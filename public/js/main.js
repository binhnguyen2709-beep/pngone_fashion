document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('nav-links--open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  const galleryMainImg = document.getElementById('galleryMainImg');
  if (galleryThumbs.length && galleryMainImg) {
    galleryThumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        galleryMainImg.src = thumb.dataset.src;
        galleryThumbs.forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  document.querySelectorAll('.qty-stepper').forEach((stepper) => {
    const input = stepper.querySelector('.qty-input');
    const decrement = stepper.querySelector('[data-qty-decrement]');
    const increment = stepper.querySelector('[data-qty-increment]');
    if (!input) return;
    decrement?.addEventListener('click', () => {
      const min = parseInt(input.min, 10) || 1;
      input.value = Math.max(min, (parseInt(input.value, 10) || 1) - 1);
    });
    increment?.addEventListener('click', () => {
      input.value = (parseInt(input.value, 10) || 1) + 1;
    });
  });
});
