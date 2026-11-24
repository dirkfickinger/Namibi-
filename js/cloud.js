// Gedeelde reizen: end-to-end versleutelde synchronisatie via Supabase.
//
// Beveiligingsmodel
// - Elke gedeelde reis heeft een eigen willekeurige reissleutel (AES-256-GCM).
// - Alle inhoud (reisplan, verhalen, waarnemingen, foto's) wordt in de app versleuteld vóór verzending.
//   De server ziet alleen versleutelde blokken plus noodzakelijke metadata (wie lid is, tijdstippen, groottes).
// - Elk blok is gekoppeld aan reis, soort en id (AES-GCM "additional data"), zodat blokken niet
//   onopgemerkt verwisseld of in een andere reis gebruikt kunnen worden.
// - De reissleutel staat alleen in de uitnodigingslink (na het #-teken, dat nooit naar een server gaat)
//   en lokaal in de (bij vergrendeling versleutelde) app-opslag.
// - Uitnodigingen bevatten daarnaast een willekeurig eenmalig token; de server kent alleen de SHA-256-hash.
// - Wie welke gegevens mag lezen/schrijven wordt door de database afgedwongen (supabase/schema.sql).

import { db, uid, deletePhoto, sanitizeShared, lock } from './db.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BACKEND } from './config.js';

const te = new TextEncoder(), td = new TextDecoder();
const rand = n => crypto.getRandomValues(new Uint8Array(n));
export const events = new EventTarget();

// ---------- Base64 ----------
function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const toB64u = bytes => toB64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return fromB64(s); };

export const configured = () => BACKEND === 'test' || (!!SUPABASE_URL && !!SUPABASE_ANON_KEY);

// ---------- Backends ----------
// Sessiegegevens van Supabase worden in de app-opslag bewaard (versleuteld als de app-vergrendeling aan staat),
// niet in localStorage.
const authStorage = {
  getItem: async k => { try { return await db.getKV('sb:' + k, null); } catch { return null; } },
  setItem: async (k, v) => { try { await db.setKV('sb:' + k, v); } catch { /* vergrendeld */ } },
  removeItem: async k => { try { await db.del('kv', 'sb:' + k); } catch { /* */ } },
};

let libPromise;
function loadSupabaseLib() {
  if (window.supabase?.createClient) return Promise.resolve(window.supabase);
  libPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/supabase/supabase.js';
    s.onload = () => resolve(window.supabase);
    s.onerror = () => { libPromise = null; s.remove(); reject(new Error('Kon de synchronisatiemodule niet laden.')); };
    document.head.append(s);
  });
  return libPromise;
}

async function supabaseBackend() {
  const lib = await loadSupabaseLib();
  const c = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storage: authStorage, storageKey: 'auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  const ok = ({ data, error }) => { if (error) throw new Error(error.message || 'Serverfout'); return data; };
  const path = (t, p) => `${t}/${p}`;
  const bucket = () => c.storage.from('trip-photos');
  return {
    async user() { const { data } = await c.auth.getSession(); const u = data.session?.user; return u ? { id: u.id, email: u.email } : null; },
    async sendCode(email) { ok(await c.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })); },
    async verifyCode(email, token) { ok(await c.auth.verifyOtp({ email, token, type: 'email' })); },
    async signOut() { await c.auth.signOut({ scope: 'local' }); },
    async profiles(ids) { return ids.length ? ok(await c.from('profiles').select('id,display_name').in('id', ids)) : []; },
    async setDisplayName(id, name) { ok(await c.from('profiles').upsert({ id, display_name: name })); },
    async createTrip() { return ok(await c.from('trips').insert({}).select('id').single()).id; },
    async deleteTrip(id) { ok(await c.from('trips').delete().eq('id', id)); },
    async memberships(userId) { return ok(await c.from('trip_members').select('trip_id,role').eq('user_id', userId)); },
    async members(tripId) { return ok(await c.from('trip_members').select('user_id,role').eq('trip_id', tripId)); },
    async setRole(tripId, userId, role) { ok(await c.from('trip_members').update({ role }).eq('trip_id', tripId).eq('user_id', userId)); },
    async removeMember(tripId, userId) { ok(await c.from('trip_members').delete().eq('trip_id', tripId).eq('user_id', userId)); },
    async createInvite(tripId, role, tokenHash, expiresAt) { ok(await c.from('invites').insert({ trip_id: tripId, token_hash: tokenHash, role, expires_at: expiresAt, max_uses: 1 })); },
    async invites(tripId) { return ok(await c.from('invites').select('id,role,expires_at,uses,max_uses').eq('trip_id', tripId).order('created_at')); },
    async deleteInvite(id) { ok(await c.from('invites').delete().eq('id', id)); },
    async acceptInvite(token) { const d = ok(await c.rpc('accept_invite', { p_token: token })); return Array.isArray(d) ? d[0] : d; },
    async pull(tripId, since) {
      return ok(await c.from('records').select('id,kind,ciphertext,deleted,author,updated_by,updated_at,seq')
        .eq('trip_id', tripId).gt('seq', since).order('seq').limit(200));
    },
    async push(row) { ok(await c.from('records').upsert(row, { onConflict: 'trip_id,id' })); },
    async upload(tripId, pid, bytes) {
      const { error } = await bucket().upload(path(tripId, pid), new Blob([bytes], { type: 'application/octet-stream' }), { contentType: 'application/octet-stream', upsert: false });
      if (error && !/exist|duplicate|409/i.test(`${error.message} ${error.statusCode || ''}`)) throw new Error(error.message);
    },
    async download(tripId, pid) { const b = ok(await bucket().download(path(tripId, pid))); return new Uint8Array(await b.arrayBuffer()); },
    async removeFile(tripId, pid) { await bucket().remove([path(tripId, pid)]); },
    async removeAllFiles(tripId) {
      for (;;) {
        const list = ok(await bucket().list(tripId, { limit: 100 }));
        if (!list?.length) return;
        ok(await bucket().remove(list.map(f => path(tripId, f.name))));
        if (list.length < 100) return;
      }
    },
  };
}

// Testbackend: alleen actief als de testserver config.js vervangt (BACKEND = 'test').
function testBackend() {
  const call = async (op, args = {}) => {
    const s = await db.getKV('testSession', null);
    const r = await fetch('__test/api', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-user': s?.id || '' }, body: JSON.stringify({ op, args }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Serverfout');
    return j.data;
  };
  return {
    user: () => db.getKV('testSession', null),
    sendCode: email => call('sendCode', { email }),
    async verifyCode(email, code) { await db.setKV('testSession', await call('verifyCode', { email, code })); },
    signOut: () => db.del('kv', 'testSession'),
    profiles: ids => (ids.length ? call('profiles', { ids }) : []),
    setDisplayName: (id, name) => call('setDisplayName', { id, name }),
    createTrip: () => call('createTrip'),
    deleteTrip: id => call('deleteTrip', { id }),
    memberships: userId => call('memberships', { userId }),
    members: tripId => call('members', { tripId }),
    setRole: (tripId, userId, role) => call('setRole', { tripId, userId, role }),
    removeMember: (tripId, userId) => call('removeMember', { tripId, userId }),
    createInvite: (tripId, role, tokenHash, expiresAt) => call('createInvite', { tripId, role, tokenHash, expiresAt }),
    invites: tripId => call('invites', { tripId }),
    deleteInvite: id => call('deleteInvite', { id }),
    acceptInvite: token => call('acceptInvite', { token }),
    pull: (tripId, since) => call('pull', { tripId, since }),
    push: row => call('push', { row }),
    upload: (tripId, pid, bytes) => call('upload', { tripId, pid, data: toB64(bytes) }),
    download: async (tripId, pid) => fromB64(await call('download', { tripId, pid })),
    removeFile: (tripId, pid) => call('removeFile', { tripId, pid }),
    removeAllFiles: tripId => call('removeAllFiles', { tripId }),
  };
}

let backendPromise;
export function backend() {
  if (!configured()) return Promise.reject(new Error('Gedeelde reizen zijn nog niet ingesteld.'));
  backendPromise ||= (BACKEND === 'test' ? Promise.resolve(testBackend()) : supabaseBackend()).catch(e => { backendPromise = null; throw e; });
  return backendPromise;
}

// ---------- Versleuteling per reis ----------
const keyCache = new Map();
export const newTripKey = () => toB64u(rand(32));
function tripKey(b64) {
  if (!keyCache.has(b64)) keyCache.set(b64, crypto.subtle.importKey('raw', fromB64u(b64), 'AES-GCM', false, ['encrypt', 'decrypt']));
  return keyCache.get(b64);
}
export function clearKeys() { keyCache.clear(); }

async function encryptBytes(keyB64, aad, bytes) {
  const iv = rand(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(aad) }, await tripKey(keyB64), bytes));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv); out.set(ct, 12);
  return out;
}
async function decryptBytes(keyB64, aad, data) {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.subarray(0, 12), additionalData: te.encode(aad) }, await tripKey(keyB64), data.subarray(12)));
}
const recordAad = (trip, kind, id) => `namibie:${trip.cloud.id}:${kind}:${id}`;
const photoAad = (trip, pid) => `namibie:${trip.cloud.id}:photo-file:${pid}`;
const encryptRecord = async (trip, kind, id, obj) => toB64(await encryptBytes(trip.cloud.key, recordAad(trip, kind, id), te.encode(JSON.stringify(obj))));
const decryptRecord = async (trip, row) => JSON.parse(td.decode(await decryptBytes(trip.cloud.key, recordAad(trip, row.kind, row.id), fromB64(row.ciphertext))));

// ---------- Account ----------
export async function currentUser() {
  if (!configured()) return null;
  try { return await (await backend()).user(); } catch { return null; }
}
export async function sendCode(email) { await (await backend()).sendCode(email.trim().toLowerCase()); }
export async function verifyCode(email, code) { await (await backend()).verifyCode(email.trim().toLowerCase(), code.trim()); }
export async function signOut() { await (await backend()).signOut(); await db.setKV('cloudMe', null); }
export async function setDisplayName(name) {
  const be = await backend(); const me = await be.user();
  if (!me) throw new Error('Log eerst in.');
  name = String(name).trim().slice(0, 40);
  if (!name) throw new Error('Vul een naam in.');
  await be.setDisplayName(me.id, name);
  const names = await db.getKV('cloudProfiles', {});
  names[me.id] = name;
  await db.setKV('cloudProfiles', names);
}
export async function profileNames() { return db.getKV('cloudProfiles', {}); }
async function refreshProfiles(be, ids) {
  const list = await be.profiles([...new Set(ids)]);
  const names = await db.getKV('cloudProfiles', {});
  for (const p of list) names[p.id] = String(p.display_name).slice(0, 40);
  await db.setKV('cloudProfiles', names);
  return names;
}
export async function myDisplayName() {
  const me = await currentUser(); if (!me) return '';
  const names = await profileNames();
  if (names[me.id]) return names[me.id];
  try { return (await refreshProfiles(await backend(), [me.id]))[me.id] || ''; } catch { return ''; }
}

// ---------- Wachtrij met lokale wijzigingen ----------
const itemKey = o => `${o.t}|${o.k}|${o.i}`;
export async function queue(items) {
  const ob = await db.getKV('outbox', []);
  const have = new Set(ob.map(itemKey));
  let added = 0;
  for (const it of items) {
    const trip = await db.get('trips', it.t);
    if (!trip?.cloud || trip.cloud.removed || trip.cloud.role === 'viewer') continue;
    if (!have.has(itemKey(it))) { ob.push(it); have.add(itemKey(it)); added++; }
  }
  if (added) { await db.setKV('outbox', ob); scheduleSync(); }
}
// Hulpfunctie voor de app: een verhaal/waarneming (plus foto's) of reis/plan is gewijzigd.
export async function changed(tripId, kind, id, photoIds = []) {
  if (!tripId) return;
  const trip = await db.get('trips', tripId);
  if (!trip?.cloud) return;
  await queue([{ t: tripId, k: kind, i: id }, ...photoIds.map(p => ({ t: tripId, k: 'photo', i: p }))]);
}
async function dequeue(it) {
  const ob = await db.getKV('outbox', []);
  await db.setKV('outbox', ob.filter(o => itemKey(o) !== itemKey(it)));
}
export async function pendingCount(tripId) { return (await db.getKV('outbox', [])).filter(o => !tripId || o.t === tripId).length; }

// ---------- Synchronisatie ----------
let syncing = null, timer = null;
export function scheduleSync(ms = 1500) { clearTimeout(timer); timer = setTimeout(() => syncAll().catch(() => {}), ms); }
const isPermissionError = e => /row-level security|permission|not allowed|violates|unauthori[sz]ed|forbidden|42501/i.test(e?.message || '');

export function syncAll() {
  if (syncing) return syncing;
  syncing = (async () => {
    if (!configured() || !navigator.onLine) return { skipped: true };
    if (await lock.isEnabled() && !lock.isUnlocked()) return { skipped: true };
    const be = await backend();
    const me = await be.user();
    if (!me) return { skipped: true };
    const trips = (await db.all('trips')).filter(t => t.cloud && !t.cloud.removed);
    if (!trips.length) return {};
    const roles = new Map((await be.memberships(me.id)).map(m => [m.trip_id, m.role]));
    let changedAny = false;
    for (const trip of trips) {
      if (!roles.has(trip.cloud.id)) { await updateTrip(trip, t => { if (t.cloud) t.cloud.removed = true; }); changedAny = true; continue; }
      if (roles.get(trip.cloud.id) !== trip.cloud.role) { await updateTrip(trip, t => { if (t.cloud) t.cloud.role = roles.get(trip.cloud.id); }); changedAny = true; }
      await pushTrip(be, trip);
      changedAny = (await pullTrip(be, trip, me)) || changedAny;
    }
    await db.setKV('lastSync', Date.now());
    if (changedAny) events.dispatchEvent(new Event('changed'));
    return { changed: changedAny };
  })().finally(() => { syncing = null; });
  return syncing;
}

// Lees de reis altijd vers in vóór een wijziging, zodat een gelijktijdige wijziging in de app niet wordt overschreven.
async function updateTrip(trip, fn) {
  const fresh = (await db.get('trips', trip.id)) || trip;
  fn(fresh);
  await db.put('trips', fresh);
  Object.assign(trip, fresh);
}

async function syncState(cloudId) { return (await db.getKV('syncState', {}))[cloudId] || { cursor: 0, retry: [] }; }
async function saveSyncState(cloudId, st) { const all = await db.getKV('syncState', {}); all[cloudId] = st; await db.setKV('syncState', all); }

async function buildRow(be, tripIn, it) {
  const trip = (await db.get('trips', tripIn.id)) || tripIn;
  const row = { trip_id: trip.cloud.id, id: it.i, kind: it.k, deleted: false };
  let obj = null;
  if (it.k === 'trip') { row.id = 'trip'; obj = { name: trip.name, start: trip.start, end: trip.end, who: trip.who || '' }; }
  else if (it.k === 'plan') { row.id = 'plan'; obj = { plan: trip.plan || [] }; }
  else if (it.k === 'entry') {
    const e = await db.get('entries', it.i);
    if (e && e.tripId === trip.id) { const { id, tripId, by, ...rest } = e; obj = rest; }
  } else if (it.k === 'sighting') {
    const s = await db.get('sightings', it.i);
    if (s && s.tripId === trip.id) {
      const { id, tripId, by, ...rest } = s; obj = rest;
      if (s.animalId?.startsWith('c_')) { const a = (await db.getKV('customAnimals', [])).find(x => x.id === s.animalId); if (a) obj.animal = { name: a.name, sci: a.sci, emoji: a.emoji, cat: a.cat }; }
    }
  } else if (it.k === 'photo') {
    const p = await db.get('photos', it.i);
    if (p?.blob) {
      const bytes = await encryptBytes(trip.cloud.key, photoAad(trip, it.i), new Uint8Array(await p.blob.arrayBuffer()));
      await be.upload(trip.cloud.id, it.i, bytes);
      obj = { created: p.created, taken: p.taken, type: p.blob.type };
    } else {
      try { await be.removeFile(trip.cloud.id, it.i); } catch { /* niet van mij of al weg */ }
    }
  }
  if (!obj) { row.deleted = true; obj = {}; }
  row.ciphertext = await encryptRecord(trip, it.k, row.id, obj);
  return row;
}

async function pushTrip(be, trip) {
  const items = (await db.getKV('outbox', [])).filter(o => o.t === trip.id);
  if (!items.length) return;
  if (trip.cloud.role === 'viewer') {
    // Kijkers mogen niets wijzigen: lokale wijzigingen vervallen en de serverversie wordt opnieuw opgehaald.
    for (const it of items) await dequeue(it);
    const st = await syncState(trip.cloud.id); st.cursor = 0; await saveSyncState(trip.cloud.id, st);
    return;
  }
  // Foto's eerst, zodat verhalen nooit naar een nog niet geüploade foto verwijzen.
  items.sort((a, b) => (a.k === 'photo' ? 0 : 1) - (b.k === 'photo' ? 0 : 1));
  for (const it of items) {
    try {
      await be.push(await buildRow(be, trip, it));
      await dequeue(it);
    } catch (e) {
      if (isPermissionError(e)) {
        // Niet toegestaan (bijv. andermans verhaal): lokale wijziging vervalt, serverversie wordt opnieuw opgehaald.
        await dequeue(it);
        const st = await syncState(trip.cloud.id); st.cursor = 0; await saveSyncState(trip.cloud.id, st);
      } else throw e; // netwerkprobleem: later opnieuw
    }
  }
}

async function ensureCustomAnimal(a) {
  if (!a) return;
  const list = await db.getKV('customAnimals', []);
  if (!list.some(x => x.id === a.id)) { list.push(a); await db.setKV('customAnimals', list); }
}

async function fetchPhoto(be, trip, pid, meta) {
  if (await db.get('photos', pid)) return true;
  try {
    const bytes = await decryptBytes(trip.cloud.key, photoAad(trip, pid), await be.download(trip.cloud.id, pid));
    await db.put('photos', { id: pid, blob: new Blob([bytes], { type: meta.type || 'image/jpeg' }), created: meta.created || Date.now(), taken: meta.taken || Date.now() });
    return true;
  } catch { return false; }
}

async function pullTrip(be, trip, me) {
  const st = await syncState(trip.cloud.id);
  st.retry = Array.isArray(st.retry) ? st.retry : [];
  const pending = new Set((await db.getKV('outbox', [])).filter(o => o.t === trip.id).map(o => `${o.k}|${o.i}`));
  let changedAny = false, bad = 0, good = 0;
  const authors = new Set([me.id]);

  // Eerder mislukte foto-downloads opnieuw proberen.
  const retry = [];
  for (const r of st.retry) { if (!(await fetchPhoto(be, trip, r.id, r.meta))) retry.push(r); else changedAny = true; }
  st.retry = retry;

  for (;;) {
    const rows = await be.pull(trip.cloud.id, st.cursor);
    for (const row of rows) {
      st.cursor = Math.max(st.cursor, Number(row.seq) || 0);
      authors.add(row.author);
      if (pending.has(`${row.kind}|${row.id}`)) continue; // eigen niet-verzonden wijziging gaat voor
      let obj;
      try { obj = sanitizeShared(row.kind, await decryptRecord(trip, row)); good++; } catch { bad++; continue; }
      if (!obj) continue;
      changedAny = true;
      if (row.kind === 'trip') {
        if (!row.deleted) await updateTrip(trip, t => { Object.assign(t, { name: obj.name, start: obj.start || t.start, end: obj.end || t.end, who: obj.who }); if (t.end < t.start) t.end = t.start; });
      } else if (row.kind === 'plan') {
        if (!row.deleted) await updateTrip(trip, t => { t.plan = obj.plan; });
      } else if (row.kind === 'entry') {
        if (row.deleted) await db.del('entries', row.id);
        else await db.put('entries', { ...obj, id: row.id, tripId: trip.id, by: row.author });
      } else if (row.kind === 'sighting') {
        if (row.deleted) await db.del('sightings', row.id);
        else { const { animal, ...rest } = obj; await ensureCustomAnimal(animal); await db.put('sightings', { ...rest, id: row.id, tripId: trip.id, by: row.author }); }
      } else if (row.kind === 'photo') {
        if (row.deleted) { if (await db.get('photos', row.id)) await deletePhoto(row.id); }
        else if (!(await fetchPhoto(be, trip, row.id, obj))) st.retry.push({ id: row.id, meta: obj });
      }
    }
    if (rows.length < 200) break;
  }
  // Klopt de reissleutel niet (alles onleesbaar)? Dan melden in plaats van stil falen.
  const keyError = bad > 0 && good === 0;
  if (!!trip.cloud.keyError !== keyError) { await updateTrip(trip, t => { if (t.cloud) t.cloud.keyError = keyError || undefined; }); changedAny = true; }
  await saveSyncState(trip.cloud.id, st);
  try { await refreshProfiles(be, [...authors].filter(Boolean)); } catch { /* namen later */ }
  return changedAny;
}

// ---------- Reis delen, uitnodigen, deelnemen ----------
export async function shareTrip(trip) {
  const be = await backend();
  if (!(await be.user())) throw new Error('Log eerst in.');
  const remoteId = await be.createTrip();
  trip.cloud = { id: remoteId, role: 'owner', key: newTripKey() };
  await db.put('trips', trip);
  const items = [{ t: trip.id, k: 'trip', i: 'trip' }, { t: trip.id, k: 'plan', i: 'plan' }];
  for (const e of await db.byIndex('entries', 'tripId', trip.id)) { items.push({ t: trip.id, k: 'entry', i: e.id }); for (const p of e.photos || []) items.push({ t: trip.id, k: 'photo', i: p }); }
  for (const s of await db.byIndex('sightings', 'tripId', trip.id)) { items.push({ t: trip.id, k: 'sighting', i: s.id }); for (const p of s.photos || []) items.push({ t: trip.id, k: 'photo', i: p }); }
  await queue(items);
  await syncAll();
}

const sha256hex = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', te.encode(s))), b => b.toString(16).padStart(2, '0')).join('');

export async function createInvite(trip, role) {
  if (!['editor', 'viewer'].includes(role)) throw new Error('Ongeldige rol');
  const token = toB64u(rand(16));
  await (await backend()).createInvite(trip.cloud.id, role, await sha256hex(token), new Date(Date.now() + 7 * 864e5).toISOString());
  return `${token}.${trip.cloud.key}`;
}
export const inviteLink = code => `${location.origin}${location.pathname}#/join/${code}`;
export function parseInvite(text) {
  const m = /(?:^|#\/join\/)([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})\s*$/.exec(String(text || '').trim());
  return m ? { token: m[1], key: m[2] } : null;
}

export async function joinTrip(code) {
  const inv = parseInvite(code);
  if (!inv) throw new Error('Dit is geen geldige uitnodiging.');
  const be = await backend();
  if (!(await be.user())) throw new Error('Log eerst in.');
  const r = await be.acceptInvite(inv.token);
  if (!r?.trip_id) throw new Error('Uitnodiging ongeldig of verlopen.');
  let trip = (await db.all('trips')).find(t => t.cloud?.id === r.trip_id);
  if (trip) {
    trip.cloud = { id: r.trip_id, role: r.role, key: inv.key };
  } else {
    const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const today = d.toISOString().slice(0, 10);
    trip = { id: uid(), name: 'Gedeelde reis', start: today, end: today, who: '', plan: [], created: Date.now(), cloud: { id: r.trip_id, role: r.role, key: inv.key } };
  }
  await db.put('trips', trip);
  await syncAll();
  const fresh = await db.get('trips', trip.id);
  if (fresh?.cloud?.keyError) throw new Error('De sleutel in deze uitnodiging klopt niet. Vraag om een nieuwe uitnodiging.');
  return trip.id;
}

export async function members(trip) {
  const be = await backend();
  const list = await be.members(trip.cloud.id);
  const names = await refreshProfiles(be, list.map(m => m.user_id));
  return list.map(m => ({ ...m, name: names[m.user_id] || 'Onbekend' }));
}
export const invites = async trip => (await backend()).invites(trip.cloud.id);
export const deleteInvite = async id => (await backend()).deleteInvite(id);
export const setRole = async (trip, userId, role) => (await backend()).setRole(trip.cloud.id, userId, role);
export const removeMember = async (trip, userId) => (await backend()).removeMember(trip.cloud.id, userId);

async function detach(trip) {
  const ob = await db.getKV('outbox', []);
  await db.setKV('outbox', ob.filter(o => o.t !== trip.id));
  const st = await db.getKV('syncState', {}); delete st[trip.cloud.id]; await db.setKV('syncState', st);
  delete trip.cloud;
  await db.put('trips', trip);
}
// Deelnemer verlaat de reis: de eigen lokale kopie blijft bewaard.
export async function leaveTrip(trip) {
  const be = await backend(); const me = await be.user();
  if (!trip.cloud.removed) await be.removeMember(trip.cloud.id, me.id);
  await detach(trip);
}
// Eigenaar stopt met delen: de gedeelde reis en alle versleutelde bestanden op de server worden verwijderd.
export async function stopSharing(trip) {
  const be = await backend();
  await be.removeAllFiles(trip.cloud.id);
  await be.deleteTrip(trip.cloud.id);
  await detach(trip);
}
