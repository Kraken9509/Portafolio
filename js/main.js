(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  /* ---------- Año del footer ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  var header = $('#header');
  var toggle = $('#navToggle');
  var menu = $('#navMenu');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
    if (open) header.classList.remove('is-hidden');
  }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  $$('a', menu).forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* ---------- Scroll: header, barra de progreso y línea de tiempo ---------- */
  var progressBar = $('#scrollProgress');
  var timeline = $('.timeline');
  var timelineItems = timeline ? $$('.timeline__item', timeline) : [];
  var lastY = window.scrollY;
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight - vh;

    header.classList.toggle('is-scrolled', y > 20);
    if (!menu.classList.contains('is-open') && Math.abs(y - lastY) > 6) {
      header.classList.toggle('is-hidden', y > lastY && y > 480);
      lastY = y;
    }

    if (progressBar) progressBar.style.transform = 'scaleX(' + (docH > 0 ? y / docH : 0).toFixed(4) + ')';

    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var trigger = vh * 0.6;
      timeline.style.setProperty('--progress', clamp((trigger - r.top) / r.height, 0, 1).toFixed(4));
      timelineItems.forEach(function (item) {
        var dot = item.firstElementChild.getBoundingClientRect();
        item.classList.toggle('is-active', dot.top < trigger);
      });
    }
  }
  function requestScrollFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }
  onScrollFrame();
  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame);

  /* ---------- Enlace activo según sección ---------- */
  var navLinks = $$('.nav__link');
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (l) {
      var s = $(l.getAttribute('href'));
      if (s) spy.observe(s);
    });
  }

  /* ---------- Aparición al hacer scroll (con variantes y escalonado) ---------- */
  var variants = {
    '.about__visual': 'left',
    '.stats': 'blur',
    '.service': 'scale',
    '.step': 'scale',
    '.timeline__item': 'right',
    '.edu__col:first-child .edu__card': 'left',
    '.edu__col:last-child .edu__card': 'right',
    '.skills__group': 'scale',
    '.form': 'right'
  };
  Object.keys(variants).forEach(function (sel) {
    $$(sel).forEach(function (el) {
      if (el.classList.contains('reveal') && !el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', variants[sel]);
    });
  });

  // Etiquetas de habilidades: índice para el escalonado
  $$('.tags').forEach(function (list) {
    $$('li', list).forEach(function (li, i) { li.style.setProperty('--i', i); });
  });

  function finishReveal(el) {
    el.classList.add('is-visible');
    // Quita la clase de animación al terminar para devolver sus transiciones propias al elemento
    setTimeout(function () {
      el.classList.remove('reveal');
      el.style.removeProperty('--d');
    }, 1300 + (parseInt(el.style.getPropertyValue('--d'), 10) || 0));
  }

  var reveals = $$('.reveal');
  if (hasIO) {
    var revealObs = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--d', Math.min(batch, 6) * 90 + 'ms');
        batch++;
        finishReveal(entry.target);
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Contadores ---------- */
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var start = null;
    var duration = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (hasIO) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); countObs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Texto rotativo (máquina de escribir) ---------- */
  var typed = $('#typed');
  var phrases = [
    'Soporte Técnico Nivel 1 y Nivel 2',
    'Seguridad Informática y Ciberseguridad',
    'Mantenimiento de Equipos de Cómputo',
    'Soporte Remoto y Presencial',
    'Docencia en Ingeniería de Sistemas'
  ];
  if (typed) {
    var pi = 0, ci = phrases[0].length, deleting = true;
    setTimeout(function tick() {
      var word = phrases[pi];
      ci += deleting ? -1 : 1;
      typed.textContent = word.slice(0, ci);
      var delay = deleting ? 26 : 50 + Math.random() * 40;
      if (!deleting && ci === word.length) { deleting = true; delay = 2200; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 380; }
      setTimeout(tick, delay);
    }, 2800);
  }

  /* ---------- Terminal: líneas en secuencia ---------- */
  var termLines = $$('#terminalBody p');
  if (termLines.length) {
    termLines.forEach(function (p) { p.classList.add('is-hidden'); });
    termLines.forEach(function (p, i) {
      setTimeout(function () { p.classList.remove('is-hidden'); }, 700 + i * 360);
    });
  }

  /* ---------- Hero: red animada que reacciona al cursor + parallax ---------- */
  var hero = $('#inicio');
  var canvas = $('#heroCanvas');
  var mouse = null;

  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      mouse = null;
      hero.style.setProperty('--px', 0);
      hero.style.setProperty('--py', 0);
    });
  }

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var points = [];
    var w = 0, h = 0, running = true;

    function resize() {
      var nw = canvas.offsetWidth, nh = canvas.offsetHeight;
      if (nw === w && Math.abs(nh - h) < 120 && points.length) return; // evita reinicios por la barra del navegador móvil
      w = nw; h = nh;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(clamp((w * h) / 20000, 24, 80));
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.4 + 1 });
      }
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var maxDist = 140, mouseDist = 190;
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse) {
          var mx = p.x - mouse.x, my = p.y - mouse.y;
          var md = Math.sqrt(mx * mx + my * my);
          if (md < mouseDist && md > 0) {
            var force = (1 - md / mouseDist);
            p.x += (mx / md) * force * 1.2;
            p.y += (my / md) * force * 1.2;
            ctx.strokeStyle = 'rgba(212, 175, 106,' + (0.45 * force).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }

        for (var j = i + 1; j < points.length; j++) {
          var q = points[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            ctx.strokeStyle = 'rgba(59, 130, 246,' + (0.28 * (1 - d / maxDist)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    draw(); // con movimiento reducido se dibuja una sola vez (red estática)
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); if (reduceMotion) draw(); }, 200);
    });

    // Pausa la animación cuando el hero no está visible
    if (hasIO && !reduceMotion) {
      new IntersectionObserver(function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible && !running) { running = true; draw(); }
        else if (!visible) { running = false; }
      }).observe(canvas);
    }
  }

  /* ---------- Interacciones de escritorio (cursor fino) ---------- */
  if (finePointer) {

    // Spotlight dentro de tarjetas
    $$('.tier, .service, .card, .edu__card, .skills__group, .step, .contact__item, .faq__item, .stat, .highlights li').forEach(function (el) {
      el.classList.add('spot');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  if (finePointer && !reduceMotion) {

    // Resplandor que sigue al cursor
    var glow = $('#cursorGlow');
    if (glow) {
      var gx = window.innerWidth / 2, gy = window.innerHeight / 2, tx = gx, ty = gy, glowRunning = false;
      var glowLoop = function () {
        gx += (tx - gx) * 0.12;
        gy += (ty - gy) * 0.12;
        glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
        if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) requestAnimationFrame(glowLoop);
        else glowRunning = false;
      };
      window.addEventListener('pointermove', function (e) {
        tx = e.clientX; ty = e.clientY;
        glow.classList.add('is-active');
        if (!glowRunning) { glowRunning = true; requestAnimationFrame(glowLoop); }
      }, { passive: true });
      document.addEventListener('mouseout', function (e) {
        if (!e.relatedTarget) glow.classList.remove('is-active');
      });
    }

    // Inclinación 3D
    function bindTilt(el, max, lift) {
      el.classList.add('tilt');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        el.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * max).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * max).toFixed(2) + 'deg) translateY(' + lift + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    }
    $$('.terminal').forEach(function (el) { bindTilt(el, 10, 0); });
    $$('.tier').forEach(function (el) { bindTilt(el, 6, -6); });
    $$('.avatar').forEach(function (el) { bindTilt(el, 18, 0); });

    // Botones magnéticos
    $$('.hero__actions .btn, .nav__cta, .wa-float, .form .btn').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = (dx * 0.18).toFixed(1) + 'px ' + (dy * 0.3).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  }

  /* ---------- Efecto ripple en botones ---------- */
  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2;
    var s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(s);
    setTimeout(function () { s.remove(); }, 750);
  });

  /* ---------- Notificación ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function showToast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 3200);
  }

  /* ---------- Formulario → WhatsApp ---------- */
  var form = $('#contactForm');
  var errorEl = $('#formError');
  if (form) {
    // Los enlaces "Solicitar soporte nivel X" preseleccionan el servicio
    $$('[data-servicio]').forEach(function (link) {
      link.addEventListener('click', function () {
        form.servicio.value = link.getAttribute('data-servicio');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.nombre.value.trim();
      var mensaje = form.mensaje.value.trim();
      if (!nombre || !mensaje) {
        errorEl.hidden = false;
        form.classList.remove('is-shake');
        void form.offsetWidth; // reinicia la animación
        form.classList.add('is-shake');
        (nombre ? form.mensaje : form.nombre).focus();
        return;
      }
      errorEl.hidden = true;
      var modalidad = form.querySelector('input[name="modalidad"]:checked').value;
      var linea = form.querySelector('input[name="linea"]:checked').value;
      var texto =
        'Hola Omar, soy ' + nombre + '.\n' +
        'Servicio: ' + form.servicio.value + '\n' +
        'Modalidad: ' + modalidad + '\n\n' +
        mensaje;
      showToast('✅ Abriendo WhatsApp con tu mensaje…');
      window.open('https://wa.me/' + linea + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }
})();
