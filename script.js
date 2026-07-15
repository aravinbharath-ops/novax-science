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

    if (!code) {
      verifyResult.className = 'verify-result';
      verifyResult.textContent = 'Enter a valid batch or serial number.';
      return;
    }

    verifyResult.className = 'verify-result success';
    verifyResult.innerHTML = '<strong>Demo lookup completed.</strong><br>This interface is ready to connect to your live batch database. No verified result is displayed until a genuine matching record is available.';
  }, 1100);
});
