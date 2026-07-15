
// Image fallback: use the main Novax packaging image if an editable image path is missing.
document.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && !image.dataset.fallbackApplied) {
    image.dataset.fallbackApplied = 'true';
    image.src = 'assets/novax-retatrutide.jpeg';
  }
}, true);

const content = window.NOVAX_CONTENT || {};

function applyContent() {
  const hero = content.hero || {};
  const heading = content.productsHeading || {};
  const products = content.products || [];

  document.querySelectorAll('.site-logo').forEach(img => {
    if (content.brand?.logo) img.src = content.brand.logo;
  });

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  };

  setText('heroEyebrow', hero.eyebrow);
  setText('heroTitle1', hero.titleLine1);
  setText('heroTitle2', hero.titleLine2);
  setText('heroDescription', hero.description);
  setText('productsEyebrow', heading.eyebrow);
  setText('productsTitle', heading.title);
  setText('productsDescription', heading.description);
  setText('contactEyebrow', content.contact?.eyebrow);
  setText('contactTitle', content.contact?.title);
  setText('contactDescription', content.contact?.description);

  const heroImage = document.getElementById('heroImage');
  if (heroImage && hero.image) heroImage.src = hero.image;

  const grid = document.getElementById('productGrid');
  if (grid) {
    grid.innerHTML = products.map(product => {
      const visual = product.image
        ? `<div class="product-image">
             <img src="${product.image}" alt="${product.name} ${product.amount}">
             ${product.featured ? '<span class="image-badge">FEATURED</span>' : ''}
           </div>`
        : `<div class="product-placeholder"><span>${product.code || ''}</span></div>`;

      return `<article class="product-card reveal">
        ${visual}
        <div class="product-copy">
          <small>RESEARCH FORMAT</small>
          <h3>${product.name}</h3>
          <p>${product.amount}</p>
          <div class="product-actions">
            <button type="button" class="details-button" data-product-index="${products.indexOf(product)}">View details</button>
            <a href="#verify" data-product="${product.name} ${product.amount}">Verify batch <span>→</span></a>
          </div>
        </div>
      </article>`;
    }).join('');
  }
}

applyContent();

const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  header.classList.toggle('scrolled', y > 20);
}, { passive: true });

menuButton.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  observer.observe(el);
});

document.querySelectorAll('[data-product]').forEach(link => {
  link.addEventListener('click', () => {
    const input = document.getElementById('batchCode');
    input.placeholder = `Enter code for ${link.dataset.product}`;
    setTimeout(() => input.focus(), 500);
  });
});

const verifyForm = document.getElementById('verifyForm');
const verifyResult = document.getElementById('verifyResult');

verifyForm.addEventListener('submit', event => {
  event.preventDefault();
  const code = document.getElementById('batchCode').value.trim();
  verifyForm.classList.add('loading');
  verifyResult.className = 'verify-result loading';
  verifyResult.textContent = 'Searching the batch database…';

  window.setTimeout(() => {
    verifyForm.classList.remove('loading');
    verifyResult.className = code ? 'verify-result success' : 'verify-result';
    verifyResult.innerHTML = code
      ? '<strong>Demo lookup completed.</strong><br>This interface is ready to connect to your live batch database.'
      : 'Enter a valid batch or serial number.';
  }, 1100);
});

// Product details modal
const modal = document.getElementById('productModal');
const modalVisual = document.getElementById('modalVisual');
const modalTitle = document.getElementById('modalTitle');
const modalAmount = document.getElementById('modalAmount');
const modalSummary = document.getElementById('modalSummary');

function openProductModal(product) {
  modalTitle.textContent = product.name;
  modalAmount.textContent = product.amount;
  modalSummary.textContent = product.summary || 'Research-use-only product format with batch-level identification.';
  modalVisual.innerHTML = product.image
    ? `<img src="${product.image}" alt="${product.name} ${product.amount}">`
    : `<div class="modal-placeholder">${product.code || ''}</div>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeProductModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.addEventListener('click', event => {
  const detailButton = event.target.closest('[data-product-index]');
  if (detailButton) {
    const product = (window.NOVAX_CONTENT.products || [])[Number(detailButton.dataset.productIndex)];
    if (product) openProductModal(product);
  }
  if (event.target.closest('[data-close-modal]')) closeProductModal();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeProductModal();
});

// Contact form demo
document.getElementById('contactForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const status = document.getElementById('contactStatus');
  status.textContent = 'Thank you. Your demo enquiry has been recorded.';
  event.currentTarget.reset();
});
