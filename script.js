'use strict';

/* Mark document as JS-ready */
document.documentElement.classList.add('js-loaded');

var root      = document.documentElement;
var reduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var HAS_GSAP  = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
var HDR_OFF   = 56 + 14 + 8;

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

/* ===== SMOOTH SCROLL: Lenis is the single engine, driven by GSAP's ticker ===== */
var lenis = null;
var tickerFn = null;

if (HAS_GSAP) {
  gsap.registerPlugin(ScrollTrigger);
}
if (!reduced && HAS_GSAP && typeof window.Lenis !== 'undefined') {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tickerFn = function (t) { lenis.raf(t * 1000); };
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);
}

function stopScroll()  { root.classList.add('is-locked');    if (lenis) lenis.stop(); }
function startScroll() { root.classList.remove('is-locked'); if (lenis) lenis.start(); }

function scrollToTarget(hash) {
  var target = hash === '#about' ? null : document.querySelector(hash);
  if (hash !== '#about' && !target) return;
  if (lenis) {
    lenis.scrollTo(target || 0, { offset: target ? -HDR_OFF : 0, duration: 1.4 });
  } else {
    var top = target ? target.getBoundingClientRect().top + window.pageYOffset - HDR_OFF : 0;
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  }
}

/* ===== HEADER: hamburger overlay ===== */
var hamburger  = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobileMenu');
var menuOpen   = false;
var heroUnveiled = false;

function setMenu(open) {
  if (open === menuOpen) return;
  menuOpen = open;
  if (open) {
    mobileMenu.hidden = false;
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add('open');
    stopScroll();
    var first = mobileMenu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  } else {
    mobileMenu.classList.remove('open');
    setTimeout(function () { if (!menuOpen) mobileMenu.hidden = true; }, reduced ? 200 : 750);
    if (heroUnveiled) startScroll();
    hamburger.focus({ preventScroll: true });
  }
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
hamburger.addEventListener('click', function () { setMenu(!menuOpen); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
window.addEventListener('resize', function () { if (menuOpen && window.innerWidth > 820) setMenu(false); });

/* in-page anchors (header, menu, hero links) */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[data-scroll]');
  if (!a) return;
  var hash = a.getAttribute('href');
  if (!hash || hash.charAt(0) !== '#') return;
  e.preventDefault();
  var wasMenu = menuOpen;
  if (wasMenu) setMenu(false);
  if (hash === '#about' && !wasMenu) { scrollToTarget(hash); return; }
  setTimeout(function () { scrollToTarget(hash); }, wasMenu ? 60 : 0);
});

/* ===== LOAD SECTIONS THEN INIT ===== */
var sectionMap = [
  { id: 'sec-hero',              file: 'sections/hero.html' },
  { id: 'sec-experience',        file: 'sections/experience.html' },
  { id: 'sec-projects',          file: 'sections/projects.html' },
  { id: 'sec-skills',            file: 'sections/skills.html' },
  { id: 'sec-learning-projects', file: 'sections/learning-projects.html' },
  { id: 'sec-education',         file: 'sections/education.html' },
  { id: 'sec-publications',      file: 'sections/publications.html' },
  { id: 'sec-contact',           file: 'sections/contact.html' }
];

Promise.all(sectionMap.map(function (s) {
  return fetch(s.file)
    .then(function (r) { return r.text(); })
    .then(function (html) { document.getElementById(s.id).innerHTML = html; })
    .catch(function () { /* leave slot empty if a section fails to load */ });
})).then(initSections);

function initSections() {

  /* ===== ACTIVE NAV via IntersectionObserver ===== */
  var navAnchors = document.querySelectorAll('.nav-links a[data-sec]');
  var navObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(function (a) {
        a.classList.toggle('active', a.dataset.sec === entry.target.id);
      });
    });
  }, { rootMargin: '-30% 0px -65% 0px' });
  ['bio', 'experience', 'projects', 'skills', 'learning-projects', 'education', 'publications', 'contact'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) navObs.observe(el);
  });

  /* ===== HERO NAME LETTER ANIMATION (#heroName / #heroWord1 / #heroWord2) ===== */
  (function () {
    var words  = ['Harshavardhan', 'Robba'];
    var offset = 0;
    words.forEach(function (word, wi) {
      var el = document.getElementById('heroWord' + (wi + 1));
      if (!el) return;
      word.split('').forEach(function (ch) {
        var span = document.createElement('span');
        span.classList.add('nl');
        span.setAttribute('aria-hidden', 'true');
        span.textContent = ch;
        span.style.animationDelay = (300 + offset * 42) + 'ms';
        el.appendChild(span);
        offset++;
      });
    });
  }());

  initHero();

  /* ===== OPEN TO WORK DISMISS ===== */
  var otwX = document.getElementById('otwX');
  if (otwX) {
    otwX.addEventListener('click', function () {
      document.getElementById('otwBadge').style.display = 'none';
    });
  }

  /* ===== COPY LINK (SHARE) ===== */
  var copyBtn = document.getElementById('copyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy link'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = location.href;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* ignore */ }
        document.body.removeChild(ta);
      }
    });
  }

  /* ===== FADE-IN OBSERVER ===== */
  var fiObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('on');
      fiObs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fi').forEach(function (el) { fiObs.observe(el); });

  /* ===== CAROUSEL FILL ===== */
  (function () {
    var r1 = ['LangChain','LangGraph','RAG','OpenAI Realtime','Gemini 2.0','DeepEval','Node.js','TypeScript','Next.js','Python','Java','Go','tRPC','REST'];
    var r2 = ['Inngest','PostgreSQL','MongoDB','Prisma','PySpark','Databricks','Docker','WebRTC','WebSockets','CI/CD'];
    function fill(id, items) {
      var track = document.getElementById(id);
      if (!track) return;
      /* two copies give the -50% loop; reduced motion shows one static list */
      (reduced ? items : items.concat(items)).forEach(function (name) {
        var s = document.createElement('span');
        s.classList.add('spill');
        s.textContent = name;
        track.appendChild(s);
      });
    }
    fill('cr1', r1);
    fill('cr2', r2);
  }());

  /* ===== METRIC COUNTERS ===== */
  (function () {
    function animCount(el, target, suffix) {
      if (reduced) { el.textContent = (target >= 1000 ? target.toLocaleString() : String(target)) + suffix; return; }
      var start = performance.now();
      var dur   = 1400;
      function step(now) {
        var t    = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        var val  = Math.round(ease * target);
        el.textContent = (target >= 1000 ? val.toLocaleString() : String(val)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cntObs.unobserve(entry.target);
        var el = entry.target;
        if (el.dataset.static) return;
        var count  = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || '';
        if (!isNaN(count)) animCount(el, count, suffix);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.mv').forEach(function (el) { cntObs.observe(el); });
  }());

  /* ===== CONTACT FORM ===== */
  (function () {
    function sanitize(str) { return str.replace(/<[^>]*>/g, '').trim(); }
    function setErr(id, show) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('show', show);
    }
    var fSend = document.getElementById('fSend');
    if (!fSend) return;
    fSend.addEventListener('click', function () {
      var name    = sanitize(document.getElementById('fName').value);
      var email   = sanitize(document.getElementById('fEmail').value);
      var subject = sanitize(document.getElementById('fSubject').value);
      var message = sanitize(document.getElementById('fMsg').value);
      var ok      = true;
      if (!name    || name.length    > 100)                       { setErr('eN', true); ok = false; } else { setErr('eN', false); }
      if (!email   || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('eE', true); ok = false; } else { setErr('eE', false); }
      if (!subject || subject.length > 200)                       { setErr('eS', true); ok = false; } else { setErr('eS', false); }
      if (!message || message.length > 2000)                      { setErr('eM', true); ok = false; } else { setErr('eM', false); }
      if (!ok) return;
      var body = 'Name: ' + name + '\r\nEmail: ' + email + '\r\n\r\n' + message;
      window.location.href =
        'mailto:robbaharsha834@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body='    + encodeURIComponent(body);
    });
  }());

  /* ===== RADAR CHART ANIMATION ===== */
  (function () {
    var polygon = document.getElementById('radar-polygon');
    if (!polygon) return;

    var finalPts = [
      { x: 200, y: 56  },  /* AI / ML & LLMs: 9/10 */
      { x: 325, y: 128 },  /* Backend & APIs: 9/10 */
      { x: 311, y: 264 },  /* Data & Databases: 8/10 */
      { x: 200, y: 328 },  /* Infra & Obs: 8/10 */
      { x: 103, y: 256 },  /* Streaming & Voice: 7/10 */
      { x: 103, y: 144 }   /* Frontend & Web: 7/10 */
    ];

    function draw(ease) {
      polygon.setAttribute('points', finalPts.map(function (fp) {
        return (200 + (fp.x - 200) * ease) + ',' + (200 + (fp.y - 200) * ease);
      }).join(' '));
    }
    if (reduced) { draw(1); return; }

    var startTime = null;
    var DURATION  = 1200;
    var fired     = false;

    function animatePolygon(ts) {
      if (!startTime) startTime = ts;
      var t = Math.min((ts - startTime) / DURATION, 1);
      draw(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(animatePolygon);
    }

    var skillsSection = document.getElementById('skills');
    if (!skillsSection) { requestAnimationFrame(animatePolygon); return; }

    var radarObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || fired) return;
        fired = true;
        radarObs.unobserve(entry.target);
        requestAnimationFrame(animatePolygon);
      });
    }, { threshold: 0.2 });
    radarObs.observe(skillsSection);
  }());

  /* ===== RADAR TOOLTIPS ===== */
  (function () {
    var tooltip = document.getElementById('radar-tooltip');
    if (!tooltip) return;

    document.querySelectorAll('[data-radar-label]').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) {
        tooltip.textContent = el.getAttribute('data-radar-skills');
        tooltip.style.display = 'block';
        tooltip.style.left    = (e.clientX + 12) + 'px';
        tooltip.style.top     = (e.clientY + 12) + 'px';
      });
      el.addEventListener('mousemove', function (e) {
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top  = (e.clientY + 12) + 'px';
      });
      el.addEventListener('mouseleave', function () {
        tooltip.style.display = 'none';
      });
    });
  }());

  /* ===== CARD CLICK REDIRECTS (mouse + keyboard) ===== */
  (function () {
    var url = 'https://github.com/HarshaVardhanRobba?tab=repositories';
    document.querySelectorAll('.pcard, .mcard').forEach(function (card) {
      card.style.cursor = 'pointer';
      if (card.classList.contains('pcard')) card.tabIndex = 0;
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        window.open(url, '_blank', 'noopener');
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target === card) window.open(url, '_blank', 'noopener');
      });
    });
  }());

  /* ===== SCROLL CHOREOGRAPHY (GSAP + ScrollTrigger) ===== */
  initScrollMotion();

  /* CTA title slam when it enters view (echoes the hero) */
  (function () {
    var cta = document.getElementById('cta');
    if (!cta) return;
    if (reduced) { cta.classList.add('slam'); return; }
    var o = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      cta.classList.add('slam');
      o.disconnect();
    }, { threshold: 0.3 });
    o.observe(cta);
  }());

  /* Heights change after sections + fonts + images settle */
  if (HAS_GSAP) {
    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
}

/* ==========================================================================
   Word-split helper: parent keeps aria-label, split words are aria-hidden
   ========================================================================== */
function splitWords(el, wrapClass, inner) {
  if (el.dataset.split) return el.querySelectorAll('[data-w]');
  var text = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  el.dataset.split = '1';
  el.textContent = '';
  var out = [];
  text.split(' ').forEach(function (word, i, arr) {
    var w = document.createElement('span');
    w.className = wrapClass;
    w.setAttribute('aria-hidden', 'true');
    w.setAttribute('data-w', '');
    if (inner) {
      var s = document.createElement('span');
      s.textContent = word;
      w.appendChild(s);
    } else {
      w.textContent = word;
    }
    el.appendChild(w);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    out.push(w);
  });
  return out;
}

function initScrollMotion() {
  /* Experience: ghost year follows the active row */
  var ghost = document.getElementById('ghostYear');
  var rows  = document.querySelectorAll('#experience .tcard');
  if (ghost && rows.length) {
    var current = ghost.textContent;
    var yObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var yr = entry.target.getAttribute('data-year');
        if (!yr || yr === current) return;
        current = yr;
        if (reduced) { ghost.textContent = yr; return; }
        ghost.classList.add('swap');
        setTimeout(function () { ghost.textContent = yr; ghost.classList.remove('swap'); }, 400);
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    rows.forEach(function (r) { yObs.observe(r); });
  }

  var fill = document.getElementById('tlFill');
  if (fill && (reduced || !HAS_GSAP)) fill.style.transform = 'scaleY(1)';

  if (reduced || !HAS_GSAP) return;

  /* Section headings: word-by-word reveal */
  document.querySelectorAll('.sec-title').forEach(function (h) {
    var words = splitWords(h, 'w', true);
    var inner = [];
    Array.prototype.forEach.call(words, function (w) { inner.push(w.firstChild); });
    gsap.set(inner, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: h, start: 'top 88%', once: true,
      onEnter: function () {
        gsap.to(inner, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 });
      }
    });
  });

  /* Timeline progress line */
  if (fill) {
    gsap.to(fill, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: true }
    });
  }

  /* Ghost year parallax (0.3x) */
  if (ghost) {
    gsap.fromTo(ghost, { y: -20 }, {
      y: 40, ease: 'none',
      scrollTrigger: { trigger: '#experience', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* Philosophy: word-by-word opacity scrub 25% -> 100% */
  document.querySelectorAll('.philosophy-card h3').forEach(function (h) {
    var words = splitWords(h, 'pw', false);
    gsap.to(words, {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: h, start: 'top 85%', end: 'bottom 45%', scrub: true }
    });
  });

  /* Skill pills stagger in */
  document.querySelectorAll('.sk-card').forEach(function (card) {
    var pills = card.querySelectorAll('.sk-pill');
    gsap.set(pills, { opacity: 0, y: 8 });
    ScrollTrigger.create({
      trigger: card, start: 'top 85%', once: true,
      onEnter: function () { gsap.to(pills, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04 }); }
    });
  });
}

/* ==========================================================================
   HERO: drag-to-reveal unveil
   ========================================================================== */
function initHero() {
  var hero   = document.getElementById('about');
  var canvas = document.getElementById('dust');
  if (!hero) return;

  var p = 0;
  var raf = 0;
  var dragging = false, moved = false, sx = 0, sy = 0;
  var dustSpeed = 1;

  /* ---- render: p in [0,1] drives every visual layer ---- */
  function render(v) {
    p = clamp(v, 0, 1);
    hero.style.setProperty('--p', p.toFixed(4));
    hero.style.setProperty('--intro', (1 - clamp((p - 0.05) / 0.25, 0, 1)).toFixed(3));
    var tilt = p < 0.5 ? -8 * p : -4 + (p - 0.5) * 6;   /* 0 -> -4deg -> -1deg */
    hero.style.setProperty('--tilt', tilt.toFixed(3) + 'deg');
    dustSpeed = 1 + p;
  }

  function cancelTween() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function tweenTo(to, dur, ease, done) {
    cancelTween();
    var from = p, t0 = performance.now();
    function step(now) {
      var t = clamp((now - t0) / (dur * 1000), 0, 1);
      render(from + (to - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else { raf = 0; if (done) done(); }
    }
    raf = requestAnimationFrame(step);
  }

  function setFinal() {
    if (heroUnveiled) return;
    heroUnveiled = true;
    cancelTween();
    dragging = false;
    hero.classList.remove('dragging');
    hero.classList.add('touched');
    render(1);
    hero.setAttribute('data-state', 'final');
  }
  function finish() {
    if (heroUnveiled) return;
    dragging = false;
    tweenTo(1, 1.4, easeOut, setFinal);   /* snap to final, then title slam via CSS */
  }
  function play() {
    if (heroUnveiled) return;
    hero.classList.add('touched', 'dragging');
    tweenTo(1, 3.5, easeIO, function () { hero.classList.remove('dragging'); setFinal(); });
  }
  function release() {
    hero.classList.remove('dragging');
    if (heroUnveiled) return;
    if (p >= 0.6) finish(); else tweenTo(0, 0.7, easeOut);
  }

  window.__unveilNow = setFinal;

  /* Hero starts unveiled: title slams in on load */
  hero.classList.add('touched');
  render(1);
  setFinal();
  if (!reduced) initDust();

  /* ---- ambient dust (canvas): paused offscreen / hidden tab ---- */
  function initDust() {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var count = window.innerWidth < 640 ? 16 : 40;
    var parts = [];
    var running = false, visible = true, last = 0, id = 0;

    function size() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(initial) {
      return {
        x: Math.random() * W, y: initial ? Math.random() * H : H + 6,
        r: 1 + Math.random() * 2, a: 0.15 + Math.random() * 0.35,
        v: 4 + Math.random() * 6, w: 0.5 + Math.random() * 0.5, ph: Math.random() * 6.28, f: 0.4 + Math.random() * 0.6
      };
    }
    function loop(now) {
      id = 0;
      if (!running) return;
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var q = parts[i];
        q.y -= q.v * dt * dustSpeed;
        q.ph += q.f * dt;
        var x = q.x + Math.sin(q.ph) * q.w * 8;
        if (q.y < -6) parts[i] = q = spawn(false);
        ctx.globalAlpha = q.a;
        ctx.fillStyle = '#ffe8c4';
        ctx.beginPath(); ctx.arc(x, q.y, q.r, 0, 6.2832); ctx.fill();
      }
      id = requestAnimationFrame(loop);
    }
    function sync() {
      var should = visible && !document.hidden;
      hero.classList.toggle('paused', !should);
      if (should && !running) { running = true; last = performance.now(); id = requestAnimationFrame(loop); }
      else if (!should && running) { running = false; if (id) cancelAnimationFrame(id); id = 0; }
    }
    size();
    for (var i = 0; i < count; i++) parts.push(spawn(true));
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', sync);
    if (window.ResizeObserver) new ResizeObserver(size).observe(canvas); else window.addEventListener('resize', size);
    sync();
  }
}

/* ===== CLEANUP ===== */
window.addEventListener('pagehide', function () {
  if (HAS_GSAP) {
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    if (tickerFn) gsap.ticker.remove(tickerFn);
  }
  if (lenis) { lenis.destroy(); lenis = null; }
});
