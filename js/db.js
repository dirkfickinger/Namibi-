// Opslag (IndexedDB) met optionele versleuteling.
//
// Beveiligingsmodel
// - Alle gegevens blijven op het toestel; er is geen server.
// - Met app-vergrendeling aan wordt elk record (ook foto's) versleuteld met AES-256-GCM.
//   De gegevenssleutel (DEK) is willekeurig en wordt zelf versleuteld ("wrapped") met een sleutel
//   die uit het wachtwoord wordt afgeleid via PBKDF2-SHA256 (600.000 iteraties, willekeurige salt).
//   Het wachtwoord en de ontsleutelde sleutel worden nooit opgeslagen; de sleutel leeft alleen in het geheugen
//   zolang de app ontgrendeld is.
// - Elk record is cryptografisch gekoppeld aan zijn opslag en id (AES-GCM "additional data"),
//   zodat versleutelde records niet onopgemerkt verwisseld of aangepast kunnen worden.
// - Back-ups kunnen met een eigen wachtwoord worden versleuteld.
// - Geïmporteerde back-ups worden streng gecontroleerd; onbekende of ongeldige velden worden weggegooid.

const DB_NAME = 'namibie-reisapp';
const DB_VERSION = 2;
const PBKDF2_ITER = 600000;
const te = new TextEncoder();
const td = new TextDecoder();
let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of ['trips', 'entries', 'sightings', 'photos']) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' }); // nooit versleuteld: alleen vergrendel-instellingen
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function reqP(req) {
  return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
}
async function rawOp(store, mode, fn) {
  const d = await open();
  return new Promise((resolve, reject) => {
    const t = d.transaction(store, mode);
    let result;
    reqP(fn(t.objectStore(store))).then(r => { result = r; }, reject);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}
const raw = {
  all: s => rawOp(s, 'readonly', st => st.getAll()),
  get: (s, id) => rawOp(s, 'readonly', st => st.get(id)),
  put: (s, o) => rawOp(s, 'readwrite', st => st.put(o)),
  del: (s, id) => rawOp(s, 'readwrite', st => st.delete(id)),
  clear: s => rawOp(s, 'readwrite', st => st.clear()),
};
const DATA_STORES = ['trips', 'entries', 'sightings', 'photos', 'kv'];
const keyField = store => (store === 'kv' ? 'key' : 'id');

// ---------- Cryptografie ----------
let dek = null; // ontsleutelde gegevenssleutel, alleen in het geheugen

export class LockedError extends Error { constructor() { super('De app is vergrendeld.'); this.name = 'LockedError'; } }

const rand = n => crypto.getRandomValues(new Uint8Array(n));
async function deriveKek(password, salt, iter) {
  const base = await crypto.subtle.importKey('raw', te.encode(password.normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']);
}

async function seal(store, obj) {
  if (!dek) return obj;
  const k = keyField(store);
  const { blob, ...rest } = obj;
  let bin = new Uint8Array(0);
  if (blob instanceof Blob) { bin = new Uint8Array(await blob.arrayBuffer()); rest.__blobType = blob.type; }
  const json = te.encode(JSON.stringify(rest));
  const buf = new Uint8Array(4 + json.length + bin.length);
  new DataView(buf.buffer).setUint32(0, json.length);
  buf.set(json, 4); buf.set(bin, 4 + json.length);
  const iv = rand(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(`${store}:${obj[k]}`) }, dek, buf);
  return { [k]: obj[k], __enc: 1, iv, ct };
}

async function unseal(store, rec) {
  if (!rec || !rec.__enc) return rec;
  if (!dek) throw new LockedError();
  const k = keyField(store);
  const buf = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: rec.iv, additionalData: te.encode(`${store}:${rec[k]}`) }, dek, rec.ct));
  const len = new DataView(buf.buffer).getUint32(0);
  const obj = JSON.parse(td.decode(buf.subarray(4, 4 + len)));
  if ('__blobType' in obj) { obj.blob = new Blob([buf.slice(4 + len)], { type: obj.__blobType }); delete obj.__blobType; }
  obj[k] = rec[k];
  return obj;
}

// ---------- Publieke opslag-API ----------
// Volledig willekeurige id's (128 bit, base64url). Bewust zonder tijdstempel: id's staan onversleuteld
// in de opslag en zouden anders verraden wánneer je iets hebt vastgelegd.
export const uid = () => btoa(String.fromCharCode(...rand(16))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const db = {
  async all(store) { return Promise.all((await raw.all(store)).map(r => unseal(store, r))); },
  async get(store, id) { return unseal(store, await raw.get(store, id)); },
  async put(store, obj) { return raw.put(store, await seal(store, obj)); },
  del: (store, id) => raw.del(store, id),
  clear: store => raw.clear(store),
  async byIndex(store, field, value) { return (await this.all(store)).filter(o => o[field] === value); },
  async getKV(key, fallback) { const r = await this.get('kv', key); return r === undefined ? fallback : r.value; },
  setKV(key, value) { return this.put('kv', { key, value }); },
};

// ---------- App-vergrendeling ----------
const getMeta = async (key, fb) => { const r = await raw.get('meta', key); return r === undefined ? fb : r.value; };
const setMeta = (key, value) => raw.put('meta', { key, value });

async function reencryptAll() {
  // Versleutel (of ontsleutel, als dek === null) elk record dat nog niet in de gewenste vorm staat.
  for (const store of DATA_STORES) {
    for (const r of await raw.all(store)) {
      const want = !!dek;
      if (!!r.__enc === want) continue;
      await raw.put(store, want ? await seal(store, r) : r);
    }
  }
}

// De gegevenssleutel in het geheugen is niet-exporteerbaar: de browser geeft de ruwe sleutel nooit prijs.
const unwrapDek = (m, kek, extractable = false) =>
  crypto.subtle.unwrapKey('raw', m.wrapped, kek, { name: 'AES-GCM', iv: m.iv }, { name: 'AES-GCM', length: 256 }, extractable, ['encrypt', 'decrypt']);

// Zet oude losse "cover:<dier>"-sleutels (naam was onversleuteld zichtbaar) om naar één versleuteld record.
export async function migrateCovers() {
  const old = (await raw.all('kv')).filter(r => /^cover:/.test(r.key));
  if (!old.length) return;
  const covers = await db.getKV('covers', {});
  for (const r of old) {
    const rec = await unseal('kv', r);
    if (!covers[r.key.slice(6)] && typeof rec.value === 'string') covers[r.key.slice(6)] = rec.value;
  }
  await db.setKV('covers', covers);
  for (const r of old) await raw.del('kv', r.key);
}

export const lock = {
  async isEnabled() { return !!(await getMeta('lock', null)); },
  isUnlocked() { return !!dek; },
  async settings() { return { autoLockMin: await getMeta('autoLockMin', 5) }; },
  setAutoLock(min) { return setMeta('autoLockMin', min); },

  // Mislukte pogingen worden bewaard zodat herladen de wachttijd niet omzeilt.
  async waitSeconds() {
    const f = await getMeta('fails', { n: 0, at: 0 });
    if (f.n < 3) return 0;
    const wait = Math.min(300, 2 ** (f.n - 3) * 5);
    return Math.max(0, Math.ceil((f.at + wait * 1000 - Date.now()) / 1000));
  },

  async unlock(password) {
    const m = await getMeta('lock', null);
    if (!m) return true;
    if (await this.waitSeconds() > 0) return false;
    try {
      const kek = await deriveKek(password, m.salt, m.iter);
      dek = await unwrapDek(m, kek);
    } catch {
      const f = await getMeta('fails', { n: 0, at: 0 });
      await setMeta('fails', { n: f.n + 1, at: Date.now() });
      return false;
    }
    await setMeta('fails', { n: 0, at: 0 });
    await reencryptAll(); // maakt een eventueel onderbroken migratie af
    return true;
  },

  lockNow() { dek = null; revokeAllPhotoURLs(); },

  async enable(password) {
    const fresh = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    await this._wrap(password, fresh);
    const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', fresh));
    dek = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
    rawKey.fill(0);
    await reencryptAll();
  },

  async change(oldPw, newPw) {
    const m = await getMeta('lock', null);
    const kek = await deriveKek(oldPw, m.salt, m.iter);
    let old;
    try { old = await unwrapDek(m, kek, true); } catch { return false; }
    await this._wrap(newPw, old);
    return true;
  },

  async disable(password) {
    const m = await getMeta('lock', null);
    try {
      const kek = await deriveKek(password, m.salt, m.iter);
      dek = await unwrapDek(m, kek);
    } catch { return false; }
    // Eerst alles ontsleutelen, pas daarna de sleutel weggooien.
    for (const store of DATA_STORES) for (const r of await raw.all(store)) if (r.__enc) await raw.put(store, await unseal(store, r));
    await raw.del('meta', 'lock');
    dek = null;
    return true;
  },

  async _wrap(password, key) {
    const salt = rand(16), iv = rand(12);
    const kek = await deriveKek(password, salt, PBKDF2_ITER);
    const wrapped = await crypto.subtle.wrapKey('raw', key, kek, { name: 'AES-GCM', iv });
    await setMeta('lock', { v: 1, kdf: 'PBKDF2-SHA256', iter: PBKDF2_ITER, salt, iv, wrapped });
  },

  async wipeEverything() {
    dek = null; revokeAllPhotoURLs();
    for (const s of [...DATA_STORES, 'meta']) await raw.clear(s);
  },
};

// ---------- Foto's ----------
// Foto's worden opnieuw gecodeerd via een canvas. Daardoor verdwijnen alle EXIF-metadata
// (zoals GPS-locatie, toestel en serienummer) uit de opgeslagen foto.
export async function savePhoto(file, maxSize = 1600) {
  if (!/^image\//.test(file.type || 'image/')) throw new Error('Geen afbeelding');
  const bitmap = await loadImage(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
  const id = uid();
  await db.put('photos', { id, blob, created: Date.now(), taken: file.lastModified || Date.now() });
  return id;
}

async function loadImage(file) {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* fallback */ }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

const urlCache = new Map();
export async function photoURL(id) {
  if (!id) return '';
  if (urlCache.has(id)) return urlCache.get(id);
  const p = await db.get('photos', id);
  if (!p || !(p.blob instanceof Blob)) return '';
  const url = URL.createObjectURL(p.blob);
  urlCache.set(id, url);
  return url;
}
function revokeAllPhotoURLs() {
  for (const u of urlCache.values()) URL.revokeObjectURL(u);
  urlCache.clear();
}

export async function deletePhoto(id) {
  if (urlCache.has(id)) { URL.revokeObjectURL(urlCache.get(id)); urlCache.delete(id); }
  await db.del('photos', id);
}

// ---------- Base64 (in stukjes, geschikt voor grote bestanden) ----------
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

// ---------- Back-up ----------
export async function exportBackup(password) {
  const out = { app: 'namibie-reisapp', version: 1, exported: new Date().toISOString() };
  for (const s of ['trips', 'entries', 'sightings', 'kv']) out[s] = await db.all(s);
  out.photos = [];
  for (const p of await db.all('photos')) {
    out.photos.push({ id: p.id, created: p.created, taken: p.taken, type: p.blob.type, data: toB64(new Uint8Array(await p.blob.arrayBuffer())) });
  }
  const json = te.encode(JSON.stringify(out));
  if (!password) return new Blob([json], { type: 'application/json' });
  const salt = rand(16), iv = rand(12);
  const key = await deriveKek(password, salt, PBKDF2_ITER);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode('namibie-backup') }, key, json));
  const env = { app: 'namibie-reisapp', version: 2, encrypted: true, kdf: 'PBKDF2-SHA256', iter: PBKDF2_ITER, salt: toB64(salt), iv: toB64(iv), data: toB64(ct) };
  return new Blob([JSON.stringify(env)], { type: 'application/json' });
}

export async function readBackup(file) {
  if (file.size > 1024 * 1024 * 1024) throw new Error('Bestand is te groot.');
  let data;
  try { data = JSON.parse(await file.text()); } catch { throw new Error('Dit is geen geldig back-upbestand.'); }
  if (!data || data.app !== 'namibie-reisapp') throw new Error('Dit is geen back-up van deze app.');
  return data;
}
export const backupIsEncrypted = data => data.encrypted === true;

export async function importBackup(data, password) {
  if (data.encrypted) {
    const iter = Number(data.iter);
    if (!Number.isInteger(iter) || iter < 100000 || iter > 10000000) throw new Error('Ongeldige back-up.');
    try {
      const key = await deriveKek(password || '', fromB64(data.salt), iter);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(data.iv), additionalData: te.encode('namibie-backup') }, key, fromB64(data.data));
      data = JSON.parse(td.decode(pt));
    } catch { throw new Error('Verkeerd wachtwoord of beschadigde back-up.'); }
  }
  const clean = sanitizeBackup(data);
  for (const s of ['trips', 'entries', 'sightings', 'kv']) for (const o of clean[s]) await db.put(s, o);
  for (const p of clean.photos) await db.put('photos', p);
  return { trips: clean.trips.length, entries: clean.entries.length, sightings: clean.sightings.length, photos: clean.photos.length };
}

// ---------- Validatie van geïmporteerde gegevens ----------
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '');
const id = v => (typeof v === 'string' && ID.test(v) ? v : null);
const date = v => (typeof v === 'string' && DATE.test(v) ? v : '');
const num = (v, min, max) => { const n = Number(v); return Number.isFinite(n) && n >= min && n <= max ? n : undefined; };
const ids = v => (Array.isArray(v) ? v.map(id).filter(Boolean).slice(0, 200) : []);
const arr = (v, max = 5000) => (Array.isArray(v) ? v.slice(0, max) : []);
const coords = o => { const lat = num(o.lat, -90, 90), lng = num(o.lng, -180, 180); return lat !== undefined && lng !== undefined ? { lat, lng } : {}; };
const time = v => num(v, 0, 8.64e15);
const CATS = ['big', 'roof', 'hoef', 'klein', 'zee', 'vogel', 'reptiel', 'eigen'];

function sanitizeKV(key, v) {
  if (key === 'customAnimals') return arr(v, 500).filter(a => a && /^c_[A-Za-z0-9_-]{1,62}$/.test(a.id)).map(a => ({
    id: a.id, name: str(a.name, 80) || 'Onbekend', sci: str(a.sci, 120), emoji: str(a.emoji, 8) || '🐾',
    cat: CATS.includes(a.cat) ? a.cat : 'eigen', rarity: 2, custom: true, where: '', fact: '' }));
  if (key === 'visited' || key === 'wishlist' || key === 'actWish' || key === 'actDone') return ids(v);
  if (key === 'bookings') return arr(v, 500).filter(b => b && id(b.id)).map(b => ({
    id: b.id, name: str(b.name, 120), place: str(b.place, 120), checkin: date(b.checkin), checkout: date(b.checkout),
    ref: str(b.ref, 80), phone: str(b.phone, 40), note: str(b.note, 2000) }));
  if (key === 'packing') { const o = {}; if (v && typeof v === 'object') for (const [k, x] of Object.entries(v).slice(0, 1000)) if (k !== '__proto__') o[str(k, 120)] = x === true; return o; }
  if (key === 'packingCustom') return arr(v, 300).map(x => str(x, 120)).filter(Boolean);
  if (key === 'contacts') return arr(v, 100).filter(c => c && typeof c === 'object').map(c => ({ label: str(c.label, 80), number: str(c.number, 40) })).filter(c => c.number);
  if (key === 'rate') return num(v, 0.01, 10000) ?? 20;
  if (key === 'covers') { const o = {}; if (v && typeof v === 'object') for (const [k, x] of Object.entries(v).slice(0, 2000)) if (id(k) && id(x)) o[k] = x; return o; }
  return undefined; // onbekende sleutel: niet importeren
}

function sanitizeBackup(d) {
  const out = { trips: [], entries: [], sightings: [], kv: [], photos: [] };
  for (const t of arr(d.trips)) {
    if (!t || !id(t.id)) continue;
    const plan = arr(t.plan, 100).filter(x => x && typeof x === 'object').map(x => ({
      id: id(x.id) || uid(), ref: typeof x.ref === 'string' && /^(a:[A-Za-z0-9_-]{1,64}|t:[^<>"']{1,60})?$/.test(x.ref) ? x.ref : '',
      name: str(x.name, 80) || 'Stop', ...coords(x), nights: Math.round(num(x.nights, 0, 60) ?? 1), stay: str(x.stay, 120), note: str(x.note, 2000),
    })).filter(x => x.lat !== undefined);
    out.trips.push({ id: t.id, name: str(t.name, 120) || 'Reis', start: date(t.start) || date(t.end), end: date(t.end) || date(t.start), who: str(t.who, 200), plan, created: time(t.created) });
  }
  for (const e of arr(d.entries, 20000)) {
    if (!e || !id(e.id) || !id(e.tripId)) continue;
    out.entries.push({ id: e.id, tripId: e.tripId, date: date(e.date), title: str(e.title, 200), place: str(e.place, 200), text: str(e.text, 20000),
      stay: str(e.stay, 200), km: num(e.km, 0, 100000) ?? '', photos: ids(e.photos), ...coords(e), created: time(e.created), updated: time(e.updated) });
  }
  for (const s of arr(d.sightings, 20000)) {
    if (!s || !id(s.id) || !id(s.animalId)) continue;
    out.sightings.push({ id: s.id, animalId: s.animalId, date: date(s.date), place: str(s.place, 200), note: str(s.note, 2000),
      photos: ids(s.photos), ...coords(s), created: time(s.created), tripId: id(s.tripId) || undefined });
  }
  const oldCovers = {};
  for (const k of arr(d.kv, 2000)) {
    if (!k || typeof k.key !== 'string') continue;
    const m = /^cover:([A-Za-z0-9_-]{1,64})$/.exec(k.key); // oud formaat
    if (m) { if (id(k.value)) oldCovers[m[1]] = k.value; continue; }
    const value = sanitizeKV(k.key, k.value);
    if (value !== undefined && value !== null) out.kv.push({ key: k.key, value });
  }
  if (Object.keys(oldCovers).length) {
    const cur = out.kv.find(k => k.key === 'covers');
    if (cur) cur.value = { ...oldCovers, ...cur.value }; else out.kv.push({ key: 'covers', value: oldCovers });
  }
  const IMG = ['image/jpeg', 'image/png', 'image/webp'];
  for (const p of arr(d.photos, 20000)) {
    if (!p || !id(p.id)) continue;
    let type = p.type, b64 = p.data;
    if (typeof p.blob === 'string') { // oud formaat: data-URL
      const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(p.blob);
      if (!m) continue;
      [, type, b64] = m;
    }
    if (!IMG.includes(type) || typeof b64 !== 'string' || b64.length > 40 * 1024 * 1024) continue;
    let bytes;
    try { bytes = fromB64(b64); } catch { continue; }
    out.photos.push({ id: p.id, blob: new Blob([bytes], { type }), created: time(p.created), taken: time(p.taken) });
  }
  return out;
}
