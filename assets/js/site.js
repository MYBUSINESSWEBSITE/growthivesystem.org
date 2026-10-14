/* Growthive Systems — site behaviour */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 901px)');
  var header = document.querySelector('.site-header');

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header: transparent over dark hero, solid after it */
  var heroEl = document.querySelector('.hero, .page-hero');
  function setHeader() {
    if (!header) return;
    var limit = heroEl ? heroEl.offsetHeight - 80 : 0;
    header.classList.toggle('is-solid', window.scrollY > Math.max(limit, 40) || !heroEl);
  }
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  /* Mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      header.classList.toggle('on-light', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); header.classList.remove('on-light'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); header.classList.remove('on-light'); menuBtn.focus(); }
    });
  }

  /* Product sequence: switch the pinned screen as each step becomes active (works without GSAP) */
  document.querySelectorAll('[data-seq]').forEach(function (seq) {
    var steps = seq.querySelectorAll('.seq-step');
    var imgs = seq.querySelectorAll('.device .screens img');
    var url = seq.querySelector('.device .url');
    var cap = seq.querySelector('.seq-caption');
    function activate(step) {
      steps.forEach(function (s) { s.classList.toggle('is-active', s === step); });
      var key = step.getAttribute('data-screen');
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-screen') === key); });
      if (url && step.dataset.url) url.textContent = step.dataset.url;
      if (cap && step.dataset.caption) cap.textContent = step.dataset.caption;
    }
    if (!('IntersectionObserver' in window)) { steps.forEach(function (s) { s.classList.add('is-active'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
    activate(steps[0]);
  });

  /* Work filters */
  var filterBtns = document.querySelectorAll('.filters button');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      document.querySelectorAll('[data-cat]').forEach(function (item) {
        item.hidden = !(f === 'all' || item.dataset.cat.split(' ').indexOf(f) > -1);
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  /* Lightbox for design work */
  var lb = document.querySelector('dialog.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        lbImg.src = b.dataset.full; lbImg.alt = b.querySelector('img').alt; lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.close')) lb.close(); });
    lb.addEventListener('close', function () { lbImg.src = ''; });
  }

  /* Contact form */
  var form = document.getElementById('project-form');
  if (form) {
    var params = new URLSearchParams(location.search);
    var interest = params.get('interest');
    var sel = form.querySelector('#interest');
    if (interest && sel) { Array.prototype.forEach.call(sel.options, function (o) { if (o.value === interest) sel.value = interest; }); }
    var ok = document.getElementById('form-ok'), err = document.getElementById('form-err');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (form.querySelector('[name="_gotcha"]').value) return;
      var btn = form.querySelector('button[type="submit"]');
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      ok.hidden = true; err.hidden = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); ok.hidden = false; ok.focus(); })
        .catch(function () { err.hidden = false; err.focus(); })
        .finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  }

  /* ---------- Scroll motion (GSAP + Lenis), only when available and motion is allowed ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  document.documentElement.classList.add('js-motion');

  if (window.Lenis) {
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -80 });
      });
    });
  }

  /* Hero: headline lines rise once on load */
  var lines = document.querySelectorAll('.hero h1 .ln > span');
  if (lines.length) {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: 1.05, stagger: .09 })
      .from('.hero .lede, .hero-actions, .hero-proof', { opacity: 0, y: 18, duration: .8, stagger: .08 }, '-=.6')
      .from('.hero-stage', { opacity: 0, y: 60, duration: 1.1 }, '-=.7');
  }

  /* Hero screenshot: tilted, flattens as you scroll */
  var shot = document.querySelector('.hero-shot');
  if (shot) {
    gsap.fromTo(shot, { rotateX: 22, scale: .9, y: 0 }, {
      rotateX: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.hero-stage', start: 'top 85%', end: 'top 15%', scrub: .6 }
    });
  }

  /* Reveal: a few chosen blocks only */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  /* Horizontal work gallery, pinned on desktop */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    var wrap = document.querySelector('.hwork');
    var track = wrap && wrap.querySelector('.hwork-track');
    if (!track) return;
    var bar = document.querySelector('.progress-line span');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: 'top top+=90', end: function () { return '+=' + dist(); },
        pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { if (bar) bar.style.transform = 'scaleX(' + self.progress + ')'; }
      }
    });
  });

  /* Process line fills as you scroll through the steps */
  document.querySelectorAll('.process').forEach(function (p) {
    var fill = p.querySelector('.fill'); if (!fill) return;
    var vertical = window.matchMedia('(max-width: 820px)').matches;
    gsap.fromTo(fill, vertical ? { scaleY: 0 } : { scaleX: 0 }, Object.assign(vertical ? { scaleY: 1 } : { scaleX: 1 }, {
      ease: 'none', scrollTrigger: { trigger: p, start: 'top 75%', end: 'bottom 55%', scrub: .5 }
    }));
    gsap.from(p.querySelectorAll('.n'), { scale: .4, opacity: 0, duration: .5, stagger: .18, ease: 'back.out(2)', scrollTrigger: { trigger: p, start: 'top 75%', once: true } });
  });

  /* Gentle parallax on marked images */
  gsap.utils.toArray('[data-parallax]').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  window.addEventListener('load', function () { ST.refresh(); });
})();
