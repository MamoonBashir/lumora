/* Lumora — Shared JS: theme, navbar, toast, utils */

/* ── THEME ─────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('lm_theme') || 'light';
  document.documentElement.dataset.theme = saved;
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('lm_theme', next);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

/* ── AUTH HELPERS ───────────────────────────────── */
function getUser() {
  try { return JSON.parse(localStorage.getItem('lm_user') || 'null'); } catch { return null; }
}
function isLoggedIn()  { return !!localStorage.getItem('lm_token'); }
function isCreator()   { return getUser()?.role === 'creator'; }
function requireAuth() { if (!isLoggedIn()) window.location.href = 'auth.html'; }
function requireCreator() { if (!isCreator()) window.location.href = 'feed.html'; }
function logout() {
  localStorage.removeItem('lm_token');
  localStorage.removeItem('lm_user');
  window.location.href = 'index.html';
}
function toggleNavDropdown(e) {
  e.stopPropagation();
  document.getElementById('nav-dropdown')?.classList.toggle('open');
}

/* ── NAVBAR INJECTION ───────────────────────────── */
function injectNavbar(activePage) {
  const user = getUser();
  const avatarSrc = user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.username || 'U') + '&background=e1306c&color=fff&size=64';

  const roleLabel = isCreator()
    ? `<span class="nav-role-badge nav-role-creator">📸 Creator</span>`
    : `<span class="nav-role-badge nav-role-consumer">👤 Consumer</span>`;

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <a class="nav-logo" href="feed.html">Lumora</a>
    ${roleLabel}
    <div class="nav-search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="Search photos, people, tags…" id="nav-search-input" onkeydown="navSearch(event)"/>
    </div>
    <div class="nav-icons">
      <a class="nav-icon-btn${activePage==='feed'?' active':''}" href="feed.html" title="Home">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="${activePage==='feed'?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </a>
      <a class="nav-icon-btn${activePage==='explore'?' active':''}" href="explore.html" title="Explore">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </a>
      ${isCreator() ? `<a class="nav-icon-btn${activePage==='creator'?' active':''}" href="creator.html" title="Upload">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      </a>` : ''}
      <a class="nav-icon-btn${activePage==='saved'?' active':''}" href="saved.html" title="Saved">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="${activePage==='saved'?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </a>
      <button class="nav-icon-btn" title="Notifications" onclick="showToast('No new notifications','info')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </button>
      <button class="nav-icon-btn" id="theme-btn" onclick="toggleTheme()" title="Toggle theme">🌙</button>
      <div class="nav-avatar-wrap" id="nav-avatar-wrap" onclick="toggleNavDropdown(event)">
        <img class="nav-avatar" src="${avatarSrc}" alt="Profile"/>
        <div class="nav-dropdown" id="nav-dropdown">
          <a class="nav-dropdown-item" href="profile.html">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${isCreator() ? 'Creator Profile' : 'My Profile'}
          </a>
          <div class="nav-dropdown-divider"></div>
          <button class="nav-dropdown-item nav-dropdown-signout" onclick="logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>`;
  document.body.prepend(nav);

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('nav-avatar-wrap');
    if (wrap && !wrap.contains(e.target)) {
      document.getElementById('nav-dropdown')?.classList.remove('open');
    }
  });

  initTheme();

  // Bottom nav (mobile)
  const bottom = document.createElement('nav');
  bottom.className = 'bottom-nav';
  bottom.innerHTML = `<div class="bottom-nav-items">
    <a class="bottom-nav-btn${activePage==='feed'?' active':''}" href="feed.html">
      <svg viewBox="0 0 24 24" fill="${activePage==='feed'?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      Home
    </a>
    <a class="bottom-nav-btn${activePage==='explore'?' active':''}" href="explore.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Explore
    </a>
    ${isCreator() ? `<a class="bottom-nav-btn${activePage==='creator'?' active':''}" href="creator.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      Create
    </a>` : ''}
    <a class="bottom-nav-btn${activePage==='saved'?' active':''}" href="saved.html">
      <svg viewBox="0 0 24 24" fill="${activePage==='saved'?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      Saved
    </a>
    <a class="bottom-nav-btn${activePage==='profile'?' active':''}" href="profile.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Profile
    </a>
  </div>`;
  document.body.appendChild(bottom);
}

function navSearch(e) {
  if (e.key === 'Enter') {
    const q = document.getElementById('nav-search-input').value.trim();
    if (q) window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
  }
}

/* ── TOAST ──────────────────────────────────────── */
function showToast(msg, type = 'info') {
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ── SKELETON CARDS ─────────────────────────────── */
function renderSkeletons(container, count = 3) {
  container.innerHTML = Array.from({length: count}, () => `
    <div class="skel-card">
      <div class="skel-header">
        <div class="skeleton skel-avatar"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="skeleton skel-line-sm" style="width:40%"></div>
          <div class="skeleton skel-line-xs" style="width:25%"></div>
        </div>
      </div>
      <div class="skeleton skel-image"></div>
      <div class="skel-actions">
        <div class="skeleton skel-action"></div>
        <div class="skeleton skel-action"></div>
        <div class="skeleton skel-action"></div>
      </div>
      <div class="skel-body">
        <div class="skeleton skel-line-sm" style="width:30%"></div>
        <div class="skeleton skel-line-sm" style="width:80%"></div>
        <div class="skeleton skel-line-sm" style="width:55%"></div>
      </div>
    </div>`).join('');
}

/* ── UTILS ──────────────────────────────────────── */
function debounce(fn, delay = 350) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
function formatNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + 'm';
  if (n >= 1000)    return (n/1000).toFixed(1).replace('.0','') + 'k';
  return String(n);
}
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return Math.floor(diff/60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return new Date(dateStr).toLocaleDateString();
}
function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function parseHashtags(text) {
  return text.replace(/#(\w+)/g, '<span class="hashtag" onclick="searchTag(\'$1\')">#$1</span>');
}
function searchTag(tag) {
  window.location.href = `explore.html?tag=${encodeURIComponent(tag)}`;
}

/* ── LIKE / SAVE STATE ──────────────────────────── */
const LikeState = {
  _data: JSON.parse(localStorage.getItem('lm_likes') || '{}'),
  toggle(id) { this._data[id] = !this._data[id]; this._save(); return this._data[id]; },
  isLiked(id) { return !!this._data[id]; },
  set(id, val) { this._data[id] = !!val; this._save(); },
  _save() { localStorage.setItem('lm_likes', JSON.stringify(this._data)); },
};
const SaveState = {
  _data: JSON.parse(localStorage.getItem('lm_saves') || '{}'),
  toggle(id) { this._data[id] = !this._data[id]; this._save(); return this._data[id]; },
  isSaved(id) { return !!this._data[id]; },
  set(id, val) { this._data[id] = !!val; this._save(); },
  remove(id)  { delete this._data[id]; this._save(); },
  _save() { localStorage.setItem('lm_saves', JSON.stringify(this._data)); },
};
const RatingState = {
  _data: JSON.parse(localStorage.getItem('lm_ratings') || '{}'),
  get(id)        { return this._data[id] || 0; },
  set(id, score) { this._data[id] = score; localStorage.setItem('lm_ratings', JSON.stringify(this._data)); },
};

/* ── PHOTO CARD BUILDER ─────────────────────────── */
function buildPhotoCard(photo) {
  const liked = LikeState.isLiked(photo.id);
  const saved = SaveState.isSaved(photo.id);
  const personTags = (photo.people || []).map(p => `
    <div class="person-tag" style="left:${p.x||30}%;top:${p.y||50}%">
      <div class="tag-dot"></div>
      <div class="tag-label">@${escapeHTML(p.username || p)}</div>
    </div>`).join('');

  const chips = (photo.people || []).map(p => `
    <div class="people-tag-chip">
      <span>@${escapeHTML(p.username || p)}</span>
    </div>`).join('');

  const userRating = RatingState.get(photo.id) || photo.userRating || 0;
  const displayRating = userRating || photo.avgRating || 0;
  const stars = [1,2,3,4,5].map(n =>
    `<span class="star${n <= displayRating ? ' on' : ''}" onclick="ratePhoto('${photo.id}',${n})">★</span>`
  ).join('');

  return `
    <div class="photo-card" id="card-${photo.id}">
      <div class="card-header">
        <div class="card-avatar-wrap">
          <img src="${photo.creatorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(photo.creatorUsername||'U')}&background=e1306c&color=fff`}" alt=""/>
        </div>
        <div class="card-user-info">
          <div class="card-username">${escapeHTML(photo.creatorUsername || photo.creatorName || 'Creator')}</div>
          <div class="card-meta">
            ${photo.location ? `<span>📍 ${escapeHTML(photo.location)}</span> ·` : ''}
            <span>${timeAgo(photo.createdAt || new Date())}</span>
          </div>
        </div>
        <button class="card-more-btn">···</button>
      </div>
      <div class="card-img-wrap" id="wrap-${photo.id}"
           ondblclick="doubleTap('${photo.id}')"
           onclick="openPhotoModal('${photo.id}')">
        ${photo.mediaType === 'video'
          ? `<video src="${photo.blobUrl}" style="width:100%;display:block;max-height:600px;object-fit:cover;background:#000"
               muted autoplay loop playsinline></video>
             <div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,.6);color:#fff;padding:3px 8px;border-radius:12px;font-size:.72rem;font-weight:700;pointer-events:none">🎬 VIDEO</div>`
          : `<img src="${photo.imageUrl || photo.thumbnailUrl || photo.blobUrl}" alt="${escapeHTML(photo.title||'')}"/>`
        }
        <div class="heart-overlay"><span class="heart-burst" id="hb-${photo.id}">❤️</span></div>
        <div class="person-tag-layer">${personTags}</div>
      </div>
      <div class="card-actions">
        <button class="action-btn${liked?' liked':''}" id="like-btn-${photo.id}" onclick="toggleLike('${photo.id}',event)">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="${liked?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span id="like-count-${photo.id}">${formatNum(photo.likeCount || photo.likes || 0)}</span>
        </button>
        <button class="action-btn" onclick="openPhotoModal('${photo.id}')">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>${formatNum(photo.commentCount || 0)}</span>
        </button>
        <button class="action-btn" onclick="sharePhoto('${photo.id}')">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <div class="action-spacer"></div>
        <div class="star-row" id="stars-${photo.id}">${stars}</div>
        <button class="action-btn${saved?' saved':''}" id="save-btn-${photo.id}" onclick="toggleSave('${photo.id}',event)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${saved?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-caption">
          ${parseHashtags(escapeHTML(photo.caption || ''))}
        </div>
        ${chips ? `<div class="people-tags-row">${chips}</div>` : ''}
        <span class="view-comments-btn" onclick="openPhotoModal('${photo.id}')">
          ${photo.commentCount > 0 ? `View all ${photo.commentCount} comments` : 'Be the first to comment'}
        </span>
        <div class="post-time">${timeAgo(photo.createdAt || new Date())}</div>
      </div>
      <div class="comment-input-row">
        <input type="text" placeholder="Add a comment…" onkeydown="postComment(event,'${photo.id}')"/>
        <button class="ci-post-btn">Post</button>
      </div>
    </div>`;
}

/* ── INTERACTIONS ───────────────────────────────── */
function doubleTap(id) {
  const burst = document.getElementById('hb-'+id);
  if (!burst) return;
  burst.classList.remove('pop');
  void burst.offsetWidth;
  burst.classList.add('pop');
  if (!LikeState.isLiked(id)) toggleLike(id);
  setTimeout(() => burst.classList.remove('pop'), 800);
}

async function toggleLike(id, e) {
  if (e) e.stopPropagation();
  const btn    = document.getElementById('like-btn-'+id);
  const countEl  = document.getElementById('like-count-'+id);
  const countEl2 = document.getElementById('likes-count-'+id);

  // Optimistic update
  const wasLiked = LikeState.isLiked(id);
  const liked    = LikeState.toggle(id);
  if (!btn) return;
  btn.classList.toggle('liked', liked);
  const svg = btn.querySelector('svg');
  if (svg) svg.setAttribute('fill', liked ? 'currentColor' : 'none');
  const prevN = countEl ? parseInt(countEl.textContent.replace(/[^\d]/g,'')) || 0 : 0;
  if (countEl)  countEl.textContent  = formatNum(Math.max(0, prevN + (liked ? 1 : -1)));
  if (countEl2) countEl2.textContent = Math.max(0, prevN + (liked ? 1 : -1)) + ' likes';
  showToast(liked ? '❤️ Added to liked photos' : '🤍 Removed from liked photos', liked ? 'success' : 'info');

  // Persist to backend
  if (typeof API !== 'undefined') {
    try {
      const res = await API.toggleLike(id);
      // Sync with authoritative server count & state
      if (res && res.likeCount !== undefined) {
        if (countEl)  countEl.textContent  = formatNum(res.likeCount);
        if (countEl2) countEl2.textContent = formatNum(res.likeCount) + ' likes';
      }
      // If server disagrees with local state, correct it
      if (res && res.liked !== liked) {
        LikeState.set(id, res.liked);
        btn.classList.toggle('liked', res.liked);
        if (svg) svg.setAttribute('fill', res.liked ? 'currentColor' : 'none');
      }
    } catch(_) {
      // Rollback on failure
      LikeState.set(id, wasLiked);
      btn.classList.toggle('liked', wasLiked);
      if (svg) svg.setAttribute('fill', wasLiked ? 'currentColor' : 'none');
      if (countEl)  countEl.textContent  = formatNum(prevN);
      if (countEl2) countEl2.textContent = prevN + ' likes';
    }
  }
}

async function toggleSave(id, e) {
  if (e) e.stopPropagation();
  const btn = document.getElementById('save-btn-'+id);
  if (!btn) return;

  // Optimistic update
  const wasSaved = SaveState.isSaved(id);
  const saved    = SaveState.toggle(id);
  btn.classList.toggle('saved', saved);
  const svg = btn.querySelector('svg');
  if (svg) svg.setAttribute('fill', saved ? 'currentColor' : 'none');
  showToast(saved ? '🔖 Saved to collection' : '📌 Removed from saved', saved ? 'success' : 'info');

  // Persist to backend
  if (typeof API !== 'undefined') {
    try {
      await API.toggleSave(id);
    } catch(_) {
      // Rollback on failure
      SaveState.set(id, wasSaved);
      btn.classList.toggle('saved', wasSaved);
      if (svg) svg.setAttribute('fill', wasSaved ? 'currentColor' : 'none');
    }
  }
}

async function ratePhoto(id, score) {
  const row = document.getElementById('stars-'+id);
  if (!row) return;
  // Optimistic update + save to localStorage immediately
  row.querySelectorAll('.star').forEach((s,i) => s.classList.toggle('on', i < score));
  RatingState.set(id, score);
  showToast(`⭐ Rated ${score} star${score>1?'s':''}`, 'success');
  // Persist to backend
  if (typeof API !== 'undefined') {
    try {
      await API.ratePhoto(id, score);
    } catch(_) {
      // Keep the local state even if API fails — it will sync next time
    }
  }
}

function sharePhoto(id) {
  const url = `${window.location.origin}/photo.html?id=${id}`;
  navigator.clipboard?.writeText(url).catch(()=>{});
  showToast('🔗 Link copied to clipboard!', 'success');
}

async function postComment(e, id) {
  if (e.key !== 'Enter') return;
  const input = e.target;
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  if (typeof API !== 'undefined') {
    try {
      await API.addComment(id, text);
      // Update comment count in the card
      const countEl = input.closest('.photo-card')?.querySelector('[id^="comment-count-"]');
      if (countEl) countEl.textContent = parseInt(countEl.textContent||'0') + 1;
    } catch(_) {}
  }
  showToast('💬 Comment posted!', 'success');
}

function openPhotoModal(id) {
  window.location.href = `photo.html?id=${id}`;
}
