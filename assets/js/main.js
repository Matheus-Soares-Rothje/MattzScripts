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

// ===== CATEGORY ICONS =====
const categoryIcons = {
  'Discord': '🎮',
  'WhatsApp': '💬',
  'Bots': '🤖',
  'APIs': '</>', 
  'Automação': '⚙️',
  'Painéis': '📊',
  'IA': '🧠',
  'Web': '🌐',
  'Jogos': '🕹️',
  'Utilitários': '🔧',
  'Outros': '📦'
};

function getCatIcon(cat) {
  return categoryIcons[cat] || '📦';
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
    <a href="produto.html?id=${p.id}" class="product-card fade-in">
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
    </a>
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
