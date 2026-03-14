// ============================================================
//  CineMax · app.js
//  Auth + Lista con localStorage (sin Firebase, sin servidor)
//  Autor: Helen Reinoso
// ============================================================

// ── TMDB ─────────────────────────────────────────────────────
const API_KEY  = '2cd981d8c5920efbf4e45c30f37809cc';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p/';

// ── ESTADO ───────────────────────────────────────────────────
const state = {
  currentTab:     'popular',
  currentPage:    1,
  totalPages:     1,
  language:       'es-MX',
  heroMovies:     [],
  heroIndex:      0,
  heroTimer:      null,
  darkMode:       true,
  user:           null,
  currentListTab: 'saved',
};

// ── $ HELPER ─────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

// ── localStorage HELPERS ─────────────────────────────────────
const LS = {
  getUsers()         { return JSON.parse(localStorage.getItem('cm_users')   || '{}'); },
  saveUsers(u)       { localStorage.setItem('cm_users', JSON.stringify(u)); },
  getSession()       { return JSON.parse(localStorage.getItem('cm_session') || 'null'); },
  saveSession(u)     { localStorage.setItem('cm_session', JSON.stringify(u)); },
  clearSession()     { localStorage.removeItem('cm_session'); },
  listKey(email)     { return `cm_list_${email}`; },
  getList(email)     { return JSON.parse(localStorage.getItem(LS.listKey(email)) || '[]'); },
  saveList(email, l) { localStorage.setItem(LS.listKey(email), JSON.stringify(l)); },
};

// ── AUTH ──────────────────────────────────────────────────────
function initSession() {
  const session = LS.getSession();
  if (session) { state.user = session; updateNavUI(session); }
}

function updateNavUI(user) {
  if (user) {
    $('authButtons').classList.add('hidden');
    $('userMenu').classList.remove('hidden');
    const initial = user.name.charAt(0).toUpperCase();
    $('userAvatar').textContent      = initial;
    $('userAvatarDrop').textContent  = initial;
    $('userNameNav').textContent     = user.name;
    $('dropdownName').textContent    = user.name;
    $('dropdownEmail').textContent   = user.email;
  } else {
    $('authButtons').classList.remove('hidden');
    $('userMenu').classList.add('hidden');
  }
}

window.doRegister = function() {
  const name  = $('regName').value.trim();
  const email = $('regEmail').value.trim().toLowerCase();
  const pass  = $('regPassword').value;

  if (!name || !email || !pass) { showAuthError('registerError', 'Completa todos los campos.'); return; }
  if (pass.length < 6)          { showAuthError('registerError', 'La contraseña debe tener al menos 6 caracteres.'); return; }
  if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email)) { showAuthError('registerError', 'Email inválido.'); return; }

  const users = LS.getUsers();
  if (users[email]) { showAuthError('registerError', 'Ese email ya está registrado.'); return; }

  users[email] = { name, email, password: btoa(pass) };
  LS.saveUsers(users);

  const user = { name, email };
  state.user = user;
  LS.saveSession(user);
  updateNavUI(user);
  closeAuthModal();
  showToast(`¡Bienvenida, ${name}! 🎬`, 'success');
};

window.doLogin = function() {
  const email = $('loginEmail').value.trim().toLowerCase();
  const pass  = $('loginPassword').value;

  if (!email || !pass) { showAuthError('loginError', 'Completa todos los campos.'); return; }

  const users = LS.getUsers();
  const user  = users[email];

  if (!user || user.password !== btoa(pass)) {
    showAuthError('loginError', 'Email o contraseña incorrectos.'); return;
  }

  const session = { name: user.name, email: user.email };
  state.user = session;
  LS.saveSession(session);
  updateNavUI(session);
  closeAuthModal();
  showToast(`¡Bienvenido de nuevo, ${user.name}! 🎬`, 'success');
};

window.doLogout = function() {
  state.user = null;
  LS.clearSession();
  updateNavUI(null);
  $('userDropdown').classList.remove('open');
  showToast('Sesión cerrada', 'success');
  if (!$('myListContent').classList.contains('hidden')) {
    showMain();
    loadTab('popular', 1);
  }
};

// ── MI LISTA ─────────────────────────────────────────────────
function getUserList() {
  return state.user ? LS.getList(state.user.email) : [];
}

function getMovieStatus(movieId) {
  const found = getUserList().find(m => m.movie_id === movieId);
  return found ? found.list_type : null;
}

async function toggleList(movie, listType) {
  if (!state.user) { openAuthModal('login'); showToast('Inicia sesión para guardar películas', 'error'); return; }

  let list = getUserList();
  const idx = list.findIndex(m => m.movie_id === movie.id);

  if (idx >= 0 && list[idx].list_type === listType) {
    list.splice(idx, 1);
    showToast('Eliminado de tu lista', 'success');
  } else {
    const item = {
      movie_id:  movie.id,
      title:     movie.title,
      poster:    movie.poster_path  || '',
      year:      movie.release_date ? movie.release_date.slice(0,4) : '',
      rating:    movie.vote_average ? movie.vote_average.toFixed(1)  : '',
      list_type: listType,
      added_at:  Date.now(),
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    showToast(listType === 'saved' ? '📌 Guardado' : '✅ Marcado como vista', 'success');
  }
  LS.saveList(state.user.email, list);
}

window.removeFromList = function(movieId) {
  if (!state.user) return;
  const list = getUserList().filter(m => m.movie_id !== movieId);
  LS.saveList(state.user.email, list);
  showToast('Eliminado de tu lista', 'success');
  renderMyList(state.currentListTab);
};

window.openMyList = function() {
  $('userDropdown').classList.remove('open');
  $('mainContent').classList.add('hidden');
  $('searchContent').classList.add('hidden');
  $('hero').style.display = 'none';
  $('myListContent').classList.remove('hidden');
  renderMyList(state.currentListTab);
};

window.switchListTab = function(type, btn) {
  state.currentListTab = type;
  document.querySelectorAll('.list-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderMyList(type);
};

function renderMyList(type) {
  const items = getUserList().filter(m => m.list_type === type);
  const grid  = $('myListGrid');

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${type==='saved' ? '📌' : '✅'}</div>
        <div class="empty-text">${type==='saved' ? 'No tienes películas guardadas aún.' : 'No has marcado películas como vistas.'}</div>
        <button class="empty-cta" onclick="showMain(); loadTab('popular',1)">Explorar cartelera</button>
      </div>`;
    return;
  }

  grid.innerHTML = items.map(m => movieCard({
    ...m, id: m.movie_id,
    vote_average: parseFloat(m.rating) || 0,
    release_date: m.year ? `${m.year}-01-01` : '',
    poster_path:  m.poster,
  }, true)).join('');
  animateCards(grid);
}

function showMain() {
  $('mainContent').classList.remove('hidden');
  $('searchContent').classList.add('hidden');
  $('myListContent').classList.add('hidden');
  $('hero').style.display = '';
}

// ── AUTH MODAL ────────────────────────────────────────────────
window.openAuthModal = function(mode) {
  $('authOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchAuth(mode);
  clearAuthErrors();
};

window.closeAuthModal = function() {
  $('authOverlay').classList.remove('open');
  document.body.style.overflow = '';
  clearAuthErrors();
};

window.switchAuth = function(mode) {
  $('loginForm').classList.toggle('hidden',    mode !== 'login');
  $('registerForm').classList.toggle('hidden', mode !== 'register');
  clearAuthErrors();
};

function clearAuthErrors() {
  ['loginError','registerError'].forEach(id => {
    $(id).textContent = '';
    $(id).classList.add('hidden');
  });
}

function showAuthError(id, msg) {
  $(id).textContent = msg;
  $(id).classList.remove('hidden');
}

// ── TMDB FETCH ────────────────────────────────────────────────
async function apiFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', state.language);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

const ENDPOINTS = { popular:'/movie/popular', now_playing:'/movie/now_playing', top_rated:'/movie/top_rated', upcoming:'/movie/upcoming' };
const LABELS    = { popular:['Populares','esta semana'], now_playing:['En','cartelera'], top_rated:['Mejor','valoradas'], upcoming:['Próximamente',''] };

// ── HERO ──────────────────────────────────────────────────────
function buildHero(movie) {
  if (!movie) return;
  const heroBg      = $('heroBg');
  const heroContent = $('heroContent');
  if (movie.backdrop_path) heroBg.style.backgroundImage = `url(${IMG}original${movie.backdrop_path})`;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—';
  const year   = movie.release_date ? movie.release_date.slice(0,4) : '';
  const desc   = movie.overview ? (movie.overview.length > 220 ? movie.overview.slice(0,220)+'…' : movie.overview) : 'Sin descripción disponible.';

  heroContent.innerHTML = `
    <div class="hero-badge"><div class="badge-dot"></div> Destacada ahora</div>
    <h1 class="hero-title">${formatTitle(movie.title)}</h1>
    <div class="hero-stats">
      ${year ? `<div class="hero-stat"><strong>${year}</strong></div>` : ''}
      <div class="hero-stat"><span class="star">★</span> <strong>${rating}</strong> / 10</div>
    </div>
    <p class="hero-desc">${esc(desc)}</p>
    <div class="hero-btns">
      <button class="btn-primary" onclick="openModal(${movie.id})">▶ Ver detalles</button>
      <button class="btn-outline" onclick="openModal(${movie.id})">＋ Mi lista</button>
    </div>`;

  heroContent.style.opacity = '0'; heroContent.style.transform = 'translateY(20px)';
  requestAnimationFrame(() => {
    heroContent.style.transition = 'opacity .6s ease, transform .6s ease';
    heroContent.style.opacity    = '1'; heroContent.style.transform = 'translateY(0)';
  });
}

function buildIndicators(count) {
  const heroIndicators = $('heroIndicators');
  heroIndicators.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i===0?' active':'');
    d.onclick   = () => setHeroIndex(i);
    heroIndicators.appendChild(d);
  }
}

function setHeroIndex(i) {
  state.heroIndex = i;
  buildHero(state.heroMovies[i]);
  document.querySelectorAll('.dot').forEach((d,idx) => d.classList.toggle('active', idx===i));
}

function startHeroRotation() {
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => setHeroIndex((state.heroIndex+1) % state.heroMovies.length), 7000);
}

// ── MOVIE CARD ────────────────────────────────────────────────
function movieCard(movie, inList = false) {
  const poster    = movie.poster_path ? `<img src="${IMG}w342${movie.poster_path}" alt="${esc(movie.title)}" loading="lazy">` : `<div class="card-no-img">🎬</div>`;
  const rating    = movie.vote_average ? (typeof movie.vote_average==='string' ? movie.vote_average : movie.vote_average.toFixed(1)) : '—';
  const year      = movie.release_date ? movie.release_date.slice(0,4) : '';
  const removeBtn = inList ? `<button class="remove-btn" onclick="event.stopPropagation(); removeFromList(${movie.movie_id||movie.id})">✕ Quitar</button>` : '';
  const listBadge = inList ? `<div class="list-badge ${movie.list_type}">${movie.list_type==='saved'?'📌 Guardada':'✅ Vista'}</div>` : '';
  const id        = movie.movie_id || movie.id;

  return `
    <div class="movie-card" onclick="openModal(${id})">
      ${poster}
      <div class="rating-badge">★ ${rating}</div>
      ${listBadge}${removeBtn}
      <div class="card-overlay">
        <div class="card-title-ov">${esc(movie.title)}</div>
        <div class="card-year-ov">${year}</div>
        <button class="card-detail-btn" onclick="event.stopPropagation(); openModal(${id})">VER DETALLES</button>
      </div>
      <div class="card-info">
        <div class="card-title">${esc(movie.title)}</div>
        <div class="card-year">${year}</div>
      </div>
    </div>`;
}

// ── LOAD TAB ──────────────────────────────────────────────────
async function loadTab(tab, page = 1) {
  state.currentTab = tab; state.currentPage = page;
  showMain();
  const [a,b] = LABELS[tab];
  $('sectionTitle').innerHTML   = `<span>${a}</span>${b?' '+b:''}`;
  $('moviesGrid').innerHTML     = Array(10).fill('<div class="card-skeleton"></div>').join('');
  $('pagination').innerHTML     = '';
  $('resultsCount').textContent = '';

  try {
    const data   = await apiFetch(ENDPOINTS[tab], { page });
    const movies = data.results || [];
    state.totalPages = Math.min(data.total_pages||1, 500);
    $('resultsCount').textContent = `${(data.total_results||0).toLocaleString()} resultados`;

    if (page === 1) {
      state.heroMovies = movies.slice(0,5); state.heroIndex = 0;
      buildHero(state.heroMovies[0]); buildIndicators(state.heroMovies.length);
      startHeroRotation(); $('hero').style.display = '';
    } else { $('hero').style.display = 'none'; }

    const grid = $('moviesGrid');
    grid.innerHTML = movies.length ? movies.map(m => movieCard(m)).join('') : emptyHTML('No hay películas disponibles.');
    if (movies.length) animateCards(grid);
    buildPagination(page, state.totalPages);
  } catch(e) {
    $('moviesGrid').innerHTML = emptyHTML('Error al cargar. Intenta de nuevo.');
  }
}

// ── MODAL ────────────────────────────────────────────────────
window.openModal = async function(id) {
  $('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  $('modalContent').innerHTML = `<div class="modal-loading"><div class="spinner"></div></div>`;

  try {
    const movie  = await apiFetch(`/movie/${id}`);
    const status = getMovieStatus(movie.id);
    const backdrop = movie.backdrop_path ? `<img class="modal-backdrop" src="${IMG}w780${movie.backdrop_path}" alt="">` : `<div class="modal-backdrop-grad"></div>`;
    const poster   = movie.poster_path   ? `<img class="modal-poster"   src="${IMG}w185${movie.poster_path}"   alt="">` : '';
    const rating   = movie.vote_average  ? movie.vote_average.toFixed(1) : '—';
    const year     = movie.release_date  ? movie.release_date.slice(0,4)  : '';
    const runtime  = movie.runtime       ? `${movie.runtime} min`         : '';
    const genres   = (movie.genres||[]).map(g=>`<span class="genre-tag">${g.name}</span>`).join('');
    const votes    = movie.vote_count    ? `· ${movie.vote_count.toLocaleString()} votos` : '';

    let listActions = '';
    if (!state.user) {
      listActions = `<p class="modal-login-hint"><a onclick="closeModal(); openAuthModal('login')">Inicia sesión</a> para guardar esta película en tu lista.</p>`;
    } else if (status === 'saved') {
      listActions = `<button class="modal-action-btn remove-modal-btn" onclick="handleListAction(${movie.id},'saved',event)">✕ Quitar de guardadas</button>
                     <button class="modal-action-btn watch-btn" onclick="handleListAction(${movie.id},'watched',event)">✅ Marcar como vista</button>`;
    } else if (status === 'watched') {
      listActions = `<button class="modal-action-btn save-btn" onclick="handleListAction(${movie.id},'saved',event)">📌 Guardar</button>
                     <button class="modal-action-btn remove-modal-btn" onclick="handleListAction(${movie.id},'watched',event)">✕ Quitar de vistas</button>`;
    } else {
      listActions = `<button class="modal-action-btn save-btn" onclick="handleListAction(${movie.id},'saved',event)">📌 Guardar</button>
                     <button class="modal-action-btn watch-btn" onclick="handleListAction(${movie.id},'watched',event)">✅ Ya la vi</button>`;
    }

    $('modalContent').innerHTML = `
      <div style="position:relative">
        ${backdrop}
        <div style="position:absolute;inset:0;background:linear-gradient(to top,var(--bg2),transparent 55%);border-radius:18px 18px 0 0"></div>
      </div>
      <div class="modal-body">
        <div class="modal-flex">
          ${poster}
          <div class="modal-info">
            <h2 class="modal-title">${esc(movie.title)}</h2>
            <div class="modal-rating">★ ${rating} <span>${votes}</span></div>
            <div class="modal-stats">
              ${year    ? `<div class="modal-stat"><strong>${year}</strong></div>`    : ''}
              ${runtime ? `<div class="modal-stat"><strong>${runtime}</strong></div>` : ''}
              ${movie.original_language ? `<div class="modal-stat"><strong>${movie.original_language.toUpperCase()}</strong></div>` : ''}
            </div>
          </div>
        </div>
        <p class="modal-overview">${esc(movie.overview||'Sin descripción disponible.')}</p>
        <div class="modal-genres">${genres}</div>
        <div class="modal-actions" id="modalActions" style="margin-top:1rem">${listActions}</div>
      </div>`;

    window._currentModalMovie = movie;
  } catch(e) {
    $('modalContent').innerHTML = `<div class="modal-loading"><p style="color:var(--muted)">Error al cargar la película.</p></div>`;
  }
};

window.handleListAction = async function(movieId, listType, e) {
  e.stopPropagation();
  const movie = window._currentModalMovie;
  if (!movie) return;
  await toggleList(movie, listType);
  const status  = getMovieStatus(movie.id);
  const actions = $('modalActions');
  if (!actions) return;
  if (status==='saved') {
    actions.innerHTML = `<button class="modal-action-btn remove-modal-btn" onclick="handleListAction(${movie.id},'saved',event)">✕ Quitar de guardadas</button>
                         <button class="modal-action-btn watch-btn" onclick="handleListAction(${movie.id},'watched',event)">✅ Marcar como vista</button>`;
  } else if (status==='watched') {
    actions.innerHTML = `<button class="modal-action-btn save-btn" onclick="handleListAction(${movie.id},'saved',event)">📌 Guardar</button>
                         <button class="modal-action-btn remove-modal-btn" onclick="handleListAction(${movie.id},'watched',event)">✕ Quitar de vistas</button>`;
  } else {
    actions.innerHTML = `<button class="modal-action-btn save-btn" onclick="handleListAction(${movie.id},'saved',event)">📌 Guardar</button>
                         <button class="modal-action-btn watch-btn" onclick="handleListAction(${movie.id},'watched',event)">✅ Ya la vi</button>`;
  }
};

window.closeModal = function() { $('modalOverlay').classList.remove('open'); document.body.style.overflow = ''; };

// ── SEARCH ────────────────────────────────────────────────────
let searchTimer;

function initSearch() {
  const searchInput = $('searchInput');
  const searchClear = $('searchClear');

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    searchClear.classList.toggle('visible', val.length > 0);
    clearTimeout(searchTimer);
    if (!val) { $('searchContent').classList.add('hidden'); showMain(); return; }
    $('mainContent').classList.add('hidden');
    $('myListContent').classList.add('hidden');
    $('searchContent').classList.remove('hidden');
    $('hero').style.display = 'none';
    $('searchGrid').innerHTML = '<div class="empty-state"><div class="spinner"></div></div>';
    searchTimer = setTimeout(() => doSearch(val), 480);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    $('searchContent').classList.add('hidden');
    showMain();
  });
}

async function doSearch(query) {
  try {
    const data   = await apiFetch('/search/movie', { query });
    const movies = data.results || [];
    $('searchTitle').innerHTML = `Resultados para <em>"${esc(query)}"</em>`;
    $('searchGrid').innerHTML  = movies.length ? movies.map(m => movieCard(m)).join('') : emptyHTML('No encontramos esa película.');
    if (movies.length) animateCards($('searchGrid'));
  } catch(e) { $('searchGrid').innerHTML = emptyHTML('Error al buscar.'); }
}

// ── PAGINATION ────────────────────────────────────────────────
function buildPagination(current, total) {
  if (total <= 1) { $('pagination').innerHTML = ''; return; }
  const pages = [1];
  if (current > 3) pages.push('…');
  for (let i = Math.max(2,current-1); i <= Math.min(total-1,current+1); i++) pages.push(i);
  if (current < total-2) pages.push('…');
  if (total > 1) pages.push(total);

  let html = `<button class="page-btn" onclick="loadTab('${state.currentTab}',${current-1})" ${current===1?'disabled':''}>← Anterior</button>`;
  pages.forEach(p => {
    if (p==='…') html += `<span style="color:var(--muted);padding:0 .3rem">…</span>`;
    else html += `<button class="page-btn${p===current?' active':''}" onclick="loadTab('${state.currentTab}',${p})">${p}</button>`;
  });
  html += `<button class="page-btn" onclick="loadTab('${state.currentTab}',${current+1})" ${current===total?'disabled':''}>Siguiente →</button>`;
  $('pagination').innerHTML = html;
}

// ── HELPERS ───────────────────────────────────────────────────
function esc(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function formatTitle(t) { const w=t.split(' '); return w.length<=2?`<em>${t}</em>`:`${w.slice(0,-1).join(' ')} <em>${w.slice(-1)[0]}</em>`; }
function emptyHTML(msg) { return `<div class="empty-state"><div class="empty-icon">🎬</div><div class="empty-text">${msg}</div></div>`; }
function animateCards(container) {
  container.querySelectorAll('.movie-card').forEach((c,i) => {
    c.style.opacity='0'; c.style.transform='translateY(16px)';
    setTimeout(() => { c.style.transition='opacity .4s ease, transform .4s ease'; c.style.opacity='1'; c.style.transform='translateY(0)'; }, i*45);
  });
}

// ── TOAST ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type='') {
  clearTimeout(toastTimer);
  const t = $('toast');
  t.textContent = msg; t.className = 'toast show'+(type?` ${type}`:'');
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Bottom nav (mobile)
  document.querySelectorAll('.bottom-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      // sincronizar tab del navbar
      const navTab = document.querySelector(`.tab[data-tab="${btn.dataset.tab}"]`);
      if (navTab) navTab.classList.add('active');
      $('searchInput').value = '';
      $('searchClear').classList.remove('visible');
      loadTab(btn.dataset.tab, 1);
    });
  });

  $('bottomMyList').addEventListener('click', () => {
    document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
    $('bottomMyList').classList.add('active');
    if (!state.user) { openAuthModal('login'); return; }
    openMyList();
  });

  // Logo → inicio
  $('logoBtn').addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.tab[data-tab="popular"]').classList.add('active');
    document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
    const bt = document.querySelector('.bottom-tab[data-tab="popular"]');
    if (bt) bt.classList.add('active');
    $('searchInput').value = '';
    $('searchClear').classList.remove('visible');
    loadTab('popular', 1);
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const bt = document.querySelector(`.bottom-tab[data-tab="${btn.dataset.tab}"]`);
      if (bt) bt.classList.add('active');
      $('searchInput').value = '';
      $('searchClear').classList.remove('visible');
      loadTab(btn.dataset.tab, 1);
    });
  });

  // User dropdown
  $('userMenuBtn').addEventListener('click', e => { e.stopPropagation(); $('userDropdown').classList.toggle('open'); });
  document.addEventListener('click', () => $('userDropdown').classList.remove('open'));

  // Cerrar modales
  $('modalClose').addEventListener('click', closeModal);
  $('modalOverlay').addEventListener('click', e => { if(e.target===$('modalOverlay')) closeModal(); });
  $('authOverlay').addEventListener('click',  e => { if(e.target===$('authOverlay'))  closeAuthModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') { closeModal(); closeAuthModal(); } });

  // Enter en inputs auth
  $('loginPassword').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
  $('regPassword').addEventListener('keydown',   e => { if(e.key==='Enter') doRegister(); });

  // Tema
  $('themeBtn').addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('light-mode', !state.darkMode);
    $('themeBtn').textContent = state.darkMode ? '☀️' : '🌙';
  });

  // Navbar shadow
  window.addEventListener('scroll', () => {
    $('navbar').style.boxShadow = window.scrollY > 60 ? '0 2px 30px rgba(0,0,0,.4)' : 'none';
  }, { passive: true });

  // Search
  initSearch();

  // Sesión guardada
  initSession();

  // Cargar películas
  loadTab('popular', 1);
});
