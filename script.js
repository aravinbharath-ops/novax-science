const menuBtn=document.querySelector('.menu-btn');const navLinks=document.querySelector('.nav-links');
menuBtn?.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));
document.getElementById('verifyForm')?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('verifyMessage').textContent='Verification request received. Connect a real batch database before publishing live results.';});
document.getElementById('contactForm')?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('contactMessage').textContent='Thank you. This demo is ready to connect to your preferred CRM or email service.';});
const io=new IntersectionObserver(entries=>entries.forEach(x=>x.isIntersecting&&x.target.classList.add('visible')),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Animated navigation shadow
const navWrap = document.querySelector('.nav-wrap');
window.addEventListener('scroll', () => {
  navWrap?.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

// Staggered section reveals
const revealElements = [...document.querySelectorAll(
  '.product-card, .steps > div, .check-list > div, .accordion details, .trust-grid span'
)];

revealElements.forEach((el, index) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
});

const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => staggerObserver.observe(el));

// Gentle pointer parallax on the hero product
const stage = document.querySelector('.product-stage');
const stageImage = stage?.querySelector('img');

stage?.addEventListener('pointermove', (event) => {
  if (!stageImage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  stageImage.style.setProperty('--parallax-x', `${x * 10}px`);
  stageImage.style.setProperty('--parallax-y', `${y * 10}px`);
  stageImage.style.filter = `drop-shadow(${x * -18}px ${28 + y * 10}px 35px rgba(18,66,67,.22))`;
});

stage?.addEventListener('pointerleave', () => {
  if (!stageImage) return;
  stageImage.style.removeProperty('--parallax-x');
  stageImage.style.removeProperty('--parallax-y');
  stageImage.style.filter = '';
});
