/* ========================================
   PIRKON KUKKA – main.js
   ======================================== */

(function () {
  'use strict';

  /* --------------------------------------------------
   * 1. HAMBURGER / MOBILE MENU
   * -------------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu();
      });
    });

    document.addEventListener('click', function (e) {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
        hamburger.focus();
      }
    });
  }

  /* --------------------------------------------------
   * 2. NAV INDICATOR – liukuva alleviivauspalkki
   * -------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');
  const navList = document.querySelector('.nav-list');

  function moveIndicator(el) {
    if (!indicator || !navList) return;
    const navRect = navList.getBoundingClientRect();
    const linkRect = el.getBoundingClientRect();
    indicator.style.left = (linkRect.left - navRect.left) + 'px';
    indicator.style.width = linkRect.width + 'px';
    indicator.style.opacity = '1';
  }

  function hideIndicator() {
    if (!indicator) return;
    indicator.style.opacity = '0';
  }

  if (navList && indicator) {
    navLinks.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        moveIndicator(link);
      });
      link.addEventListener('focus', function () {
        moveIndicator(link);
      });
      link.addEventListener('mouseleave', function () {
        hideIndicator();
      });
      link.addEventListener('blur', function () {
        hideIndicator();
      });
    });
  }

  /* --------------------------------------------------
   * 3. AKTIIVINEN NAV-LINKKI SCROLLIN MUKAAN
   * -------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY;
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 70;

    sections.forEach(function (sec) {
      const top = sec.offsetTop - headerH - 40;
      if (scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* --------------------------------------------------
   * 4. SCROLL REVEAL – IntersectionObserver, stagger 0.1s
   * -------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const siblings = el.closest('.palvelut-grid, .arvostelut-grid, .galleria-grid, .faq-list, .stats-grid, .yhteystiedot-inner, .aukiolo-inner');
        let delay = 0;

        if (siblings) {
          const children = Array.from(siblings.querySelectorAll('.reveal'));
          const index = children.indexOf(el);
          delay = index * 0.1;
        }

        el.style.transitionDelay = delay + 's';
        el.classList.add('visible');
        revealObserver.unobserve(el);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: näytä kaikki heti
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* --------------------------------------------------
   * 5. STAT CARDS – spring pop, stagger 0.15s
   * -------------------------------------------------- */
  const statCards = document.querySelectorAll('.stat-card');
  const statsSection = document.querySelector('.stats-section');

  if ('IntersectionObserver' in window && statCards.length && statsSection) {
    let statsFired = false;

    const statObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !statsFired) {
        statsFired = true;
        statCards.forEach(function (card, i) {
          setTimeout(function () {
            card.classList.add('visible');
          }, i * 150);
        });
        statObserver.disconnect();
      }
    }, { threshold: 0.25 });

    statObserver.observe(statsSection);
  } else {
    statCards.forEach(function (card) {
      card.classList.add('visible');
    });
  }

  /* --------------------------------------------------
   * 6. HERO ROTATING TEXT – 3s sykli, opacity fade
   * -------------------------------------------------- */
  const rotatingItems = document.querySelectorAll('.rotating-item');
  let currentIndex = 0;
  let rotatingInterval = null;

  function startRotating() {
    if (rotatingItems.length < 2) return;

    rotatingInterval = setInterval(function () {
      rotatingItems[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % rotatingItems.length;
      rotatingItems[currentIndex].classList.add('active');
    }, 3000);
  }

  if (rotatingItems.length) {
    // Varmista että ensimmäinen on aktiivinen
    rotatingItems[0].classList.add('active');
    startRotating();
  }

  // Pysäytä animaatio kun välilehti ei ole aktiivinen
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearInterval(rotatingInterval);
    } else {
      startRotating();
    }
  });

  /* --------------------------------------------------
   * 7. FAQ ACCORDION – smooth, ARIA, + → ×
   * -------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Sulje muut
      faqItems.forEach(function (other) {
        if (other === item) return;
        const otherBtn = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.hidden = true;
      });

      // Vaihda tämä
      const nextState = !isExpanded;
      btn.setAttribute('aria-expanded', String(nextState));
      answer.hidden = !nextState;
    });
  });

  /* --------------------------------------------------
   * 8. LOMAKE – stagger kenttien esiin tulo + submit + shake
   * -------------------------------------------------- */
  const formEl = document.querySelector('.yhteydenotto-lomake');
  const formGroups = document.querySelectorAll('.form-group');
  const statusEl = document.querySelector('.lomake-status');

  // Kentät häipyvät esiin IntersectionObserverilla
  if ('IntersectionObserver' in window && formGroups.length) {
    let formFired = false;

    const formObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !formFired) {
        formFired = true;
        formGroups.forEach(function (group, i) {
          setTimeout(function () {
            group.classList.add('visible');
          }, i * 100);
        });
        formObserver.disconnect();
      }
    }, { threshold: 0.1 });

    formObserver.observe(formEl || formGroups[0]);
  } else {
    formGroups.forEach(function (g) { g.classList.add('visible'); });
  }

  // Poista error-luokka kun käyttäjä alkaa kirjoittaa
  formGroups.forEach(function (group) {
    const field = group.querySelector('input, textarea');
    if (field) {
      field.addEventListener('input', function () {
        field.classList.remove('error');
        if (statusEl && statusEl.classList.contains('error-msg')) {
          statusEl.style.display = 'none';
        }
      });
    }
  });

  // Validointi ja lähetys
  if (formEl && statusEl) {
    formEl.addEventListener('submit', async function (e) {
      e.preventDefault();

      const requiredFields = formEl.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(function (field) {
        field.classList.remove('error');
        if (!field.value.trim()) {
          // Pakota reflow shake-animaatiota varten
          void field.offsetWidth;
          field.classList.add('error');
          valid = false;
        }
      });

      if (!valid) {
        showStatus('error-msg', 'Täytä kaikki pakolliset kentät.');
        const firstError = formEl.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = formEl.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Lähetetään…';

      try {
        const response = await fetch(formEl.action, {
          method: 'POST',
          body: new FormData(formEl),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          showStatus('success', 'Kiitos viestistäsi! Olemme yhteydessä pian.');
          formEl.reset();
          resetFormAnimation();
        } else {
          const data = await response.json().catch(function () { return {}; });
          const msg = (data.errors && data.errors.map(function (e) { return e.message; }).join(', ')) ||
            'Lähetys epäonnistui. Soita meille: 040 1546445.';
          showStatus('error-msg', msg);
        }
      } catch (err) {
        showStatus('error-msg', 'Verkkovirhe. Soita meille: 040 1546445.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function showStatus(type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'lomake-status ' + type;
    statusEl.style.display = 'block';
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function resetFormAnimation() {
    formGroups.forEach(function (g) { g.classList.remove('visible'); });
    setTimeout(function () {
      formGroups.forEach(function (g, i) {
        setTimeout(function () { g.classList.add('visible'); }, i * 80);
      });
    }, 200);
  }

  /* --------------------------------------------------
   * 9. SMOOTH SCROLL – kompensoi fixed headerin korkeus
   * -------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      const headerEl = document.querySelector('.site-header');
      const offset = (headerEl ? headerEl.offsetHeight : 70) + 16;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Sulje mobiilimenu jos auki
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  });

  /* --------------------------------------------------
   * 10. HEADER – varjo scrollatessa
   * -------------------------------------------------- */
  const siteHeader = document.querySelector('.site-header');

  if (siteHeader) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        siteHeader.style.boxShadow = '0 4px 24px rgba(0,0,0,0.28)';
      } else {
        siteHeader.style.boxShadow = '0 2px 12px rgba(0,0,0,0.22)';
      }
    }, { passive: true });
  }

})();