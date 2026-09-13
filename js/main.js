/* ═══════════════════════════════════════════════════════════════════
   MAIN — interaction engine

   Design rule: this file never writes a transform, colour or size
   directly. It writes CSS custom properties and toggles classes;
   fx.css decides what those mean. That keeps the visual language in
   one place and makes every effect retunable without touching JS.

   No external libraries — the particle field, typewriter and easing
   are all local, which removes two CDN round-trips.
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─────────────────────────────────────────────
     UTILITIES
     ───────────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp  = (a, b, t) => a + (b - a) * t;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)');

  const prefersReduced = () => reduceMotion.matches;

  /* Coalesce bursty events (scroll, resize) into one frame */
  function onFrame(fn) {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn(...args);
      });
    };
  }

  /* Run a callback once an element scrolls into view */
  function whenVisible(els, cb, options = {}) {
    const { threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = options;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => cb(el));
      return null;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        cb(entry.target);
        if (once) io.unobserve(entry.target);
      });
    }, { threshold, rootMargin });

    els.forEach(el => io.observe(el));
    return io;
  }

  /* ═══════════════════════════════════════════════
     SOUND — tiny synthesised UI clicks, muted by default
     so the site never makes noise without consent.
     ═══════════════════════════════════════════════ */
  const Sound = (() => {
    let ctx = null;
    let muted = localStorage.getItem('qs-muted') !== 'false';

    function audio() {
      if (muted) return null;
      if (!ctx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    }

    function tone(freq, dur, vol, type = 'sine', slideTo = null) {
      const a = audio();
      if (!a) return;
      try {
        const osc  = a.createOscillator();
        const gain = a.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, a.currentTime);
        if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
        }
        gain.gain.setValueAtTime(vol, a.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
        osc.connect(gain).connect(a.destination);
        osc.start();
        osc.stop(a.currentTime + dur);
      } catch (_) { /* audio is a nicety, never a failure */ }
    }

    return {
      click: () => tone(660, 0.035, 0.03, 'sine', 220),
      soft:  () => tone(480, 0.03,  0.022, 'sine', 260),
      chime: () => tone(587, 0.22,  0.03, 'sine', 880),
      isMuted: () => muted,
      toggle() {
        muted = !muted;
        localStorage.setItem('qs-muted', String(muted));
        if (!muted) tone(720, 0.05, 0.03, 'sine', 480);
        return muted;
      }
    };
  })();

  /* ═══════════════════════════════════════════════
     THEME — dark by default, choice persisted
     ═══════════════════════════════════════════════ */
  const Theme = (() => {
    const KEY = 'qs-theme';
    const meta = () => $('meta[name="theme-color"]');

    function apply(mode) {
      document.documentElement.setAttribute('data-theme', mode);
      const m = meta();
      if (m) m.setAttribute('content', mode === 'light' ? '#F2F5FA' : '#05060A');
      $$('[data-theme-toggle]').forEach(btn => {
        btn.setAttribute('aria-label',
          mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
        btn.setAttribute('aria-pressed', String(mode === 'light'));
      });
    }

    function current() {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function init() {
      /* The inline script in <head> has already set the attribute to
         avoid a flash; here we only wire the control. */
      apply(current());

      $$('[data-theme-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
          const next = current() === 'light' ? 'dark' : 'light';
          localStorage.setItem(KEY, next);
          apply(next);
          Sound.soft();
        });
      });
    }

    return { init };
  })();

  /* ═══════════════════════════════════════════════
     PRELOADER
     ═══════════════════════════════════════════════ */
  function initPreloader() {
    const pre = $('#preloader');
    if (!pre) return;

    const bar = $('.pre-bar i', pre);
    const pct = $('.pre-pct', pre);
    let value = 0;
    let finished = false;

    document.body.classList.add('is-locked');

    function paint(v) {
      if (bar) bar.style.setProperty('--pct', v + '%');
      if (pct) pct.textContent = String(Math.round(v)).padStart(3, '0') + '%';
    }

    /* Creep toward 90% so there is always visible motion, then let
       the real load event take it home. */
    const creep = setInterval(() => {
      if (finished) return;
      value = Math.min(value + Math.random() * 11 + 4, 90);
      paint(value);
    }, 130);

    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(creep);
      paint(100);

      setTimeout(() => {
        pre.classList.add('is-done');
        document.body.classList.remove('is-locked');
        document.body.classList.add('is-ready');
        /* Kick off the entrance animations for whatever is already
           on screen, now that the curtain is lifting. */
        window.dispatchEvent(new CustomEvent('qs:ready'));
        setTimeout(() => pre.remove(), 1100);
      }, 260);
    }

    if (document.readyState === 'complete') setTimeout(finish, 380);
    else window.addEventListener('load', () => setTimeout(finish, 380));

    /* Never trap the user behind a stalled asset */
    setTimeout(finish, 4500);
  }

  /* ═══════════════════════════════════════════════
     CURSOR — sharp dot, lagging ring

     PERF: the position vars are written on the two cursor
     elements, never on documentElement. A custom property set
     on the root invalidates the inherited value for every node
     in the document, so the old version forced a full-tree
     style recalc on every pointermove *and* every frame — by
     far the most expensive thing on the page.

     The loop is also parked once the ring catches up, and
     pointermove only requests a frame instead of writing
     styles inline (high-refresh mice fire well above 60Hz,
     so most of those writes were thrown away unpainted).
     ═══════════════════════════════════════════════ */
  function initCursor() {
    if (!finePointer.matches || prefersReduced()) return;

    const dot  = $('.cursor-dot');
    const ring = $('.cursor-ring');
    if (!dot || !ring) return;

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let rx = tx, ry = ty;
    let active = false;
    let raf = 0;

    function wake() {
      if (!raf) raf = requestAnimationFrame(paint);
    }

    function paint() {
      raf = 0;

      rx = lerp(rx, tx, 0.18);
      ry = lerp(ry, ty, 0.18);

      dot.style.setProperty('--cx', tx + 'px');
      dot.style.setProperty('--cy', ty + 'px');
      /* One decimal is below a physical pixel — more precision only
         lengthens the string we allocate 60 times a second. */
      ring.style.setProperty('--rcx', Math.round(rx * 10) / 10 + 'px');
      ring.style.setProperty('--rcy', Math.round(ry * 10) / 10 + 'px');

      /* Keep going only while the ring is still catching up */
      if (Math.abs(tx - rx) > 0.2 || Math.abs(ty - ry) > 0.2) wake();
    }

    window.addEventListener('pointermove', e => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        rx = tx; ry = ty;
        document.body.classList.add('has-cursor');
      }
      wake();
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      document.body.classList.remove('has-cursor');
      active = false;
    });

    /* Delegated so it also covers markup added later */
    const HOT = 'a, button, [role="button"], input, textarea, select, [data-tilt], .orb-face';
    let hot = false;

    function setHot(on) {
      if (on === hot) return;          /* skip redundant class writes */
      hot = on;
      document.body.classList.toggle('cursor-hot', on);
    }

    document.addEventListener('pointerover', e => {
      if (e.target.closest(HOT)) setHot(true);
    }, { passive: true });

    document.addEventListener('pointerout', e => {
      if (e.target.closest(HOT)) setHot(false);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════
     DUST — drifting particle field on canvas.

     PERF: the previous version issued one beginPath/fill per
     dot and one beginPath/stroke per link line — with ~70 dots
     that is up to ~2,400 candidate pairs and thousands of draw
     calls every frame. Now dots are batched into three paths
     (one per alpha tier) and every link line goes into a single
     path stroked once, so a frame costs 4 draw calls instead of
     thousands. The link pass also runs against a pre-filtered
     list of particles near the pointer, turning O(n²) into
     O(n + k²) where k is usually under ten.
     ═══════════════════════════════════════════════ */
  function initDust() {
    const canvas = $('#dust');
    if (!canvas || prefersReduced()) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    /* Three fixed tiers instead of a random alpha per particle —
       lets every dot of a tier share one path and one fillStyle. */
    const TIERS = [0.2, 0.34, 0.5];

    let w = 0, h = 0, dpr = 1;
    let particles = [];
    let tiers = [];          /* particles pre-bucketed by alpha tier */
    let mouse = { x: -9999, y: -9999 };
    let running = true;
    let raf = 0;
    let rgb = '79, 209, 255';
    const near = [];

    function readAccent() {
      rgb = document.documentElement.getAttribute('data-theme') === 'light'
        ? '0, 119, 194'
        : '79, 209, 255';
    }

    /* Recompute the accent only when the theme actually changes,
       rather than reading an attribute 60 times a second. */
    new MutationObserver(readAccent).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* Scale to viewport area, then trim again on modest hardware */
      const cores = navigator.hardwareConcurrency || 4;
      const cap = cores <= 4 ? 26 : 46;
      const count = clamp(Math.round((w * h) / 34000), 16, cap);

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.6
      }));

      /* Bucket once here so the draw loop never has to test a tier */
      tiers = TIERS.map(() => []);
      particles.forEach((p, i) => tiers[i % TIERS.length].push(p));
    }

    function frame() {
      raf = 0;
      if (!running) return;

      ctx.clearRect(0, 0, w, h);
      near.length = 0;

      /* ── pass 1: integrate, and collect those near the pointer ── */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap rather than bounce — bouncing reads as a boundary */
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;

        const dmx = p.x - mouse.x;
        const dmy = p.y - mouse.y;
        if (dmx * dmx + dmy * dmy <= 44100) near.push(p);
      }

      /* ── pass 2: all dots of a tier in one path, one fill ── */
      for (let t = 0; t < tiers.length; t++) {
        const bucket = tiers[t];
        if (!bucket.length) continue;
        ctx.beginPath();
        for (let i = 0; i < bucket.length; i++) {
          const p = bucket[i];
          /* moveTo before arc, or consecutive arcs join into one shape */
          ctx.moveTo(p.x + p.r, p.y);
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        ctx.fillStyle = 'rgba(' + rgb + ', ' + TIERS[t] + ')';
        ctx.fill();
      }

      /* ── pass 3: every link line in a single path ── */
      if (near.length > 1) {
        ctx.beginPath();
        for (let i = 0; i < near.length; i++) {
          const p = near[i];
          for (let j = i + 1; j < near.length; j++) {
            const q = near[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            if (dx * dx + dy * dy > 19600) continue;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        }
        ctx.strokeStyle = 'rgba(' + rgb + ', 0.14)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('pointermove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('resize', onFrame(resize), { passive: true });

    /* Stop burning frames on a hidden tab */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      } else if (!running) {
        running = true;
        if (!raf) raf = requestAnimationFrame(frame);
      }
    });

    readAccent();
    resize();
    raf = requestAnimationFrame(frame);
  }

  /* ═══════════════════════════════════════════════
     SPLIT TEXT
     Wraps every character so it can flip in on a
     stagger. Element structure inside the heading
     (e.g. a nested .accent span) is preserved.
     ═══════════════════════════════════════════════ */

  /* Gradient headings and split text fight each other:
     background-clip:text paints an element's OWN text, but after
     splitting the text lives in child spans, so the parent paints
     nothing and the inherited transparent fill makes the children
     invisible. Fix: give every character its own copy of the
     gradient, sized to the whole group and offset by that
     character's position, so the ramp still reads as continuous.

     Measured with transforms suppressed — getBoundingClientRect
     reports the *transformed* box, and characters start rotated
     and displaced, which would corrupt every offset. */
  function paintGradientText(root) {
    const groups = root.hasAttribute('data-gradient')
      ? $$('.ln', root)
      : $$('.accent', root);
    if (!groups.length) return;

    root.classList.add('is-measuring');

    const work = groups.map(group => {
      const chars = $$('.ch', group);
      if (!chars.length) return null;
      const box = group.getBoundingClientRect();
      return {
        group,
        width: box.width,
        chars: chars.map(ch => ({ ch, dx: ch.getBoundingClientRect().left - box.left }))
      };
    }).filter(Boolean);

    root.classList.remove('is-measuring');

    work.forEach(({ group, width, chars }) => {
      group.classList.add('grad-group');
      chars.forEach(({ ch, dx }) => {
        ch.style.setProperty('--gw', width.toFixed(1) + 'px');
        ch.style.setProperty('--gx', (-dx).toFixed(1) + 'px');
      });
    });
  }

  function initSplitText() {
    const targets = $$('[data-split]');
    if (!targets.length) return;

    targets.forEach(el => {
      if (el.dataset.splitDone) return;

      /* <br> marks an intentional line break; each becomes its own
         block so lines animate as separate units. */
      const lines = el.innerHTML.split(/<br\s*\/?>/i);
      let index = 0;

      el.innerHTML = '';
      el.classList.add('split');

      lines.forEach(html => {
        const line = document.createElement('span');
        line.className = 'ln';

        const source = document.createElement('span');
        source.innerHTML = html;

        /* Depth-first walk: text becomes .ch spans, elements are
           rebuilt so classes like .accent survive. */
        (function walk(from, to) {
          Array.from(from.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent;
              for (const char of text) {
                if (char === ' ') {
                  /* A real space, not a span — lets lines wrap */
                  to.appendChild(document.createTextNode(' '));
                  continue;
                }
                const ch = document.createElement('span');
                ch.className = 'ch';
                ch.style.setProperty('--i', index++);
                ch.textContent = char;
                to.appendChild(ch);
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const copy = node.cloneNode(false);
              to.appendChild(copy);
              walk(node, copy);
            }
          });
        })(source, line);

        el.appendChild(line);
      });

      el.dataset.splitDone = 'true';
    });

    /* Wait for webfonts: character widths change once the real face
       swaps in, which would invalidate every measured offset. */
    const paintAll = () => targets.forEach(paintGradientText);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(paintAll);
    } else {
      paintAll();
    }

    window.addEventListener('resize', onFrame(paintAll), { passive: true });

    if (prefersReduced()) {
      targets.forEach(el => el.classList.add('is-in'));
      return;
    }

    whenVisible(targets, el => el.classList.add('is-in'), { threshold: 0.2 });
  }

  /* ═══════════════════════════════════════════════
     REVEAL — scroll-triggered entrances
     ═══════════════════════════════════════════════ */
  function initReveal() {
    /* Give staggered children their index up front */
    $$('[data-stagger]').forEach(group => {
      Array.from(group.children).forEach((child, i) => {
        child.style.setProperty('--i', i);
      });
    });

    const items = $$('[data-reveal], [data-stagger]');

    if (prefersReduced()) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }

    items.forEach(el => {
      if (el.dataset.revealDelay) {
        el.style.setProperty('--reveal-delay', el.dataset.revealDelay + 'ms');
      }
    });

    whenVisible(items, el => el.classList.add('is-in'), { threshold: 0.08 });
  }

  /* ═══════════════════════════════════════════════
     TILT — 3D rotation toward the pointer
     ═══════════════════════════════════════════════ */
  function initTilt() {
    if (!finePointer.matches || prefersReduced()) return;

    $$('[data-tilt]').forEach(el => {
      const max = parseFloat(el.dataset.tilt) || 8;

      el.addEventListener('pointerenter', () => el.classList.add('is-tilting'));

      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;

        /* Pointer position drives both the tilt and the sheen */
        el.style.setProperty('--mx', px.toFixed(4));
        el.style.setProperty('--my', py.toFixed(4));
        el.style.setProperty('--rx', ((0.5 - py) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((px - 0.5) * max * 2).toFixed(2) + 'deg');
      }, { passive: true });

      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--mx', '0.5');
        el.style.setProperty('--my', '0.5');
      });
    });

    /* Surfaces that only want a pointer-tracked highlight */
    $$('[data-spot]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width).toFixed(4));
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height).toFixed(4));
      }, { passive: true });
    });
  }

  /* ═══════════════════════════════════════════════
     MAGNETIC — element drifts toward the cursor
     ═══════════════════════════════════════════════ */
  function initMagnetic() {
    if (!finePointer.matches || prefersReduced()) return;

    $$('[data-magnetic]').forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || 0.28;

      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.classList.add('is-pulled');
        el.style.setProperty('--mgx', ((e.clientX - (r.left + r.width / 2)) * strength).toFixed(2) + 'px');
        el.style.setProperty('--mgy', ((e.clientY - (r.top + r.height / 2)) * strength).toFixed(2) + 'px');
      }, { passive: true });

      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-pulled');
        el.style.setProperty('--mgx', '0px');
        el.style.setProperty('--mgy', '0px');
      });
    });
  }

  /* ═══════════════════════════════════════════════
     SCROLL — progress bar, nav state, parallax, to-top

     PERF: --progress used to be written on documentElement,
     which invalidated inherited custom properties across the
     whole tree on every scroll frame. Only #progress consumes
     it, so it is written there instead. (--scroll was written
     too and read by nothing, so it is gone.)
     ═══════════════════════════════════════════════ */
  function initScroll() {
    const nav      = $('#nav');
    const toTop    = $('#to-top');
    const bar      = $('#progress');
    const parallax = $$('[data-parallax]');

    let lastScrolled = null, lastShown = null;

    const update = onFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp(y / max, 0, 1) : 0;

      if (bar) bar.style.setProperty('--progress', progress.toFixed(4));

      /* Only touch classList when the state actually flips */
      const scrolled = y > 24;
      if (nav && scrolled !== lastScrolled) {
        nav.classList.toggle('is-scrolled', scrolled);
        lastScrolled = scrolled;
      }

      const shown = y > 480;
      if (toTop && shown !== lastShown) {
        toTop.classList.toggle('is-shown', shown);
        lastShown = shown;
      }

      if (parallax.length && !prefersReduced()) {
        /* Read every rect first, then write — interleaving them
           forces a layout flush per element. */
        const vh = window.innerHeight / 2;
        const offsets = parallax.map(el => {
          const r = el.getBoundingClientRect();
          const rate = parseFloat(el.dataset.parallax) || 0.12;
          return (r.top + r.height / 2 - vh) * -rate;
        });
        parallax.forEach((el, i) => {
          el.style.setProperty('--py', offsets[i].toFixed(2) + 'px');
        });
      }
    });

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener('click', () => {
        Sound.click();
        window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
      });
    }
  }

  /* ═══════════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════════ */
  function initNav() {
    const page = document.body.dataset.page;

    $$('.nav-link, .m-link').forEach(link => {
      const isCurrent = link.dataset.page === page;
      link.classList.toggle('is-active', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const burger = $('#burger');
    const menu   = $('#m-menu');
    if (!burger || !menu) return;

    let lastFocus = null;

    const setOpen = open => {
      menu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
      Sound.soft();

      if (open) {
        lastFocus = document.activeElement;
        const first = $('.m-link', menu);
        if (first) first.focus({ preventScroll: true });
      } else if (lastFocus) {
        lastFocus.focus({ preventScroll: true });
      }
    };

    burger.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    $$('.m-link', menu).forEach(l => l.addEventListener('click', () => setOpen(false)));

    document.addEventListener('keydown', e => {
      if (!menu.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      /* Keep tab focus inside the open sheet */
      if (e.key !== 'Tab') return;
      const focusable = $$('a[href], button:not([disabled])', menu);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ═══════════════════════════════════════════════
     COUNTERS
     ═══════════════════════════════════════════════ */
  function initCounters() {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;

    const format = (value, decimals) =>
      decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

    if (prefersReduced()) {
      nodes.forEach(el => {
        const target = parseFloat(el.dataset.count);
        el.textContent = format(target, parseInt(el.dataset.decimals || '0', 10));
      });
      return;
    }

    whenVisible(nodes, el => {
      const target   = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const duration = parseInt(el.dataset.duration || '1700', 10);
      if (Number.isNaN(target)) return;

      const start = performance.now();
      /* easeOutExpo — fast out of the gate, long settle */
      const ease = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      (function tick(now) {
        const t = clamp((now - start) / duration, 0, 1);
        el.textContent = format(target * ease(t), decimals);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = format(target, decimals);
      })(start);
    }, { threshold: 0.4 });
  }

  /* ═══════════════════════════════════════════════
     TYPEWRITER — cycles role phrases
     ═══════════════════════════════════════════════ */
  function initTypewriter() {
    const el = $('#typewriter');
    if (!el) return;

    const config = (window.SITE && window.SITE.typewriter) || {};
    const phrases = config.phrases && config.phrases.length
      ? config.phrases
      : ['Flutter & Dart Engineer'];

    if (prefersReduced() || phrases.length === 1) {
      el.textContent = phrases[0];
      return;
    }

    const typeMs   = config.speed       || 62;
    const eraseMs  = config.deleteSpeed || 26;
    const holdMs   = config.pauseAfter  || 2100;
    const betweenMs = config.pauseBefore || 380;

    let phrase = 0;
    let chars  = 0;
    let erasing = false;

    (function step() {
      const text = phrases[phrase];

      if (!erasing) {
        chars++;
        el.textContent = text.slice(0, chars);
        if (chars === text.length) {
          erasing = true;
          setTimeout(step, holdMs);
          return;
        }
        setTimeout(step, typeMs + Math.random() * 34);
        return;
      }

      chars--;
      el.textContent = text.slice(0, chars);
      if (chars === 0) {
        erasing = false;
        phrase = (phrase + 1) % phrases.length;
        setTimeout(step, betweenMs);
        return;
      }
      setTimeout(step, eraseMs);
    })();
  }

  /* ═══════════════════════════════════════════════
     FILTER RAILS
     One implementation serves every filter on the
     site. A rail declares its target grid, buttons
     carry a value, and grid items list the values
     they belong to.
     ═══════════════════════════════════════════════ */
  function initFilters() {
    $$('[data-filter-rail]').forEach(rail => {
      const grid = $(rail.dataset.filterRail);
      if (!grid) return;

      const buttons = $$('.filter-btn', rail);
      const items   = Array.from(grid.children).filter(el => el.dataset.cat !== undefined);

      /* Slide the indicator pill behind the active button */
      function moveIndicator(btn) {
        rail.style.setProperty('--ind-x', (btn.offsetLeft - rail.clientLeft) + 'px');
        rail.style.setProperty('--ind-w', btn.offsetWidth + 'px');
        rail.style.setProperty('--ind-o', '1');
      }

      function activate(btn) {
        buttons.forEach(b => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        moveIndicator(btn);

        const value = btn.dataset.value || 'all';
        items.forEach(item => {
          const cats = (item.dataset.cat || '').split(/\s+/);
          const show = value === 'all' || cats.includes(value);
          item.classList.toggle('is-filtered', !show);
          /* Re-run the entrance so surviving items animate back in */
          if (show && !prefersReduced() && item.hasAttribute('data-reveal')) {
            item.classList.remove('is-in');
            requestAnimationFrame(() => item.classList.add('is-in'));
          }
        });
      }

      buttons.forEach(btn => {
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', () => {
          Sound.soft();
          activate(btn);
        });
      });

      const initial = buttons.find(b => b.classList.contains('is-active')) || buttons[0];
      if (initial) {
        /* Wait for layout so offsetLeft/Width are real */
        requestAnimationFrame(() => moveIndicator(initial));
        window.addEventListener('resize', onFrame(() => {
          const active = buttons.find(b => b.classList.contains('is-active'));
          if (active) moveIndicator(active);
        }), { passive: true });
      }
    });
  }

  /* ═══════════════════════════════════════════════
     SEARCH — live text filter (certifications)
     ═══════════════════════════════════════════════ */
  function initSearch() {
    const input = $('[data-search]');
    if (!input) return;

    const grid = $(input.dataset.search);
    if (!grid) return;

    const cards = Array.from(grid.children).filter(el => el.dataset.cat !== undefined);
    const empty = $('#search-empty');
    const count = $('[data-search-count]');

    function run() {
      const term = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(card => {
        /* Search the visible text plus any keywords on the element */
        const haystack = (card.textContent + ' ' + (card.dataset.keywords || '')).toLowerCase();
        const match = !term || haystack.includes(term);
        card.classList.toggle('is-search-hidden', !match);
        card.style.display = match && !card.classList.contains('is-filtered') ? '' : 'none';
        if (match) visible++;
      });

      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = String(visible);
    }

    input.addEventListener('input', run);

    /* A domain filter changes what is on screen, so the visible count
       and the empty state have to be recalculated after it runs. */
    document.addEventListener('click', e => {
      if (e.target.closest('.filter-btn')) requestAnimationFrame(run);
    });

    run();
  }

  /* ═══════════════════════════════════════════════
     3D STACK — tap to explode on touch devices,
     where there is no hover to trigger it
     ═══════════════════════════════════════════════ */
  function initStack() {
    $$('.stack-3d').forEach(stack => {
      stack.addEventListener('click', () => {
        if (finePointer.matches) return;
        stack.classList.toggle('is-open');
      });
    });
  }

  /* ═══════════════════════════════════════════════
     STUDIO LIGHT — cycles the portrait's lighting
     ═══════════════════════════════════════════════ */
  function initStudioLight() {
    const stage = $('#studio');
    const btn   = $('#studio-btn');
    if (!stage || !btn) return;

    const label = $('#studio-label', btn);

    const presets = [
      { name: 'Cyan Key',    beam: '79, 209, 255' },
      { name: 'Violet Wash', beam: '167, 139, 250' },
      { name: 'Mint Rim',    beam: '52, 229, 196' },
      { name: 'Neutral Studio', beam: '235, 240, 250' }
    ];

    let index = 0;

    function apply() {
      const preset = presets[index];
      stage.style.setProperty('--beam', preset.beam);
      if (label) label.textContent = preset.name;
    }

    btn.addEventListener('click', () => {
      index = (index + 1) % presets.length;
      apply();
      Sound.chime();
    });

    apply();

    /* The beam swings to follow the pointer across the stage */
    if (finePointer.matches && !prefersReduced()) {
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        stage.style.setProperty('--beam-angle', (nx * 13).toFixed(2) + 'deg');
      }, { passive: true });

      stage.addEventListener('pointerleave', () => {
        stage.style.setProperty('--beam-angle', '0deg');
      });
    }
  }

  /* ═══════════════════════════════════════════════
     CONTACT FORM — Web3Forms with a mailto fallback
     ═══════════════════════════════════════════════ */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const status = $('#form-status');
    const button = $('#submit-btn');
    const original = button ? button.innerHTML : '';

    let sending = false;
    let lastSent = 0;

    function report(message, kind) {
      if (!status) return;
      status.textContent = message;
      status.className = 'form-status is-shown form-status--' + kind;
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const now = Date.now();
      if (sending || now - lastSent < 4000) {
        report('Just a moment before sending again.', 'err');
        return;
      }

      /* Honeypot — bots tick hidden checkboxes */
      const honey = form.querySelector('input[name="botcheck"]');
      if (honey && honey.checked) return;

      const name    = form.name_field?.value.trim() || '';
      const email   = form.email?.value.trim() || '';
      const subject = form.subject?.value || 'General Inquiry';
      const message = form.message?.value.trim() || '';

      if (!name || !email || !message) {
        report('Please fill in your name, email and message.', 'err');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        report('That email address does not look right.', 'err');
        return;
      }

      sending = true;
      lastSent = now;
      Sound.click();

      if (button) {
        button.disabled = true;
        button.innerHTML = 'Sending<span class="caret"></span>';
      }

      try {
        const key = (window.SITE && window.SITE.web3formsKey) || '';
        const data = new FormData(form);
        data.set('access_key', key);
        data.set('name', name);
        data.set('subject', `Portfolio — ${subject} — ${name}`);
        data.set('from_name', name);

        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: data
        });
        const json = await res.json();

        if (!json.success) throw new Error(json.message || 'Submission rejected');

        Sound.chime();
        report('Message sent. I usually reply within a few hours.', 'ok');
        form.reset();
      } catch (err) {
        /* Gateway down should not lose the user's message */
        console.warn('Web3Forms unavailable, falling back to mailto:', err);
        report('The form service is unreachable — opening your email app instead.', 'err');
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        setTimeout(() => {
          window.location.href =
            `mailto:qaswarsofttec@gmail.com?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;
        }, 1500);
      } finally {
        sending = false;
        if (button) {
          button.disabled = false;
          button.innerHTML = original;
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════
     SOUND TOGGLE
     ═══════════════════════════════════════════════ */
  function initSoundToggle() {
    $$('[data-sound-toggle]').forEach(btn => {
      const sync = () => {
        const muted = Sound.isMuted();
        btn.classList.toggle('is-muted', muted);
        btn.setAttribute('aria-pressed', String(!muted));
        btn.setAttribute('aria-label', muted ? 'Enable interface sound' : 'Mute interface sound');
      };

      btn.addEventListener('click', () => {
        Sound.toggle();
        sync();
      });

      sync();
    });

    /* Light click on genuinely interactive controls only */
    document.addEventListener('click', e => {
      if (e.target.closest('.btn, .nav-link, .chip, .pill, .m-link')) Sound.click();
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════
     PAGE TRANSITION — wipe out before navigating
     ═══════════════════════════════════════════════ */
  function initCurtain() {
    const curtain = $('.curtain');
    if (!curtain || prefersReduced()) return;

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href
        || link.target === '_blank'
        || link.hasAttribute('download')
        || href.startsWith('#')
        || href.startsWith('mailto:')
        || href.startsWith('tel:')
        || link.origin !== window.location.origin
        || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      e.preventDefault();
      curtain.classList.add('is-up');
      setTimeout(() => { window.location.href = href; }, 420);
    });

    /* Coming back via the history cache must not leave it covering */
    window.addEventListener('pageshow', () => curtain.classList.remove('is-up'));
  }

  /* ═══════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════ */
  function boot() {
    document.documentElement.classList.remove('no-js');

    Theme.init();
    initPreloader();
    initNav();
    initScroll();
    initReveal();
    initSplitText();
    initCursor();
    initDust();
    initTilt();
    initMagnetic();
    initCounters();
    initTypewriter();
    initFilters();
    initSearch();
    initStack();
    initStudioLight();
    initContactForm();
    initSoundToggle();
    initCurtain();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
