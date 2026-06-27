/* =========================================================
   SCRIPTSTORE — JAVASCRIPT PRINCIPAL
   Tema persistente, menu mobile, busca instantânea, sistema
   de produtos via fetch(), skeleton loading, scroll reveal
   com Intersection Observer e lazy loading do catálogo.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initIcons();
  setCurrentYear();
  initSidebarToggle();
  initMobileMenu();
  initSearchShortcuts();
  initScrollReveal();
  renderSkeletons();
  initApp();
});

async function initApp() {
  const products = await fetchAllProducts();

  renderHomeSections(products);
  initCatalogControls(products);
  initProductPage(products);
}

/* =========================================================
   SISTEMA DE PRODUTOS
   Carrega produtos/index.json e busca automaticamente o
   info.json de cada produto listado. Sem backend: tudo via
   fetch() de arquivos estáticos. O resultado é reutilizado
   pela Home, pelo Catálogo e pela Página de Produto.
   ========================================================= */

async function fetchAllProducts() {
  try {
    const indexRes = await fetch("produtos/index.json");
    if (!indexRes.ok) throw new Error("Não foi possível carregar produtos/index.json");
    const { produtos: slugs } = await indexRes.json();

    const requests = slugs.map((slug) =>
      fetch(`produtos/${slug}/info.json`)
        .then((res) => {
          if (!res.ok) throw new Error(`Falha ao carregar produto: ${slug}`);
          return res.json();
        })
        .catch((err) => {
          console.error(err);
          return null;
        })
    );

    return (await Promise.all(requests)).filter(Boolean);
  } catch (error) {
    console.error("Erro ao carregar o catálogo de produtos:", error);
    return [];
  }
}

/* Estado do catálogo — filtros ativos (apenas na página catalogo.html) */
const catalogState = {
  products: [],
  searchTerm: "",
  category: "todos",
  sortBy: "recentes",
  visibleCount: 8
};

const CATALOG_PAGE_SIZE = 8;

/* =========================================================
   TEMA — ESCURO / CLARO
   Persistência via localStorage. Aplica o atributo
   data-theme na <html>, consumido por todas as variáveis
   CSS do design system. Ícones de sol/lua são alternados
   nos botões de tema do header e da bottom navigation.
   ========================================================= */

const THEME_STORAGE_KEY = "scriptstore-theme";

function initTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const theme = stored || (prefersLight ? "light" : "dark");

  applyTheme(theme);

  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/* ---------- RENDERIZAÇÃO — HOME ---------- */
function renderHomeSections(products) {
  renderGrid("featured-products", products.filter((p) => p.destaque).slice(0, 4));
  renderGrid("new-products", products.filter((p) => p.novo).slice(0, 4));
  renderGrid("bestseller-products", products.filter((p) => p.maisVendido).slice(0, 4));
}

/* =========================================================
   CATÁLOGO — BUSCA, FILTRO DE CATEGORIA E ORDENAÇÃO
   Tudo processado no cliente, em cima dos produtos já
   carregados via fetch(). Sem requisições adicionais.
   ========================================================= */

function initCatalogControls(products) {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return; // controles só existem na página de catálogo

  catalogState.products = products;

  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const categoryLinks = document.querySelectorAll(".sidebar-link[data-category]");

  searchInput?.addEventListener("input", (e) => {
    catalogState.searchTerm = e.target.value.trim().toLowerCase();
    catalogState.visibleCount = CATALOG_PAGE_SIZE;
    applyCatalogFilters();
  });

  sortSelect?.addEventListener("change", (e) => {
    catalogState.sortBy = e.target.value;
    catalogState.visibleCount = CATALOG_PAGE_SIZE;
    applyCatalogFilters();
  });

  categoryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      catalogState.category = link.dataset.category;
      catalogState.visibleCount = CATALOG_PAGE_SIZE;

      categoryLinks.forEach((l) => {
        l.classList.remove("active");
        l.removeAttribute("aria-current");
      });
      link.classList.add("active");
      link.setAttribute("aria-current", "true");

      applyCatalogFilters();
      closeSidebarOnMobile();
    });
  });

  initLazyLoadSentinel();
  applyCatalogFilters();
}

function applyCatalogFilters() {
  const { products, searchTerm, category, sortBy, visibleCount } = catalogState;

  let result = products.filter((product) => {
    const matchesCategory = category === "todos" || product.categoria === category;
    const matchesSearch =
      !searchTerm ||
      product.nome.toLowerCase().includes(searchTerm) ||
      product.categoriaLabel.toLowerCase().includes(searchTerm) ||
      (product.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm));

    return matchesCategory && matchesSearch;
  });

  result = sortProducts(result, sortBy);

  catalogState.filteredTotal = result.length;
  renderCatalog(result.slice(0, visibleCount));

  const sentinel = document.getElementById("catalog-sentinel");
  if (sentinel) {
    sentinel.hidden = visibleCount >= result.length;
  }
}

/* ---------- LAZY LOADING — CARREGAMENTO PROGRESSIVO ---------- */
function initLazyLoadSentinel() {
  const sentinel = document.getElementById("catalog-sentinel");
  if (!sentinel || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          catalogState.visibleCount += CATALOG_PAGE_SIZE;
          applyCatalogFilters();
        }
      });
    },
    { rootMargin: "200px" }
  );

  observer.observe(sentinel);
}

function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case "vendidos":
      return sorted.sort((a, b) => b.vendas - a.vendas);
    case "preco-asc":
      return sorted.sort((a, b) => a.preco - b.preco);
    case "preco-desc":
      return sorted.sort((a, b) => b.preco - a.preco);
    case "avaliacao":
      return sorted.sort((a, b) => b.avaliacao - a.avaliacao);
    case "recentes":
    default:
      return sorted.sort((a, b) => new Date(b.dataLancamento) - new Date(a.dataLancamento));
  }
}

/* ---------- RENDERIZAÇÃO — CATÁLOGO ---------- */
function renderCatalog(products) {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  renderGrid("catalog-grid", products);
  updateResultsCount(catalogState.filteredTotal ?? products.length);

  const emptyState = document.getElementById("empty-state");
  if (emptyState) {
    emptyState.hidden = (catalogState.filteredTotal ?? products.length) > 0;
  }
}

function updateResultsCount(total) {
  const el = document.getElementById("results-count");
  if (!el) return;
  el.textContent = total === 1 ? "1 produto encontrado" : `${total} produtos encontrados`;
}

/* ---------- RENDERIZAÇÃO GENÉRICA DE GRID ---------- */
function renderGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.removeAttribute("data-state");
  container.innerHTML = products.map(buildProductCardHTML).join("");
  initIcons();
  observeReveals();
}

/* ---------- CARD DE PRODUTO ---------- */
function buildProductCardHTML(product) {
  const {
    id,
    nome,
    categoriaLabel,
    categoria,
    icone,
    preco,
    avaliacao,
    vendas,
    destaque,
    novo,
    maisVendido
  } = product;

  return `
    <article class="product-card reveal">
      ${buildBadgeHTML({ destaque, novo, maisVendido })}
      <div class="product-thumb thumb-${categoria}">
        <i data-lucide="${icone}" aria-hidden="true"></i>
      </div>
      <div class="product-body">
        <span class="product-category">${categoriaLabel}</span>
        <h3 class="product-title">${nome}</h3>
        <div class="product-meta">
          <span class="product-rating"><i data-lucide="star" aria-hidden="true"></i>${avaliacao.toFixed(1)}</span>
          <span class="product-sales">${vendas} vendas</span>
        </div>
        <div class="product-footer">
          <span class="product-price">${formatPrice(preco)}</span>
          <a href="produto.html?id=${encodeURIComponent(id)}" class="btn-mini">Ver</a>
        </div>
      </div>
    </article>
  `;
}

function buildBadgeHTML({ destaque, novo, maisVendido }) {
  if (novo) {
    return `<span class="product-badge badge-new">Novo</span>`;
  }
  if (destaque) {
    return `<span class="product-badge badge-featured">Destaque</span>`;
  }
  if (maisVendido) {
    return `<span class="product-badge badge-bestseller"><i data-lucide="flame" aria-hidden="true"></i>Top</span>`;
  }
  return "";
}

function formatPrice(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* =========================================================
   PÁGINA DE PRODUTO
   Lê o parâmetro "id" da URL (ex: produto.html?id=discord-bot),
   localiza o produto correspondente entre os já carregados via
   fetch() e renderiza todo o conteúdo dinamicamente: imagem,
   nome, descrição, recursos, categoria, avaliação, preço,
   botão de compra, SEO/OG/Twitter e produtos relacionados.
   ========================================================= */

function initProductPage(products) {
  const detailGrid = document.getElementById("product-detail-grid");
  if (!detailGrid) return; // só executa em produto.html

  const id = new URLSearchParams(window.location.search).get("id");
  const product = products.find((p) => p.id === id);

  if (!product) {
    renderProductNotFound(detailGrid);
    return;
  }

  renderProductDetail(product);
  renderProductSEO(product);
  renderRelatedProducts(product, products);
  initIcons();
}

function renderProductNotFound(container) {
  container.innerHTML = `
    <div class="product-not-found">
      <i data-lucide="search-x" aria-hidden="true"></i>
      <h1>Produto não encontrado</h1>
      <p>O script que você procura não existe ou foi removido do catálogo.</p>
      <a href="catalogo.html" class="btn btn-primary">
        Voltar ao catálogo
        <i data-lucide="arrow-right" aria-hidden="true"></i>
      </a>
    </div>
  `;

  setText("page-title", "Produto não encontrado — ScriptStore");

  const robotsMeta = document.querySelector('meta[name="robots"]');
  robotsMeta?.setAttribute("content", "noindex, follow");

  initIcons();
}

function renderProductDetail(product) {
  const {
    nome,
    categoriaLabel,
    categoria,
    icone,
    preco,
    avaliacao,
    vendas,
    descricaoCurta,
    descricao,
    recursos = []
  } = product;

  const container = document.getElementById("product-detail-grid");
  container.innerHTML = `
    <div class="product-gallery">
      <div class="product-image thumb-${categoria}">
        <i data-lucide="${icone}" aria-hidden="true"></i>
      </div>
    </div>

    <div class="product-info">
      <span class="product-category-tag">
        <i data-lucide="${icone}" aria-hidden="true"></i>
        ${categoriaLabel}
      </span>

      <h1>${nome}</h1>

      <div class="product-rating-row">
        <span class="product-rating product-rating-lg">
          <i data-lucide="star" aria-hidden="true"></i>${avaliacao.toFixed(1)}
        </span>
        <span class="product-sales">${vendas} vendas</span>
      </div>

      <p class="product-description">${descricaoCurta}</p>

      ${recursos.length ? `
        <div class="product-features">
          <h3>Recursos inclusos</h3>
          <ul>
            ${recursos.map((item) => `
              <li>
                <i data-lucide="check-circle-2" aria-hidden="true"></i>
                <span>${item}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      ` : ""}

      ${descricao ? `<p class="product-long-description">${descricao}</p>` : ""}

      <div class="product-buy-box">
        <span class="product-price product-price-lg">${formatPrice(preco)}</span>
        <button type="button" class="btn btn-primary btn-buy">
          <i data-lucide="shopping-cart" aria-hidden="true"></i>
          Comprar agora
        </button>
      </div>
    </div>
  `;

  const breadcrumbCurrent = document.getElementById("breadcrumb-current");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = nome;
}

function renderRelatedProducts(product, allProducts) {
  const related = allProducts
    .filter((p) => p.categoria === product.categoria && p.id !== product.id)
    .slice(0, 4);

  const relatedSection = document.getElementById("related-section");
  const container = document.getElementById("related-products");
  if (!container) return;

  if (related.length === 0) {
    if (relatedSection) relatedSection.hidden = true;
    return;
  }

  container.innerHTML = related.map(buildProductCardHTML).join("");
}

function renderProductSEO(product) {
  const { nome, descricaoCurta, id, preco, avaliacao, categoriaLabel } = product;
  const title = `${nome} — ScriptStore`;
  const url = `https://seudominio.github.io/produto.html?id=${encodeURIComponent(id)}`;

  setText("page-title", title);
  setAttr("meta-description", "content", descricaoCurta);
  setAttr("canonical-link", "href", url);

  setAttr("og-title", "content", title);
  setAttr("og-description", "content", descricaoCurta);
  setAttr("og-url", "content", url);

  setAttr("twitter-title", "content", title);
  setAttr("twitter-description", "content", descricaoCurta);

  const jsonLd = document.getElementById("product-jsonld");
  if (jsonLd) {
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: nome,
      description: descricaoCurta,
      category: categoriaLabel,
      url,
      offers: {
        "@type": "Offer",
        price: preco.toFixed(2),
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avaliacao,
        bestRating: "5"
      }
    });
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

/* Abre/fecha a sidebar de categorias em telas mobile.
   Apenas controle de visibilidade — sem lógica de filtragem. */
function initSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const openBtn = document.getElementById("sidebar-toggle");
  const closeBtn = document.getElementById("sidebar-close");

  if (!sidebar || !overlay || !openBtn) return;

  openBtn.addEventListener("click", openSidebarMobile);
  closeBtn?.addEventListener("click", closeSidebarOnMobile);
  overlay.addEventListener("click", closeSidebarOnMobile);
}

function openSidebarMobile() {
  document.getElementById("sidebar")?.classList.add("is-open");
  document.getElementById("sidebar-overlay")?.classList.add("is-visible");
  document.getElementById("sidebar-toggle")?.setAttribute("aria-expanded", "true");
}

function closeSidebarOnMobile() {
  document.getElementById("sidebar")?.classList.remove("is-open");
  document.getElementById("sidebar-overlay")?.classList.remove("is-visible");
  document.getElementById("sidebar-toggle")?.setAttribute("aria-expanded", "false");
}

/* =========================================================
   MENU MOBILE
   Abre/fecha o menu de navegação em telas pequenas a partir
   do botão hamburger do header. Fecha ao clicar em um link,
   ao clicar fora ou ao pressionar Escape.
   ========================================================= */

function initMobileMenu() {
  const toggleBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggleBtn || !menu) return;

  const openMenu = () => {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add("is-open"));
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      menu.hidden = true;
    }, 250);
  };

  const toggleMenu = () => {
    const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  };

  toggleBtn.addEventListener("click", toggleMenu);

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    if (isOpen && !menu.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggleBtn.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });
}

/* =========================================================
   BUSCA INSTANTÂNEA — ATALHO GLOBAL
   O ícone de busca do header leva o usuário até o campo de
   busca do catálogo (ou navega até ele) e o foca imediatamente.
   A filtragem em si acontece em tempo real dentro de
   initCatalogControls(), a cada caractere digitado.
   ========================================================= */

function initSearchShortcuts() {
  document.getElementById("search-toggle")?.addEventListener("click", goToSearch);
}

function goToSearch() {
  const input = document.getElementById("search-input");

  if (input) {
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus();
    return;
  }

  window.location.href = "catalogo.html";
}

/* =========================================================
   SCROLL REVEAL + INTERSECTION OBSERVER
   Qualquer elemento com a classe "reveal" inicia levemente
   deslocado e transparente (definido em CSS) e recebe a
   classe "is-visible" assim que entra na viewport, disparando
   uma transição suave. Reutilizado tanto para o conteúdo
   estático das páginas quanto para os cards renderizados
   dinamicamente após cada fetch().
   ========================================================= */

let revealObserver = null;

function initScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  observeReveals();
}

function observeReveals() {
  if (!revealObserver) return;
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    revealObserver.observe(el);
  });
}

/* =========================================================
   SKELETON LOADING
   Exibido imediatamente ao carregar a página, antes que o
   fetch() dos produtos seja concluído. É substituído pelo
   conteúdo real assim que os dados chegam (ver renderGrid
   e renderProductDetail), sem alterar a estrutura do layout.
   ========================================================= */

function renderSkeletons() {
  ["featured-products", "new-products", "bestseller-products", "catalog-grid"].forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = buildSkeletonCardHTML().repeat(4);
    }
  });

  const detailGrid = document.getElementById("product-detail-grid");
  if (detailGrid) {
    detailGrid.innerHTML = buildSkeletonDetailHTML();
  }
}

function buildSkeletonCardHTML() {
  return `
    <article class="product-card skeleton-card" aria-hidden="true">
      <div class="skeleton-thumb"></div>
      <div class="product-body">
        <div class="skeleton-line skeleton-line-xs"></div>
        <div class="skeleton-line skeleton-line-lg"></div>
        <div class="skeleton-line skeleton-line-sm"></div>
        <div class="skeleton-line skeleton-line-md"></div>
      </div>
    </article>
  `;
}

function buildSkeletonDetailHTML() {
  return `
    <div class="product-gallery">
      <div class="skeleton-thumb skeleton-image"></div>
    </div>
    <div class="product-info">
      <div class="skeleton-line skeleton-line-xs" style="width:120px;"></div>
      <div class="skeleton-line skeleton-line-lg" style="width:70%; height:32px;"></div>
      <div class="skeleton-line skeleton-line-sm" style="width:40%;"></div>
      <div class="skeleton-line skeleton-line-md"></div>
      <div class="skeleton-line skeleton-line-md"></div>
      <div class="skeleton-line skeleton-line-md" style="width:60%;"></div>
    </div>
  `;
}

/* Inicializa os ícones Lucide presentes na página */
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* Atualiza o ano exibido no rodapé */
function setCurrentYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
