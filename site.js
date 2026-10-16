/* Growthive Systems — site behaviour (v2) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  /* ---------- 1. Intro (first page of a visit) & 2. page transitions ---------- */
  var cameFromNav = ss.get('gs_nav') === '1';
  ss.set('gs_nav', '0');
  var introDelay = 0;
  if (!reduce && !ss.get('gs_intro') && !cameFromNav) {
    ss.set('gs_intro', '1');
    var intro = document.createElement('div');
    intro.className = 'intro'; intro.setAttribute('aria-hidden', 'true');
    var logoSrc = (document.querySelector('.brand img') || {}).getAttribute ? document.querySelector('.brand img').getAttribute('src') : '';
    intro.innerHTML = '<div class="in"><img src="' + logoSrc + '" alt=""><div class="word"><span>Growthive Systems</span></div><div class="bar"><i></i></div></div>';
    document.body.appendChild(intro);
    introDelay = .85;
    setTimeout(function () { intro.classList.add('out'); }, 850);
    setTimeout(function () { intro.remove(); }, 1600);
  } else if (cameFromNav && !reduce) {
    document.body.classList.add('page-enter');
  }
  var curtain = null;
  if (!reduce) {
    curtain = document.createElement('div'); curtain.className = 'curtain'; curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href)) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      ss.set('gs_nav', '1');
      curtain.classList.add('in');
      setTimeout(function () { location.href = a.href; }, 430);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted && curtain) curtain.classList.remove('in'); });
  }

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header state + 5. scroll progress */
  var heroEl = document.querySelector('.hero, .page-hero');
  var bar = null;
  if (!reduce) { bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar); }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (header) { var limit = heroEl ? heroEl.offsetHeight - 80 : 0; header.classList.toggle('is-solid', window.scrollY > Math.max(limit, 40) || !heroEl); }
      if (bar) { var h = root.scrollHeight - root.clientHeight; bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')'; }
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); header.classList.remove('on-light'); }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { var open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); header.classList.toggle('on-light', open); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });
  }

  /* Product showcase: switch the pinned screen as each step becomes active */
  document.querySelectorAll('[data-seq]').forEach(function (seq) {
    var steps = Array.prototype.slice.call(seq.querySelectorAll('.seq-step'));
    var imgs = seq.querySelectorAll('.device .screens img');
    var url = seq.querySelector('.device .url');
    var cap = seq.querySelector('.seq-caption');
    var dots = seq.querySelectorAll('.seq-dots i');
    function activate(step) {
      var idx = steps.indexOf(step);
      steps.forEach(function (s) { s.classList.toggle('is-active', s === step); });
      var key = step.getAttribute('data-screen');
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-screen') === key); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
      if (url && step.dataset.url) url.textContent = step.dataset.url;
      if (cap && step.dataset.caption) cap.textContent = step.dataset.caption;
    }
    if (!('IntersectionObserver' in window)) { steps.forEach(function (s) { s.classList.add('is-active'); }); return; }
    var mobile = window.matchMedia('(max-width: 900px)').matches;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(en.target); });
    }, { rootMargin: mobile ? '-62% 0px -20% 0px' : '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
    activate(steps[0]);
  });

  /* Work filters */
  var filterBtns = document.querySelectorAll('.filters button');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      document.querySelectorAll('[data-cat]').forEach(function (item) { item.hidden = !(f === 'all' || item.dataset.cat.split(' ').indexOf(f) > -1); });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  /* Lightbox */
  var lb = document.querySelector('dialog.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('[data-full]').forEach(function (b) {
      b.addEventListener('click', function () { lbImg.src = b.dataset.full; lbImg.alt = b.querySelector('img').alt; lb.showModal(); });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.close')) lb.close(); });
    lb.addEventListener('close', function () { lbImg.src = ''; });
  }

  /* Contact form */
  var form = document.getElementById('project-form');
  if (form) {
    var interest = new URLSearchParams(location.search).get('interest');
    var sel = form.querySelector('#interest');
    if (interest && sel) Array.prototype.forEach.call(sel.options, function (o) { if (o.value === interest) sel.value = interest; });
    var ok = document.getElementById('form-ok'), err = document.getElementById('form-err');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (form.querySelector('[name="_gotcha"]').value) return;
      var btn = form.querySelector('button[type="submit"]'), label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…'; ok.hidden = true; err.hidden = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); ok.hidden = false; ok.focus(); })
        .catch(function () { err.hidden = false; err.focus(); })
        .finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  }

  /* ---------- 10. Count-up numbers (works without GSAP) ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1700;
        (function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 4)));
          el.textContent = v.toLocaleString('en-US') + (p === 1 ? suf : '');
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: .6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- 7. Typing headline ---------- */
  document.querySelectorAll('.typer-word').forEach(function (el) {
    if (reduce) return;
    var words = el.dataset.words.split('|'), wi = 0, ci = words[0].length, deleting = true;
    function tick() {
      var w = words[wi];
      if (deleting) { ci--; el.textContent = w.slice(0, ci); if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; } setTimeout(tick, 45); }
      else { var nw = words[wi]; ci++; el.textContent = nw.slice(0, ci); if (ci >= nw.length) { deleting = true; setTimeout(tick, 1900); } else setTimeout(tick, 75); }
    }
    setTimeout(tick, 2200 + introDelay * 1000);
  });

  /* ---------- 6. Hero canvas: moving data grid ---------- */
  document.querySelectorAll('.hero-canvas').forEach(function (cv) {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var host = cv.parentElement, W, H, dpr, G = 64, pts = [], mouse = { x: -999, y: -999 }, running = false, raf;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = host.clientWidth; H = host.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(26, Math.max(10, W * H / 52000)));
      pts = []; for (var i = 0; i < n; i++) pts.push(spawn());
    }
    function spawn() {
      var horiz = Math.random() < .5;
      return { h: horiz, x: horiz ? Math.random() * W : Math.round(Math.random() * W / G) * G, y: horiz ? Math.round(Math.random() * H / G) * G : Math.random() * H, v: (Math.random() * .9 + .35) * (Math.random() < .5 ? -1 : 1), len: 60 + Math.random() * 120 };
    }
    function grid() {
      ctx.lineWidth = 1;
      for (var x = 0; x <= W; x += G) { ctx.strokeStyle = 'rgba(210,178,107,0.06)'; ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
      for (var y = 0; y <= H; y += G) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
      // nodes near the mouse light up
      for (x = 0; x <= W; x += G) for (y = 0; y <= H; y += G) {
        var d = Math.hypot(x - mouse.x, y - mouse.y);
        if (d < 220) { ctx.fillStyle = 'rgba(210,178,107,' + (0.55 * (1 - d / 220)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.3); ctx.fill(); }
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H); grid();
      pts.forEach(function (p, i) {
        if (p.h) p.x += p.v * 1.6; else p.y += p.v * 1.6;
        var tx = p.h ? p.x - Math.sign(p.v) * p.len : p.x, ty = p.h ? p.y : p.y - Math.sign(p.v) * p.len;
        var gr = ctx.createLinearGradient(tx, ty, p.x, p.y);
        gr.addColorStop(0, 'rgba(210,178,107,0)'); gr.addColorStop(1, 'rgba(232,201,122,0.85)');
        ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = '#F1DCA2'; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 6.3); ctx.fill();
        if (p.x < -200 || p.x > W + 200 || p.y < -200 || p.y > H + 200) pts[i] = spawn();
      });
      if (running) raf = requestAnimationFrame(frame);
    }
    size(); window.addEventListener('resize', function () { size(); if (!running) { ctx.clearRect(0, 0, W, H); grid(); } });
    host.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    host.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    if (reduce) { grid(); return; }
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
      else if (!en[0].isIntersecting) { running = false; cancelAnimationFrame(raf); }
    }).observe(cv);
  });

  /* ---------- Pointer effects: 3 cursor, 4 magnetic, 8 hero tilt, 16 glow, package tilt ---------- */
  if (finePointer && !reduce) {
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot); document.body.appendChild(ring); root.classList.add('has-cursor');
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'; });
    (function loop() { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function (e) { ring.classList.toggle('hover', !!e.target.closest('a,button,summary,[data-tilt],.hwork-card,[data-full]')); });
    document.addEventListener('mousedown', function () { ring.classList.add('down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('down'); });
    document.addEventListener('mouseleave', function () { mx = my = -100; });

    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transition = 'transform .15s'; b.style.transform = 'translate(' + x * .28 + 'px,' + y * .38 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transition = 'transform .5s cubic-bezier(.2,.7,.1,1)'; b.style.transform = ''; });
    });

    var tiltEl = document.querySelector('[data-hero-tilt]');
    if (tiltEl) {
      var hero = tiltEl.closest('.hero'), tx = 0, ty = 0, cx = 0, cy = 0;
      hero.addEventListener('mousemove', function (e) { var r = hero.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2; });
      hero.addEventListener('mouseleave', function () { tx = ty = 0; });
      (function tl() { cx += (tx - cx) * .07; cy += (ty - cy) * .07; tiltEl.style.transform = 'rotateY(' + (cx * 6).toFixed(2) + 'deg) rotateX(' + (-cy * 4).toFixed(2) + 'deg) translateZ(0)'; requestAnimationFrame(tl); })();
    }

    document.querySelectorAll('.glow, .pkg').forEach(function (c) {
      c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
    document.querySelectorAll('[data-tilt]').forEach(function (c) {
      c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transition = 'transform .1s'; c.style.transform = 'rotateY(' + x * 8 + 'deg) rotateX(' + -y * 8 + 'deg) translateY(-6px)'; });
      c.addEventListener('mouseleave', function () { c.style.transition = 'transform .6s cubic-bezier(.2,.7,.1,1)'; c.style.transform = ''; });
    });
  }

  /* ---------- Demo videos: play only while visible, pause button, reel tabs ---------- */
  var vids = document.querySelectorAll('.demo-video');
  function setBtn(v) { var b = v.parentElement.querySelector('.vid-toggle'); if (!b) return; var paused = v.paused; b.setAttribute('aria-label', paused ? 'Play video' : 'Pause video'); b.firstElementChild.className = paused ? 'i-play' : 'i-pause'; }
  vids.forEach(function (v) {
    v.dataset.userPaused = reduce ? '1' : '0';
    if (reduce) v.setAttribute('controls', '');
    v.addEventListener('play', function () { setBtn(v); }); v.addEventListener('pause', function () { setBtn(v); });
    var b = v.parentElement.querySelector('.vid-toggle');
    if (b) b.addEventListener('click', function () { if (v.paused) { v.dataset.userPaused = '0'; v.play().catch(function () {}); } else { v.dataset.userPaused = '1'; v.pause(); } });
    setBtn(v);
  });
  if ('IntersectionObserver' in window && vids.length) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && v.dataset.userPaused !== '1' && !v.closest('[hidden]')) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(function () {}); }
        else if (!en.isIntersecting) v.pause();
      });
    }, { threshold: .35 });
    vids.forEach(function (v) { vio.observe(v); });
  }
  document.querySelectorAll('.reel-tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('[data-reel]'), url = document.querySelector('.reel-url');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (x) {
          var on = x === btn, panel = document.getElementById('reel-' + x.dataset.reel), v = panel.querySelector('video');
          x.setAttribute('aria-selected', on); panel.hidden = !on; panel.classList.toggle('is-on', on);
          if (on) { if (url) url.textContent = panel.dataset.url; if (v.dataset.userPaused !== '1') { v.preload = 'auto'; v.currentTime = 0; v.play().catch(function () {}); } }
          else v.pause();
        });
      });
      btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var arr = Array.prototype.slice.call(btns), i = arr.indexOf(btn), n = arr[(i + (e.key === 'ArrowRight' ? 1 : arr.length - 1)) % arr.length]; n.focus(); n.click(); } });
    });
  });

  /* ---------- YouTube frames: custom cover, one at a time, floating player ---------- */
  var ytFrames = Array.prototype.slice.call(document.querySelectorAll('[data-yt]'));
  function ytCmd(f, func) { var ifr = f.querySelector('iframe'); if (ifr && ifr.contentWindow) ifr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*'); }
  function unfloat(f) { var pl = f.querySelector('.yt-player'); pl.classList.remove('is-floating'); f.classList.remove('has-float'); var h = f.closest('[data-float-host]'); if (h) h.classList.remove('float-host'); }
  ytFrames.forEach(function (f) {
    var cover = f.querySelector('.yt-cover'), pl = f.querySelector('.yt-player');
    cover.addEventListener('click', function () {
      if ((function () { try { return window.localStorage.getItem('gs_cookies') === 'essential'; } catch (e) { return false; } })()) { window.open('https://www.youtube.com/watch?v=' + f.dataset.yt, '_blank', 'noopener'); return; }
      ytFrames.forEach(function (o) { if (o !== f && o.dataset.active) { ytCmd(o, 'pauseVideo'); o.dataset.playing = '0'; unfloat(o); } });
      var ifr = document.createElement('iframe');
      ifr.src = 'https://www.youtube-nocookie.com/embed/' + f.dataset.yt + '?autoplay=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
      ifr.title = f.dataset.ytTitle; ifr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; ifr.allowFullscreen = true;
      ifr.addEventListener('load', function () { try { ifr.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*'); } catch (e) {} });
      cover.replaceWith(ifr); f.dataset.active = '1'; f.dataset.playing = '1'; f.dataset.dismissed = '0';
    });
    f.querySelector('.yt-close').addEventListener('click', function () { ytCmd(f, 'pauseVideo'); f.dataset.playing = '0'; f.dataset.dismissed = '1'; unfloat(f); });
    f.querySelector('.yt-back').addEventListener('click', function () { unfloat(f); f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });
  });
  window.addEventListener('message', function (e) {
    if (!/youtube(-nocookie)?\.com$/.test((e.origin || '').replace(/^https?:\/\//, ''))) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d || !d.info || d.info.playerState === undefined) return;
    ytFrames.forEach(function (f) {
      var ifr = f.querySelector('iframe');
      if (ifr && ifr.contentWindow === e.source) {
        var st = d.info.playerState; f.dataset.playing = st === 1 || st === 3 ? '1' : '0';
        if (st === 1) ytFrames.forEach(function (o) { if (o !== f && o.dataset.playing === '1') { ytCmd(o, 'pauseVideo'); o.dataset.playing = '0'; unfloat(o); } });
        if (st === 0) unfloat(f);
      }
    });
  });
  if ('IntersectionObserver' in window && ytFrames.length) {
    var yio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var f = en.target, pl = f.querySelector('.yt-player');
        if (en.isIntersecting) { unfloat(f); f.dataset.dismissed = '0'; }
        else if (f.dataset.active && f.dataset.playing === '1' && f.dataset.dismissed !== '1') { var h = f.closest('[data-float-host]'); if (h) h.classList.add('float-host'); f.classList.add('has-float'); pl.classList.add('is-floating'); }
      });
    }, { threshold: .2 });
    ytFrames.forEach(function (f) { yio.observe(f); });
  }

  /* Typed quotes */
  var typed = document.querySelectorAll('[data-type]');
  if (typed.length && !reduce && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return; tio.unobserve(en.target);
        var el = en.target, full = el.textContent, i = 0, cur = document.createElement('span'); cur.className = 'cur';
        el.setAttribute('aria-label', full); el.textContent = ''; var txt = document.createTextNode(''); el.appendChild(txt); el.appendChild(cur);
        (function t() { i++; txt.nodeValue = full.slice(0, i); if (i < full.length) setTimeout(t, 26); else setTimeout(function () { cur.remove(); }, 1600); })();
      });
    }, { threshold: .8 });
    typed.forEach(function (el) { tio.observe(el); });
  }

  /* ---------- Cookie notice ---------- */
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var cookieBox = null;
  function cookieChoice() { return ls.get('gs_cookies'); }
  function showCookie() {
    if (!cookieBox) {
      cookieBox = document.createElement('div'); cookieBox.className = 'cookie'; cookieBox.setAttribute('role', 'dialog'); cookieBox.setAttribute('aria-live', 'polite'); cookieBox.setAttribute('aria-label', 'Cookie settings');
      var priv = (document.querySelector('.foot-grid a[href*="privacy"]') || {}).getAttribute ? document.querySelector('.foot-grid a[href*="privacy"]').getAttribute('href') : 'privacy.html';
      cookieBox.innerHTML = '<h2>🍪 Cookies on this site</h2><p>We only use essential browser storage to remember your settings. Our YouTube videos may set cookies when you play them. <a href="' + priv + '#cookies">Read our cookie policy</a>.</p><div class="row"><button type="button" class="btn btn-gold" data-ck="all">Accept all</button><button type="button" class="btn btn-line" data-ck="essential">Essential only</button></div>';
      document.body.appendChild(cookieBox);
      cookieBox.addEventListener('click', function (e) { var b = e.target.closest('[data-ck]'); if (!b) return; ls.set('gs_cookies', b.dataset.ck); cookieBox.classList.remove('show'); });
    }
    requestAnimationFrame(function () { requestAnimationFrame(function () { cookieBox.classList.add('show'); }); });
  }
  if (!cookieChoice()) setTimeout(showCookie, 1800 + introDelay * 1000);
  document.querySelectorAll('[data-cookie-open]').forEach(function (b) { b.addEventListener('click', showCookie); });

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { b.classList.add('done'); var l = b.querySelector('.cbtn-copy-label'); if (l) l.textContent = 'Copied'; setTimeout(function () { b.classList.remove('done'); if (l) l.textContent = 'Copy'; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(b.dataset.copy).then(done, function () { window.prompt('Copy this email address:', b.dataset.copy); });
      else window.prompt('Copy this email address:', b.dataset.copy);
    });
  });

  /* ---------- Send enquiry on WhatsApp ---------- */
  var waBtn = document.getElementById('send-wa');
  if (waBtn && form) {
    waBtn.addEventListener('click', function () {
      var name = form.querySelector('#name'), msg = form.querySelector('#message'), sel2 = form.querySelector('#interest');
      if (!name.value.trim()) { name.reportValidity(); name.focus(); return; }
      if (!msg.value.trim()) { msg.reportValidity(); msg.focus(); return; }
      var val = function (id) { var el = form.querySelector('#' + id); return el && el.value.trim(); };
      var opt = sel2 && sel2.value ? sel2.options[sel2.selectedIndex].text : '';
      var lines = ['Hi Growthive Systems, I\'d like to start a project.', '', 'Name: ' + val('name')];
      if (val('email')) lines.push('Email: ' + val('email'));
      if (val('company')) lines.push('Company: ' + val('company'));
      if (opt) lines.push('Service: ' + opt);
      if (val('budget')) lines.push('Budget: ' + form.querySelector('#budget').options[form.querySelector('#budget').selectedIndex].text);
      if (val('timeline')) lines.push('Timeline: ' + form.querySelector('#timeline').options[form.querySelector('#timeline').selectedIndex].text);
      lines.push('', val('message'));
      var url = waBtn.dataset.wa + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url;
    });
  }

  /* ---------- Scroll motion (GSAP + Lenis) ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  root.classList.add('js-motion');

  if (window.Lenis) {
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length < 2) return; var t = document.querySelector(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); });
    });
  }

  /* Hero entrance */
  var lines = document.querySelectorAll('.hero h1 .ln > span');
  if (lines.length) {
    var tl = gsap.timeline({ delay: introDelay, defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: 1.05, stagger: .09 })
      .from('.hero .typer, .hero .lede, .hero-actions, .stats > div', { opacity: 0, y: 18, duration: .8, stagger: .07 }, '-=.6')
      .from('.hero-stage', { opacity: 0, y: 70, duration: 1.1 }, '-=.7');
  }
  var phEls = document.querySelectorAll('.page-hero .kicker, .page-hero .lede, .page-hero .jump');
  if (phEls.length) gsap.from(phEls, { opacity: 0, y: 20, duration: .8, stagger: .08, delay: introDelay + .25, ease: 'power3.out' });

  /* Hero screenshot flattens as you scroll */
  var shot = document.querySelector('.hero-shot');
  if (shot) gsap.fromTo(shot, { rotateX: 22, scale: .9 }, { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top 85%', end: 'top 15%', scrub: .6 } });

  /* 9. Word-by-word heading reveal */
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      tn.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    var words = el.querySelectorAll('.w');
    var inHero = el.closest('.page-hero');
    if (inHero) gsap.from(words, { opacity: 0, y: '0.5em', duration: .7, stagger: .05, ease: 'power3.out', delay: introDelay + .1 });
    else gsap.fromTo(words, { opacity: .12 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 50%', scrub: .5 } });
  });

  /* 14. Mask zoom reveal */
  gsap.utils.toArray('[data-mask]').forEach(function (m) {
    if (m.closest('.hwork')) return;
    var img = m.querySelector('img');
    gsap.fromTo(m, { clipPath: 'inset(14% 14% 14% 14% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none', scrollTrigger: { trigger: m, start: 'top 92%', end: 'top 45%', scrub: .6 } });
    if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top 92%', end: 'top 45%', scrub: .6 } });
  });

  /* 11. Stacking service cards shrink as the next one covers them */
  var cards = gsap.utils.toArray('.stack-card');
  cards.forEach(function (c, i) {
    var next = cards[i + 1]; if (!next) return;
    gsap.to(c, { scale: .92, opacity: .55, ease: 'none', scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true } });
  });
  gsap.utils.toArray('.stack-img img').forEach(function (im) {
    gsap.fromTo(im, { yPercent: -4, scale: 1.08 }, { yPercent: 4, scale: 1.08, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Reveal (kept for any marked blocks) */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  /* Horizontal work gallery, pinned on desktop */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    var wrap = document.querySelector('.hwork'), track = wrap && wrap.querySelector('.hwork-track');
    if (!track) return;
    var pbar = document.querySelector('.progress-line span');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var tween = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top top+=90', end: function () { return '+=' + dist(); }, pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { if (pbar) pbar.style.transform = 'scaleX(' + self.progress + ')'; } }
    });
    gsap.utils.toArray('.hwork-card .shot img').forEach(function (im) {
      gsap.fromTo(im, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im, containerAnimation: tween, start: 'left right', end: 'left 40%', scrub: true } });
    });
  });

  /* Process line */
  document.querySelectorAll('.process').forEach(function (p) {
    var fill = p.querySelector('.fill'); if (!fill) return;
    var vertical = window.matchMedia('(max-width: 820px)').matches;
    gsap.fromTo(fill, vertical ? { scaleY: 0 } : { scaleX: 0 }, Object.assign(vertical ? { scaleY: 1 } : { scaleX: 1 }, { ease: 'none', scrollTrigger: { trigger: p, start: 'top 75%', end: 'bottom 55%', scrub: .5 } }));
    gsap.from(p.querySelectorAll('.n'), { scale: .4, opacity: 0, duration: .5, stagger: .18, ease: 'back.out(2)', scrollTrigger: { trigger: p, start: 'top 75%', once: true } });
  });

  /* 17. Packages: cards rise in with depth, features tick in one by one */
  document.querySelectorAll('.pkg-grid').forEach(function (g) {
    var pk = g.querySelectorAll('.pkg');
    gsap.from(pk, { y: 90, rotateX: 14, opacity: 0, duration: 1, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 80%', once: true } });
    pk.forEach(function (card, i) {
      gsap.from(card.querySelectorAll('.pkg-list li'), { x: -14, opacity: 0, duration: .45, stagger: .08, ease: 'power2.out', delay: .35 + i * .15, scrollTrigger: { trigger: g, start: 'top 80%', once: true } });
    });
  });

  /* Feature cells and audience items */
  gsap.utils.toArray('.feature-grid, .audience, .values, .status-table').forEach(function (g) {
    gsap.from(g.children, { y: 34, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
  });

  /* Case studies and gallery images drift in */
  gsap.utils.toArray('.case .shot, .shots figure').forEach(function (el) {
    gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.utils.toArray('.gallery figure').forEach(function (el, i) {
    gsap.from(el, { y: 40, opacity: 0, scale: .96, duration: .7, delay: (i % 3) * .08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  /* Solutions & inner pages: divisions, lists, FAQs, forms */
  gsap.utils.toArray('.division').forEach(function (d) {
    var side = d.querySelector('.side');
    if (side) gsap.from(side.children, { y: 40, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: d, start: 'top 75%', once: true } });
    gsap.from(d.querySelectorAll('.points li'), { x: -18, opacity: 0, duration: .45, stagger: .05, ease: 'power2.out', scrollTrigger: { trigger: d.querySelector('.cols') || d, start: 'top 80%', once: true } });
    var line = d.querySelector('.div-line');
    if (line) gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: d, start: 'top 80%', end: 'top 30%', scrub: .5 } });
  });
  gsap.from('.jump a', { y: 16, opacity: 0, duration: .5, stagger: .07, delay: introDelay + .5, ease: 'back.out(2)' });
  gsap.utils.toArray('.faq details, .prose > p, .side-card > div, .form > .row, .form > .field').forEach(function (el) {
    gsap.from(el, { y: 26, opacity: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  gsap.utils.toArray('.stat-row strong').forEach(function (el) {
    gsap.from(el, { scale: .6, opacity: 0, duration: .8, ease: 'back.out(1.8)', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* Showreel frame grows from tilted to full as you scroll in */
  var reel = document.querySelector('[data-reel-scale]');
  if (reel) gsap.fromTo(reel, { scale: .82, rotateX: 16, opacity: .6 }, { scale: 1, rotateX: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.reel-stage', start: 'top 90%', end: 'top 25%', scrub: .6 } });

  /* About videos: slanted frames straighten and grow as they arrive */
  gsap.utils.toArray('.videos .yt-frame').forEach(function (f) {
    var left = f.classList.contains('tilt-l');
    gsap.fromTo(f, { rotate: left ? -7 : 7, scale: .86, x: left ? -60 : 60, opacity: .4 }, { rotate: left ? -1.5 : 1.5, scale: 1, x: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'center 55%', scrub: .6 } });
  });
  gsap.utils.toArray('.vtext').forEach(function (t) {
    gsap.from(t.children, { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 80%', once: true } });
  });

  /* Homepage "deal": two frames start stacked in the centre, then fan out */
  var dl = document.querySelector('.deal-frame.dl'), dr = document.querySelector('.deal-frame.dr');
  if (dl && dr) {
    var dealTl = gsap.timeline({ scrollTrigger: { trigger: '.deal-frames', start: 'top 90%', end: 'center 50%', scrub: .7 } });
    var gapX = function () { return (dr.getBoundingClientRect().left - dl.getBoundingClientRect().left) / 2; };
    dealTl.fromTo(dl, { x: function () { return gapX(); }, rotate: 8, scale: .9 }, { x: 0, rotate: -4, scale: 1, ease: 'power2.out' }, 0)
          .fromTo(dr, { x: function () { return -gapX(); }, rotate: -8, scale: .9 }, { x: 0, rotate: 4, scale: 1, ease: 'power2.out' }, 0);
    gsap.from('.deal-copy', { y: 40, opacity: 0, duration: .9, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '.deal-copies', start: 'top 85%', once: true } });
  }

  /* Parallax */
  gsap.utils.toArray('[data-parallax]').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  window.addEventListener('load', function () { ST.refresh(); });
})();
