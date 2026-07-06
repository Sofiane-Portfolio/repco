(function () {
  const header = document.querySelector('header');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuOpenBtn = document.querySelector('header button[aria-label="Ouvrir le menu"]');
  const menuCloseBtn = document.querySelector('.mobile-menu button[aria-label="Fermer le menu"]');
  const navLinks = header.querySelectorAll('nav a');
  const scrollProgress = document.querySelector('.scroll-progress');
  const heroBg = document.querySelector('.hero-bg img');

  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden hidden';
  document.body.appendChild(overlay);

  function setScrolled(scrolled) {
    header.classList.toggle('nav-scrolled', scrolled);
    header.classList.toggle('py-3', scrolled);
    header.classList.toggle('py-5', !scrolled);
    header.classList.toggle('bg-transparent', !scrolled);

    const headerLogo = header.querySelector('.logo-svg');
    if (headerLogo) {
      headerLogo.src = scrolled
        ? headerLogo.dataset.logoDark || 'images/logo-dark.svg'
        : headerLogo.dataset.logoLight || 'images/logo-white.svg';
    }

    navLinks.forEach((link) => {
      link.classList.toggle('text-foreground', scrolled);
      link.classList.toggle('hover:text-accent', scrolled);
      link.classList.toggle('text-white/90', !scrolled);
      link.classList.toggle('hover:text-white', !scrolled);
    });
    header.querySelectorAll('.nav-dropdown-btn').forEach((btn) => {
      btn.classList.toggle('text-foreground', scrolled);
      btn.classList.toggle('text-white/90', !scrolled);
    });

    if (menuOpenBtn) {
      menuOpenBtn.classList.toggle('text-foreground', scrolled);
      menuOpenBtn.classList.toggle('text-white', !scrolled);
    }
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove('open');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    mobileMenu?.classList.add('open');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    setScrolled(y > 60);
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = docHeight > 0 ? `${(y / docHeight) * 100}%` : '0%';
    }
    if (heroBg && y < window.innerHeight) {
      heroBg.style.transform = `scale(${1 + y * 0.0002}) translateY(${y * 0.3}px)`;
    }
  }, { passive: true });

  setScrolled(window.scrollY > 60);

  menuOpenBtn?.addEventListener('click', openMobileMenu);
  menuCloseBtn?.addEventListener('click', closeMobileMenu);
  overlay.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('.mobile-menu a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .clip-reveal, .section-line, .cert-item, .process-step, .repco-product-card, .sector-card, .product-grid-card'
  ).forEach((el) => revealObserver.observe(el));

  document.querySelectorAll('.pro-photo').forEach((img) => {
    const markLoaded = () => img.classList.add('loaded');
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', () => {
        img.style.opacity = '0.3';
        img.alt = 'Image indisponible';
      }, { once: true });
    }
  });

  // Tilt 3D subtil sur les nouvelles cartes secteurs
  document.querySelectorAll('.sector-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  function animateCounter(el) {
    const text = el.textContent.trim();
    const match = text.match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.stat-counter').forEach((el) => counterObserver.observe(el));

  // ── Dropdown "Qui sommes-nous" ──
  document.querySelectorAll('.nav-dropdown-wrap').forEach((wrap) => {
    const btn = wrap.querySelector('.nav-dropdown-btn');
    const menu = wrap.querySelector('.nav-dropdown-menu');
    if (!btn || !menu) return;
    let closeTimer;
    function openDropdown() {
      clearTimeout(closeTimer);
      menu.classList.remove('hidden');
      btn.querySelector('.nav-dropdown-chevron')?.style.setProperty('transform', 'rotate(180deg)');
    }
    function closeDropdown() {
      closeTimer = setTimeout(() => {
        menu.classList.add('hidden');
        btn.querySelector('.nav-dropdown-chevron')?.style.setProperty('transform', '');
      }, 120);
    }
    wrap.addEventListener('mouseenter', openDropdown);
    wrap.addEventListener('mouseleave', closeDropdown);
    btn.addEventListener('click', () => {
      if (menu.classList.contains('hidden')) openDropdown();
      else closeDropdown();
    });
    menu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    menu.addEventListener('mouseleave', closeDropdown);
    // Fermer si clic en dehors
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) menu.classList.add('hidden');
    });
  });

  const form = document.querySelector('#contact form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = 'Message envoyé ✓';
    btn.disabled = true;
    btn.style.opacity = '0.85';
    setTimeout(() => {
      form.reset();
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.opacity = '';
    }, 3000);
  });
})();
