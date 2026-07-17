
// Image fallback: use the main Novax packaging image if an editable image path is missing.
document.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && !image.dataset.fallbackApplied) {
    image.dataset.fallbackApplied = 'true';
    image.src = image.id === 'heroImage' ? 'assets/novax-logo-v25.png' : 'assets/novax-retatrutide.jpeg';
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
          <div class="product-meta"><p>${product.amount}</p><strong class="product-price">${product.price || ""}</strong></div>
          <div class="product-actions">
            <button type="button" class="details-button" data-product-index="${products.indexOf(product)}">Product Information</button>
            <a href="#verify" data-product="${product.name} ${product.amount}">Authenticate Product <span>→</span></a>
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
  el.style.transitionDelay = `${Math.min(index % 4, 3) * 85}ms`;
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

verifyForm.addEventListener('submit', async event => {
  event.preventDefault();
  const code = document.getElementById('batchCode').value.trim().toUpperCase();

  verifyForm.classList.add('loading');
  verifyResult.className = 'verify-result loading';
  verifyResult.textContent = 'Searching the secure certificate registry…';

  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serial: code })
    });

    const data = await response.json();

    if (!response.ok || !data.verified) {
      verifyResult.className = 'verify-result';
      verifyResult.innerHTML = `<strong>Authentication Unsuccessful</strong><br>${data.message || 'The authentication code entered could not be matched with an active Novax Science production record. Please verify the code and try again.'}`;
      return;
    }

    window.currentCertificateRecord = data.certificate;
    verifyResult.className = 'verify-result success';
    verifyResult.innerHTML = `<strong>✓ Authentic Novax Science Product</strong><br>${data.certificate.product} · ${data.certificate.strength} · ${data.certificate.analysisDate}<br><button type="button" class="inline-certificate-button" data-open-current-certificate>View Certificate of Analysis</button>`;
  } catch (error) {
    verifyResult.className = 'verify-result';
    verifyResult.innerHTML = '<strong>Verification unavailable.</strong><br>Please try again in a moment.';
  } finally {
    verifyForm.classList.remove('loading');
  }
});

// Product details modal
const modal = document.getElementById('productModal');
const modalVisual = document.getElementById('modalVisual');
const modalTitle = document.getElementById('modalTitle');
const modalAmount = document.getElementById('modalAmount');
const modalSummary = document.getElementById('modalSummary');

function openProductModal(product) {
  modalTitle.textContent = product.name;
  modalAmount.textContent = `${product.amount}${product.price ? " · " + product.price : ""}`;
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
document.getElementById('contactForm')?.addEventListener('submit', async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const status = document.getElementById('contactStatus');
  const formData = new FormData(form);

  const payload = {
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    enquiryType: String(formData.get('subject') || '').trim(),
    message: String(formData.get('message') || '').trim()
  };

  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  status.className = 'contact-status sending';
  status.textContent = 'Submitting your enquiry securely…';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || 'Unable to submit enquiry.');
    }

    status.className = 'contact-status success';
    status.textContent = data.emailSent
      ? 'Thank you. Your enquiry has been sent successfully.'
      : 'Thank you. Your enquiry has been recorded successfully.';
    form.reset();
  } catch (error) {
    status.className = 'contact-status error';
    status.textContent = error.message || 'We could not submit your enquiry. Please try again.';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send Enquiry <span>→</span>';
  }
});


// Certificate viewer
const certificateModal = document.getElementById('certificateModal');
const certificateGrid = document.getElementById('certificateGrid');
const certificateImage = document.getElementById('certificateImage');
const viewCertificateLink = document.getElementById('viewCertificateLink');

function openCertificate(record) {
  certificateGrid.innerHTML = `
    <div><span>Serial number</span><strong>${record.serial}</strong></div>
    <div><span>Product</span><strong>${record.product}</strong></div>
    <div><span>Strength</span><strong>${record.strength}</strong></div>
    <div><span>Task number</span><strong>#${record.taskNumber}</strong></div>
    <div><span>Batch</span><strong>${record.batch}</strong></div>
    <div><span>Analysis date</span><strong>${record.analysisDate}</strong></div>
    <div><span>Measured result</span><strong>${record.result}</strong></div>
    <div><span>Purity</span><strong>${record.purity}</strong></div>
  `;
  certificateImage.src = record.certificate;
  viewCertificateLink.href = record.certificate;
  certificateModal.classList.add('open');
  certificateModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeCertificate() {
  certificateModal.classList.remove('open');
  certificateModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.addEventListener('click', event => {
  if (event.target.closest('[data-open-current-certificate]') && window.currentCertificateRecord) {
    openCertificate(window.currentCertificateRecord);
  }
  if (event.target.closest('[data-close-certificate]')) closeCertificate();
});


// V23 loading screen and refined reveal timing
window.addEventListener('load', () => {
  const loader = document.getElementById('siteLoader');
  if (loader) window.setTimeout(() => loader.classList.add('is-hidden'), 250);
});

const premiumRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      premiumRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  premiumRevealObserver.observe(el);
});

// V25 mobile navigation and accessibility polish
if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    document.body.classList.toggle('menu-open', navLinks.classList.contains('open'));
  });

  document.addEventListener('click', (event) => {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      navLinks.classList.remove('open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) {
      navLinks.classList.remove('open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });
}
