/* Lumora — API layer (wired to Azure Functions) */
const API = (() => {
  const base = () => CONFIG.API_BASE;
  const token = () => localStorage.getItem('lm_token') || '';
  const headers = (extra = {}) => ({
    'Content-Type': 'application/json',
    'Authorization': token() ? `Bearer ${token()}` : '',
    ...extra,
  });

  async function req(method, path, body) {
    const res = await fetch(base() + path, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
    return res.json();
  }

  return {
    // Auth
    login:    (data) => req('POST', '/auth/login',    data),
    signup:   (data) => req('POST', '/auth/register', data),
    me:       ()     => req('GET',  '/auth/me'),

    // Photos
    getPhotos:    (params = '') => req('GET', `/photos${params}`),
    getPhoto:     (id)          => req('GET', `/photos/${id}`),
    uploadPhoto:  (data)        => req('POST', '/photos', data),
    deletePhoto:  (id)          => req('DELETE', `/photos/${id}`),
    getSasUrl:    (extension)   => req('POST', '/photos/upload-url', { extension }),

    // Likes
    toggleLike: (id) => req('POST', `/photos/${id}/like`),

    // Comments
    getComments: (id)        => req('GET',  `/photos/${id}/comments`),
    addComment:  (id, text)  => req('POST', `/photos/${id}/comments`, { text }),

    // Ratings
    ratePhoto: (id, score) => req('POST', `/photos/${id}/rate`, { rating: score }),

    // Saved / Liked collections
    toggleSave:  (id)          => req('POST', `/photos/${id}/save`),
    getSaved:    (params = '') => req('GET',  `/users/me/saved${params}`),
    getLiked:    (params = '') => req('GET',  `/users/me/liked${params}`),

    // Explore
    search:   (q)    => req('GET', `/photos/search?q=${encodeURIComponent(q)}`),
    trending: ()     => req('GET', '/photos/trending'),
    hashtag:  (tag)  => req('GET', `/photos/hashtag/${encodeURIComponent(tag)}`),

    // Profile
    getProfile:       (userId) => req('GET',  `/users/${userId}`),
    updateProfile:    (data)   => req('PUT',  '/users/me', data),
    getAvatarUploadUrl: ()     => req('POST', '/users/avatar-url'),
    getUserPhotos: (userId) => req('GET',   `/users/${userId}/photos`),

    // Stories
    getStories:  ()                    => req('GET',  '/stories'),
    postStory:   (blobUrl, caption)    => req('POST', '/stories', { blobUrl, caption }),
  };
})();
