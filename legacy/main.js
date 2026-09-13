/* ============================================================
   MAIN.JS — Solid Architectural Interactive Engine & 3D Physics
   Soft Alabaster (#F7F5F2), Taupe Greige (#9E9184), Matte Charcoal (#1A1817) & Pure White (#FFFFFF)
   ============================================================ */

/* ── TACTILE SOUND ENGINE (Ethereal Synthesis with mute control) ── */
const SoundFX = (() => {
  let ctx = null;
  let isMuted = localStorage.getItem('qs-sound-muted') === 'true';

  function getAudioContext() {
    if (isMuted) return null;
    if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playClick(freq = 640, duration = 0.035, vol = 0.035) {
    if (isMuted) return;
    try {
      const audio = getAudioContext();
      if (!audio) return;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audio.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audio.currentTime + duration);
      gain.gain.setValueAtTime(vol, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch (e) {}
  }

  function playFlip() {
    if (isMuted) return;
    try {
      const audio = getAudioContext();
      if (!audio) return;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audio.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, audio.currentTime + 0.09);
      gain.gain.setValueAtTime(0.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + 0.09);
    } catch (e) {}
  }

  function playChime() {
    if (isMuted) return;
    try {
      const audio = getAudioContext();
      if (!audio) return;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audio.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880.00, audio.currentTime + 0.12);
      gain.gain.setValueAtTime(0.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + 0.22);
    } catch (e) {}
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('qs-sound-muted', isMuted ? 'true' : 'false');
    return isMuted;
  }

  return { playClick, playFlip, playChime, toggleMute, isMuted: () => isMuted };
})();

/* ── SURREAL PARTICLES CONFIG (Matte Charcoal & Warm Taupe Stardust) ── */
function getParticlesConfig() {
  return {
    particles: {
      number: { value: 35, density: { enable: true, value_area: 850 } },
      color: { value: ['#1A1817', '#9E9184', '#B5A89B'] },
      shape: { type: 'circle' },
      opacity: { value: 0.35, random: true, anim: { enable: true, speed: 0.35, opacity_min: 0.15 } },
      size: { value: 3.0, random: true, anim: { enable: false } },
      line_linked: {
        enable: true,
        distance: 145,
        color: '#9E9184',
        opacity: 0.22,
        width: 1
      },
      move: { enable: true, speed: 0.65, direction: 'none', random: true, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: false },
        resize: true
      },
      modes: { grab: { distance: 160, line_linked: { opacity: 0.5 } } }
    },
    retina_detect: true
  };
}

function initParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;
  particlesJS('particles-js', getParticlesConfig());
}

/* ── THEME INITIALIZER (Exclusively Solid Light Architectural Mode) ── */
const ThemeManager = (() => {
  function apply() {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('qs-theme', 'light');
    
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = '✨';
      btn.setAttribute('aria-label', 'Architectural Light Mode');
    }
    const mb = document.getElementById('themeToggleMobile');
    if (mb) {
      mb.textContent = '✨';
      mb.setAttribute('aria-label', 'Architectural Light Mode');
    }
  }
  function init() {
    apply();
  }
  return { init, get: () => 'light' };
})();

/* ── SCROLL PROGRESS BAR ── */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  const update = () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
}

/* ── NAVBAR SCROLL REACTION ── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── MOBILE MENU ── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobileMenu');
  const closeBtn  = document.getElementById('mobileClose');
  if (!hamburger || !menu) return;
  let lastFocused = null;

  const open = () => {
    SoundFX.playClick(520, 0.03, 0.04);
    lastFocused = document.activeElement;
    menu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  };
  const close = () => {
    SoundFX.playClick(420, 0.03, 0.04);
    menu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  hamburger.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
  if (closeBtn) closeBtn.addEventListener('click', close);
  menu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
    if (e.key !== 'Tab' || !menu.classList.contains('open')) return;
    const focusable = menu.querySelectorAll('a, button');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

function initPageNavigation() {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    const isCurrent = link.dataset.page === currentPage;
    link.classList.toggle('active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

/* ── REVEAL ON SCROLL ── */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, [data-reveal]');
  
  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight + 100) {
      el.classList.add('visible');
    }
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });
  
  els.forEach(el => obs.observe(el));
}

/* ── STATISTICAL COUNTER ANIMATION ── */
function animateCount(el) {
  const isDecimal = el.hasAttribute('data-decimal');
  const target    = parseFloat(el.dataset.counterTarget || el.dataset.target);
  if (isNaN(target)) return;
  const duration  = 1600;
  const start     = performance.now();
  const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const v = target * ease(p);
    el.textContent = isDecimal ? v.toFixed(2) : Math.round(v).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
    else {
      el.textContent = isDecimal ? target.toFixed(2) : target.toLocaleString();
    }
  };
  requestAnimationFrame(tick);
}

function initCounters() {
  const targets = document.querySelectorAll('[data-counter-target]');
  if (!targets.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(el => {
      el.textContent = el.dataset.counterTarget;
    });
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  targets.forEach(t => obs.observe(t));
}

/* ── DYNAMIC TYPEWRITER ── */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const siteConfig = typeof SITE !== 'undefined' ? SITE : {};
  const twConfig = siteConfig.typewriter || {};
  const phrases = twConfig.phrases && twConfig.phrases.length
    ? twConfig.phrases
    : [
        'Flutter & Dart Engineer',
        'Mobile AI Systems Architect',
        'Supabase & Cloud Builder',
        'CSOFT Systems Mobile Developer'
      ];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = phrases[0] || 'Flutter Developer';
    return;
  }

  if (typeof Typed !== 'undefined') {
    new Typed('#typewriter', {
      strings: phrases,
      typeSpeed: twConfig.speed || 55,
      backSpeed: twConfig.deleteSpeed || 28,
      backDelay: twConfig.pauseAfter || 2200,
      startDelay: twConfig.pauseBefore || 300,
      loop: true,
      showCursor: false
    });
  }
}

/* ── 3D SHOWCASE SWITCHER (3 MODES & MULTI-PLANE 3D PARALLAX) ── */
function initShowcaseSwitcher() {
  const btnPortal = document.getElementById('viewBtnPortal');
  const btnPhone = document.getElementById('viewBtnPhone');
  const btnPass = document.getElementById('viewBtnPass');
  const portal = document.getElementById('portalShowcase');
  const phone = document.getElementById('phoneSimulator');
  const pass = document.getElementById('developerPass');

  function setMode(activeBtn, activeTarget) {
    SoundFX.playClick(640, 0.03, 0.04);
    [btnPortal, btnPhone, btnPass].forEach(btn => {
      if (!btn) return;
      const isActive = btn === activeBtn;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    [portal, phone, pass].forEach(panel => {
      if (!panel) return;
      if (panel === activeTarget) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });
  }

  if (btnPortal && portal) {
    btnPortal.addEventListener('click', () => setMode(btnPortal, portal));
  }
  if (btnPhone && phone) {
    btnPhone.addEventListener('click', () => setMode(btnPhone, phone));
  }
  if (btnPass && pass) {
    btnPass.addEventListener('click', () => setMode(btnPass, pass));
  }

  // Multi-Plane 3D Gyroscopic Parallax Tilt on 3D Spatial Hologram
  if (portal && !window.matchMedia('(hover: none)').matches) {
    const portrait = portal.querySelector('.spatial-portrait-img');
    const badges = portal.querySelectorAll('.spatial-telemetry-badge, .spatial-callout-pill');
    const aura = portal.querySelector('.spatial-aura-matrix');

    portal.addEventListener('mousemove', e => {
      const rect = portal.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const normX = x / (rect.width / 2);
      const normY = y / (rect.height / 2);

      const tiltX = normY * -9;
      const tiltY = normX * 9;

      portal.style.transform = `perspective(1400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

      if (portrait) {
        portrait.style.transform = `translateZ(45px) translateX(${normX * 8}px) translateY(${normY * 6}px)`;
      }

      badges.forEach((badge, idx) => {
        const factor = (idx + 1) * 3;
        badge.style.transform = `translateZ(85px) translateX(${-normX * factor}px) translateY(${-normY * factor}px)`;
      });

      if (aura) {
        aura.style.transform = `translateZ(-35px) rotate(${normX * 12}deg)`;
      }
    });

    portal.addEventListener('mouseleave', () => {
      portal.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      portal.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg)';

      if (portrait) {
        portrait.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        portrait.style.transform = 'translateZ(45px) translateX(0px) translateY(0px)';
      }

      badges.forEach(badge => {
        badge.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        badge.style.transform = '';
      });

      if (aura) {
        aura.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        aura.style.transform = 'translateZ(-35px) rotate(0deg)';
      }

      setTimeout(() => {
        portal.style.transition = '';
        if (portrait) portrait.style.transition = '';
        badges.forEach(b => b.style.transition = '');
        if (aura) aura.style.transition = '';
      }, 600);
    });
  }
}

/* ── FAVORITE PROJECTS CATEGORY FILTER (INSPIRATION 2) ── */
function initFavoriteProjectsFilter() {
  const filterBtns = document.querySelectorAll('.fav-filter-btn');
  const projectCards = document.querySelectorAll('.fav-project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      SoundFX.playClick(620, 0.02, 0.03);
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-cat') || '';
        const cats = cat.split(' ');
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'all var(--t-base)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

function initSkillsFilter() {
  const filterButtons = document.querySelectorAll('.skill-nav-pill');
  const categories = document.querySelectorAll('.skill-category');
  if (!filterButtons.length || !categories.length) return;

  filterButtons.forEach(button => {
    button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    categories.forEach(category => {
      const categoryName = category.dataset.cat || category.dataset.category || '';
      category.hidden = filter !== 'all' && categoryName !== filter;
    });
    });
  });
}

/* ── SMARTPHONE INTERACTIVE CONTROLLER ── */
function initSmartphoneController() {
  const dockBtns = document.querySelectorAll('.dock-btn');
  const views = document.querySelectorAll('.phone-view');
  const filterChips = document.querySelectorAll('.m-chip-btn');
  const skillRows = document.querySelectorAll('.mobile-skill-row');

  dockBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      SoundFX.playClick(660, 0.025, 0.035);
      dockBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-target');
      views.forEach(v => {
        if (v.id === targetId) {
          v.classList.add('active');
        } else {
          v.classList.remove('active');
        }
      });
    });
  });

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      SoundFX.playClick(600, 0.02, 0.03);
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.getAttribute('data-filter');
      skillRows.forEach(row => {
        const cat = row.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          row.style.display = 'block';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  const phoneWrapper = document.getElementById('phoneSimulator');
  if (phoneWrapper && !window.matchMedia('(hover: none)').matches) {
    phoneWrapper.addEventListener('mousemove', e => {
      const rect = phoneWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * -8;
      const tiltY = (x / (rect.width / 2)) * 8;
      phoneWrapper.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    phoneWrapper.addEventListener('mouseleave', () => {
      phoneWrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }
}

/* ── 3D ID CARD FLIP & TILT ── */
function initIdCard() {
  const wrapper = document.getElementById('developerPass');
  if (!wrapper) return;

  wrapper.addEventListener('click', () => {
    SoundFX.playFlip();
    wrapper.classList.toggle('flipped');
  });

  if (!window.matchMedia('(hover: none)').matches) {
    wrapper.addEventListener('mousemove', e => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * -8;
      const tiltY = (x / (rect.width / 2)) * 8;
      wrapper.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }
}

/* ── TACTILE BUTTON AUDIO HOOKS ── */
function initTactileButtons() {
  document.querySelectorAll('.btn, .quick-card, .project-link-btn, .hero-social-link, .nav-link, .hero-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      SoundFX.playClick(600, 0.025, 0.03);
    });
  });
}

/* ── SCROLL TO TOP ── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 350);
  }, { passive: true });
  btn.addEventListener('click', () => {
    SoundFX.playClick(680, 0.03, 0.04);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── CONTACT FORM SUBMISSION ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  let isSubmitting = false;
  let lastSubmitTime = 0;

  function showStatus(message, type = 'success') {
    let statusBox = document.getElementById('formStatus');
    if (!statusBox) {
      statusBox = document.createElement('div');
      statusBox.id = 'formStatus';
      statusBox.setAttribute('role', 'status');
      statusBox.setAttribute('aria-live', 'polite');
      statusBox.className = 'form-status';
      form.appendChild(statusBox);
    }
    statusBox.textContent = message;
    statusBox.className = `form-status active ${type === 'success' ? 'form-status-success' : 'form-status-error'}`;
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmitTime < 4000 || isSubmitting) {
      showStatus('Please wait a moment before sending another message.', 'error');
      return;
    }

    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      console.warn('Bot submission blocked');
      return;
    }

    SoundFX.playClick(750, 0.05, 0.06);

    const name    = form.querySelector('#name')?.value.trim();
    const email   = form.querySelector('#email')?.value.trim();
    const subject = form.querySelector('#subject')?.value || 'General Inquiry';
    const message = form.querySelector('#message')?.value.trim();
    const btn     = document.getElementById('submitBtn');

    if (!name || !email || !message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    isSubmitting = true;
    lastSubmitTime = now;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending Message... ⏳';
    }

    try {
      const siteConfig = typeof SITE !== 'undefined' ? SITE : {};
      const web3key = siteConfig.web3formsKey || '68781ac7-4208-4aee-8b70-bb20e4694812';

      const formData = new FormData(form);
      formData.set('access_key', web3key);
      formData.set('subject', `Portfolio Contact: ${subject} from ${name}`);
      formData.set('from_name', name);

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        SoundFX.playChime();
        showStatus('✨ Thank you! Your message has been sent successfully. I will get back to you shortly.', 'success');
        form.reset();
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.warn('API error, providing fallback options:', err);
      showStatus('Message service is currently unreachable. Opening your email app to send directly...', 'error');
      setTimeout(() => {
        const mailto = `mailto:qaswarsofttec@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
        window.location.href = mailto;
      }, 1400);
    } finally {
      isSubmitting = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Send Message →';
      }
    }
  });
}

/* ── CERTIFICATIONS FILTER & SEARCH ── */
function initCertFilter() {
  const searchInput = document.getElementById('certSearch');
  const filterBtns = document.querySelectorAll('.cert-filter-btn');
  const cards = document.querySelectorAll('.cert-card');
  const grid = document.getElementById('certGrid');
  if (!cards.length || !grid) return;

  let activeTag = 'all';
  let searchTerm = '';

  let emptyState = document.getElementById('certEmptyState');
  if (!emptyState) {
    emptyState = document.createElement('div');
    emptyState.id = 'certEmptyState';
    emptyState.style.display = 'none';
    emptyState.style.gridColumn = '1 / -1';
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = 'var(--sp-12) var(--sp-6)';
    emptyState.innerHTML = `
      <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
      <h3 style="font-family: var(--font-display); font-size: var(--fs-md); font-weight: 800; color: var(--clr-text);">No matching credentials found</h3>
      <p style="color: var(--clr-text-muted); font-size: var(--fs-sm); margin-top: 4px;">Try searching for a different keyword like "Flutter", "Python", "IBM", or "Google".</p>
    `;
    grid.appendChild(emptyState);
  }

  function filterCards() {
    let visibleCount = 0;
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matchesSearch = !searchTerm || text.includes(searchTerm);
      const matchesTag = activeTag === 'all' || text.includes(activeTag.toLowerCase());

      if (matchesSearch && matchesTag) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchTerm = e.target.value.toLowerCase().trim();
      filterCards();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = btn.getAttribute('data-filter') || 'all';
      SoundFX.playClick(640, 0.03, 0.04);
      filterCards();
    });
  });
}

/* ── ARCHITECTURAL STUDIO SPOTLIGHT LAMP ── */
function initStudioLamp() {
  const lampShade = document.getElementById('studioLampShade');
  const btnToggle = document.getElementById('btnLampToggle');
  const bulb = document.getElementById('studioLampBulb');
  const beam = document.getElementById('studioLightBeam');
  const aura = document.getElementById('standeeAura');
  const label = document.getElementById('lampModeLabel');
  const standeeImg = document.getElementById('standeeImg');
  const stage = document.getElementById('standeeStage');

  if (!lampShade || !bulb || !beam || !aura) return;

  const modes = [
    {
      name: 'Architectural Alabaster',
      bulbShadow: '0 0 20px 8px #9E9184, 0 0 35px 14px rgba(158, 145, 132, 0.4)',
      beamGradient: 'linear-gradient(180deg, rgba(158, 145, 132, 0.35) 0%, rgba(158, 145, 132, 0.15) 40%, rgba(158, 145, 132, 0.03) 80%, transparent 100%)',
      auraGradient: 'radial-gradient(circle, rgba(158, 145, 132, 0.32) 0%, rgba(247, 245, 242, 0.6) 60%, transparent 75%)',
      imgFilter: 'brightness(1.08) contrast(1.08) drop-shadow(0 16px 28px rgba(26, 24, 23, 0.25))'
    },
    {
      name: 'Warm Taupe Radiance',
      bulbShadow: '0 0 22px 9px #B5A89B, 0 0 40px 16px rgba(181, 168, 155, 0.5)',
      beamGradient: 'linear-gradient(180deg, rgba(181, 168, 155, 0.4) 0%, rgba(181, 168, 155, 0.16) 40%, rgba(181, 168, 155, 0.03) 80%, transparent 100%)',
      auraGradient: 'radial-gradient(circle, rgba(181, 168, 155, 0.35) 0%, rgba(247, 245, 242, 0.6) 60%, transparent 75%)',
      imgFilter: 'brightness(1.12) contrast(1.1) drop-shadow(0 16px 28px rgba(26, 24, 23, 0.25))'
    },
    {
      name: 'Pure Porcelain Diamond',
      bulbShadow: '0 0 24px 10px #FFFFFF, 0 0 45px 18px rgba(255, 255, 255, 0.85)',
      beamGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.22) 40%, rgba(255, 255, 255, 0.04) 80%, transparent 100%)',
      auraGradient: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(247, 245, 242, 0.7) 60%, transparent 75%)',
      imgFilter: 'brightness(1.15) contrast(1.12) drop-shadow(0 16px 28px rgba(26, 24, 23, 0.25))'
    }
  ];

  let currentModeIdx = 0;

  function cycleLight() {
    SoundFX.playChime();
    currentModeIdx = (currentModeIdx + 1) % modes.length;
    const mode = modes[currentModeIdx];

    bulb.style.boxShadow = mode.bulbShadow;
    beam.style.background = mode.beamGradient;
    aura.style.background = mode.auraGradient;
    if (label) label.textContent = mode.name;
    if (standeeImg) standeeImg.style.filter = mode.imgFilter;
  }

  lampShade.addEventListener('click', cycleLight);
  if (btnToggle) btnToggle.addEventListener('click', cycleLight);

  if (stage && !window.matchMedia('(hover: none)').matches) {
    stage.addEventListener('mousemove', e => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const angle = (x / (rect.width / 2)) * 10;
      beam.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    });
    stage.addEventListener('mouseleave', () => {
      beam.style.transform = 'translateX(-50%) rotate(0deg)';
    });
  }
}

/* ── DOM READY INITIALIZATION ── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  initParticles();
  initProgressBar();
  initNavbar();
  initPageNavigation();
  initMobileMenu();
  initReveal();
  initCounters();
  initTypewriter();
  initShowcaseSwitcher();
  initSmartphoneController();
  initIdCard();
  initStudioLamp();
  initTactileButtons();
  initScrollTop();
  initContactForm();
  initCertFilter();
  initFavoriteProjectsFilter();
  initSkillsFilter();
});
