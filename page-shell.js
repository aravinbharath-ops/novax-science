document.addEventListener('DOMContentLoaded', () => {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .footer-nav a').forEach(link => {
    if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
  });

  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');

  const closeMenu = () => {
    if (!menuButton || !navLinks) return;
    navLinks.classList.remove('open');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    requestAnimationFrame(() => {
      document.body.classList.toggle('menu-open', navLinks?.classList.contains('open'));
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) closeMenu();
  }, { passive: true });
});
