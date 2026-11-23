import { db, uid, savePhoto, photoURL, deletePhoto, exportBackup, importBackup, readBackup, backupIsEncrypted, lock, migrateCovers } from './db.js';
import { ANIMALS, CATEGORIES } from './data/animals.js';
import { REGIONS, ATTRACTIONS, ACCOMMODATIONS, SUPERMARKET_CHAINS, SUPERMARKETS } from './data/places.js';
import { FACTS, SECTIONS, EMERGENCY, EMERGENCY_NOTE, PHRASES, PACKING, TIPS } from './data/info.js';
import { BORDERS } from './data/borders.js';

// ============ Beveiliging: niet in een frame laten draaien (clickjacking) ============
if (window.top !== window.self) {
  document.body.textContent = 'Deze app kan om veiligheidsredenen niet in een frame worden geopend.';
  throw new Error('framed');
}

// ============ Helpers ============
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const view = $('#view');
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDate = (iso, opts = { weekday: 'short', day: 'numeric', month: 'long' }) => iso ? parseISO(iso).toLocaleDateString('nl-NL', opts) : '';
const fmtDateLong = iso => fmtDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const mapsSearch = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const mapsRoute = q => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
// Opent de kaart-app van het toestel; werkt ook zonder internet als je daar offline kaarten hebt gedownload.
const nativeMap = (lat, lng, name) => isApple
  ? `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(name)}`
  : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
const regionName = id => REGIONS.find(r => r.id === id)?.name ?? '';
const stars = n => { n = Math.min(3, Math.max(1, Math.round(Number(n)) || 1)); return '★'.repeat(n) + '☆'.repeat(3 - n); };
const rarityLabel = n => ({ 1: 'Algemeen', 2: 'Regelmatig', 3: 'Zeldzaam' })[n] || '';

function toast(msg, ms = 2200) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}

async function hydrate(root = view) {
  for (const img of $$('img[data-photo]', root)) {
    if (img.src) continue;
    const url = await photoURL(img.dataset.photo);
    if (url) img.src = url; else img.closest('.ph, .pv')?.remove();
  }
}

function openSheet(html, { onClose } = {}) {
  const bd = document.createElement('div');
  bd.className = 'sheet-backdrop';
  bd.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  document.body.append(bd);
  document.body.style.overflow = 'hidden';
  let closed = false;
  const close = (reason) => {
    if (closed) return; closed = true;
    bd.remove(); document.body.style.overflow = '';
    onClose?.(reason);
  };
  bd.addEventListener('click', e => { if (e.target === bd) close('cancel'); });
  $$('[data-close]', bd).forEach(b => b.addEventListener('click', () => close('cancel')));
  return { root: $('.sheet', bd), close };
}

function lightbox(url, actionsHtml = '', bind) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<img src="${url}" alt=""><button aria-label="Sluiten">✕</button>${actionsHtml ? `<div style="position:absolute;bottom:calc(20px + env(safe-area-inset-bottom));left:0;right:0;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding:0 16px">${actionsHtml}</div>` : ''}`;
  document.body.append(lb);
  const close = () => lb.remove();
  $('button[aria-label]', lb).onclick = close;
  lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'IMG') close(); });
  bind?.(lb, close);
}

function confirmSheet(msg, okLabel = 'Verwijderen') {
  return new Promise(resolve => {
    const s = openSheet(`<p style="font-size:1.05rem">${esc(msg)}</p>
      <div class="row"><button class="btn secondary block" data-close>Annuleren</button><button class="btn block" style="background:var(--danger)" id="ok">${esc(okLabel)}</button></div>`,
      { onClose: r => resolve(r === 'ok') });
    $('#ok', s.root).onclick = () => s.close('ok');
  });
}

// Fotokiezer voor formulieren
function photoPicker(wrap, initial = []) {
  const ids = [...initial];
  const added = [], removed = [];
  const render = () => {
    wrap.innerHTML = ids.map(id => `<div class="pv"><img data-photo="${esc(id)}" alt=""><button type="button" data-rm="${esc(id)}" aria-label="Verwijder foto">✕</button></div>`).join('')
      + `<label class="add" title="Foto toevoegen">📷<input type="file" accept="image/*" multiple hidden></label>`;
    hydrate(wrap);
  };
  wrap.addEventListener('change', async e => {
    if (e.target.type !== 'file') return;
    const files = [...e.target.files];
    if (!files.length) return;
    toast(files.length > 1 ? `${files.length} foto's verwerken…` : 'Foto verwerken…');
    for (const f of files) {
      try { const id = await savePhoto(f); ids.push(id); added.push(id); }
      catch { toast('Kon een foto niet lezen.'); }
    }
    $$('.toast').forEach(t => t.remove());
    e.target.value = '';
    render();
  });
  wrap.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (!rm) return;
    const id = rm.dataset.rm;
    ids.splice(ids.indexOf(id), 1); removed.push(id); render();
  });
  render();
  return {
    get ids() { return [...ids]; },
    async commit() { for (const id of removed) await deletePhoto(id); },
    async cancel() { for (const id of added) await deletePhoto(id); },
  };
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Locatie niet beschikbaar'));
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) }),
      reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
}

function bindLocationButton(root, state) {
  const btn = $('[data-geo]', root);
  if (!btn) return;
  const label = $('[data-geo-label]', root);
  const show = () => { label.textContent = state.lat ? `📍 ${state.lat}, ${state.lng}` : ''; };
  show();
  btn.onclick = async () => {
    btn.disabled = true; btn.textContent = 'Zoeken…';
    try { Object.assign(state, await getLocation()); show(); }
    catch { toast('Locatie niet gevonden. Sta locatietoegang toe of probeer buiten.'); }
    btn.disabled = false; btn.textContent = '📍 Huidige locatie';
  };
}

// ============ Data-toegang ============
async function allAnimals() {
  const custom = await db.getKV('customAnimals', []);
  return [...ANIMALS, ...custom];
}
async function sightingsByAnimal() {
  const map = new Map();
  for (const s of await db.all('sightings')) {
    if (!map.has(s.animalId)) map.set(s.animalId, []);
    map.get(s.animalId).push(s);
  }
  for (const list of map.values()) list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  return map;
}
async function coverFor(animalId, sightings) {
  const c = (await db.getKV('covers', {}))[animalId];
  const all = (sightings || []).flatMap(s => s.photos || []);
  if (c && all.includes(c)) return c;
  return all[0] || null;
}
async function trips() {
  return (await db.all('trips')).sort((a, b) => (b.start || '').localeCompare(a.start || ''));
}
async function currentTrip() {
  const list = await trips();
  const t = todayISO();
  return list.find(x => x.start <= t && t <= x.end)
    || list.filter(x => x.start > t).sort((a, b) => a.start.localeCompare(b.start))[0]
    || list[0] || null;
}

// ============ Router ============
const routes = [];
const route = (pattern, fn, opts = {}) => routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), fn, ...opts });

let currentCleanup = null;
async function render() {
  if (await lock.isEnabled() && !lock.isUnlocked()) { showLockScreen(); return; }
  if (!render.migrated) { render.migrated = true; await migrateCovers().catch(() => {}); }
  let path;
  try { path = decodeURIComponent(location.hash.slice(1) || '/'); } catch { path = '/'; }
  currentCleanup?.(); currentCleanup = null;
  $$('.fab').forEach(f => f.remove());
  $('#topActions').innerHTML = '';
  for (const r of routes) {
    const m = path.match(r.re);
    if (!m) continue;
    $$('.bottomnav a').forEach(a => a.classList.toggle('active', a.dataset.tab === r.tab));
    const back = $('#backBtn');
    back.hidden = !r.parent;
    back.onclick = () => { if (history.length > 1 && sessionStorage.getItem('nav')) history.back(); else location.hash = typeof r.parent === 'function' ? r.parent(...m.slice(1)) : r.parent; };
    setTitle(r.title || 'Namibië');
    view.innerHTML = '';
    view.onclick = null;
    try { await r.fn(...m.slice(1)); } catch (e) { console.error(e); view.innerHTML = `<div class="empty"><div class="big">🌵</div>Er ging iets mis: ${esc(e.message)}</div>`; }
    // Is de app vergrendeld terwijl deze pagina nog laadde? Dan niets laten staan.
    if (lockSettings.enabled && !lock.isUnlocked()) { showLockScreen(); return; }
    hydrate();
    window.scrollTo(0, 0);
    return;
  }
  location.hash = '#/';
}
const setTitle = t => { $('#title').textContent = t; document.title = t === 'Namibië' ? 'Namibië Reisapp' : `${t} · Namibië`; };
window.addEventListener('hashchange', () => { sessionStorage.setItem('nav', '1'); render(); });

function fab(label, onClick) {
  const b = document.createElement('button');
  b.className = 'fab'; b.textContent = '+'; b.setAttribute('aria-label', label);
  b.onclick = onClick;
  document.body.append(b);
}

// ============ HOME ============
route('/', async () => {
  const [trip, sMap, animals, entries, visited, bookings] = await Promise.all([
    currentTrip(), sightingsByAnimal(), allAnimals(), db.all('entries'), db.getKV('visited', []), db.getKV('bookings', [])]);
  const t = todayISO();
  const got = animals.filter(a => sMap.has(a.id)).length;
  const photoCount = (await db.all('photos')).length;

  let heroTitle = 'Welkom in Namibië', heroSub = 'Jouw reisgids, dagboek en dierencollectie – ook offline.', kicker = 'Land van de oneindige horizon';
  if (trip) {
    const total = daysBetween(trip.start, trip.end) + 1;
    if (t < trip.start) { const n = daysBetween(t, trip.start); kicker = esc(trip.name); heroTitle = `Nog ${n} ${n === 1 ? 'dag' : 'dagen'}!`; heroSub = `Vertrek op ${fmtDate(trip.start)}. Tijd om je paklijst af te vinken.`; }
    else if (t <= trip.end) { const n = daysBetween(trip.start, t) + 1; kicker = esc(trip.name); heroTitle = `Dag ${n} van ${total}`; heroSub = fmtDateLong(t); }
    else { kicker = esc(trip.name); heroTitle = 'Wat een reis!'; heroSub = `${total} dagen Namibië – blader terug door je dagboek.`; }
  }
  const tonight = bookings.find(b => b.checkin && b.checkin <= t && (!b.checkout || t < b.checkout));
  const tip = TIPS[(new Date().getDate() + new Date().getMonth()) % TIPS.length];

  const recent = (await db.all('sightings')).sort((a, b) => (b.created || 0) - (a.created || 0)).slice(0, 6);
  const recentHtml = recent.length ? `<div class="gallery">${recent.map(s => {
    const a = animals.find(x => x.id === s.animalId);
    const pid = s.photos?.[0];
    return `<a class="ph" href="#/collectie/${encodeURIComponent(s.animalId)}" style="display:block">${pid ? `<img data-photo="${esc(pid)}" alt="">` : `<div style="display:grid;place-items:center;height:100%;font-size:2rem">${esc(a?.emoji || '🐾')}</div>`}
      <div style="position:absolute;left:0;right:0;bottom:0;padding:14px 6px 5px;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;font-size:.7rem;font-weight:700">${esc(a?.name || '')}</div></a>`;
  }).join('')}</div>` : '';

  view.innerHTML = `
    <section class="hero">
      <div class="kicker">${kicker}</div>
      <h1>${heroTitle}</h1>
      <p>${heroSub}</p>
      <div class="tree" aria-hidden="true">🌳</div>
    </section>

    ${tonight ? `<a class="card tight row" href="#/ontdek/overnachten" style="text-decoration:none;color:inherit"><span style="font-size:1.6rem">🛏️</span><div><div class="small muted">Vannacht slaap je in</div><b>${esc(tonight.name)}</b>${tonight.place ? ` <span class="muted">· ${esc(tonight.place)}</span>` : ''}</div></a>` : ''}

    <div class="stats">
      <a class="stat" href="#/collectie"><b>${got}<small style="font-size:.8rem;color:var(--muted)">/${animals.length}</small></b><span>Dieren</span></a>
      <a class="stat" href="#/reis"><b>${entries.length}</b><span>Verhalen</span></a>
      <a class="stat" href="#/ontdek"><b>${visited.length}</b><span>Plekken bezocht</span></a>
    </div>

    <div class="quick">
      <a href="#/reis/nieuw"><span class="ico">✍️</span>Verhaal</a>
      <a href="#/spot"><span class="ico">📸</span>Dier gespot</a>
      <a href="#/paklijst"><span class="ico">🎒</span>Paklijst</a>
      <a href="#/nood"><span class="ico">🆘</span>Nood</a>
      <a href="#/ontdek/kaart"><span class="ico">🗺️</span>Kaart</a>
      <a href="#/ontdek/overnachten"><span class="ico">🛏️</span>Overnachten</a>
      <a href="#/ontdek/supermarkten"><span class="ico">🛒</span>Winkels</a>
      <a href="#/info/geld"><span class="ico">💱</span>Valuta</a>
    </div>

    <div class="card" style="background:var(--accent-soft);border-color:transparent">
      <div class="small" style="font-weight:800;color:var(--accent-2)">💡 TIP VAN DE DAG</div>
      <div>${esc(tip)}</div>
    </div>

    ${recent.length ? `<div class="section-title"><h2>Laatst gespot</h2><a href="#/collectie" class="small">Collectie ›</a></div>${recentHtml}` : ''}

    <div class="section-title"><h2>Niet te missen</h2><a href="#/ontdek" class="small">Alles ›</a></div>
    <div class="list">
      ${ATTRACTIONS.filter(a => a.must).slice(0, 6).map(a => attractionRow(a, visited)).join('')}
    </div>
    <p class="small muted" style="text-align:center">${photoCount} foto's veilig opgeslagen op dit toestel · <a href="#/instellingen">Back-up maken</a></p>
  `;
}, { tab: 'home', title: 'Namibië' });

// Snel een dier spotten
route('/spot', async () => {
  const animals = await allAnimals();
  const sMap = await sightingsByAnimal();
  setTitle('Welk dier zag je?');
  view.innerHTML = `
    <input class="search" id="q" placeholder="Zoek een dier… (bijv. olifant)" autocomplete="off">
    <div class="list" id="res"></div>
    <a class="btn secondary block" href="#/collectie/nieuw">＋ Eigen soort toevoegen</a>`;
  const res = $('#res');
  const draw = q => {
    const f = q.trim().toLowerCase();
    const list = animals.filter(a => !f || a.name.toLowerCase().includes(f) || (a.sci || '').toLowerCase().includes(f));
    res.innerHTML = list.map(a => `<a class="list-item" href="#/collectie/${encodeURIComponent(a.id)}?spot">
      <span class="lead">${esc(a.emoji)}</span><div class="body"><div class="title">${esc(a.name)}</div><div class="sub">${esc(a.sci || '')}</div></div>
      ${sMap.has(a.id) ? '<span class="tag gold">✓ verzameld</span>' : '<span class="chev">›</span>'}</a>`).join('') || '<div class="empty">Niets gevonden. Voeg een eigen soort toe.</div>';
  };
  $('#q').addEventListener('input', e => draw(e.target.value));
  draw('');
  $('#q').focus();
}, { tab: 'collectie', title: 'Dier gespot', parent: '#/' });

// ============ DAGBOEK ============
route('/reis', async () => {
  const list = await trips();
  const entries = await db.all('entries');
  if (!list.length) {
    view.innerHTML = `<div class="empty"><div class="big">📔</div><h2>Begin je reisdagboek</h2>
      <p>Maak een reis aan en leg elke dag je avonturen vast met verhalen, foto's en locaties.</p>
      <button class="btn" id="new">＋ Nieuwe reis</button></div>`;
    $('#new').onclick = () => tripForm();
    return;
  }
  view.innerHTML = `<div class="list">${list.map(tr => {
    const n = entries.filter(e => e.tripId === tr.id).length;
    return `<a class="list-item" href="#/reis/${encodeURIComponent(tr.id)}"><span class="lead">🧳</span><div class="body"><div class="title">${esc(tr.name)}</div>
      <div class="sub">${fmtDate(tr.start, { day: 'numeric', month: 'short', year: 'numeric' })} – ${fmtDate(tr.end, { day: 'numeric', month: 'short', year: 'numeric' })} · ${n} ${n === 1 ? 'verhaal' : 'verhalen'}</div></div><span class="chev">›</span></a>`;
  }).join('')}</div>
  <button class="btn secondary block" id="new">＋ Nieuwe reis</button>`;
  $('#new').onclick = () => tripForm();
}, { tab: 'reis', title: 'Reisdagboek' });

route('/reis/nieuw', async () => {
  const trip = await currentTrip();
  if (!trip) { location.replace('#/reis'); toast('Maak eerst een reis aan.'); return; }
  location.replace('#/reis/' + trip.id);
  const place = sessionStorage.getItem('prefillPlace') || '';
  sessionStorage.removeItem('prefillPlace');
  setTimeout(() => entryForm(trip, null, place), 50);
}, { tab: 'reis' });

function tripForm(trip) {
  const isNew = !trip;
  trip = trip || { id: uid(), name: 'Mijn Namibië-reis', start: todayISO(), end: todayISO(), created: Date.now() };
  const s = openSheet(`
    <h2>${isNew ? 'Nieuwe reis' : 'Reis bewerken'}</h2>
    <label class="f">Naam</label><input class="input" id="name" value="${esc(trip.name)}">
    <div class="row"><div style="flex:1"><label class="f">Vertrek</label><input class="input" type="date" id="start" value="${esc(trip.start)}"></div>
    <div style="flex:1"><label class="f">Terug</label><input class="input" type="date" id="end" value="${esc(trip.end)}"></div></div>
    <label class="f">Reisgenoten (optioneel)</label><input class="input" id="who" value="${esc(trip.who || '')}" placeholder="Bijv. Anna, Tom">
    <div class="row" style="margin-top:18px">
      ${isNew ? '' : '<button class="btn danger" id="del">Verwijderen</button>'}
      <span class="spacer"></span><button class="btn secondary" data-close>Annuleren</button><button class="btn" id="save">Opslaan</button></div>`);
  $('#save', s.root).onclick = async () => {
    trip.name = $('#name', s.root).value.trim() || 'Mijn reis';
    trip.start = $('#start', s.root).value; trip.end = $('#end', s.root).value;
    if (trip.end < trip.start) trip.end = trip.start;
    trip.who = $('#who', s.root).value.trim();
    await db.put('trips', trip);
    s.close('ok');
    if (isNew) location.hash = '#/reis/' + trip.id; else render();
  };
  $('#del', s.root)?.addEventListener('click', async () => {
    s.close('ok');
    if (!(await confirmSheet(`"${trip.name}" en alle verhalen en foto's daarin verwijderen?`))) return;
    for (const e of await db.byIndex('entries', 'tripId', trip.id)) { for (const p of e.photos || []) await deletePhoto(p); await db.del('entries', e.id); }
    await db.del('trips', trip.id);
    location.hash = '#/reis';
  });
}

route('/reis/:id', async id => {
  const trip = await db.get('trips', id);
  if (!trip) { location.hash = '#/reis'; return; }
  setTitle(trip.name);
  const entries = (await db.byIndex('entries', 'tripId', id)).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const total = daysBetween(trip.start, trip.end) + 1;
  const photos = entries.reduce((n, e) => n + (e.photos?.length || 0), 0);
  const km = entries.reduce((n, e) => n + (Number(e.km) || 0), 0);

  $('#topActions').innerHTML = `<button class="icon-btn" id="editTrip" aria-label="Reis bewerken">✏️</button>`;
  $('#editTrip').onclick = () => tripForm(trip);

  view.innerHTML = `
    <div class="card">
      <div class="muted small">${fmtDateLong(trip.start)} – ${fmtDateLong(trip.end)}</div>
      ${trip.who ? `<div class="small">👥 ${esc(trip.who)}</div>` : ''}
      <div class="stats" style="margin:12px 0 0">
        <div class="stat"><b>${total}</b><span>Dagen</span></div>
        <div class="stat"><b>${photos}</b><span>Foto's</span></div>
        <div class="stat"><b>${km.toLocaleString('nl-NL')}</b><span>Km gereden</span></div>
      </div>
    </div>
    ${entries.length ? `<div class="timeline">${entries.map(e => {
      const day = daysBetween(trip.start, e.date) + 1;
      return `<article class="card entry" data-id="${esc(e.id)}">
        <div class="date">${day >= 1 && day <= total ? `Dag ${day} · ` : ''}${fmtDate(e.date)}</div>
        <h3 style="margin:2px 0 4px">${esc(e.title || 'Zonder titel')}</h3>
        ${e.place || e.stay ? `<div class="small muted">${e.place ? `📍 ${esc(e.place)}` : ''}${e.place && e.stay ? ' · ' : ''}${e.stay ? `🛏️ ${esc(e.stay)}` : ''}${Number(e.km) > 0 ? ` · 🚙 ${esc(Number(e.km))} km` : ''}</div>` : ''}
        ${e.text ? `<div class="text" style="margin-top:8px">${esc(e.text)}</div>` : ''}
        ${e.photos?.length ? `<div class="photos">${e.photos.map(p => `<img data-photo="${esc(p)}" data-lb alt="">`).join('')}</div>` : ''}
        <div class="row" style="margin-top:8px"><span class="spacer"></span>
          ${e.lat ? `<a class="btn ghost sm" href="${esc(mapsSearch(Number(e.lat) + ',' + Number(e.lng)))}" target="_blank" rel="noopener">🗺️ Kaart</a>` : ''}
          <button class="btn ghost sm" data-edit="${esc(e.id)}">Bewerken</button></div>
      </article>`;
    }).join('')}</div>` : `<div class="empty"><div class="big">✍️</div>Nog geen verhalen. Tik op ＋ om je eerste dag vast te leggen.</div>`}
  `;
  view.onclick = ev => {
    const ed = ev.target.closest('[data-edit]');
    if (ed) entryForm(trip, entries.find(x => x.id === ed.dataset.edit));
    const img = ev.target.closest('img[data-lb]');
    if (img?.src) lightbox(img.src);
  };
  fab('Nieuw verhaal', () => entryForm(trip));
}, { tab: 'reis', parent: '#/reis' });

function entryForm(trip, entry, prefillPlace = '') {
  const isNew = !entry;
  const t = todayISO();
  entry = entry ? { ...entry } : { id: uid(), tripId: trip.id, date: (t >= trip.start && t <= trip.end) ? t : trip.start, title: '', place: prefillPlace, text: '', photos: [], created: Date.now() };
  const geo = { lat: entry.lat, lng: entry.lng };
  const s = openSheet(`
    <h2>${isNew ? 'Nieuw verhaal' : 'Verhaal bewerken'}</h2>
    <label class="f">Datum</label><input class="input" type="date" id="date" value="${esc(entry.date)}">
    <label class="f">Titel</label><input class="input" id="title" value="${esc(entry.title)}" placeholder="Bijv. Zonsopkomst bij Dune 45">
    <label class="f">Plaats</label><input class="input" id="place" value="${esc(entry.place)}" placeholder="Bijv. Sossusvlei" list="placeList">
    <datalist id="placeList">${ATTRACTIONS.map(a => `<option value="${esc(a.name)}">`).join('')}</datalist>
    <div class="row" style="margin-top:6px"><button type="button" class="btn secondary sm" data-geo>📍 Huidige locatie</button><span class="small muted" data-geo-label></span></div>
    <label class="f">Verhaal</label><textarea class="input" id="text" placeholder="Wat heb je vandaag beleefd?">${esc(entry.text)}</textarea>
    <label class="f">Foto's</label><div class="photo-pick" id="pp"></div>
    <div class="row"><div style="flex:1"><label class="f">Overnachting</label><input class="input" id="stay" value="${esc(entry.stay || '')}" placeholder="Lodge / camping"></div>
    <div style="width:110px"><label class="f">Km gereden</label><input class="input" type="number" inputmode="numeric" id="km" value="${esc(entry.km || '')}"></div></div>
    <div class="row" style="margin-top:18px">
      ${isNew ? '' : '<button class="btn danger" id="del">Verwijderen</button>'}
      <span class="spacer"></span><button class="btn secondary" data-close>Annuleren</button><button class="btn" id="save">Opslaan</button></div>`,
    { onClose: r => { if (r !== 'ok') pp.cancel(); } });
  const pp = photoPicker($('#pp', s.root), entry.photos || []);
  bindLocationButton(s.root, geo);
  $('#save', s.root).onclick = async () => {
    Object.assign(entry, {
      date: $('#date', s.root).value || t, title: $('#title', s.root).value.trim(), place: $('#place', s.root).value.trim(),
      text: $('#text', s.root).value, stay: $('#stay', s.root).value.trim(), km: $('#km', s.root).value, photos: pp.ids, lat: geo.lat, lng: geo.lng, updated: Date.now(),
    });
    await pp.commit();
    await db.put('entries', entry);
    s.close('ok'); toast('Opgeslagen ✓'); render();
  };
  $('#del', s.root)?.addEventListener('click', async () => {
    s.close('cancel');
    if (!(await confirmSheet('Dit verhaal en de foto\'s verwijderen?'))) return;
    for (const p of entry.photos || []) await deletePhoto(p);
    await db.del('entries', entry.id); render();
  });
}

// ============ COLLECTIE ============
let collFilter = 'alle';
route('/collectie', async () => {
  const [animals, sMap] = await Promise.all([allAnimals(), sightingsByAnimal()]);
  const got = animals.filter(a => sMap.has(a.id)).length;
  const pct = Math.round(got / animals.length * 100);
  const covers = new Map();
  for (const a of animals) if (sMap.has(a.id)) covers.set(a.id, await coverFor(a.id, sMap.get(a.id)));

  const cats = [...CATEGORIES, { id: 'eigen', name: 'Eigen soorten' }];
  const filters = [['alle', 'Alle'], ['got', `Verzameld (${got})`], ['todo', 'Nog te vinden'], ...cats.map(c => [c.id, c.name])];
  const pass = a => collFilter === 'alle' || (collFilter === 'got' && sMap.has(a.id)) || (collFilter === 'todo' && !sMap.has(a.id)) || a.cat === collFilter;

  const slot = (a, i) => {
    const list = sMap.get(a.id);
    const n = '#' + String(i + 1).padStart(3, '0');
    if (!list) return `<a class="slot" href="#/collectie/${encodeURIComponent(a.id)}"><span class="num">${n}</span><span class="stars">${stars(a.rarity)}</span><span class="emoji">${esc(a.emoji)}</span><span class="nm">${esc(a.name)}</span></a>`;
    const cover = covers.get(a.id);
    return `<a class="slot got ${cover ? '' : 'noimg'}" href="#/collectie/${encodeURIComponent(a.id)}"><span class="num">${n}</span>${list.length > 1 ? `<span class="count">${list.length}×</span>` : ''}
      ${cover ? `<img data-photo="${esc(cover)}" alt="">` : `<span class="emoji">${esc(a.emoji)}</span>`}<span class="nm">${esc(a.name)}</span></a>`;
  };

  let html = `
    <div class="card">
      <div class="row"><div style="font-size:2rem">📖</div><div style="flex:1"><b>Mijn dierenboek</b><div class="small muted">${got} van ${animals.length} soorten verzameld</div></div><b style="font-size:1.4rem;color:var(--accent)">${pct}%</b></div>
      <div class="progress" style="margin-top:10px"><div style="width:${pct}%"></div></div>
      ${badges(got, sMap, animals)}
    </div>
    <div class="chips">${filters.map(([id, nm]) => `<button class="chip ${collFilter === id ? 'active' : ''}" data-f="${id}">${esc(nm)}</button>`).join('')}</div>`;
  for (const c of cats) {
    const items = animals.map((a, i) => [a, i]).filter(([a]) => a.cat === c.id && pass(a));
    if (!items.length) continue;
    const gotHere = animals.filter(a => a.cat === c.id && sMap.has(a.id)).length;
    const totHere = animals.filter(a => a.cat === c.id).length;
    html += `<div class="section-title"><h3 style="margin:0">${esc(c.name)}</h3><span class="small muted">${gotHere}/${totHere}</span></div>
      <div class="collection">${items.map(([a, i]) => slot(a, i)).join('')}</div>`;
  }
  html += `<div style="margin-top:20px"><a class="btn secondary block" href="#/collectie/nieuw">＋ Eigen soort toevoegen</a></div>`;
  view.innerHTML = html;
  $$('.chip', view).forEach(b => b.onclick = () => { collFilter = b.dataset.f; render(); });
  fab('Dier gespot', () => { location.hash = '#/spot'; });
}, { tab: 'collectie', title: 'Dierencollectie' });

function badges(got, sMap, animals) {
  const has = id => sMap.has(id);
  const list = [
    { e: '🐣', n: 'Eerste waarneming', ok: got >= 1 },
    { e: '🔟', n: '10 soorten', ok: got >= 10 },
    { e: '🏅', n: '25 soorten', ok: got >= 25 },
    { e: '🏆', n: '50 soorten', ok: got >= 50 },
    { e: '👑', n: 'Grote Vijf', ok: ['olifant', 'leeuw', 'luipaard', 'buffel'].every(has) && (has('zwarteneushoorn') || has('wittenneushoorn')) },
    { e: '🐈', n: 'Katachtigen (leeuw, luipaard, cheetah)', ok: ['leeuw', 'luipaard', 'jachtluipaard'].every(has) },
    { e: '🌊', n: 'Kustkenner (3 zeedieren)', ok: animals.filter(a => a.cat === 'zee' && has(a.id)).length >= 3 },
    { e: '💎', n: 'Zeldzaam (3 zeldzame soorten)', ok: animals.filter(a => a.rarity === 3 && has(a.id)).length >= 3 },
  ];
  return `<div class="row wrap" style="margin-top:12px;gap:6px">${list.map(b => `<span class="tag ${b.ok ? 'gold' : ''}" title="${esc(b.n)}" style="${b.ok ? '' : 'opacity:.45'}">${b.e} ${esc(b.n)}</span>`).join('')}</div>`;
}

route('/collectie/nieuw', async () => {
  view.innerHTML = `<div class="card">
    <p class="muted">Een dier gezien dat niet in de lijst staat? Voeg het toe aan je boek.</p>
    <label class="f">Naam</label><input class="input" id="name" placeholder="Bijv. Kudu-mier, Rotsklipdas…">
    <label class="f">Wetenschappelijke naam (optioneel)</label><input class="input" id="sci">
    <label class="f">Emoji</label><input class="input" id="emoji" value="🐾" maxlength="4" style="width:90px">
    <label class="f">Categorie</label><select class="input" id="cat">${CATEGORIES.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}<option value="eigen" selected>Eigen soorten</option></select>
    <button class="btn block" id="save" style="margin-top:16px">Toevoegen</button></div>`;
  $('#save').onclick = async () => {
    const name = $('#name').value.trim();
    if (!name) return toast('Vul een naam in.');
    const list = await db.getKV('customAnimals', []);
    const a = { id: 'c_' + uid(), name, sci: $('#sci').value.trim(), emoji: $('#emoji').value.trim() || '🐾', cat: $('#cat').value, rarity: 2, custom: true, where: '', fact: '' };
    list.push(a); await db.setKV('customAnimals', list);
    location.replace('#/collectie/' + a.id + '?spot');
  };
}, { tab: 'collectie', title: 'Eigen soort', parent: '#/collectie' });

route('/collectie/:id', async rawId => {
  const [id, query] = rawId.split('?');
  const animals = await allAnimals();
  const idx = animals.findIndex(a => a.id === id);
  const a = animals[idx];
  if (!a) { location.hash = '#/collectie'; return; }
  setTitle(a.name);
  const sightings = (await db.byIndex('sightings', 'animalId', id)).sort((x, y) => (x.date || '').localeCompare(y.date || ''));
  const cover = await coverFor(id, sightings);
  const photos = sightings.flatMap(s => (s.photos || []).map(p => ({ p, s })));

  view.innerHTML = `
    <div class="animal-hero">${cover ? `<img data-photo="${esc(cover)}" alt="">` : `<span class="emoji">${esc(a.emoji)}</span>`}</div>
    <div class="card">
      <div class="row"><span class="tag">#${String(idx + 1).padStart(3, '0')}</span>${sightings.length ? '<span class="tag gold">✓ Verzameld</span>' : '<span class="tag">Nog niet gespot</span>'}<span class="spacer"></span>
        <span class="small" style="color:var(--gold)" title="${rarityLabel(a.rarity)}">${stars(a.rarity || 1)}</span></div>
      <h1 style="margin:10px 0 2px">${esc(a.emoji)} ${esc(a.name)}</h1>
      ${a.sci ? `<div class="muted" style="font-style:italic">${esc(a.sci)}</div>` : ''}
      ${a.fact ? `<p style="margin-top:12px">${esc(a.fact)}</p>` : ''}
      ${a.where ? `<div class="note">🔎 <b>Waar te zien:</b> ${esc(a.where)}</div>` : ''}
      ${a.custom ? `<div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn danger sm" id="delCustom">Soort verwijderen</button></div>` : ''}
    </div>
    <button class="btn block" id="spot" style="margin-bottom:14px">📸 ${sightings.length ? 'Nog een waarneming toevoegen' : 'Ik heb dit dier gespot!'}</button>
    ${photos.length ? `<div class="section-title"><h2>Mijn foto's</h2><span class="small muted">${photos.length}</span></div>
      <div class="gallery">${photos.map(({ p }) => `<div class="ph" data-p="${esc(p)}"><img data-photo="${esc(p)}" alt="">${p === cover ? '<span class="tag gold" style="position:absolute;left:4px;bottom:4px">omslag</span>' : ''}</div>`).join('')}</div>` : ''}
    ${sightings.length ? `<div class="section-title"><h2>Waarnemingen</h2></div><div class="list">${sightings.map(s => `
      <div class="list-item" data-s="${esc(s.id)}"><span class="lead">👁️</span><div class="body"><div class="title">${fmtDate(s.date)}${s.place ? ` · ${esc(s.place)}` : ''}</div>
      <div class="sub">${esc(s.note || (s.photos?.length ? `${s.photos.length} foto('s)` : 'Zonder foto'))}</div></div><span class="chev">›</span></div>`).join('')}</div>` : ''}
  `;
  $('#spot').onclick = () => sightingForm(a);
  $$('[data-s]').forEach(el => el.onclick = () => sightingForm(a, sightings.find(s => s.id === el.dataset.s)));
  $$('.gallery .ph').forEach(el => el.onclick = () => {
    const pid = el.dataset.p; const img = $('img', el);
    if (!img.src) return;
    lightbox(img.src, `<button class="btn sm" data-cover>⭐ Als omslag</button>`, (lb, close) => {
      $('[data-cover]', lb).onclick = async e => { e.stopPropagation(); await db.setKV('covers', { ...(await db.getKV('covers', {})), [id]: pid }); close(); toast('Omslagfoto ingesteld'); render(); };
    });
  });
  $('#delCustom')?.addEventListener('click', async () => {
    if (!(await confirmSheet(`"${a.name}" en alle waarnemingen verwijderen?`))) return;
    for (const s of sightings) { for (const p of s.photos || []) await deletePhoto(p); await db.del('sightings', s.id); }
    await db.setKV('customAnimals', (await db.getKV('customAnimals', [])).filter(x => x.id !== id));
    location.hash = '#/collectie';
  });
  if (query === 'spot') { history.replaceState(null, '', '#/collectie/' + encodeURIComponent(id)); sightingForm(a); }
}, { tab: 'collectie', parent: '#/collectie' });

async function sightingForm(animal, s) {
  const isNew = !s;
  const trip = await currentTrip();
  s = s ? { ...s } : { id: uid(), animalId: animal.id, date: todayISO(), place: '', note: '', photos: [], created: Date.now(), tripId: trip?.id };
  const geo = { lat: s.lat, lng: s.lng };
  const wasFirst = isNew && !(await db.byIndex('sightings', 'animalId', animal.id)).length;
  const sh = openSheet(`
    <h2>${esc(animal.emoji)} ${esc(animal.name)}</h2>
    <label class="f">Foto's van dit dier</label><div class="photo-pick" id="pp"></div>
    <div class="small muted" style="margin-top:4px">Tip: kies je beste foto's uit je galerij of maak er direct een.</div>
    <label class="f">Datum</label><input class="input" type="date" id="date" value="${esc(s.date)}">
    <label class="f">Waar?</label><input class="input" id="place" value="${esc(s.place)}" placeholder="Bijv. Okaukuejo waterpoel" list="placeList2">
    <datalist id="placeList2">${ATTRACTIONS.map(a => `<option value="${esc(a.name)}">`).join('')}</datalist>
    <div class="row" style="margin-top:6px"><button type="button" class="btn secondary sm" data-geo>📍 Huidige locatie</button><span class="small muted" data-geo-label></span></div>
    <label class="f">Notitie</label><textarea class="input" id="note" style="min-height:70px" placeholder="Bijv. moeder met 2 jongen bij zonsondergang">${esc(s.note)}</textarea>
    <div class="row" style="margin-top:18px">
      ${isNew ? '' : '<button class="btn danger" id="del">Verwijderen</button>'}
      <span class="spacer"></span><button class="btn secondary" data-close>Annuleren</button><button class="btn" id="save">${isNew ? 'Toevoegen aan boek' : 'Opslaan'}</button></div>`,
    { onClose: r => { if (r !== 'ok') pp.cancel(); } });
  const pp = photoPicker($('#pp', sh.root), s.photos || []);
  bindLocationButton(sh.root, geo);
  $('#save', sh.root).onclick = async () => {
    Object.assign(s, { date: $('#date', sh.root).value || todayISO(), place: $('#place', sh.root).value.trim(), note: $('#note', sh.root).value.trim(), photos: pp.ids, lat: geo.lat, lng: geo.lng });
    await pp.commit();
    await db.put('sightings', s);
    sh.close('ok');
    if (wasFirst) celebrate(animal); else toast('Opgeslagen ✓');
    render();
  };
  $('#del', sh.root)?.addEventListener('click', async () => {
    sh.close('cancel');
    if (!(await confirmSheet('Deze waarneming en foto\'s verwijderen?'))) return;
    for (const p of s.photos || []) await deletePhoto(p);
    await db.del('sightings', s.id); render();
  });
}

async function celebrate(animal) {
  const [animals, sMap] = await Promise.all([allAnimals(), sightingsByAnimal()]);
  const got = animals.filter(a => sMap.has(a.id)).length;
  const s = openSheet(`<div class="celebrate"><div class="big">${esc(animal.emoji)}</div>
    <h2>Nieuw in je collectie!</h2><p><b>${esc(animal.name)}</b> is toegevoegd aan je dierenboek.<br>Je hebt nu <b>${got}</b> van ${animals.length} soorten.</p>
    <button class="btn block" data-close>Top! 🎉</button></div>`);
  setTimeout(() => s.close(), 6000);
}

// ============ ONTDEK ============
const ontdekTabs = [['bezienswaardigheden', '📍 Bezienswaardig'], ['overnachten', '🛏️ Overnachten'], ['supermarkten', '🛒 Supermarkten'], ['kaart', '🗺️ Kaart']];
let regionFilter = 'alle';
const tabsHtml = active => `<div class="chips">${ontdekTabs.map(([id, nm]) => `<a class="chip ${active === id ? 'active' : ''}" href="#/ontdek/${id}" style="text-decoration:none">${nm}</a>`).join('')}</div>`;
const regionChips = () => `<div class="chips">${[['alle', 'Heel Namibië'], ...REGIONS.map(r => [r.id, r.name])].map(([id, nm]) => `<button class="chip ${regionFilter === id ? 'active' : ''}" data-r="${id}">${esc(nm)}</button>`).join('')}</div>`;
const bindRegionChips = () => $$('[data-r]', view).forEach(b => b.onclick = () => { regionFilter = b.dataset.r; render(); });

function attractionRow(a, visited = [], wish = []) {
  const v = visited.includes(a.id), w = wish.includes(a.id);
  return `<a class="list-item" href="#/plek/${encodeURIComponent(a.id)}"><span class="lead">${v ? '✅' : typeEmoji(a.type)}</span>
    <div class="body"><div class="title">${esc(a.name)} ${a.must ? '<span class="tag accent">must-see</span>' : ''} ${w ? '♥' : ''}</div>
    <div class="sub">${esc(a.type)} · ${esc(regionName(a.region))}</div></div><span class="chev">›</span></a>`;
}
const typeEmoji = t => ({ Natuur: '🏜️', Wildlife: '🦓', Cultuur: '🏛️', Stad: '🏙️', Dorp: '🏘️', Route: '🛣️', 'Foto-stop': '📷', Bijzonder: '☄️', Ontspanning: '♨️' }[t] || '📍');

route('/ontdek', () => { location.replace('#/ontdek/bezienswaardigheden'); }, { tab: 'ontdek' });

route('/ontdek/bezienswaardigheden', async () => {
  const [visited, wish] = await Promise.all([db.getKV('visited', []), db.getKV('wishlist', [])]);
  const list = ATTRACTIONS.filter(a => regionFilter === 'alle' || a.region === regionFilter);
  view.innerHTML = tabsHtml('bezienswaardigheden') + regionChips() + `
    <input class="search" id="q" placeholder="Zoek een plek…">
    <div class="small muted" style="margin:-4px 2px 10px">${visited.length} van ${ATTRACTIONS.length} plekken bezocht · ${wish.length} op je wensenlijst</div>
    <div class="list" id="res"></div>`;
  const draw = q => {
    const f = q.toLowerCase();
    $('#res').innerHTML = list.filter(a => !f || (a.name + a.desc).toLowerCase().includes(f)).map(a => attractionRow(a, visited, wish)).join('') || '<div class="empty">Geen resultaten</div>';
  };
  $('#q').oninput = e => draw(e.target.value);
  draw(''); bindRegionChips();
}, { tab: 'ontdek', title: 'Ontdek' });

route('/plek/:id', async id => {
  const a = ATTRACTIONS.find(x => x.id === id);
  if (!a) { location.hash = '#/ontdek'; return; }
  setTitle(a.name);
  const [visited, wish] = await Promise.all([db.getKV('visited', []), db.getKV('wishlist', [])]);
  const v = visited.includes(id), w = wish.includes(id);
  const stays = ACCOMMODATIONS.filter(x => x.region === a.region).slice(0, 4);
  const shops = SUPERMARKETS.filter(x => x.region === a.region);
  view.innerHTML = `
    <div class="card">
      <div class="row wrap" style="gap:6px"><span class="tag">${typeEmoji(a.type)} ${esc(a.type)}</span><span class="tag">${esc(regionName(a.region))}</span>${a.must ? '<span class="tag accent">must-see</span>' : ''}${v ? '<span class="tag green">✓ bezocht</span>' : ''}</div>
      <h1 style="margin:12px 0 8px">${esc(a.name)}</h1>
      <p>${esc(a.desc)}</p>
      ${a.tips ? `<div class="note">💡 <b>Tip:</b> ${esc(a.tips)}</div>` : ''}
      <div class="small muted" style="margin-top:8px">Coördinaten (indicatief): ${a.lat}, ${a.lng}</div>
      <div class="row wrap" style="margin-top:14px">
        <a class="btn" href="${navigator.onLine ? mapsRoute(a.name + ', Namibia') : nativeMap(a.lat, a.lng, a.name)}" target="_blank" rel="noopener">🧭 Route</a>
        <a class="btn secondary" href="${nativeMap(a.lat, a.lng, a.name)}">📍 Kaart-app</a>
        <button class="btn secondary" id="visit">${v ? '✓ Bezocht' : 'Markeer als bezocht'}</button>
        <button class="btn secondary" id="wish" aria-label="Wensenlijst">${w ? '♥' : '♡'}</button>
      </div>
    </div>
    <a class="btn secondary block" href="#/reis/nieuw" id="write" style="margin-bottom:14px">✍️ Schrijf hierover in je dagboek</a>
    ${stays.length ? `<div class="section-title"><h2>Overnachten in de regio</h2><a class="small" href="#/ontdek/overnachten" id="moreStay">Meer ›</a></div>
      <div class="list">${stays.map(accRow).join('')}</div>` : ''}
    ${shops.length ? `<div class="section-title"><h2>Boodschappen in de regio</h2></div><div class="list">${shops.map(shopRow).join('')}</div>` : ''}
  `;
  const toggle = async (key, list, flag) => { const set = new Set(list); flag ? set.delete(id) : set.add(id); await db.setKV(key, [...set]); render(); };
  $('#visit').onclick = () => { toggle('visited', visited, v); if (!v) toast('Bezocht ✓'); };
  $('#wish').onclick = () => toggle('wishlist', wish, w);
  $('#moreStay').onclick = () => { regionFilter = a.region; };
  $('#write').onclick = () => sessionStorage.setItem('prefillPlace', a.name);
}, { tab: 'ontdek', parent: '#/ontdek/bezienswaardigheden' });

const accRow = x => `<div class="list-item" style="cursor:default"><span class="lead">${x.type.includes('Camp') ? '⛺' : x.type === 'Hostel' ? '🎒' : '🏨'}</span>
  <div class="body"><div class="title">${esc(x.name)} <span class="tag">${esc(x.price)}</span></div>
  <div class="sub" style="white-space:normal">${esc(x.type)} · ${esc(x.place)}<br>${esc(x.note)}</div></div>
  <div class="stack" style="flex:none;text-align:right"><a class="btn ghost sm" href="${mapsSearch(x.name + ', ' + x.place + ', Namibia')}" target="_blank" rel="noopener">🗺️</a>
  <a class="btn ghost sm" href="https://www.google.com/search?q=${encodeURIComponent(x.name + ' ' + x.place + ' Namibia')}" target="_blank" rel="noopener">🔎</a></div></div>`;

const shopRow = s => `<a class="list-item" href="${mapsSearch('supermarket ' + s.place + ', Namibia')}" target="_blank" rel="noopener"><span class="lead">🛒</span>
  <div class="body"><div class="title">${esc(s.place)}</div><div class="sub" style="white-space:normal">${esc(s.chains)}${s.where ? ` · ${esc(s.where)}` : ''}${s.tip ? `<br>💡 ${esc(s.tip)}` : ''}</div></div><span class="chev">🗺️</span></a>`;

route('/ontdek/overnachten', async () => {
  const bookings = (await db.getKV('bookings', [])).sort((a, b) => (a.checkin || '').localeCompare(b.checkin || ''));
  const list = ACCOMMODATIONS.filter(a => regionFilter === 'alle' || a.region === regionFilter);
  let html = tabsHtml('overnachten') + `
    <div class="section-title" style="margin-top:4px"><h2>Mijn boekingen</h2><button class="btn ghost sm" id="addB">＋ Toevoegen</button></div>
    ${bookings.length ? `<div class="list">${bookings.map(b => `<div class="list-item" data-b="${esc(b.id)}"><span class="lead">🛏️</span><div class="body">
      <div class="title">${esc(b.name)}</div><div class="sub">${b.checkin ? fmtDate(b.checkin, { day: 'numeric', month: 'short' }) : ''}${b.checkout ? ' → ' + fmtDate(b.checkout, { day: 'numeric', month: 'short' }) : ''}${b.place ? ' · ' + esc(b.place) : ''}${b.ref ? ' · #' + esc(b.ref) : ''}</div></div><span class="chev">›</span></div>`).join('')}</div>`
      : `<div class="card tight small muted">Bewaar hier je geboekte lodges en campings met datum, boekingsnummer en telefoonnummer – ook offline beschikbaar.</div>`}
    <div class="section-title"><h2>Aanraders per regio</h2></div>
    ${regionChips()}
    <p class="small muted">€ = budget/camping · €€ = middenklasse · €€€ = luxe · €€€€ = top-luxe. NWR = staatskampen (Namibia Wildlife Resorts) – in het hoogseizoen ruim vooruit boeken.</p>`;
  for (const r of REGIONS) {
    const items = list.filter(a => a.region === r.id);
    if (items.length) html += `<h3 style="margin:16px 2px 8px">${esc(r.name)}</h3><div class="list">${items.map(accRow).join('')}</div>`;
  }
  view.innerHTML = html;
  bindRegionChips();
  $('#addB').onclick = () => bookingForm();
  $$('[data-b]').forEach(el => el.onclick = () => bookingForm(bookings.find(b => b.id === el.dataset.b)));
}, { tab: 'ontdek', title: 'Overnachten' });

function bookingForm(b) {
  const isNew = !b;
  b = b ? { ...b } : { id: uid(), name: '', place: '', checkin: todayISO(), checkout: '', ref: '', phone: '', note: '' };
  const s = openSheet(`<h2>${isNew ? 'Boeking toevoegen' : 'Boeking'}</h2>
    <label class="f">Accommodatie</label><input class="input" id="name" value="${esc(b.name)}" list="accList" placeholder="Naam lodge / camping">
    <datalist id="accList">${ACCOMMODATIONS.map(a => `<option value="${esc(a.name)}">`).join('')}</datalist>
    <label class="f">Plaats</label><input class="input" id="place" value="${esc(b.place)}">
    <div class="row"><div style="flex:1"><label class="f">Inchecken</label><input class="input" type="date" id="in" value="${esc(b.checkin)}"></div>
    <div style="flex:1"><label class="f">Uitchecken</label><input class="input" type="date" id="out" value="${esc(b.checkout)}"></div></div>
    <label class="f">Boekingsnummer</label><input class="input" id="ref" value="${esc(b.ref)}">
    <label class="f">Telefoon</label><input class="input" type="tel" id="phone" value="${esc(b.phone)}">
    <label class="f">Notities</label><textarea class="input" id="note" style="min-height:70px" placeholder="Bijv. diner inbegrepen, check-in vóór 18:00">${esc(b.note)}</textarea>
    ${!isNew && b.phone ? `<a class="btn secondary block" style="margin-top:12px" href="tel:${esc(b.phone.replace(/\s/g, ''))}">📞 Bellen</a>` : ''}
    ${!isNew ? `<a class="btn secondary block" style="margin-top:8px" href="${mapsRoute(b.name + ', ' + b.place + ', Namibia')}" target="_blank" rel="noopener">🧭 Route</a>` : ''}
    <div class="row" style="margin-top:18px">${isNew ? '' : '<button class="btn danger" id="del">Verwijderen</button>'}<span class="spacer"></span>
    <button class="btn secondary" data-close>Annuleren</button><button class="btn" id="save">Opslaan</button></div>`);
  const nameInput = $('#name', s.root);
  nameInput.addEventListener('change', () => { const m = ACCOMMODATIONS.find(a => a.name === nameInput.value); if (m && !$('#place', s.root).value) $('#place', s.root).value = m.place; });
  $('#save', s.root).onclick = async () => {
    Object.assign(b, { name: nameInput.value.trim() || 'Accommodatie', place: $('#place', s.root).value.trim(), checkin: $('#in', s.root).value, checkout: $('#out', s.root).value, ref: $('#ref', s.root).value.trim(), phone: $('#phone', s.root).value.trim(), note: $('#note', s.root).value });
    const list = (await db.getKV('bookings', [])).filter(x => x.id !== b.id);
    list.push(b); await db.setKV('bookings', list);
    s.close('ok'); render();
  };
  $('#del', s.root)?.addEventListener('click', async () => {
    await db.setKV('bookings', (await db.getKV('bookings', [])).filter(x => x.id !== b.id));
    s.close('ok'); render();
  });
}

route('/ontdek/supermarkten', async () => {
  const list = SUPERMARKETS.filter(s => regionFilter === 'alle' || s.region === regionFilter);
  view.innerHTML = tabsHtml('supermarkten') + `
    <div class="card">
      <h2>🛒 Supermarktketens</h2>
      <dl class="facts">${SUPERMARKET_CHAINS.map(c => `<dt>${esc(c.name)}</dt><dd>${esc(c.note)}</dd>`).join('')}</dl>
      <div class="note" style="margin-top:12px">💡 Winkels sluiten vaak vroeg (doordeweeks ca. 18:00–19:00, zaterdag vaak eerder, zondag beperkt). Alcohol wordt op zondag en 's avonds niet altijd verkocht. Sla grote boodschappen in bij de grotere plaatsen – onderweg is het aanbod beperkt.</div>
    </div>
    ${regionChips()}
    <div class="list">${list.map(shopRow).join('')}</div>
    <p class="small muted">Tik op een plaats om supermarkten in de buurt te openen in Google Maps.</p>`;
  bindRegionChips();
}, { tab: 'ontdek', title: 'Supermarkten' });

const TOWNS = [
  ['Windhoek', -22.56, 17.08], ['Swakopmund', -22.68, 14.53], ['Walvis Bay', -22.96, 14.51, 'left'], ['Lüderitz', -26.65, 15.16, 'left'],
  ['Keetmanshoop', -26.58, 18.13], ['Mariental', -24.63, 17.96], ['Sesriem', -24.49, 15.80, 'left'], ['Otjiwarongo', -20.46, 16.65],
  ['Outjo', -20.11, 16.15, 'left'], ['Tsumeb', -19.24, 17.71], ['Opuwo', -18.06, 13.84], ['Rundu', -17.92, 19.77], ['Katima Mulilo', -17.50, 24.27],
];

route('/ontdek/kaart', async () => {
  view.innerHTML = tabsHtml('kaart') + `<div id="map"><div class="empty">Kaart laden…</div></div>
    <div class="row wrap small muted" style="margin-top:8px;gap:12px">
      <span><span style="color:#c4561f">●</span> Must-see</span><span><span style="color:#d9a520">●</span> Bezienswaardigheid</span>
      <span><span style="color:#5d7a3a">●</span> Bezocht</span><span><span style="color:#2f6f8f">●</span> Mijn verhalen & waarnemingen</span></div>
    <p class="small muted">${navigator.onLine
      ? 'Gebieden die je nu bekijkt worden bewaard en zijn later ook offline zichtbaar.'
      : '📴 Offline: je ziet de basiskaart plus eerder bekeken gebieden.'} Locaties zijn indicatief – gebruik "Route" of je kaart-app om te navigeren.</p>`;
  let L;
  try { L = await loadLeaflet(); } catch {
    $('#map').innerHTML = '<div class="empty"><div class="big">🗺️</div>De kaart kon niet geladen worden.</div>';
    return;
  }
  $('#map').innerHTML = '';
  const map = L.map('map', { zoomControl: true, minZoom: 4, maxZoom: 17 }).setView([-22.3, 17.2], 5);
  // Offline basiskaart: landsgrenzen onder de (online) kaarttegels.
  map.createPane('base'); map.getPane('base').style.zIndex = 150;
  L.geoJSON(BORDERS, {
    pane: 'base', interactive: false,
    style: f => f.properties.home
      ? { color: '#8a3a12', weight: 2, fillColor: '#f1c58f', fillOpacity: 1 }
      : { color: '#b9a690', weight: 1, fillColor: '#e9e1d6', fillOpacity: 1 },
  }).addTo(map);
  for (const [name, lat, lng, dir = 'right'] of TOWNS) {
    L.circleMarker([lat, lng], { pane: 'base', radius: 3, color: '#2b211a', weight: 1, fillColor: '#2b211a', fillOpacity: 1, interactive: false })
      .bindTooltip(name, { permanent: true, direction: dir, className: 'town-label', offset: [dir === 'left' ? -4 : 4, 0] }).addTo(map);
  }
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap · grenzen: Natural Earth' }).addTo(map);
  const visited = await db.getKV('visited', []);
  for (const a of ATTRACTIONS) {
    const color = visited.includes(a.id) ? '#5d7a3a' : a.must ? '#c4561f' : '#d9a520';
    L.circleMarker([a.lat, a.lng], { radius: a.must ? 9 : 7, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 })
      .addTo(map).bindPopup(`<b>${esc(a.name)}</b><br>${esc(a.type)}<br><a href="#/plek/${encodeURIComponent(a.id)}">Meer info ›</a>`);
  }
  const animals = await allAnimals();
  for (const e of await db.all('entries')) if (e.lat) L.circleMarker([e.lat, e.lng], { radius: 6, color: '#fff', weight: 2, fillColor: '#2f6f8f', fillOpacity: 1 }).addTo(map).bindPopup(`✍️ <b>${esc(e.title || 'Verhaal')}</b><br>${fmtDate(e.date)}`);
  for (const s of await db.all('sightings')) if (s.lat) { const an = animals.find(x => x.id === s.animalId); L.circleMarker([s.lat, s.lng], { radius: 6, color: '#fff', weight: 2, fillColor: '#2f6f8f', fillOpacity: 1 }).addTo(map).bindPopup(`${esc(an?.emoji || '🐾')} <b>${esc(an?.name || '')}</b><br>${fmtDate(s.date)}`); }
  const locBtn = L.control({ position: 'topright' });
  locBtn.onAdd = () => { const b = L.DomUtil.create('button', 'btn sm'); b.textContent = '📍 Ik'; b.onclick = async e => { L.DomEvent.stopPropagation(e); try { const p = await getLocation(); L.circleMarker([p.lat, p.lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#1a73e8', fillOpacity: 1 }).addTo(map); map.setView([p.lat, p.lng], 10); } catch { toast('Locatie niet gevonden'); } }; return b; };
  locBtn.addTo(map);
  setTimeout(() => map.invalidateSize(), 100);
  currentCleanup = () => map.remove();
}, { tab: 'ontdek', title: 'Kaart' });

// Leaflet staat lokaal in /vendor, zodat de kaart ook offline werkt.
let leafletPromise;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  leafletPromise ||= new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'vendor/leaflet/leaflet.css';
    document.head.append(css);
    const s = document.createElement('script');
    s.src = 'vendor/leaflet/leaflet.js';
    s.onload = () => resolve(window.L);
    s.onerror = () => { leafletPromise = null; s.remove(); reject(new Error('leaflet')); };
    document.head.append(s);
  });
  return leafletPromise;
}

// ============ INFO ============
route('/info', async () => {
  const rate = await db.getKV('rate', 20);
  view.innerHTML = `
    <div class="card"><h2>🇳🇦 Namibië in het kort</h2><dl class="facts">${FACTS.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
    ${converterHtml(rate)}
    <div class="list">
      <a class="list-item" href="#/paklijst"><span class="lead">🎒</span><div class="body"><div class="title">Paklijst</div><div class="sub">Afvinken wat je hebt ingepakt</div></div><span class="chev">›</span></a>
      <a class="list-item" href="#/nood"><span class="lead">🆘</span><div class="body"><div class="title">Noodnummers & contacten</div><div class="sub">Politie, ambassade, je eigen contacten</div></div><span class="chev">›</span></a>
      <a class="list-item" href="#/taal"><span class="lead">💬</span><div class="body"><div class="title">Handige zinnetjes</div><div class="sub">Afrikaans, Oshiwambo, Otjiherero</div></div><span class="chev">›</span></a>
    </div>
    <div class="section-title"><h2>Praktische informatie</h2></div>
    <div class="list">${SECTIONS.map(s => `<a class="list-item" href="#/info/${s.id}"><span class="lead">${s.icon}</span><div class="body"><div class="title">${esc(s.title)}</div></div><span class="chev">›</span></a>`).join('')}</div>
    <div class="list"><a class="list-item" href="#/instellingen"><span class="lead">⚙️</span><div class="body"><div class="title">Instellingen & back-up</div><div class="sub">Exporteer je dagboek en collectie</div></div><span class="chev">›</span></a></div>
    <p class="small muted">Informatie kan veranderen. Controleer reisadvies en inreisregels vlak voor vertrek op nederlandwereldwijd.nl.</p>`;
  bindConverter();
}, { tab: 'info', title: 'Reisinformatie' });

const converterHtml = rate => `<div class="card"><h2>💱 Valuta-omrekenen</h2>
  <div class="converter"><div><label class="f">Euro (€)</label><input class="input" id="eur" type="number" inputmode="decimal" value="10"></div>
  <div class="swap">⇄</div><div><label class="f">N$ / Rand</label><input class="input" id="nad" type="number" inputmode="decimal"></div></div>
  <div class="row small muted" style="margin-top:8px">Koers: €1 = N$ <input id="rate" type="number" step="0.01" inputmode="decimal" value="${esc(rate)}" class="input" style="width:90px;padding:5px 8px;margin-left:4px"><span class="spacer"></span></div>
  <div class="small muted">Pas de koers aan naar de actuele wisselkoers (zie je bank-app). N$ en rand zijn 1:1.</div></div>`;
function bindConverter() {
  const eur = $('#eur'), nad = $('#nad'), rate = $('#rate');
  const r = () => parseFloat(rate.value) || 20;
  const fromEur = () => { nad.value = eur.value === '' ? '' : (parseFloat(eur.value) * r()).toFixed(2); };
  eur.oninput = fromEur;
  nad.oninput = () => { eur.value = nad.value === '' ? '' : (parseFloat(nad.value) / r()).toFixed(2); };
  rate.oninput = () => { fromEur(); db.setKV('rate', r()); };
  fromEur();
}

route('/info/:id', async id => {
  const s = SECTIONS.find(x => x.id === id);
  if (!s) { location.hash = '#/info'; return; }
  setTitle(s.title);
  view.innerHTML = `<div class="card prose"><h1>${s.icon} ${esc(s.title)}</h1>${s.body}</div>`;
  if (id === 'geld') { view.insertAdjacentHTML('afterbegin', converterHtml(await db.getKV('rate', 20))); bindConverter(); }
}, { tab: 'info', parent: '#/info' });

route('/paklijst', async () => {
  const done = await db.getKV('packing', {});
  const custom = await db.getKV('packingCustom', []);
  const groups = [...PACKING, ...(custom.length ? [{ group: 'Eigen items', items: custom, custom: true }] : [])];
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  view.innerHTML = `
    <div class="card"><div class="row"><b style="flex:1" id="pkCount"></b><span style="color:var(--accent);font-weight:800" id="pkPct"></span></div>
      <div class="progress" style="margin-top:8px"><div id="pkBar"></div></div></div>
    ${groups.map(g => `<h3 style="margin:16px 2px 8px">${esc(g.group)}</h3><div class="list">${g.items.map(i => `
      <label class="check ${done[i] ? 'done' : ''}"><input type="checkbox" data-i="${esc(i)}" ${done[i] ? 'checked' : ''}><span style="flex:1">${esc(i)}</span>
      ${g.custom ? `<button class="btn ghost sm" data-rmc="${esc(i)}">✕</button>` : ''}</label>`).join('')}</div>`).join('')}
    <div class="row" style="margin-top:12px"><input class="input" id="newItem" placeholder="Eigen item toevoegen…"><button class="btn" id="add">＋</button></div>
    <button class="btn ghost block" id="reset" style="margin-top:10px">Alles uitvinken</button>`;
  const upd = () => {
    const n = groups.reduce((c, g) => c + g.items.filter(i => done[i]).length, 0);
    $('#pkCount').textContent = `${n} van ${total} ingepakt`;
    $('#pkPct').textContent = Math.round(n / total * 100) + '%';
    $('#pkBar').style.width = (n / total * 100) + '%';
  };
  upd();
  $$('[data-i]').forEach(cb => cb.onchange = async () => { done[cb.dataset.i] = cb.checked; cb.closest('.check').classList.toggle('done', cb.checked); upd(); await db.setKV('packing', done); });
  $$('[data-rmc]').forEach(b => b.onclick = async e => { e.preventDefault(); await db.setKV('packingCustom', custom.filter(x => x !== b.dataset.rmc)); render(); });
  const add = async () => { const v = $('#newItem').value.trim(); if (!v) return; custom.push(v); await db.setKV('packingCustom', custom); render(); };
  $('#add').onclick = add; $('#newItem').onkeydown = e => { if (e.key === 'Enter') add(); };
  $('#reset').onclick = async () => { if (await confirmSheet('Alle vinkjes weghalen?', 'Uitvinken')) { await db.setKV('packing', {}); render(); } };
}, { tab: 'info', title: 'Paklijst', parent: '#/info' });

route('/nood', async () => {
  const contacts = await db.getKV('contacts', []);
  view.innerHTML = `
    <div class="list">${EMERGENCY.map(e => `<a class="list-item" href="tel:${e.number}"><span class="lead">📞</span><div class="body"><div class="title">${esc(e.label)}</div><div class="sub">${esc(e.note)}</div></div><b style="color:var(--danger)">${esc(e.display || e.number)}</b></a>`).join('')}</div>
    <p class="note">${esc(EMERGENCY_NOTE)}</p>
    <div class="section-title"><h2>Mijn contacten</h2><button class="btn ghost sm" id="add">＋ Toevoegen</button></div>
    ${contacts.length ? `<div class="list">${contacts.map((c, i) => `<div class="list-item"><span class="lead">👤</span><div class="body"><div class="title">${esc(c.label)}</div><div class="sub">${esc(c.number)}</div></div>
      <a class="btn sm" href="tel:${esc(c.number.replace(/\s/g, ''))}">Bel</a><button class="btn ghost sm" data-rm="${i}">✕</button></div>`).join('')}</div>`
      : `<div class="card tight small muted">Voeg bijvoorbeeld toe: autoverhuurder (pech/24u), reisverzekering (alarmcentrale), medische hulpdienst, reisorganisatie, familie thuis.</div>`}`;
  $('#add').onclick = () => {
    const s = openSheet(`<h2>Contact toevoegen</h2><label class="f">Naam / omschrijving</label><input class="input" id="l" placeholder="Bijv. Autoverhuur pechhulp">
      <label class="f">Telefoonnummer</label><input class="input" id="n" type="tel" placeholder="+264 …">
      <div class="row" style="margin-top:16px"><span class="spacer"></span><button class="btn secondary" data-close>Annuleren</button><button class="btn" id="save">Opslaan</button></div>`);
    $('#save', s.root).onclick = async () => {
      const label = $('#l', s.root).value.trim(), number = $('#n', s.root).value.trim();
      if (!number) return toast('Vul een nummer in.');
      contacts.push({ label: label || number, number }); await db.setKV('contacts', contacts); s.close('ok'); render();
    };
  };
  $$('[data-rm]').forEach(b => b.onclick = async () => { contacts.splice(+b.dataset.rm, 1); await db.setKV('contacts', contacts); render(); });
}, { tab: 'info', title: 'Noodnummers', parent: '#/info' });

route('/taal', () => {
  view.innerHTML = PHRASES.map(p => `<div class="card"><h2>${esc(p.lang)}</h2><table class="tbl">${p.items.map(([nl, x]) => `<tr><td class="muted">${esc(nl)}</td><td><b>${esc(x)}</b></td></tr>`).join('')}</table></div>`).join('')
    + '<p class="small muted">Engels wordt vrijwel overal gesproken. Een paar woorden in de lokale taal wordt enorm gewaardeerd!</p>';
}, { tab: 'info', title: 'Handige zinnetjes', parent: '#/info' });

route('/instellingen', async () => {
  let usage = '';
  try { const e = await navigator.storage?.estimate(); if (e) usage = `${(e.usage / 1048576).toFixed(1)} MB gebruikt`; } catch { /* */ }
  const persisted = await navigator.storage?.persisted?.().catch(() => false);
  const locked = await lock.isEnabled();
  const { autoLockMin } = await lock.settings();
  const opts = [[0, 'Direct bij verlaten van de app'], [1, 'Na 1 minuut'], [5, 'Na 5 minuten'], [15, 'Na 15 minuten'], [60, 'Na 1 uur']];
  view.innerHTML = `
    <div class="card"><h2>🔒 Beveiliging</h2>
      ${locked ? `
        <p>✅ <b>App-vergrendeling staat aan.</b> Al je gegevens en foto's zijn versleuteld opgeslagen (AES-256). Zonder je wachtwoord zijn ze onleesbaar.</p>
        <label class="f">Automatisch vergrendelen</label>
        <select class="input" id="autoLock">${opts.map(([v, l]) => `<option value="${v}" ${v === autoLockMin ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <p class="small muted">Ook bij langer dan ${Math.max(autoLockMin, 2)} minuten niets doen in de app.</p>
        <div class="stack" style="margin-top:12px">
          <button class="btn block" id="lockNow">🔒 Nu vergrendelen</button>
          <button class="btn secondary block" id="changePw">Wachtwoord wijzigen</button>
          <button class="btn danger block" id="disableLock">Vergrendeling uitschakelen</button>
        </div>`
      : `
        <p>Bescherm je dagboek, foto's, boekingen en contacten met een wachtwoord. Alles wordt dan <b>versleuteld</b> opgeslagen: wie je tablet of de opslag in handen krijgt, kan niets lezen.</p>
        <div class="note">⚠️ Vergeet je het wachtwoord, dan zijn je gegevens <b>niet meer terug te halen</b> – ook niet door ons. Maak daarom ook een (versleutelde) back-up.</div>
        <button class="btn block" id="enableLock" style="margin-top:12px">🔒 Vergrendeling instellen</button>`}
    </div>
    <div class="card"><h2>💾 Back-up</h2>
      <p>Je gegevens staan <b>alleen op dit toestel</b>. Maak regelmatig een back-up – zeker vóór je naar huis vliegt of je browser wist.</p>
      <p class="small muted">${usage}${persisted ? ' · opslag is beschermd tegen automatisch wissen ✓' : ''}</p>
      <button class="btn block" id="exp">⬇️ Back-up exporteren</button>
      <label class="btn secondary block" style="margin-top:8px">⬆️ Back-up herstellen<input type="file" id="imp" accept="application/json,.json" hidden></label>
    </div>
    <div class="card"><h2>🕵️ Privacy</h2>
      <ul class="small">
        <li>Geen account, geen server, geen tracking of advertenties. Niets van je gegevens verlaat dit toestel, behalve een back-up die jij zelf deelt.</li>
        <li>Bij het opslaan van foto's worden verborgen gegevens (EXIF) zoals GPS-locatie en toestelinformatie verwijderd.</li>
        <li>Je locatie wordt alleen opgevraagd als je zelf op "📍 Huidige locatie" tikt.</li>
        <li>Alleen bij gebruik van de online kaart, "Route" of 🔎 maakt je toestel verbinding met OpenStreetMap, Google of Apple. Die zien dan welk gebied of welke plek je bekijkt.</li>
      </ul>
      <button class="btn secondary sm" id="clearTiles">Opgeslagen kaartgebieden wissen</button>
    </div>
    <div class="card"><h2>📴 Offline gebruik</h2>
      <p id="offlineStatus" class="small">Controleren…</p>
      <ul class="small">
        <li>Alles werkt zonder internet: dagboek, collectie, foto's, reisinfo, boekingen, paklijst en de basiskaart.</li>
        <li>Kaarttegels die je online hebt bekeken blijven bewaard (<span id="tileCount">…</span>). Bekijk vóór vertrek de gebieden waar je heen gaat, ingezoomd.</li>
        <li>Navigeren zonder bereik: download vooraf offline kaarten van Namibië in Google Maps, Apple Kaarten, Maps.me of Tracks4Africa. De knop "📍 Kaart-app" opent die app op de juiste plek.</li>
        <li>Alleen "Route" (Google Maps), de 🔎-zoekknoppen en het bellen vereisen een verbinding.</li>
      </ul>
      <button class="btn secondary sm" id="recheck">Offline-bestanden opnieuw downloaden</button>
    </div>
    <div class="card"><h2>📲 Installeren als app</h2>
      <p class="small"><b>iPhone / iPad (Safari):</b> tik op Deel → "Zet op beginscherm".<br><b>Android (Chrome):</b> menu ⋮ → "App installeren" / "Toevoegen aan startscherm".</p></div>
    <div class="card"><h2>⚠️ Alles wissen</h2><p class="small muted">Verwijdert alle reizen, verhalen, waarnemingen, foto's, de vergrendeling en opgeslagen kaartgebieden van dit toestel.</p>
      <button class="btn danger" id="wipe">Alle gegevens wissen</button></div>`;
  showOfflineStatus();

  // --- vergrendeling ---
  $('#enableLock')?.addEventListener('click', async () => {
    const pw = await passwordSheet({ title: 'Wachtwoord instellen', confirm: true, strength: true, ok: 'Vergrendeling aanzetten',
      text: 'Kies een sterk wachtwoord van minimaal 10 tekens. Tip: een zin van 4 of meer woorden werkt het best, bijv. <i>olifanten drinken bij zonsondergang</i>.' });
    if (!pw) return;
    toast('Gegevens versleutelen…', 6000);
    await lock.enable(pw);
    await refreshLockSettings();
    toast('🔒 Vergrendeling staat aan – je gegevens zijn versleuteld');
    render();
  });
  $('#autoLock')?.addEventListener('change', async e => { await lock.setAutoLock(Number(e.target.value)); await refreshLockSettings(); render(); });
  $('#lockNow')?.addEventListener('click', () => doLock());
  $('#changePw')?.addEventListener('click', async () => {
    const r = await passwordSheet({ title: 'Wachtwoord wijzigen', current: true, confirm: true, strength: true, ok: 'Wijzigen' });
    if (!r) return;
    toast((await lock.change(r.old, r.pw)) ? 'Wachtwoord gewijzigd ✓' : 'Huidig wachtwoord is onjuist');
  });
  $('#disableLock')?.addEventListener('click', async () => {
    const pw = await passwordSheet({ title: 'Vergrendeling uitschakelen', ok: 'Uitschakelen',
      text: 'Je gegevens worden dan weer <b>onversleuteld</b> opgeslagen. Voer je wachtwoord in om te bevestigen.' });
    if (!pw) return;
    toast('Ontsleutelen…', 6000);
    if (await lock.disable(pw)) { await refreshLockSettings(); toast('Vergrendeling uitgeschakeld'); render(); } else toast('Onjuist wachtwoord');
  });

  // --- back-up ---
  $('#exp').onclick = async () => {
    const choice = await new Promise(resolve => {
      const sh = openSheet(`<h2>Back-up exporteren</h2>
        <p class="small">Een back-up bevat al je verhalen, foto's, boekingen en contacten. Deel of bewaar het bestand dus zorgvuldig.</p>
        <label class="row" style="margin:10px 0"><input type="checkbox" id="encB" checked style="width:22px;height:22px;accent-color:var(--accent)"><span><b>Versleutelen met een wachtwoord</b> (sterk aanbevolen)</span></label>
        <div class="row" style="margin-top:14px"><span class="spacer"></span><button class="btn secondary" data-close>Annuleren</button><button class="btn" id="go">Verder</button></div>`,
        { onClose: r => resolve(r === 'ok' ? sh.root.dataset.enc : null) });
      $('#go', sh.root).onclick = () => { sh.root.dataset.enc = $('#encB', sh.root).checked ? 'yes' : 'no'; sh.close('ok'); };
    });
    if (!choice) return;
    let pw = '';
    if (choice === 'yes') {
      pw = await passwordSheet({ title: 'Wachtwoord voor de back-up', confirm: true, strength: true, ok: 'Exporteren',
        text: 'Bewaar dit wachtwoord goed (bijv. in je wachtwoordmanager). Zonder dit wachtwoord kan de back-up niet worden teruggezet.' });
      if (!pw) return;
    } else if (!(await confirmSheet('Onversleutelde back-up maken? Iedereen die het bestand in handen krijgt, kan je gegevens en foto\'s bekijken.', 'Toch exporteren'))) return;
    toast('Back-up maken…', 6000);
    const blob = await exportBackup(pw || undefined);
    const name = `namibie-backup-${todayISO()}${pw ? '-versleuteld' : ''}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Namibië back-up' }); return; } catch { /* fall back */ } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  $('#imp').onchange = async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
      const data = await readBackup(f);
      let pw;
      if (backupIsEncrypted(data)) {
        pw = await passwordSheet({ title: 'Versleutelde back-up', ok: 'Herstellen', text: 'Voer het wachtwoord van deze back-up in.' });
        if (!pw) return;
      }
      toast('Herstellen…', 6000);
      const r = await importBackup(data, pw);
      toast(`Hersteld ✓ ${r.entries} verhalen, ${r.sightings} waarnemingen, ${r.photos} foto's`);
      location.hash = '#/';
    } catch (err) { toast(err.message || 'Herstellen mislukt'); }
  };

  $('#clearTiles').onclick = async () => { await caches?.delete('tiles'); toast('Opgeslagen kaartgebieden gewist'); showOfflineStatus(); };
  $('#recheck').onclick = async () => {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (!reg) return toast('Offline-modus is niet beschikbaar in deze browser.');
    if (!navigator.onLine) return toast('Maak eerst verbinding met internet.');
    $('#offlineStatus').textContent = 'Downloaden…';
    const r = await swMessage({ type: 'precache' });
    toast(r?.ok ? 'Alle bestanden zijn offline opgeslagen ✓' : 'Downloaden mislukt, probeer het later opnieuw.');
    showOfflineStatus();
  };
  $('#wipe').onclick = async () => {
    if (!(await confirmSheet('Weet je het zeker? Alles wordt definitief verwijderd. Dit kan niet ongedaan worden gemaakt.', 'Alles wissen'))) return;
    await wipeAll();
  };
}, { tab: 'info', title: 'Instellingen', parent: '#/info' });

async function wipeAll() {
  await lock.wipeEverything();
  try { await caches.delete('tiles'); } catch { /* */ }
  try { sessionStorage.clear(); } catch { /* */ }
  location.hash = '#/';
  location.reload();
}

// ============ Wachtwoord-dialoog ============
const COMMON = ['12345678', '123456789', '1234567890', 'password', 'wachtwoord', 'qwertyui', 'qwerty123', 'namibie', 'namibia', 'iloveyou', '11111111', 'abcdefgh', 'welkom01', 'welkom123'];
function pwScore(p) {
  if (p.length < 10 || COMMON.some(c => p.toLowerCase().includes(c))) return 0;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
  return Math.min(4, 1 + (p.length >= 14) + (p.length >= 20) + (classes >= 3));
}
function passwordSheet({ title, text = '', confirm = false, strength = false, current = false, ok = 'OK' }) {
  return new Promise(resolve => {
    let result = null;
    const sh = openSheet(`<form id="pwf" novalidate>
      <h2>${esc(title)}</h2>${text ? `<p class="small">${text}</p>` : ''}
      ${current ? `<label class="f" for="pwOld">Huidig wachtwoord</label><input class="input" type="password" id="pwOld" autocomplete="current-password" autocapitalize="off" spellcheck="false">` : ''}
      <label class="f" for="pw1">${current ? 'Nieuw wachtwoord' : 'Wachtwoord'}</label>
      <input class="input" type="password" id="pw1" autocomplete="${confirm ? 'new-password' : 'current-password'}" autocapitalize="off" spellcheck="false">
      ${strength ? `<div class="progress" style="margin-top:8px;height:6px"><div id="pwBar" style="width:0"></div></div><div class="small muted" id="pwHint">Minimaal 10 tekens.</div>` : ''}
      ${confirm ? `<label class="f" for="pw2">Herhaal wachtwoord</label><input class="input" type="password" id="pw2" autocomplete="new-password" autocapitalize="off" spellcheck="false">` : ''}
      <label class="row small" style="margin-top:10px"><input type="checkbox" id="pwShow"> Wachtwoord tonen</label>
      <p class="small" id="pwErr" role="alert" style="color:var(--danger);min-height:1.2em;margin:6px 0"></p>
      <div class="row"><span class="spacer"></span><button type="button" class="btn secondary" data-close>Annuleren</button><button class="btn" type="submit">${esc(ok)}</button></div>
    </form>`, { onClose: () => resolve(result) });
    const r = sh.root, pw1 = $('#pw1', r), err = $('#pwErr', r);
    (current ? $('#pwOld', r) : pw1).focus();
    $('#pwShow', r).onchange = e => $$('input[type=password], input[data-pw]', r).forEach(i => { i.dataset.pw = 1; i.type = e.target.checked ? 'text' : 'password'; });
    if (strength) pw1.oninput = () => {
      const sc = pwScore(pw1.value);
      $('#pwBar', r).style.width = (pw1.value ? Math.max(8, sc * 25) : 0) + '%';
      $('#pwHint', r).textContent = !pw1.value ? 'Minimaal 10 tekens.' : ['Te zwak of te voorspelbaar', 'Redelijk', 'Goed', 'Sterk', 'Zeer sterk'][sc];
    };
    $('#pwf', r).onsubmit = e => {
      e.preventDefault();
      const p = pw1.value;
      if (!p) { err.textContent = 'Vul een wachtwoord in.'; return; }
      if (strength && pwScore(p) === 0) { err.textContent = 'Kies een sterker wachtwoord: minimaal 10 tekens en niet te voorspelbaar.'; return; }
      if (confirm && p !== $('#pw2', r).value) { err.textContent = 'De wachtwoorden komen niet overeen.'; return; }
      if (current && !$('#pwOld', r).value) { err.textContent = 'Vul je huidige wachtwoord in.'; return; }
      result = current ? { old: $('#pwOld', r).value, pw: p } : p;
      sh.close('ok');
    };
  });
}

// ============ Vergrendelscherm & automatisch vergrendelen ============
let lockSettings = { enabled: false, autoLockMin: 5 };
async function refreshLockSettings() {
  lockSettings = { enabled: await lock.isEnabled(), ...(await lock.settings()) };
  resetIdle();
}

function doLock() {
  lock.lockNow();
  showLockScreen();
}

function showLockScreen() {
  // Verwijder alle ontsleutelde inhoud uit de pagina.
  view.innerHTML = '';
  view.onclick = null;
  currentCleanup?.(); currentCleanup = null;
  $$('.sheet-backdrop, .lightbox, .fab').forEach(e => e.remove());
  document.body.style.overflow = '';
  document.body.classList.add('locked');
  setTitle('Namibië'); // geen reis- of diernaam zichtbaar in de app-wisselaar of tabbladen
  if ($('#lockscreen')) return;
  const el = document.createElement('div');
  el.id = 'lockscreen'; el.className = 'lockscreen';
  el.innerHTML = `<form id="lockForm" novalidate>
      <div style="font-size:3rem">🔒</div>
      <h1>Namibië</h1>
      <p class="muted">Voer je wachtwoord in om je dagboek en collectie te openen.</p>
      <input class="input" type="password" id="lockPw" autocomplete="current-password" autocapitalize="off" spellcheck="false" placeholder="Wachtwoord" aria-label="Wachtwoord">
      <button class="btn block" type="submit" id="lockBtn" style="margin-top:10px">Ontgrendelen</button>
      <p class="small" id="lockMsg" role="alert" style="min-height:1.3em;color:var(--danger)"></p>
      <button type="button" class="btn ghost sm" id="lockForgot">Wachtwoord vergeten?</button>
    </form>`;
  document.body.append(el);
  const pw = $('#lockPw', el), msg = $('#lockMsg', el), btn = $('#lockBtn', el);
  const showWait = async () => {
    const w = await lock.waitSeconds();
    if (w > 0) { msg.textContent = `Te veel onjuiste pogingen. Probeer het over ${w} seconden opnieuw.`; btn.disabled = true; setTimeout(showWait, 1000); }
    else { if (btn.disabled) msg.textContent = ''; btn.disabled = false; }
  };
  showWait();
  setTimeout(() => pw.focus(), 50);
  $('#lockForm', el).onsubmit = async e => {
    e.preventDefault();
    if (!pw.value || btn.disabled) return;
    btn.disabled = true; msg.style.color = 'var(--muted)'; msg.textContent = 'Controleren…';
    const ok = await lock.unlock(pw.value);
    pw.value = '';
    msg.style.color = 'var(--danger)';
    if (ok) {
      el.remove(); document.body.classList.remove('locked');
      await refreshLockSettings();
      render();
    } else {
      msg.textContent = 'Onjuist wachtwoord.';
      btn.disabled = false;
      showWait();
      pw.focus();
    }
  };
  $('#lockForgot', el).onclick = () => {
    const sh = openSheet(`<h2>Wachtwoord vergeten?</h2>
      <p>Je gegevens zijn versleuteld met je wachtwoord. Zonder het wachtwoord kan <b>niemand</b> ze openen – ook wij niet. Dat is precies wat ze beschermt.</p>
      <p>Je kunt de app wel volledig leegmaken en opnieuw beginnen. Daarna kun je een eerder gemaakte back-up terugzetten.</p>
      <label class="f" for="wipeConfirm">Typ <b>WISSEN</b> om alle gegevens definitief te verwijderen</label>
      <input class="input" id="wipeConfirm" autocomplete="off" autocapitalize="characters">
      <div class="row" style="margin-top:16px"><span class="spacer"></span><button class="btn secondary" data-close>Annuleren</button><button class="btn" style="background:var(--danger)" id="wipeGo">Alles wissen</button></div>`);
    $('#wipeGo', sh.root).onclick = async () => {
      if ($('#wipeConfirm', sh.root).value.trim().toUpperCase() !== 'WISSEN') return toast('Typ WISSEN om te bevestigen');
      await wipeAll();
    };
  };
}

let hiddenAt = 0, idleTimer = null;
function resetIdle() {
  clearTimeout(idleTimer);
  if (!lockSettings.enabled || !lock.isUnlocked()) return;
  idleTimer = setTimeout(() => { if (lock.isUnlocked()) doLock(); }, Math.max(lockSettings.autoLockMin, 2) * 60000);
}
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
document.addEventListener('visibilitychange', () => {
  if (!lockSettings.enabled || !lock.isUnlocked()) return;
  if (document.hidden) {
    hiddenAt = Date.now();
    if (lockSettings.autoLockMin === 0) doLock();
  } else if (Date.now() - hiddenAt >= lockSettings.autoLockMin * 60000) {
    doLock();
  }
});

// ============ Start ============
// ============ Offline ============
function swMessage(msg) {
  return new Promise(resolve => {
    const ctrl = navigator.serviceWorker?.controller;
    if (!ctrl) return resolve(null);
    const ch = new MessageChannel();
    ch.port1.onmessage = e => resolve(e.data);
    ctrl.postMessage(msg, [ch.port2]);
    setTimeout(() => resolve(null), 30000);
  });
}

async function showOfflineStatus() {
  const el = $('#offlineStatus');
  if (!el) return;
  if (!('serviceWorker' in navigator)) { el.innerHTML = '⚠️ Deze browser ondersteunt geen offline-modus. Gebruik Safari (iPhone) of Chrome (Android).'; return; }
  const st = await swMessage({ type: 'status' });
  if (!st) { el.innerHTML = '⏳ Offline-modus wordt nog ingesteld. Herlaad de app één keer met internet.'; return; }
  el.innerHTML = st.missing === 0
    ? `✅ <b>De app is volledig offline beschikbaar</b> (versie ${esc(st.version)}).`
    : `⚠️ ${st.missing} van ${st.total} bestanden ontbreken nog. Tik hieronder op downloaden terwijl je internet hebt.`;
  const tc = $('#tileCount');
  if (tc) tc.textContent = `${st.tiles} kaarttegels opgeslagen`;
}

function updateOnlineBadge() {
  let b = $('#offlineBadge');
  if (navigator.onLine) { b?.remove(); return; }
  if (!b) {
    b = document.createElement('span');
    b.id = 'offlineBadge'; b.className = 'tag'; b.textContent = '📴 Offline';
    b.title = 'Geen internet – de app werkt gewoon door';
    $('.topbar').insertBefore(b, $('#topActions'));
  }
}
window.addEventListener('online', () => { updateOnlineBadge(); toast('Weer online'); });
window.addEventListener('offline', () => { updateOnlineBadge(); toast('Offline – de app werkt gewoon door 👍'); });
updateOnlineBadge();

navigator.storage?.persist?.().catch(() => {});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) toast('App bijgewerkt – herstart de app voor de nieuwste versie', 4000);
    else toast('✓ De app is nu ook offline beschikbaar', 3500);
    showOfflineStatus();
  });
}
refreshLockSettings().finally(render);
