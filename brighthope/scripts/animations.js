(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Auto-apply animation classes to common elements
  const applyAutoClasses = () => {
    document.querySelectorAll('section').forEach(section => {
      const container = section.querySelector('.container');
      if (!container) return;

      // Title / eyebrow / lead
      container.querySelectorAll('.section-eyebrow, .section-title, .section-lead').forEach(el => {
        el.classList.add('animate-up');
      });

      // Card grids (business, reason, recruit, farmer, product, menu)
      container.querySelectorAll(
        '.business-card, .reason-card, .recruit-feature, .service-flow-step, ' +
        '.access-grid > *, .company-table, .recruit-table, .form-wrap, ' +
        '.news-item, .service-inner > *'
      ).forEach((el, i) => {
        el.classList.add('animate-up');
        el.style.transitionDelay = `${Math.min(i * 90, 400)}ms`;
      });

      // Recruit hero
      container.querySelectorAll('.recruit-hero h2, .recruit-hero p').forEach(el => {
        el.classList.add('animate-up');
      });

      // CEO section
      container.querySelectorAll('.ceo-photo, .ceo-body').forEach((el, i) => {
        el.classList.add('animate-up');
        el.style.transitionDelay = `${i * 120}ms`;
      });

      // CTA / recruit banner text
      container.querySelectorAll('.cta-section-inner > *, .recruit-banner-inner > *').forEach((el, i) => {
        el.classList.add('animate-up');
        el.style.transitionDelay = `${i * 100}ms`;
      });
    });
  };

  // Intersection Observer for scroll-triggered fade
  const setupObserver = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.animate-up').forEach(el => {
      observer.observe(el);
    });
  };

  // Subtle parallax on hero background
  const setupParallax = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let ticking = false;
    const heroHeight = hero.offsetHeight;

    const update = () => {
      const scrolled = window.scrollY;
      if (scrolled < heroHeight * 1.2) {
        hero.style.backgroundPositionY = `calc(50% + ${scrolled * 0.35}px)`;
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  };

  // Smooth number reveal (if any counters exist)
  const setupCounters = () => {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 1400;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(target * eased).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  };

  // Init
  const init = () => {
    applyAutoClasses();
    setupObserver();
    setupParallax();
    setupCounters();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
