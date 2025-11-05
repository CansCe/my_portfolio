// Theme persistence
(function () {
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const saved = localStorage.getItem('theme');
  const isLight = saved ? saved === 'light' : prefersLight;
  if (isLight) document.documentElement.classList.add('light');
})();

// Toggle theme
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const html = document.documentElement;
  const toLight = !html.classList.contains('light');
  html.classList.toggle('light', toLight);
  localStorage.setItem('theme', toLight ? 'light' : 'dark');
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });
});

// Dynamic year
document.getElementById('year').textContent = String(new Date().getFullYear());
const year2 = document.getElementById('year2');
if (year2) year2.textContent = String(new Date().getFullYear());

// Snake popup and game
(function snakeGame() {
  const widget = document.getElementById('snakeWidget');
  const toggle = document.getElementById('snakeToggle');
  const panel = document.getElementById('snakePanel');
  const canvas = document.getElementById('snakeCanvas');
  const scoreEl = document.getElementById('snakeScore');
  const highEl = document.getElementById('snakeHigh');
  const restartBtn = document.getElementById('snakeRestart');
  const pauseBtn = document.getElementById('snakePause');
  const overlay = document.getElementById('snakeOverlay');
  if (!widget || !toggle || !panel || !canvas) return;

  // Popup toggle
  const closePanel = () => {
    widget.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const openPanel = () => {
    widget.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  };
  toggle.addEventListener('click', () => {
    if (widget.classList.contains('open')) closePanel(); else openPanel();
  });
  // keep widget above bottom bar
  const updateWidgetOffset = () => {
    const hasBar = document.documentElement.classList.contains('has-bottom-bar');
    widget.style.setProperty('--dynamic-offset', hasBar ? '60px' : '0px');
  };
  new MutationObserver(updateWidgetOffset).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  updateWidgetOffset();

  // Game state
  const ctx = canvas.getContext('2d');
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const logicalSize = 220;
  canvas.width = logicalSize * dpr;
  canvas.height = logicalSize * dpr;
  ctx.scale(dpr, dpr);

  const cell = 10; // 22x22 grid
  const cols = Math.floor(logicalSize / cell);
  const rows = Math.floor(logicalSize / cell);
  let snake, dir, nextDir, food, score, highScore, running, timerId, speedMs;

  function resetGame() {
    snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = spawnFood();
    score = 0;
    speedMs = 120;
    running = false; // start paused to show overlay
    scoreEl.textContent = String(score);
    const savedHigh = Number(localStorage.getItem('snakeHighScore') || '0');
    highScore = Number.isFinite(savedHigh) ? savedHigh : 0;
    if (highEl) highEl.textContent = `HS: ${highScore}`;
    loop();
    showOverlay(true);
  }

  function spawnFood() {
    while (true) {
      const fx = Math.floor(Math.random() * cols);
      const fy = Math.floor(Math.random() * rows);
      if (!snake?.some(s => s.x === fx && s.y === fy)) return { x: fx, y: fy };
    }
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cell, y * cell, cell, cell);
  }

  function drawGrid() {
    ctx.clearRect(0, 0, logicalSize, logicalSize);
    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath(); ctx.moveTo(i * cell + 0.5, 0); ctx.lineTo(i * cell + 0.5, logicalSize); ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * cell + 0.5); ctx.lineTo(logicalSize, j * cell + 0.5); ctx.stroke();
    }
  }

  function step() {
    dir = nextDir; // apply buffered direction
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // wrap around
    head.x = (head.x + cols) % cols;
    head.y = (head.y + rows) % rows;

    // self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      running = false;
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1; scoreEl.textContent = String(score);
      if (speedMs > 60) speedMs -= 4;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', String(highScore));
        if (highEl) highEl.textContent = `HS: ${highScore}`;
      }
      food = spawnFood();
    } else {
      snake.pop();
    }
  }

  function render() {
    drawGrid();
    // food
    drawCell(food.x, food.y, '#ff6b6b');
    // snake
    snake.forEach((s, i) => {
      const t = i / Math.max(1, snake.length - 1);
      const grad = ctx.createLinearGradient(0, 0, logicalSize, logicalSize);
      grad.addColorStop(0, '#4f8cff');
      grad.addColorStop(1, '#9c6bff');
      ctx.fillStyle = i === 0 ? '#fff' : grad;
      ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
    });
  }

  function loop() {
    clearInterval(timerId);
    timerId = setInterval(() => {
      if (!running) return;
      step();
      render();
    }, speedMs);
  }

  function handleKey(e) {
    if (widget.classList.contains('open')) {
      // prevent page scroll on arrows while open
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    }
    if (e.key === 'Escape') { closePanel(); return; }
    const k = e.key;
    if (k === ' ') { running = !running; showOverlay(!running); return; }
    if (k === 'ArrowUp' && dir.y !== 1) nextDir = { x: 0, y: -1 };
    else if (k === 'ArrowDown' && dir.y !== -1) nextDir = { x: 0, y: 1 };
    else if (k === 'ArrowLeft' && dir.x !== 1) nextDir = { x: -1, y: 0 };
    else if (k === 'ArrowRight' && dir.x !== -1) nextDir = { x: 1, y: 0 };
    // if any arrow pressed, start running and hide overlay (first move)
    if (!running && (k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight')) {
      running = true;
      showOverlay(false);
    }
  }

  restartBtn?.addEventListener('click', () => { resetGame(); render(); });
  pauseBtn?.addEventListener('click', () => { running = !running; showOverlay(!running); });
  window.addEventListener('keydown', handleKey, { passive: false });

  // Start game when first opened to save resources
  let initialized = false;
  const initIfNeeded = () => { if (!initialized) { initialized = true; resetGame(); render(); } };
  toggle.addEventListener('click', initIfNeeded);
  // If opened programmatically in the future
  const obs = new MutationObserver(() => { if (widget.classList.contains('open')) initIfNeeded(); });
  obs.observe(widget, { attributes: true, attributeFilter: ['class'] });

  function showOverlay(show) {
    if (!overlay) return;
    overlay.classList.toggle('show', !!show);
  }
})();

// Scroll reveal animations
(function revealOnScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sections = document.querySelectorAll('.section');
  const grids = document.querySelectorAll('.grid, .projects');
  sections.forEach(s => s.classList.add('reveal'));
  grids.forEach(g => g.classList.add('reveal-stagger'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(s => io.observe(s));
  grids.forEach(g => io.observe(g));
})();

// Sticky header shadow + scroll-to-top visibility
(function stickyAndTop() {
  const header = document.querySelector('.site-header');
  const toTop = document.getElementById('scrollTopBtn');
  const onScroll = () => {
    const scrolled = window.scrollY > 4;
    header?.classList.toggle('scrolled', scrolled);
    if (toTop) toTop.classList.toggle('show', window.scrollY > 300);
    // bottom bar visibility near page bottom
    const bottomBar = document.querySelector('.bottom-bar');
    const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    if (bottomBar) bottomBar.classList.toggle('hide', nearBottom);
    document.documentElement.classList.toggle('has-bottom-bar', bottomBar && !bottomBar.classList.contains('hide'));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// Language switcher (lazy-load locales)
(function i18nLazy() {
  const select = document.getElementById('langSelect');
  if (!select) return;
  const cache = {};

  function getKey(el) {
    // prefer data-i18n-key; fallback to legacy data-i18n
    return el.getAttribute('data-i18n-key') || el.getAttribute('data-i18n');
  }

  function applyMap(map, lang) {
    document.documentElement.lang = lang;
    // text content/innerHTML
    document.querySelectorAll('[data-i18n],[data-i18n-key]').forEach(el => {
      const key = getKey(el);
      if (!key) return;
      const val = map[key];
      if (val == null) return;
      el.innerHTML = val;
    });
    // attributes mapping, e.g., data-i18n-attr="title,placeholder"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const attrs = el.getAttribute('data-i18n-attr');
      if (!attrs) return;
      attrs.split(',').map(s => s.trim()).forEach(attr => {
        const key = getKey(el) + ':' + attr;
        if (map[key]) el.setAttribute(attr, map[key]);
      });
    });
  }

  async function loadAndApply(lang) {
    if (!cache[lang]) {
      try {
        const res = await fetch(`./locales/${lang}.json`, { cache: 'no-cache' });
        cache[lang] = await res.json();
      } catch (e) {
        // fallback to Vietnamese if fetch fails
        if (lang !== 'vi') return loadAndApply('vi');
      }
    }
    applyMap(cache[lang], lang);
  }

  const urlLang = new URLSearchParams(location.search).get('lang');
  const saved = localStorage.getItem('lang');
  const initial = (urlLang || saved || 'vi').toLowerCase();
  select.value = initial;
  loadAndApply(initial);
  select.addEventListener('change', () => {
    const lang = select.value;
    localStorage.setItem('lang', lang);
    const sp = new URLSearchParams(location.search);
    sp.set('lang', lang);
    history.replaceState(null, '', `${location.pathname}?${sp.toString()}`);
    loadAndApply(lang);
  });
})();

// Bottom bar Email click-to-copy with mouse popup
(function copyEmail() {
  const btn = document.getElementById('copyEmailBtn');
  if (!btn) return;
  const email = 'anhnguyencao20@gmail.com';

  function showCopyPop(x, y) {
    const pop = document.createElement('div');
    pop.className = 'copy-pop';
    pop.textContent = 'Copied';
    document.body.appendChild(pop);
    const pad = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = Math.min(vw - pad, Math.max(pad, x));
    const cy = Math.min(vh - pad, Math.max(pad, y));
    pop.style.left = cx + 'px';
    pop.style.top = cy + 'px';
    requestAnimationFrame(() => pop.classList.add('show'));
    setTimeout(() => {
      pop.classList.remove('show');
      setTimeout(() => pop.remove(), 180);
    }, 900);
  }

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
      }
      const evt = e;
      showCopyPop(evt.clientX || (window.innerWidth - 20), evt.clientY || (window.innerHeight - 20));
    } catch (_) {
      // fallback: navigate to mailto if copy fails
      window.location.href = 'mailto:' + email;
    }
  });
})();

// Cursor-follow tooltips for skill cards (desktop only)
(function cursorTooltips() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) return;
  document.documentElement.classList.add('tooltip-enabled');
  const tooltip = document.createElement('div');
  tooltip.className = 'hover-tooltip';
  document.body.appendChild(tooltip);
  let active = null;

  function onMove(e) {
    if (!active) return;
    const x = e.clientX;
    const y = e.clientY;
    // clamp near viewport edges
    const pad = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = Math.min(vw - pad, Math.max(pad, x));
    const cy = Math.min(vh - pad, Math.max(pad, y));
    tooltip.style.left = cx + 'px';
    tooltip.style.top = cy + 'px';
  }

  function onEnter(e) {
    const el = e.currentTarget;
    const noteHtml = el.getAttribute('data-note-html');
    const note = noteHtml || el.getAttribute('data-note');
    if (!note) return;
    active = e.currentTarget;
    if (noteHtml) tooltip.innerHTML = note; else tooltip.textContent = note;
    tooltip.classList.add('show');
    document.addEventListener('mousemove', onMove);
  }

  function onLeave() {
    active = null;
    tooltip.classList.remove('show');
    document.removeEventListener('mousemove', onMove);
  }

  document.querySelectorAll('.card[data-note]').forEach((el) => {
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
  });
})();



