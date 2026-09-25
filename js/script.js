document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Footer: live weather, date/time, weekday ---------------- */
  const flWeatherText = document.getElementById('fl-weather-text');
  const flWeatherIcon = document.getElementById('fl-weather-icon');
  const flDatetime = document.getElementById('fl-datetime');
  const flDayname = document.getElementById('fl-dayname');

  if (flDatetime && flDayname) {
    const updateClock = () => {
      const now = new Date();
      flDatetime.textContent = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' · ' + now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
      flDayname.textContent = now.toLocaleDateString('de-DE', { weekday: 'long' });
    };
    updateClock();
    setInterval(updateClock, 30000);
  }

  /* ---------------- Footer: upcoming Bavarian public holidays ---------------- */
  const holidaysEl = document.getElementById('footer-holidays');
  if (holidaysEl) {
    // Gauss's Easter algorithm (Meeus/Jones/Butcher) — works for any year,
    // so the list of moveable holidays (Karfreitag, Ostermontag, etc.)
    // recalculates itself correctly every year, forever.
    const easterSunday = (year) => {
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31);
      const day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(year, month - 1, day);
    };
    const addDays = (date, days) => {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    };

    // Bavaria-wide public holidays
    const holidaysForYear = (year) => {
      const easter = easterSunday(year);
      return [
        { date: new Date(year, 0, 1), name: 'Neujahr' },
        { date: new Date(year, 0, 6), name: 'Heilige Drei Könige' },
        { date: addDays(easter, -2), name: 'Karfreitag' },
        { date: addDays(easter, 1), name: 'Ostermontag' },
        { date: new Date(year, 4, 1), name: 'Tag der Arbeit' },
        { date: addDays(easter, 39), name: 'Christi Himmelfahrt' },
        { date: addDays(easter, 50), name: 'Pfingstmontag' },
        { date: addDays(easter, 60), name: 'Fronleichnam' },
        { date: new Date(year, 9, 3), name: 'Tag der Deutschen Einheit' },
        { date: new Date(year, 10, 1), name: 'Allerheiligen' },
        { date: new Date(year, 11, 25), name: '1. Weihnachtstag' },
        { date: new Date(year, 11, 26), name: '2. Weihnachtstag' },
      ];
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const upcoming = [...holidaysForYear(currentYear), ...holidaysForYear(currentYear + 1)]
      .filter((h) => h.date >= today)
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);

    const pad = (n) => String(n).padStart(2, '0');
    const weekdayShort = (d) => d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');

    holidaysEl.innerHTML = upcoming.map((h) => {
      const dateStr = `${pad(h.date.getDate())}.${pad(h.date.getMonth() + 1)}.${h.date.getFullYear()}`;
      return `<li><span class="fh-date">${dateStr} (${weekdayShort(h.date)})</span>: <span class="fh-name">${h.name}</span></li>`;
    }).join('');
  }

  if (flWeatherText && flWeatherIcon) {
    const svgHead = 'xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const weatherIcons = {
      sun: `<svg ${svgHead}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
      cloudSun: `<svg ${svgHead}><circle cx="7" cy="7" r="2.5"/><path d="M7 1.5v1.5M2.5 7H1M11 7h-.5M3.5 3.5l1 1M10.5 3.5l-1 1"/><path d="M9.5 20H18a4 4 0 0 0 .3-8 6 6 0 0 0-11.2-2.3A4.5 4.5 0 0 0 6 18.5"/></svg>`,
      cloud: `<svg ${svgHead}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
      fog: `<svg ${svgHead}><path d="M3 9h13M3 13h18M6 17h14"/></svg>`,
      rain: `<svg ${svgHead}><path d="M16.5 14H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M8 18v3M12 18v3M16 18v3"/></svg>`,
      snow: `<svg ${svgHead}><path d="M16.5 14H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M8 19h.01M12 19h.01M16 19h.01"/></svg>`,
      storm: `<svg ${svgHead}><path d="M16.5 12.5H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M13 13l-2.5 5H13l-1.5 4"/></svg>`,
    };
    const weatherByCode = (code) => {
      if (code === 0) return { icon: weatherIcons.sun, label: 'Klarer Himmel' };
      if ([1, 2].includes(code)) return { icon: weatherIcons.cloudSun, label: 'Leicht bewölkt' };
      if (code === 3) return { icon: weatherIcons.cloud, label: 'Bewölkt' };
      if ([45, 48].includes(code)) return { icon: weatherIcons.fog, label: 'Nebel' };
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: weatherIcons.rain, label: 'Regen' };
      if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: weatherIcons.snow, label: 'Schnee' };
      if ([95, 96, 99].includes(code)) return { icon: weatherIcons.storm, label: 'Gewitter' };
      return { icon: weatherIcons.cloud, label: 'Bewölkt' };
    };

    // Mühldorf am Inn
    const lat = 48.2464, lon = 12.5250;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then((r) => r.json())
      .then((data) => {
        const cw = data.current_weather;
        const w = weatherByCode(cw.weathercode);
        flWeatherIcon.innerHTML = w.icon;
        flWeatherText.textContent = `${Math.round(cw.temperature)}°C · ${w.label}`;
      })
      .catch(() => {
        flWeatherText.textContent = 'Wetter aktuell nicht verfügbar';
      });
  }

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

  /* ---------------- Personen stepper (custom up/down) ---------------- */
  const guestsInput = document.getElementById('guests');
  const guestsUp = document.getElementById('guests-up');
  const guestsDown = document.getElementById('guests-down');
  if (guestsInput && guestsUp && guestsDown) {
    const step = (delta) => {
      const min = Number(guestsInput.min) || 1;
      const max = Number(guestsInput.max) || 99;
      const current = Number(guestsInput.value) || min;
      guestsInput.value = Math.min(max, Math.max(min, current + delta));
    };
    guestsUp.addEventListener('click', () => step(1));
    guestsDown.addEventListener('click', () => step(-1));
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
