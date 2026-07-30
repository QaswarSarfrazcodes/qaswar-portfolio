/* ============================================================
   MAIN.JS — Shared across all pages
   Theme toggle, nav, scroll, reveal, counters, typewriter,
  particles, custom cursor, vanilla-tilt
   ============================================================ */

/* ── PARTICLES CONFIG ── */
function getParticlesConfig(theme) {
  const isDark = theme === 'dark';
  return {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 900 } },
      color: { value: isDark ? '#1e3a5f' : '#94a3b8' },
      shape: { type: 'circle' },
      opacity: { value: isDark ? 0.5 : 0.35, random: true, anim: { enable: true, speed: 0.4, opacity_min: 0.1 } },
      size: { value: 3, random: true, anim: { enable: false } },
      line_linked: {
        enable: true,
        distance: 140,
        color: isDark ? '#1e3a5f' : '#cbd5e1',
        opacity: isDark ? 0.3 : 0.2,
        width: 1
      },
      move: { enable: true, speed: 0.8, direction: 'none', random: true, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: false },
        resize: true
      },
      modes: { grab: { distance: 160, line_linked: { opacity: 0.4 } } }
    },
    retina_detect: true
  };
}

function initParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;
  particlesJS('particles-js', getParticlesConfig(ThemeManager.get()));
}

function refreshParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof pJSDom !== 'undefined' && pJSDom.length > 0) {
    pJSDom[0].pJS.fn.vendors.destroypJS();
    pJSDom = [];
  }
  initParticles();
}

/* ── THEME ── */
const ThemeManager = (() => {
  const KEY = 'qs-theme';
  const BTN_ID = 'themeToggle';
  const ICONS = { light: '☀️', dark: '🌙' };

  function get() { return localStorage.getItem(KEY) || 'dark'; }
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    const btn = document.getElementById(BTN_ID);
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (btn) {
      btn.textContent = theme === 'dark' ? ICONS.dark : ICONS.light;
      btn.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    }
    // Sync mobile toggle
    const mb = document.getElementById('themeToggleMobile');
    if (mb) {
      mb.textContent = theme === 'dark' ? ICONS.dark : ICONS.light;
      mb.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    }
    // Refresh particles for new theme colors
    refreshParticles();
  }
  function toggle() { apply(get() === 'dark' ? 'light' : 'dark'); }
  function init() {
    apply(get());
    const btn = document.getElementById(BTN_ID);
    if (btn) btn.addEventListener('click', toggle);
    const mobileBtn = document.getElementById('themeToggleMobile');
    if (mobileBtn) mobileBtn.addEventListener('click', toggle);
  }
  return { init, toggle, get };
})();

/* ── SCROLL PROGRESS BAR ── */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  const update = () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
}

/* ── NAVBAR ── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active link highlighting */
  const links = document.querySelectorAll('.nav-link[href^="#"]');
  if (!links.length) return;
  const sections = [...links].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.35, rootMargin: `-${68}px 0px 0px 0px` });
  sections.forEach(s => obs.observe(s));
}

/* ── MOBILE MENU ── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const menu       = document.getElementById('mobileMenu');
  const closeBtn   = document.getElementById('mobileClose');
  if (!hamburger || !menu) return;

  const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const open = () => {
    menu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Move focus into dialog (WCAG 2.1 SC 2.1.2)
    const firstFocusable = menu.querySelector(FOCUSABLE);
    if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
  };
  const close = () => {
    menu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus(); // return focus to trigger element
  };
  // Focus trap inside mobile menu dialog
  menu.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = [...menu.querySelectorAll(FOCUSABLE)];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  hamburger.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
  closeBtn && closeBtn.addEventListener('click', close);
  menu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
}

/* ── PAGE STATE (active nav / aria current) ── */
function initPageState() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    const isActive = link.dataset.page === page;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

/* ── REVEAL ON SCROLL ── */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, [data-reveal]');
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const rawDelay = e.target.getAttribute('data-reveal-delay') || 0;
        const parsed = parseInt(rawDelay, 10) || 0;
        const delay = Math.round(parsed / 100) * 100;
        if (delay > 0) {
          setTimeout(() => e.target.classList.add('visible'), delay);
        } else {
          e.target.classList.add('visible');
        }
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── COUNTER ANIMATION ── */
function animateCount(el) {
  const isDecimal = el.hasAttribute('data-decimal');
  const target    = parseFloat(el.dataset.target);
  const duration  = 1600;
  const start     = performance.now();
  const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const v = target * ease(p);
    el.textContent = isDecimal ? v.toFixed(2) : Math.round(v).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
    else {
      const finalText = isDecimal ? target.toFixed(2) : target.toLocaleString();
      // Append contextual suffixes based on the adjacent label
      const label = el.parentElement?.querySelector('.stat-l')?.textContent?.toLowerCase() || '';
      let suffix = '';
      if (label.includes('project')) suffix = ' apps';
      else if (label.includes('week')) suffix = ' wks';
      else if (label.includes('cert')) suffix = ' certs';
      else if (label.includes('rating')) suffix = '%';
      el.textContent = finalText + suffix;
    }
  };
  requestAnimationFrame(tick);
}

function initCounters() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rows = document.querySelectorAll('.stats-row, .stats-row--compact');
  rows.forEach(row => {
    if (prefersReduced) {
      row.querySelectorAll('[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const isDecimal = el.hasAttribute('data-decimal');
        el.textContent = isDecimal ? target.toFixed(2) : target.toLocaleString();
      });
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('[data-target]').forEach(animateCount);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    obs.observe(row);
  });
}

/* ── TYPEWRITER (Typed.js CDN) ── */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'Flutter Developer';
    return;
  }

  // Use Typed.js if available
  if (typeof Typed !== 'undefined') {
    new Typed('#typewriter', {
      strings: ['Flutter Developer', 'AI App Builder', 'Mobile Engineer'],
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 2200,
      startDelay: 300,
      loop: true,
      showCursor: false, // We have our own cursor via .tw-cursor
    });
    return;
  }

  // Fallback: manual typewriter using self-contained phrases array
  const typewriterConfig = (typeof SITE !== 'undefined' && SITE.typewriter) ? SITE.typewriter : {
    phrases: ['Flutter Developer', 'AI App Builder', 'Mobile Engineer'],
    speed: 80,
    deleteSpeed: 40,
    pauseAfter: 2200,
    pauseBefore: 300
  };
  const { phrases, speed, deleteSpeed, pauseAfter, pauseBefore } = typewriterConfig;
  let pi = 0, ci = 0, deleting = false;
  const tick = () => {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, pauseAfter); return; }
      setTimeout(tick, speed);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, pauseBefore); return; }
      setTimeout(tick, deleteSpeed);
    }
  };
  tick();
}

/* AOS removed — handled by initReveal and data-reveal attributes */

/* ── VANILLA TILT on Project Cards ── */
function initVanillaTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  const projectCards = document.querySelectorAll('.project-card:not(.wip)');
  projectCards.forEach(card => {
    VanillaTilt.init(card, {
      max: 10,
      scale: 1.03,
      speed: 400,
      glare: true,
      'max-glare': 0.2,
    });
  });
}

/* ── ID CARD TAP-TO-FLIP (mobile touch) ── */
function initIdCardFlip() {
  const wrapper = document.querySelector('.id-card-wrapper');
  if (!wrapper) return;
  // Only activate on touch devices (no hover support)
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (!isTouchDevice) return;

  // Inject style for flipped state on wrapper
  const style = document.createElement('style');
  style.textContent = '.id-card-wrapper.flipped .id-card-inner { transform: rotateY(180deg); } .id-card-inner.is-flipped { transform: rotateY(180deg); }';
  document.head.appendChild(style);

  wrapper.addEventListener('click', () => {
    wrapper.classList.toggle('flipped');
  });

  // Mobile tap-to-flip on inner card for single-finger gestures
  const cardInner = document.querySelector('.id-card-inner');
  if (cardInner) {
    cardInner.addEventListener('touchstart', () => {
      cardInner.classList.toggle('is-flipped');
    }, { passive: true });
  }

  // Update hint text for touch
  const hint = wrapper.querySelector('.id-card-hint');
  if (hint) hint.textContent = 'Tap to flip';
}

/* ── SCROLL TO TOP ── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── SMOOTH ANCHOR SCROLL (for hash links) ── */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── CONTACT FORM ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const siteConfig = (typeof SITE !== 'undefined') ? SITE : {};
  const { publicKey, serviceId, templateId } = siteConfig.emailjs || {};
  const web3key = siteConfig.web3formsKey;

  if (publicKey && publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
    emailjs.init(publicKey);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    /* Clear errors */
    ['nameError','emailError','messageError'].forEach(id => {
      const el = document.getElementById(id); if (el) el.textContent = '';
    });

    const name    = form.querySelector('#name')?.value.trim();
    const email   = form.querySelector('#email')?.value.trim();
    const subjectSelect = form.querySelector('#subject')?.value || 'General Inquiry';
    const message = form.querySelector('#message')?.value.trim();
    const honeypot = form.querySelector('#website');

    if (honeypot && honeypot.value.trim() !== '') {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    let valid = true;
    if (!name) { setErr('nameError', 'Name is required'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr('emailError', 'Valid email required'); valid = false;
    }
    if (!message) { setErr('messageError', 'Message is required'); valid = false; }
    if (!valid) return;

    const btn = document.getElementById('submitBtn');
    const btnText    = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    btn.disabled = true;
    if (btnText)    btnText.hidden    = true;
    if (btnLoading) btnLoading.hidden = false;

    try {
      if (web3key && web3key !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
        const formData = new FormData(form);
        formData.set('access_key', web3key);
        formData.set('subject', `Portfolio Inquiry: ${subjectSelect} from ${name}`);
        formData.set('from_name', name);

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const resData = await response.json();
        if (!resData.success) throw new Error(resData.message || 'Form submission failed');
      } else if (publicKey && publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
        await emailjs.sendForm(serviceId, templateId, form);
      } else {
        // Fallback: Open email client with prefilled details
        const mailtoUrl = `mailto:qaswarsofttec@gmail.com?subject=${encodeURIComponent('Portfolio Inquiry: ' + subjectSelect)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)}`;
        window.location.href = mailtoUrl;
      }

      if (window.showToast) window.showToast('Message sent successfully! I will reply within 24 hours.', 'success');
      else show('formSuccess');
      form.reset();
    } catch (err) {
      console.error(err);
      if (window.showToast) window.showToast('Failed to send via API. Opening email client...', 'error');
      const fallbackMailto = `mailto:qaswarsofttec@gmail.com?subject=${encodeURIComponent('Portfolio Message')}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;
      window.location.href = fallbackMailto;
    } finally {
      btn.disabled = false;
      if (btnText)    btnText.hidden    = false;
      if (btnLoading) btnLoading.hidden = true;
    }
  });

  function setErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
  function show(id) { const el = document.getElementById(id); if (el) { el.hidden = false; setTimeout(() => el.hidden = true, 6000); } }
}

/* ── CONTACT HELPERS ── */
function initContactHelpers() {
  const copyBtn = document.getElementById('copyEmail');
  if (!copyBtn) return;
  const email = 'qaswarsofttec@gmail.com';

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('is-copied');
      copyBtn.setAttribute('aria-label', 'Email copied to clipboard');
      if (window.showToast) window.showToast('Email copied to clipboard!', 'success');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('is-copied');
        copyBtn.setAttribute('aria-label', 'Copy email address');
      }, 2000);
    } catch {
      if (window.showToast) window.showToast('Unable to copy email.', 'error');
    }
  });
}

/* ── CERT FILTER ── */
function initCertFilter() {
  const btns   = document.querySelectorAll('.filter-btn');
  const cards  = document.querySelectorAll('.cert-card[data-issuer]');
  const groups = document.querySelectorAll('.cert-ledger-group');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.issuer === filter;
        card.style.display = match ? '' : 'none';
      });
      // Hide a group entirely once every cert inside it is filtered out —
      // otherwise its header floats above an empty list.
      groups.forEach(group => {
        const hasVisible = [...group.querySelectorAll('.cert-card')]
          .some(card => card.style.display !== 'none');
        group.style.display = hasVisible ? '' : 'none';
      });
    });
  });
}


/* ── TOAST NOTIFICATIONS ── */
window.showToast = function(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};

/* ── DYNAMIC YEAR ── */
function initDynamicYear() {
  const els = document.querySelectorAll('.footer-copy');
  const year = new Date().getFullYear();
  els.forEach(el => {
    el.innerHTML = el.innerHTML.replace('2026', year);
  });
}

/* ── BARCODE GENERATOR ── */
function initBarcode() {
  const bc = document.getElementById('barcode-front');
  if (!bc) return;
  const pattern = [3,1,2,1,3,2,1,2,1,3,1,2,3,1,2,1,3,2,1,2,3,1,2,1,2,3,1,2,1,3,2,1,3,1,2];
  bc.innerHTML = '';
  pattern.forEach(h => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = '2px';
    bar.style.height = (h * 7) + 'px';
    bc.appendChild(bar);
  });
}

/* ── MOBILE CTA BAR (ensures visibility only on small screens) ── */
function initMobileCTABar() {
  const bar = document.querySelector('.mobile-cta-bar');
  if (!bar) return;
  const update = () => {
    const show = window.innerWidth <= 640;
    bar.style.display = show ? '' : 'none';
    bar.setAttribute('aria-hidden', show ? 'false' : 'true');
  };
  let tid;
  window.addEventListener('resize', () => {
    clearTimeout(tid);
    tid = setTimeout(update, 150);
  }, { passive: true });
  update();
}

/* ── INIT ALL ── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  initProgressBar();
  initNavbar();
  initMobileMenu();
  initReveal();
  initCounters();
  initTypewriter();
  initScrollTop();
  initSmoothAnchors();
  initPageState();
  initContactForm();
  initContactHelpers();
  initCertFilter();
  initDynamicYear();
  initVanillaTilt();
  // Add hover affordance hint for ID card (visual only)
  const cardWrapper = document.querySelector('.id-card-wrapper');
  if (cardWrapper) {
    const hint = document.createElement('p');
    hint.className = 'card-flip-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Hover to flip';
    hint.style.cssText = 'text-align:center;font-size:var(--fs-xs);color:var(--clr-text-muted);margin-top:.5rem;animation:fadeOut 1s 2s forwards;opacity:1';
    cardWrapper.appendChild(hint);
  }
  initIdCardFlip();
  initMobileCTABar();
  initParticles();
  initBarcode();
});
