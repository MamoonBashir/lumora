/*
 * Lumora — MOCK DATA (frontend testing only)
 * Remove this <script> tag from each page once Azure backend is live.
 * All images use picsum.photos — free, always available, no account needed.
 */

const MOCK = (() => {

  /* ── PHOTOS ─────────────────────────────────── */
  const photos = [
    {
      id: 'p1',
      title: 'Golden Hour in the Mountains',
      caption: 'Nothing beats watching the sun melt into the peaks. #travel #mountains #goldenhour',
      imageUrl: 'https://picsum.photos/seed/mountain1/800/900',
      thumbnailUrl: 'https://picsum.photos/seed/mountain1/400/450',
      cdnUrl: 'https://picsum.photos/seed/mountain1/800/900',
      creatorId: 'u2',
      creatorUsername: 'lensbyalex',
      creatorAvatar: 'https://picsum.photos/seed/alexface/64/64',
      location: 'Swiss Alps, Switzerland',
      likes: 1247,
      likeCount: 1247,
      commentCount: 38,
      avgRating: 4.6,
      filter: 'Warm',
      category: 'travel',
      people: [{ username: 'sarahmountain', x: 35, y: 60 }],
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      savedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'p2',
      title: 'City Never Sleeps',
      caption: 'Midnight streets have their own kind of magic. #urban #nightphotography #city',
      imageUrl: 'https://picsum.photos/seed/city99/800/900',
      thumbnailUrl: 'https://picsum.photos/seed/city99/400/450',
      cdnUrl: 'https://picsum.photos/seed/city99/800/900',
      creatorId: 'u3',
      creatorUsername: 'urbanframe',
      creatorAvatar: 'https://picsum.photos/seed/urbanface/64/64',
      location: 'Tokyo, Japan',
      likes: 892,
      likeCount: 892,
      commentCount: 21,
      avgRating: 4.2,
      filter: 'Moon',
      category: 'urban',
      people: [],
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      savedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'p3',
      title: 'Morning Fog Over the Lake',
      caption: 'Woke up at 5am for this. Worth every second. #nature #fog #lakeside #landscape',
      imageUrl: 'https://picsum.photos/seed/lake77/800/1000',
      thumbnailUrl: 'https://picsum.photos/seed/lake77/400/500',
      cdnUrl: 'https://picsum.photos/seed/lake77/800/1000',
      creatorId: 'u4',
      creatorUsername: 'natureclicks',
      creatorAvatar: 'https://picsum.photos/seed/natureface/64/64',
      location: 'Lake Bled, Slovenia',
      likes: 3410,
      likeCount: 3410,
      commentCount: 95,
      avgRating: 4.9,
      filter: 'Clarendon',
      category: 'nature',
      people: [],
      createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      savedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'p4',
      title: 'Street Portrait',
      caption: 'Strangers make the best subjects. Ask first, always. #portrait #street #people',
      imageUrl: 'https://picsum.photos/seed/portrait44/800/950',
      thumbnailUrl: 'https://picsum.photos/seed/portrait44/400/475',
      cdnUrl: 'https://picsum.photos/seed/portrait44/800/950',
      creatorId: 'u2',
      creatorUsername: 'lensbyalex',
      creatorAvatar: 'https://picsum.photos/seed/alexface/64/64',
      location: 'Marrakech, Morocco',
      likes: 654,
      likeCount: 654,
      commentCount: 14,
      avgRating: 4.0,
      filter: 'Juno',
      category: 'portrait',
      people: [{ username: 'modelzara', x: 48, y: 35 }],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      savedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'p5',
      title: 'Desert Dunes at Dusk',
      caption: 'The Sahara painted in fire. One of my favourite shots ever. #desert #travel #sunset',
      imageUrl: 'https://picsum.photos/seed/desert55/800/900',
      thumbnailUrl: 'https://picsum.photos/seed/desert55/400/450',
      cdnUrl: 'https://picsum.photos/seed/desert55/800/900',
      creatorId: 'u5',
      creatorUsername: 'sandstorm_shots',
      creatorAvatar: 'https://picsum.photos/seed/sandface/64/64',
      location: 'Sahara Desert, Morocco',
      likes: 2108,
      likeCount: 2108,
      commentCount: 56,
      avgRating: 4.7,
      filter: 'Warm',
      category: 'travel',
      people: [],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      savedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: 'p6',
      title: 'Abstract Architecture',
      caption: 'Lines, shadows and symmetry. #architecture #abstract #minimal #design',
      imageUrl: 'https://picsum.photos/seed/arch66/800/850',
      thumbnailUrl: 'https://picsum.photos/seed/arch66/400/425',
      cdnUrl: 'https://picsum.photos/seed/arch66/800/850',
      creatorId: 'u3',
      creatorUsername: 'urbanframe',
      creatorAvatar: 'https://picsum.photos/seed/urbanface/64/64',
      location: 'Dubai, UAE',
      likes: 1890,
      likeCount: 1890,
      commentCount: 42,
      avgRating: 4.5,
      filter: 'Cold',
      category: 'urban',
      people: [],
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      savedAt: null,
    },
  ];

  /* ── CURRENT USER ────────────────────────────── */
  const me = () => {
    const stored = (() => { try { return JSON.parse(localStorage.getItem('lm_user') || 'null'); } catch { return null; } })();
    return {
      id: stored?.id || 'u1',
      username: stored?.username || 'testuser',
      displayName: stored?.displayName || 'Test User',
      role: stored?.role || 'creator',
      bio: 'Photography enthusiast | Based in London | Exploring the world one frame at a time',
      location: 'London, UK',
      avatarUrl: stored?.avatarUrl || 'https://picsum.photos/seed/myavatar/64/64',
      coverUrl: '',
      followerCount: 0,
      followingCount: 0,
      photoCount: 0,
      likeCount: 0,
      savedCount: 0,
      commentCount: 0,
      avgRating: 0,
    };
  };

  /* ── STORIES ─────────────────────────────────── */
  const stories = [
    { id: 's1', username: 'lensbyalex',      avatarUrl: 'https://picsum.photos/seed/alexface/64/64',     hasNew: true  },
    { id: 's2', username: 'urbanframe',       avatarUrl: 'https://picsum.photos/seed/urbanface/64/64',    hasNew: true  },
    { id: 's3', username: 'natureclicks',     avatarUrl: 'https://picsum.photos/seed/natureface/64/64',   hasNew: false },
    { id: 's4', username: 'sandstorm_shots',  avatarUrl: 'https://picsum.photos/seed/sandface/64/64',     hasNew: true  },
    { id: 's5', username: 'portrait_life',    avatarUrl: 'https://picsum.photos/seed/portface/64/64',     hasNew: false },
  ];

  /* ── TRENDING HASHTAGS ───────────────────────── */
  const trending = {
    hashtags: [
      { name: 'travel',          count: 24800 },
      { name: 'sunset',          count: 18200 },
      { name: 'nature',          count: 15600 },
      { name: 'portrait',        count: 12100 },
      { name: 'urban',           count: 9800  },
      { name: 'goldenhour',      count: 8400  },
    ],
  };

  /* ── SUGGESTED CREATORS ──────────────────────── */
  const suggestions = [
    { id: 'u2', username: 'lensbyalex',     avatarUrl: 'https://picsum.photos/seed/alexface/64/64',    sub: 'Followed by 3 mutual friends' },
    { id: 'u3', username: 'urbanframe',      avatarUrl: 'https://picsum.photos/seed/urbanface/64/64',   sub: 'New to Lumora' },
    { id: 'u4', username: 'natureclicks',    avatarUrl: 'https://picsum.photos/seed/natureface/64/64',  sub: '2 mutual followers' },
    { id: 'u5', username: 'sandstorm_shots', avatarUrl: 'https://picsum.photos/seed/sandface/64/64',    sub: 'Popular in Travel' },
  ];

  /* ── COMMENTS ────────────────────────────────── */
  const comments = {
    p1: [
      { id: 'c1', username: 'natureclicks', avatarUrl: 'https://picsum.photos/seed/natureface/64/64', text: 'Absolutely breathtaking! What lens did you use?', createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
      { id: 'c2', username: 'urbanframe',   avatarUrl: 'https://picsum.photos/seed/urbanface/64/64',  text: 'The colours here are insane 🔥', createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
      { id: 'c3', username: 'portrait_life',avatarUrl: 'https://picsum.photos/seed/portface/64/64',   text: 'This deserves way more likes', createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
    ],
    p2: [
      { id: 'c4', username: 'lensbyalex',   avatarUrl: 'https://picsum.photos/seed/alexface/64/64',  text: 'Tokyo nights hit different 🌆', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: 'c5', username: 'natureclicks', avatarUrl: 'https://picsum.photos/seed/natureface/64/64', text: 'Love the mood here', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
    ],
    p3: [
      { id: 'c6', username: 'sandstorm_shots', avatarUrl: 'https://picsum.photos/seed/sandface/64/64', text: 'Lake Bled is on my bucket list now!', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    ],
  };

  /* ── PROFILES ────────────────────────────────── */
  const profiles = {
    u2: { id:'u2', username:'lensbyalex',     displayName:'Alex Mercer',   role:'creator', bio:'Landscape & travel photographer', location:'Edinburgh, UK', avatarUrl:'https://picsum.photos/seed/alexface/64/64',   followerCount:2840, followingCount:310, photoCount:4, likeCount:5500 },
    u3: { id:'u3', username:'urbanframe',      displayName:'Urban Frame',   role:'creator', bio:'Cities, streets, lights',         location:'Tokyo, Japan',   avatarUrl:'https://picsum.photos/seed/urbanface/64/64',  followerCount:1120, followingCount:180, photoCount:2, likeCount:2782 },
    u4: { id:'u4', username:'natureclicks',    displayName:'Nature Clicks', role:'creator', bio:'Nature is my studio',             location:'Ljubljana, SI',  avatarUrl:'https://picsum.photos/seed/natureface/64/64', followerCount:5640, followingCount:420, photoCount:1, likeCount:3410 },
    u5: { id:'u5', username:'sandstorm_shots', displayName:'Sand & Lens',   role:'creator', bio:'Desert light chaser',             location:'Marrakech, MA',  avatarUrl:'https://picsum.photos/seed/sandface/64/64',   followerCount:3200, followingCount:200, photoCount:1, likeCount:2108 },
  };

  /* ── PATCH API ───────────────────────────────── */
  // Wrap original API methods — use mock data, fall back gracefully
  // Remove this block (and the <script> include) once Azure backend is live.
  function delay(ms = 600) { return new Promise(r => setTimeout(r, ms)); }

  window.addEventListener('DOMContentLoaded', () => {
    if (typeof API === 'undefined') return;

    // me
    API.me = async () => { await delay(400); return me(); };

    // photos feed
    API.getPhotos = async (params = '') => {
      await delay(700);
      const url = new URLSearchParams(params.replace(/^\?/, ''));
      const filter = url.get('filter') || 'all';
      const cat = ['travel','nature','urban','portrait','abstract'].includes(filter) ? filter : null;
      let list = cat ? photos.filter(p => p.category === cat) : [...photos];
      return { photos: list, hasMore: false };
    };

    // single photo
    API.getPhoto = async (id) => { await delay(500); const p = photos.find(x => x.id === id); if (!p) throw new Error('Not found'); return p; };

    // saved
    API.getSaved = async () => { await delay(600); return { photos: photos.filter(p => p.savedAt), hasMore: false }; };

    // search
    API.search = async (q) => { await delay(500); const qLow = q.toLowerCase(); return { photos: photos.filter(p => p.title.toLowerCase().includes(qLow) || p.caption.toLowerCase().includes(qLow) || p.category.includes(qLow)), hasMore: false }; };

    // trending
    API.trending = async () => { await delay(400); return trending; };

    // stories
    API.getStories = async () => { await delay(350); return { stories }; };

    // comments
    API.getComments = async (id) => { await delay(400); return { comments: comments[id] || [] }; };

    // addComment (local only)
    API.addComment = async (id, text) => {
      await delay(300);
      const u = me();
      const c = { id: 'c_' + Date.now(), username: u.username, avatarUrl: u.avatarUrl, text, createdAt: new Date().toISOString() };
      if (!comments[id]) comments[id] = [];
      comments[id].unshift(c);
      return c;
    };

    // toggleLike / toggleSave / ratePhoto — just acknowledge
    API.toggleLike = async (id) => { await delay(200); return { ok: true }; };
    API.toggleSave = async (id)  => { await delay(200); return { ok: true }; };
    API.ratePhoto  = async (id, score) => { await delay(200); return { ok: true }; };

    // profile
    API.getProfile    = async (uid) => { await delay(400); return profiles[uid] || me(); };
    API.getUserPhotos = async (uid) => { await delay(500); return { photos: photos.filter(p => p.creatorId === uid), hasMore: false }; };
    API.updateProfile = async (data)=> { await delay(400); const u = me(); Object.assign(u, data); localStorage.setItem('lm_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('lm_user')||'{}'), ...data })); return u; };

    // hashtag
    API.hashtag = async (tag) => { await delay(500); return { photos: photos.filter(p => p.caption.includes('#'+tag)), hasMore: false }; };

    // suggestions (used by feed sidebar)
    API.getSuggestions = async () => { await delay(400); return { users: suggestions }; };

    console.log('[MockData] API overridden with test data ✓');
  });

  return { photos, me, stories, trending, suggestions, comments, profiles };
})();
