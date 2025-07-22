(function (window, document) {
  const CSF = {};
  window.CSF = CSF; // expose globally

  /* ----------------------------------------------
   * "Auth" helpers (stubbed – replace w/ real auth)
   * ---------------------------------------------- */
  CSF.getCurrentUserId = function () {
    return localStorage.getItem('csf_current_user');
  };

  CSF.isLoggedIn = function () {
    return localStorage.getItem('csf_user_logged_in') === 'true' && !!CSF.getCurrentUserId();
  };

  // Optional helper to simulate login in dev
  CSF.devLogin = function (userId = 'demoUser') {
    localStorage.setItem('csf_current_user', userId);
    localStorage.setItem('csf_user_logged_in', 'true');
  };

  CSF.devLogout = function () {
    localStorage.setItem('csf_user_logged_in', 'false');
    // keep csf_current_user so favourites remain associated; remove if you want full clear
  };

  CSF.requireLogin = function () {
    if (!CSF.isLoggedIn()) {
      const loginUrl = CSF.resolveLoginUrl();
      window.location.href = loginUrl;
      return false;
    }
    return true;
  };

  CSF.resolveLoginUrl = function () {
    // Try to find login link in nav (robust against path depth)
    const navLogin = document.querySelector('nav a[href*="login"]');
    if (navLogin) return navLogin.href;
    // fallback guess
    return '/login/index.html';
  };

  /* ----------------------------------------------
   * Toast util
   * ---------------------------------------------- */
  function ensureToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function injectToastStylesOnce() {
    if (document.getElementById('toast-styles')) return;
    const s = document.createElement('style');
    s.id = 'toast-styles';
    s.textContent = `
      #toast-container{position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;}
      .csf-toast{min-width:200px;max-width:300px;padding:.75rem 1rem;border-radius:6px;font-family:inherit;font-size:14px;line-height:1.2;color:#fff;animation:csf-toast-in .15s ease-out,csf-toast-out .25s ease-in 3s forwards}
      .csf-toast.success{background:#28a745}
      .csf-toast.info{background:#17a2b8}
      .csf-toast.error{background:#dc3545}
      @keyframes csf-toast-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
      @keyframes csf-toast-out{to{opacity:0;transform:translateY(-5px)}}
    `;
    document.head.appendChild(s);
  }

  CSF.showToast = function (msg, type = 'info') {
    injectToastStylesOnce();
    const container = ensureToastContainer();
    const el = document.createElement('div');
    el.className = `csf-toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 3500);
  };

  /* ----------------------------------------------
   * Favourites persistence helpers
   * ---------------------------------------------- */
  const FAV_KEY = 'csf_favorites_v1';

  function loadFavMap() {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || {};
    } catch (e) {
      console.warn('Fav parse error', e);
      return {};
    }
  }

  function saveFavMap(map) {
    localStorage.setItem(FAV_KEY, JSON.stringify(map));
  }

  CSF.getFavorites = function (userId = CSF.getCurrentUserId()) {
    const map = loadFavMap();
    return (map[userId] && Object.values(map[userId])) || [];
  };

  CSF.isFavorite = function (cafeId, userId = CSF.getCurrentUserId()) {
    const map = loadFavMap();
    return !!(map[userId] && map[userId][cafeId]);
  };

  CSF.addFavorite = function (cafeSnap, userId = CSF.getCurrentUserId()) {
    if (!userId) return;
    const map = loadFavMap();
    if (!map[userId]) map[userId] = {};
    map[userId][cafeSnap.id] = cafeSnap;
    saveFavMap(map);
  };

  CSF.removeFavorite = function (cafeId, userId = CSF.getCurrentUserId()) {
    if (!userId) return;
    const map = loadFavMap();
    if (map[userId]) {
      delete map[userId][cafeId];
      saveFavMap(map);
    }
  };

  /* ----------------------------------------------
   * Cafe data (central – used by detail + fallback for favs)
   * ---------------------------------------------- */
  // You can move this to a JSON fetch later; centralizing for now.
  CSF.cafesData = {
    "bloom": {
      id: 'bloom',
      name: 'Bloom Cafe',
      address: '596 Yonge St, Toronto, ON M4Y 1Z3',
      locationText: 'Yonge & Wellesley',
      rating: 4.7,
      tags: ['Cozy', 'Wi-Fi', 'Pastries'],
      phone: '(416) 792-0419',
      hours: 'Mon-Sun 9:00 AM - 10:00 PM',
      website: 'https://thebloomcafe.ca/',
      about: 'A cozy neighborhood cafe serving artisanal coffee and fresh pastries in a warm, welcoming atmosphere perfect for work or relaxation.',
      amenities: 'Free Wi-Fi, indoor seating, wheelchair accessibility, gender-neutral washroom',
      status: {
        seats: { available: 8, total: 15 },
        outlets: { available: 5, total: 8 },
        noise: 'Moderate',
        lastUpdated: '5 minutes ago'
      },
      images: [
        { src: 'Interior.webp', alt: 'Bloom Cafe Interior' },
        { src: 'Seats.webp', alt: 'Bloom Cafe Seating Area' },
        { src: 'Food.webp', alt: 'Bloom Cafe Food' },
        { src: 'Exterior.webp', alt: 'Bloom Cafe Exterior' }
      ],
      img: 'Interior.webp' // default card img
    },
    "good-earth": {
      id: 'good-earth',
      name: 'Good Earth Coffeehouse',
      address: '8 Wellesley St E unit 102, Toronto, ON M4Y 3B2',
      locationText: 'Wellesley Village',
      rating: 4.5,
      tags: ['Fair Trade', 'Quiet', 'Power Outlets'],
      phone: '(416) 964-0112',
      hours: 'Mon-Fri 6:00 AM - 8:00 PM; Sat-Sun 7:00 AM - 8:00 PM',
      website: 'https://goodearthcoffeehouse.com/',
      about: 'Ethically sourced coffees with a focus on sustainability, served in a relaxed, community-focused space.',
      amenities: 'Free WiFi, Power Outlets, Indoor Seating, Takeaway, Card Payment, Washroom',
      status: {
        seats: { available: 12, total: 20 },
        outlets: { available: 6, total: 10 },
        noise: 'Quiet',
        lastUpdated: '2 minutes ago'
      },
      images: [
        { src: 'GoodE_exterior.webp', alt: 'Good Earth Exterior' },
        { src: 'GoodE_food.webp', alt: 'Good Earth Food' },
        { src: 'GoodE_interior.webp', alt: 'Good Earth Interior' },
        { src: 'GoodE_menu.webp', alt: 'Good Earth Menu' }
      ],
      img: 'GoodE_exterior.webp'
    },
    "le-genie": {
      id: 'le-genie',
      name: 'Le Génie Bakery & Espresso',
      address: '382 Yonge St First Floor, Toronto, ON M5B 1S8',
      locationText: 'College Park',
      rating: 4.8,
      tags: ['Artisanal', 'Outdoor Patio', 'Bakery'],
      phone: '(416) 546-8578',
      hours: 'Tue-Thu 7:30 AM - 6:30 PM; Fri 7:30 AM - 7:00 PM; Sat 9:00 AM - 7:00 PM; Sun 9:00 AM - 6:30 PM; Mon Closed',
      website: 'https://www.le-genie.ca/',
      about: 'Masterful pastries and exceptional coffee featuring world-class beans from Tim Wendelboe.',
      amenities: 'Free WiFi, Power Outlets, Outdoor Patio, Indoor Seating, Cash & Card, Washroom',
      status: {
        seats: { available: 6, total: 12 },
        outlets: { available: 2, total: 4 },
        noise: 'Loud',
        lastUpdated: '8 minutes ago'
      },
      images: [
        { src: 'Le_exterior.webp', alt: 'Le Génie Exterior' },
        { src: 'Le_food.webp', alt: 'Le Génie Pastries' },
        { src: 'Le_interior.webp', alt: 'Le Génie Interior' },
        { src: 'Le_menu.webp', alt: 'Le Génie Menu' }
      ],
      img: 'Le_exterior.webp'
    }
  };

  // map of legacy query param IDs -> our normalized keys
  const paramAliasMap = {
    'bloom': 'bloom',
    'Good Earth': 'good-earth',
    'Good%20Earth': 'good-earth',
    'Le Génie': 'le-genie',
    'Le%20Génie': 'le-genie',
    'Le_Génie': 'le-genie'
  };

  CSF.normalizeCafeId = function (id) {
    if (!id) return 'le-genie';
    return paramAliasMap[id] || id.toLowerCase();
  };

  CSF.getCafeFromParam = function () {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('id') || 'le-genie';
    const norm = CSF.normalizeCafeId(raw);
    return CSF.cafesData[norm];
  };

  /* ----------------------------------------------
   * Cafe Detail Page Init
   * ---------------------------------------------- */
  CSF.loadCafePage = function () {
    const cafe = CSF.getCafeFromParam();
    if (!cafe) {
      CSF.showToast('Cafe not found.', 'error');
      return;
    }
    populateCafeData(cafe);
    initFavoriteButton(cafe);
    initCarousel(cafe);
  };

  function populateCafeData(cafe) {
    setElText('page-title', `${cafe.name} - Cafe Spot Finder`, true);
    setElText('cafe-name', cafe.name);
    setElHTML('cafe-address', `<strong>Address:</strong> ${cafe.address}`);
    setElHTML('cafe-phone', `<strong>Phone:</strong> ${cafe.phone}`);
    setElHTML('cafe-hours', `<strong>Hours:</strong> ${cafe.hours}`);
    setElHTML('cafe-website', `<strong>Website:</strong> <a href="${cafe.website}" target="_blank">${cafe.website}</a>`);
    setElHTML('cafe-about', `<strong>About:</strong> ${cafe.about}`);
    setElHTML('cafe-amenities', `<strong>Amenities:</strong> ${cafe.amenities}`);

    setElText('seats-status', `${cafe.status.seats.available}/${cafe.status.seats.total}`);
    setElText('outlets-status', `${cafe.status.outlets.available}/${cafe.status.outlets.total}`);
    const noiseEl = document.getElementById('noise-status');
    if (noiseEl) {
      noiseEl.textContent = cafe.status.noise;
      noiseEl.className = `status-value ${cafe.status.noise.toLowerCase()}`;
    }
    setElText('last-updated', `Last updated ${cafe.status.lastUpdated}`);
  }

  function initFavoriteButton(cafe) {
    const btn = document.querySelector('.favorite-btn');
    if (!btn) return;
    btn.dataset.cafeId = cafe.id;
    updateFavBtnState(btn, CSF.isFavorite(cafe.id));
    btn.addEventListener('click', () => {
      if (!CSF.requireLogin()) return;
      const currentlyFav = CSF.isFavorite(cafe.id);
      if (currentlyFav) {
        CSF.removeFavorite(cafe.id);
        CSF.showToast(`${cafe.name} removed from favourites.`, 'info');
      } else {
        CSF.addFavorite(toSnap(cafe));
        CSF.showToast(`${cafe.name} added to favourites!`, 'success');
      }
      updateFavBtnState(btn, !currentlyFav);
    });
  }

  function updateFavBtnState(btn, isFav) {
    if (!btn) return;
    const heart = btn.querySelector('.heart');
    if (heart) heart.textContent = isFav ? '♥' : '♡';
    btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    btn.setAttribute('aria-label', isFav ? 'Remove from favourites' : 'Add to favourites');
    btn.innerHTML = `<span class="heart" style="color:#a87544;">${isFav ? '♥' : '♡'}</span> ${isFav ? 'Added to Favourites' : 'Add to Favourites'}`;
  }

  function toSnap(cafe) {
    return {
      id: cafe.id,
      name: cafe.name,
      address: cafe.address,
      locationText: cafe.locationText,
      rating: cafe.rating,
      tags: cafe.tags,
      img: cafe.img || (cafe.images && cafe.images[0] && cafe.images[0].src) || '',
    };
  }

  /* ----------------------------------------------
   * Cafe Detail – Image Carousel + Modal
   * ---------------------------------------------- */
  function initCarousel(cafe) {
    const imgs = cafe.images || [];
    const carouselImage = document.getElementById('carouselImage');
    const counter = document.getElementById('imageCounter');
    const prevBtn = document.getElementById('prev-button');
    const nextBtn = document.getElementById('next-button');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    if (!carouselImage || !counter) return;

    let currentImageIndex = 0;
    function render() {
      if (!imgs.length) return;
      const im = imgs[currentImageIndex];
      carouselImage.src = im.src;
      carouselImage.alt = im.alt;
      counter.textContent = `${currentImageIndex + 1} / ${imgs.length}`;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + imgs.length) % imgs.length;
      render();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % imgs.length;
      render();
    });
    if (carouselImage) carouselImage.addEventListener('click', () => {
      if (!imgs.length) return;
      modal.style.display = 'block';
      modalImage.src = imgs[currentImageIndex].src;
      modalImage.alt = imgs[currentImageIndex].alt;
    });
    if (modal) modal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    render();
  }

  /* ----------------------------------------------
   * My Favourites Page Init
   * ---------------------------------------------- */
  CSF.renderFavoritesPage = function () {
    const listEl = document.getElementById('favorites-list');
    const emptyEl = document.getElementById('no-favorites');
    if (!listEl) return;

    const userOk = CSF.requireLogin();
    if (!userOk) return; // redirect triggered

    const favs = CSF.getFavorites();
    listEl.innerHTML = '';

    if (!favs.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    favs.forEach(fav => {
      const card = buildFavCard(fav);
      listEl.appendChild(card);
    });

    // event delegation for removing from favourites
    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.fav-toggle');
      if (!btn) return;
      const cafeId = btn.dataset.cafeId;
      const isFav = CSF.isFavorite(cafeId);
      if (isFav) {
        CSF.removeFavorite(cafeId);
        CSF.showToast('Removed from favourites.', 'info');
        CSF.renderFavoritesPage(); // re-render
      } else {
        // If somehow not fav & user clicks, add back (edge-case)
        const cafe = CSF.cafesData[cafeId];
        if (cafe) CSF.addFavorite(toSnap(cafe));
        CSF.renderFavoritesPage();
      }
    }, { once: true });
  };

  function buildFavCard(fav) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cafeId = fav.id;
    card.innerHTML = `
      <img src="${escapeHtmlAttr(fav.img || '')}" alt="${escapeHtmlAttr(fav.name)}">
      <div class="card-content">
        <h4>${escapeHtml(fav.name)}</h4>
        <p>${escapeHtml(fav.locationText || fav.address || '')}</p>
        <p>⭐ ${Number(fav.rating || 0).toFixed(1)} | ${Array.isArray(fav.tags) ? fav.tags.join(' • ') : ''}</p>
        <button class="fav-toggle" data-cafe-id="${escapeHtmlAttr(fav.id)}" aria-label="Remove from favourites">❤️</button>
        <a class="detail-link" href="../search/detail/index.html?id=${encodeURIComponent(fav.id)}">View Details</a>
      </div>`;
    return card;
  }

  /* ----------------------------------------------
   * Utility DOM helpers
   * ---------------------------------------------- */
  function setElText(id, txt, isTitle = false) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = txt;
      if (isTitle) document.title = txt;
    }
  }
  function setElHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]||s));
  }
  function escapeHtmlAttr(str) {
    return escapeHtml(str);
  }

  /* ----------------------------------------------
   * Auto-dev convenience: ensure a demo login the first time
   * ---------------------------------------------- */
  (function ensureDevUser() {
    if (!localStorage.getItem('csf_user_logged_in')) {
      CSF.devLogin('demoUser');
    }
  })();

})(window, document);
