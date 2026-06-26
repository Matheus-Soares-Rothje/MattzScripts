/* ===========================
   Matt'z Scripts - Main JS
   =========================== */

// ===== THEME =====
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('mattz-theme') || 'dark';
    this.apply(saved);
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mattz-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

// ===== PRODUCT LOADER =====
const ProductLoader = {
  cache: {},
  async loadIndex() {
    try {
      const r = await fetch('produtos/index.json');
      return await r.json();
    } catch (e) {
      console.error('Erro ao carregar index de produtos:', e);
      return [];
    }
  },
  async loadProduct(id) {
    if (this.cache[id]) return this.cache[id];
    try {
      const r = await fetch(`produtos/${id}/info.json`);
      const data = await r.json();
      data.id = id;
      this.cache[id] = data;
      return data;
    } catch (e) {
      console.error(`Erro ao carregar produto ${id}:`, e);
      return null;
    }
  },
  async loadAll() {
    const ids = await this.loadIndex();
    const promises = ids.map(id => this.loadProduct(id));
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  }
};

// ===== CATEGORY ICONS (SVG) =====
const categoryIcons = {
  'Discord': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="13" rx="3"/><circle cx="8.5" cy="13.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="15.5" cy="13.5" r="1.4" fill="currentColor" stroke="none"/><path d="M7 7l1.2-3h7.6L17 7"/></svg>',
  'WhatsApp': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  'Bots': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="11" rx="2"/><circle cx="9" cy="14.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="14.5" r="1.3" fill="currentColor" stroke="none"/><path d="M12 9V5"/><circle cx="12" cy="3.5" r="1.5"/><path d="M2 13h2M20 13h2"/></svg>',
  'APIs': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 7 4 12 9 17"/><polyline points="15 7 20 12 15 17"/></svg>',
  'Automação': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  'Painéis': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  'IA': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="9.5" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.5" cy="9" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14h6M9 17h4"/></svg>',
  'Web': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  'Jogos': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="10" rx="4"/><line x1="6" y1="13" x2="9" y2="13"/><line x1="7.5" y1="11.5" x2="7.5" y2="14.5"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="14" r="1" fill="currentColor" stroke="none"/></svg>',
  'Mobile': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>',
  'Utilitários': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  'Outros': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>'
};

function getCatIcon(cat) {
  return categoryIcons[cat] || categoryIcons['Outros'];
}

// ===== CARD BUILDER =====
function buildProductCard(p, size = 'normal') {
  const badges = [];
  if (p.destaque) badges.push('<span class="badge badge-destaque">Mais Vendido</span>');
  if (p.lancamento) badges.push('<span class="badge badge-lancamento">Lançamento</span>');
  if (p.popular) badges.push('<span class="badge badge-popular">Popular</span>');
  if (p.emAlta) badges.push('<span class="badge badge-alta">Em Alta</span>');

  const stars = '★'.repeat(Math.round(p.avaliacao || 5));
  const price = parseFloat(p.preco || 0).toFixed(2).replace('.', ',');

  return `
    <div class="product-card fade-in" onclick="if(!event.target.closest('.btn-buy')) window.location.href='produto.html?id=${p.id}'" role="link" tabindex="0">
      <div class="card-thumb">
        <div class="card-thumb-placeholder">${getCatIcon(p.categoria)}</div>
        ${badges.length ? `<div class="card-badges">${badges.join('')}</div>` : ''}
      </div>
      <div class="card-body">
        <div class="card-category">${p.categoria || 'Outros'}</div>
        <div class="card-name">${p.nome}</div>
        <div class="card-rating">
          <span class="stars">${stars}</span>
          <span class="rating-num">${p.avaliacao}</span>
          <span class="rating-count">(${p.avaliacoes || 0})</span>
        </div>
        <div class="card-footer">
          <div class="card-price"><span>R$</span> ${price}</div>
          <a href="${p.link || '#'}" target="_blank" class="btn-buy" onclick="event.stopPropagation()">
            Ver no Kiwify ↗
          </a>
        </div>
      </div>
    </div>
  `;
}

function buildSkeletonCard() {
  return `
    <div class="skeleton-card">
      <div class="skeleton-thumb skeleton"></div>
      <div class="skeleton-body">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line w-80"></div>
        <div class="skeleton-line w-60"></div>
      </div>
    </div>
  `;
}

// ===== INTERSECTION OBSERVER (reveal on scroll) =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

function setupReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ===== CAROUSEL =====
function setupCarousel(trackId, prevId, nextId) {
  const track = document.getElementById(trackId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  if (!track) return;

  const scroll = () => {
    const card = track.querySelector('.product-card');
    return card ? card.offsetWidth + 16 : 240;
  };

  if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -scroll() * 2, behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => track.scrollBy({ left: scroll() * 2, behavior: 'smooth' }));
}

// ===== MOBILE MENU =====
function setupMobileMenu() {
  const overlay = document.getElementById('mobile-menu-overlay');
  const openBtn = document.getElementById('hamburger-btn');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (openBtn) openBtn.addEventListener('click', () => overlay?.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => overlay?.classList.remove('open'));
  if (overlay) overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
}

// ===== TOAST =====
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ===== SEARCH UTILS =====
function matchSearch(p, query) {
  const q = query.toLowerCase();
  return (
    p.nome?.toLowerCase().includes(q) ||
    p.categoria?.toLowerCase().includes(q) ||
    p.descricao?.toLowerCase().includes(q)
  );
}

// ===== MARK ACTIVE NAV =====
function markActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-item').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === page || (page === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
}

// ===== INIT COMMON =====
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => ThemeManager.toggle());

  setupMobileMenu();
  markActiveNav();
  setupReveal();

  // Newsletter mock
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('✅ Você foi inscrito com sucesso!');
      form.reset();
    });
  });
});
