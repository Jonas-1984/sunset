document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Sticky / shrinking header ---------------- */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile nav toggle ---------------- */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- Active nav link on scroll ---------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(sec => sectionObserver.observe(sec));

  /* ---------------- Scroll reveal animations ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------- Menu tabs ---------------- */
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  /* ---------------- Contact form (client-side only) ---------------- */
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');

  /* ---------------- Date picker (TT.MM.JJJJ) ---------------- */
  const dateInput = document.getElementById('date');
  const dpPopup = document.getElementById('dp-popup');
  if (dateInput && dpPopup) {
    const dpTitle = document.getElementById('dp-title');
    const dpDays = document.getElementById('dp-days');
    const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selected = null;

    const pad = (n) => String(n).padStart(2, '0');
    const format = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

    const render = () => {
      dpTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;
      dpDays.innerHTML = '';
      const first = new Date(viewYear, viewMonth, 1);
      const offset = (first.getDay() + 6) % 7; // Monday-first week
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      for (let i = 0; i < offset; i++) {
        const empty = document.createElement('span');
        empty.className = 'dp-day empty';
        dpDays.appendChild(empty);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(viewYear, viewMonth, day);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dp-day';
        btn.textContent = day;
        // Past days and Mondays (Ruhetag) can't be booked
        if (d < today || d.getDay() === 1) btn.disabled = true;
        if (d.getTime() === today.getTime()) btn.classList.add('today');
        if (selected && d.getTime() === selected.getTime()) btn.classList.add('selected');
        btn.addEventListener('click', () => {
          selected = d;
          dateInput.value = format(d);
          dpPopup.hidden = true;
        });
        dpDays.appendChild(btn);
      }
      // Don't allow navigating to months before the current one
      document.getElementById('dp-prev').disabled =
        viewYear === today.getFullYear() && viewMonth === today.getMonth();
    };

    // Nested backdrop-filters don't blur (the form card already has one),
    // so the popup lives on <body> and is positioned next to the input.
    document.body.appendChild(dpPopup);
    const place = () => {
      const r = dateInput.getBoundingClientRect();
      dpPopup.style.top = `${r.bottom + 8}px`;
      dpPopup.style.left = `${Math.min(r.left, window.innerWidth - dpPopup.offsetWidth - 12)}px`;
    };

    const open = () => {
      if (selected) { viewYear = selected.getFullYear(); viewMonth = selected.getMonth(); }
      render();
      dpPopup.hidden = false;
      place();
    };
    window.addEventListener('scroll', () => { if (!dpPopup.hidden) place(); }, { passive: true });
    window.addEventListener('resize', () => { if (!dpPopup.hidden) place(); });

    dateInput.addEventListener('click', open);
    dateInput.addEventListener('focus', open);
    dateInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dpPopup.hidden = true;
      if (e.key !== 'Tab') e.preventDefault();
    });

    document.getElementById('dp-prev').addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    });
    document.getElementById('dp-next').addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.datepicker, .dp-popup')) dpPopup.hidden = true;
    });

    if (form) form.addEventListener('reset', () => { selected = null; });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      successMsg.hidden = false;
      form.reset();
      setTimeout(() => { successMsg.hidden = true; }, 6000);
    });
  }

  /* ================================================================
     COOKIE CONSENT
  ================================================================ */
  const CONSENT_KEY = 'sunset_cookie_consent';
  const banner = document.getElementById('cookie-banner');
  const cookieModal = document.getElementById('cookie-modal');
  const statsToggle = document.getElementById('cookie-stats');
  const marketingToggle = document.getElementById('cookie-marketing');

  const getConsent = () => {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); }
    catch { return null; }
  };
  const setConsent = (consent) => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch {}
  };

  const showBanner = () => {
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('show'));
  };
  const hideBanner = () => {
    banner.classList.remove('show');
    setTimeout(() => { banner.hidden = true; }, 600);
  };

  const existingConsent = getConsent();
  if (!existingConsent) {
    setTimeout(showBanner, 600);
  } else {
    statsToggle.checked = !!existingConsent.stats;
    marketingToggle.checked = !!existingConsent.marketing;
  }

  document.getElementById('cookie-accept-btn').addEventListener('click', () => {
    setConsent({ necessary: true, stats: true, marketing: true, date: Date.now() });
    hideBanner();
  });

  document.getElementById('cookie-reject-btn').addEventListener('click', () => {
    setConsent({ necessary: true, stats: false, marketing: false, date: Date.now() });
    hideBanner();
  });

  /* ---------------- Modal helpers ---------------- */
  const openModal = (modal) => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = (modal) => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(overlay));
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.show').forEach(closeModal);
    }
  });

  /* ---------------- Cookie settings modal ---------------- */
  document.getElementById('cookie-settings-btn').addEventListener('click', () => {
    openModal(cookieModal);
  });
  document.getElementById('link-cookie-settings').addEventListener('click', (e) => {
    e.preventDefault();
    const c = getConsent();
    if (c) { statsToggle.checked = !!c.stats; marketingToggle.checked = !!c.marketing; }
    openModal(cookieModal);
  });

  document.getElementById('cookie-save-btn').addEventListener('click', () => {
    setConsent({
      necessary: true,
      stats: statsToggle.checked,
      marketing: marketingToggle.checked,
      date: Date.now()
    });
    closeModal(cookieModal);
    hideBanner();
  });

  document.getElementById('cookie-reject-all-modal').addEventListener('click', () => {
    statsToggle.checked = false;
    marketingToggle.checked = false;
    setConsent({ necessary: true, stats: false, marketing: false, date: Date.now() });
    closeModal(cookieModal);
    hideBanner();
  });

  /* ---------------- Datenschutz / Impressum modals ---------------- */
  const datenschutzModal = document.getElementById('datenschutz-modal');
  const impressumModal = document.getElementById('impressum-modal');

  ['link-datenschutz', 'cookie-link-datenschutz'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); openModal(datenschutzModal); });
  });
  document.getElementById('link-impressum').addEventListener('click', (e) => {
    e.preventDefault();
    openModal(impressumModal);
  });

});
