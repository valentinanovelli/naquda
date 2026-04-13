/* ═══════════════════════════════════════════
   NAQUDA — Shared JavaScript
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Nav scroll effect (RAF-throttled for Safari performance) ── */
  const nav = document.getElementById('nav');
  if (nav) {
    let scrollTick = false;
    const onScroll = () => {
      if (!scrollTick) {
        scrollTick = true;
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 50);
          scrollTick = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'Naquda.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && href !== '#' && currentPage.includes(href.replace('.html', ''))) {
      link.classList.add('active');
    }
    if (currentPage === 'Naquda.html' && (href === 'Naquda.html' || href === '#')) {
      link.classList.add('active');
    }
  });

  /* ── Hamburger / mobile menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ── Hero entrance animation ── */
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => hero.classList.add('loaded'));
    /* Parallax: solo su desktop — su mobile causa lag e il chrome del browser
       cambia la viewport height rendendo il calcolo instabile */
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) {
      let paraTick = false;
      const heroBg = hero.querySelector('.hero-bg');
      window.addEventListener('scroll', () => {
        if (!paraTick && window.scrollY < window.innerHeight) {
          paraTick = true;
          requestAnimationFrame(() => {
            if (heroBg) {
              heroBg.style.transition = 'none';
              heroBg.style.transform = `scale(1) translateY(${window.scrollY * 0.28}px)`;
            }
            paraTick = false;
          });
        }
      }, { passive: true });
    }
  }

  /* ── Smooth scroll for hash links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Contact form ── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.style.display = 'none';
      const success = document.getElementById('formSuccess');
      if (success) success.style.display = 'block';
    });
  }
})();
