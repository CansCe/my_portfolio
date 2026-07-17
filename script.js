// i18n core — single source of truth is window.LOCALES (locales/locales.js).
// Exposes window.i18n so both static markup and runtime JS resolve the same
// strings: t(key) reads the current language (falling back to vi, then the raw
// key); setLang() switches; onChange() lets dynamic UI re-render on switch.
window.i18n = (function i18nCore() {
  const LOCALES = window.LOCALES || { vi: {}, en: {} };
  const listeners = [];
  let lang = 'vi';

  function t(key, vars) {
    const map = LOCALES[lang] || {};
    let val = map[key];
    if (val == null) val = (LOCALES.vi || {})[key];
    if (val == null) val = key;
    if (vars) {
      Object.keys(vars).forEach(name => {
        val = val.replace('{' + name + '}', vars[name]);
      });
    }
    return val;
  }

  function apply() {
    const map = LOCALES[lang] || {};
    document.documentElement.lang = lang;

    // Element text/innerHTML: data-i18n (legacy) or data-i18n-key.
    document.querySelectorAll('[data-i18n],[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key') || el.getAttribute('data-i18n');
      if (key && map[key] != null) el.innerHTML = map[key];
    });

    // Attributes: data-i18n-attr="attr:key,attr2:key2"
    // e.g. data-i18n-attr="aria-label:snake.toggle,title:snake.toggle.title"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(',').forEach(pair => {
        const idx = pair.indexOf(':');
        if (idx < 0) return;
        const attr = pair.slice(0, idx).trim();
        const key = pair.slice(idx + 1).trim();
        if (attr && key && map[key] != null) el.setAttribute(attr, map[key]);
      });
    });

    listeners.forEach(fn => { try { fn(lang); } catch (_) {} });
  }

  function setLang(next) {
    lang = (next || 'vi').toLowerCase();
    if (!LOCALES[lang]) lang = 'vi';
    apply();
  }

  function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }

  // Initial language: ?lang= > saved > vi
  const urlLang = new URLSearchParams(location.search).get('lang');
  const savedLang = localStorage.getItem('lang');
  lang = (urlLang || savedLang || 'vi').toLowerCase();
  if (!LOCALES[lang]) lang = 'vi';

  const select = document.getElementById('langSelect');
  if (select) {
    select.value = lang;
    select.addEventListener('change', () => {
      const next = select.value;
      localStorage.setItem('lang', next);
      const sp = new URLSearchParams(location.search);
      sp.set('lang', next);
      history.replaceState(null, '', `${location.pathname}?${sp.toString()}`);
      setLang(next);
    });
  }

  apply(); // translate the static page on load

  return { t, apply, setLang, onChange, get lang() { return lang; } };
})();

// Theme persistence
function updateThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isLight = document.documentElement.classList.contains('light');
  btn.textContent = window.i18n.t(isLight ? 'theme.light' : 'theme.dark');
}
(function () {
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const saved = localStorage.getItem('theme');
  const isLight = saved ? saved === 'light' : prefersLight;
  if (isLight) document.documentElement.classList.add('light');
  updateThemeToggle();
})();
// Keep the toggle label translated when the language changes.
window.i18n.onChange(updateThemeToggle);

// Toggle theme
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const html = document.documentElement;
  const toLight = !html.classList.contains('light');
  html.classList.toggle('light', toLight);
  localStorage.setItem('theme', toLight ? 'light' : 'dark');
  updateThemeToggle();
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

  // Show the stored high score with the translated prefix before the first
  // game starts, and keep the prefix correct if the language changes.
  const renderHigh = () => {
    if (!highEl) return;
    const stored = Number(localStorage.getItem('snakeHighScore') || '0');
    const hs = Number.isFinite(stored) ? stored : 0;
    highEl.textContent = `${window.i18n.t('snake.high.prefix')} ${hs}`;
  };
  renderHigh();
  window.i18n.onChange(renderHigh);

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
    if (highEl) highEl.textContent = `${window.i18n.t('snake.high.prefix')} ${highScore}`;
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
        if (highEl) highEl.textContent = `${window.i18n.t('snake.high.prefix')} ${highScore}`;
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

// (i18n core is defined at the top of this file so it is ready before the
// theme toggle and other modules call window.i18n.t.)

// Bottom bar Email click-to-copy with mouse popup
(function copyEmail() {
  const btn = document.getElementById('copyEmailBtn');
  if (!btn) return;
  const email = 'anhnguyencao20@gmail.com';

  function showCopyPop(x, y) {
    const pop = document.createElement('div');
    pop.className = 'copy-pop';
    pop.textContent = window.i18n.t('copy.done');
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
    const key = el.getAttribute('data-note-key');
    if (!key) return;
    active = el;
    // Notes are trusted author content (may include <strong>/<em>/<a>).
    tooltip.innerHTML = window.i18n.t(key);
    tooltip.classList.add('show');
    document.addEventListener('mousemove', onMove);
  }

  function onLeave() {
    active = null;
    tooltip.classList.remove('show');
    document.removeEventListener('mousemove', onMove);
  }

  document.querySelectorAll('.card[data-note-key]').forEach((el) => {
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
  });
})();



// Easter Egg: Hidden hotspot triggers a falling bomb that explodes
(function bombEasterEgg() {
  const hotspot = document.getElementById('eggHotspot');
  if (!hotspot) return;

  function spawnBomb() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Minimal effect: small flash near the corner
      const flash = document.createElement('div');
      flash.className = 'explosion';
      flash.style.left = (window.innerWidth - 40) + 'px';
      flash.style.top = '40px';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 700);
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = Math.round(0.12 * vw + Math.random() * 0.76 * vw);
    const bomb = document.createElement('div');
    bomb.className = 'bomb falling';
    bomb.style.setProperty('--x', x + 'px');
    // Duration scaled to viewport height
    const base = 1.8;
    const dur = Math.min(2.8, Math.max(1.2, (vh / 900) * base));
    bomb.style.setProperty('--fall-duration', dur + 's');
    document.body.appendChild(bomb);

    const onEnd = () => {
      bomb.removeEventListener('animationend', onEnd);
      const y = vh - 40; // slightly above bottom
      bomb.remove();
      explodeAt(x, y);
    };
    bomb.addEventListener('animationend', onEnd);
  }

  function explodeAt(x, y) {
    // central boom
    const boom = document.createElement('div');
    boom.className = 'explosion';
    boom.style.left = x + 'px';
    boom.style.top = y + 'px';
    document.body.appendChild(boom);
    setTimeout(() => boom.remove(), 700);

    // particles
    const colors = ['#ffd166', '#ff6b6b', '#fca311', '#ff9f1c', '#f94144'];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.8 - 0.4);
      const dist = 80 + Math.random() * 120;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist * 0.9;
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.background = colors[i % colors.length];
      p.style.boxShadow = '0 0 0 1px rgba(255,255,255,.08)';
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  hotspot.addEventListener('click', (e) => {
    e.stopPropagation();
    spawnBomb();
  });
})();

// Admin-click Easter Egg on name
(function adminClickEasterEgg() {
  const nameEl = document.querySelector('.brand-text .name');
  if (!nameEl) return;

  let totalClicks = 0;
  let started = false;
  let remaining = 5;

  function showHint(msg, x, y) {
    // Only one hint bubble at a time — clear any that's still showing.
    document.querySelectorAll('.click-pop').forEach((n) => n.remove());
    const div = document.createElement('div');
    div.className = 'click-pop';
    div.textContent = msg;
    document.body.appendChild(div);
    const pad = 14;
    const vw = window.innerWidth, vh = window.innerHeight;
    const cx = Math.min(vw - pad, Math.max(pad, x));
    const cy = Math.min(vh - pad, Math.max(pad, y));
    div.style.left = cx + 'px';
    div.style.top = cy + 'px';
    requestAnimationFrame(() => div.classList.add('show'));
    setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 160); }, 900);
  }

  function showAdminModal(onOk) {
    // The modal supersedes any lingering hint bubble.
    document.querySelectorAll('.click-pop').forEach((n) => n.remove());
    const backdrop = document.createElement('div');
    backdrop.className = 'admin-modal-backdrop';
    backdrop.innerHTML = `
      <div class="admin-modal" role="dialog" aria-modal="true">
        <h3 class="title">${window.i18n.t('admin.congrats')}</h3>
        <button class="btn" id="adminOkBtn">${window.i18n.t('admin.ok')}</button>
      </div>`;
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('show'));
    const ok = backdrop.querySelector('#adminOkBtn');
    ok?.addEventListener('click', () => {
      backdrop.classList.remove('show');
      setTimeout(() => backdrop.remove(), 180);
      onOk?.();
    });
  }

  function doJumpscare() {
    const ov = document.createElement('div');
    ov.className = 'jumpscare-overlay';
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('show'));
    setTimeout(() => {
      const img = document.createElement('img');
      img.src = './assets/giphy.gif';
      img.alt = '';
      ov.appendChild(img);
    }, 500);
    // Dismiss on click or after 6s
    const cleanup = () => { ov.classList.remove('show'); setTimeout(() => ov.remove(), 220); };
    ov.addEventListener('click', cleanup, { once: true });
    setTimeout(cleanup, 6000);
  }

  nameEl.addEventListener('click', (e) => {
    totalClicks += 1;
    if (!started && totalClicks > 3) {
      started = true; remaining = 5;
    }
    if (!started) return;

    if (remaining > 0) {
      showHint(window.i18n.t('admin.clicksRemaining', { n: remaining }), e.clientX, e.clientY);
      remaining -= 1;
    }
    if (remaining === 0) {
      // Prevent multiple triggers on same render frame
      remaining = -1;
      showAdminModal(() => doJumpscare());
    }
  });
})();

// 30s timed hint to guide users to click the name
(function timedNameHint() {
  const nameEl = document.querySelector('.brand-text .name');
  if (!nameEl) return;

  let pointerEl = null;
  let shown = false;
  let reminderId = null;
  let timer = null;

  function placePointer() {
    if (!pointerEl) return;
    const r = nameEl.getBoundingClientRect();
    // place pointer up-left of the name
    const x = r.left - 80;
    const y = Math.max(8, r.top - 40);
    pointerEl.style.left = x + 'px';
    pointerEl.style.top = y + 'px';
  }

  function showPointer() {
    if (shown) return;
    shown = true;
    pointerEl = document.createElement('div');
    pointerEl.className = 'name-pointer';
    pointerEl.innerHTML = `<span class="arrow">↗</span><span class="label">${window.i18n.t('hint.clickThis')}</span>`;
    document.body.appendChild(pointerEl);
    placePointer();
    requestAnimationFrame(() => pointerEl.classList.add('show'));
    window.addEventListener('resize', placePointer);
    window.addEventListener('scroll', placePointer, { passive: true });
    // gentle re-emphasis every ~10s until clicked
    reminderId = setInterval(() => {
      if (!pointerEl) return;
      pointerEl.classList.remove('show');
      setTimeout(() => pointerEl && pointerEl.classList.add('show'), 80);
    }, 10000);
  }

  function hidePointer() {
    if (!pointerEl) return;
    pointerEl.classList.remove('show');
    const el = pointerEl; pointerEl = null;
    setTimeout(() => el.remove(), 160);
    window.removeEventListener('resize', placePointer);
    window.removeEventListener('scroll', placePointer);
    if (reminderId) { clearInterval(reminderId); reminderId = null; }
  }

  function showMiniPop(msg, x, y) {
    // Only one hint bubble at a time — clear any that's still showing.
    document.querySelectorAll('.click-pop').forEach((n) => n.remove());
    const div = document.createElement('div');
    div.className = 'click-pop';
    div.textContent = msg;
    document.body.appendChild(div);
    const pad = 14;
    const vw = window.innerWidth, vh = window.innerHeight;
    const cx = Math.min(vw - pad, Math.max(pad, x));
    const cy = Math.min(vh - pad, Math.max(pad, y));
    div.style.left = cx + 'px';
    div.style.top = cy + 'px';
    requestAnimationFrame(() => div.classList.add('show'));
    setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 160); }, 900);
  }

  timer = setTimeout(showPointer, 30000);

  nameEl.addEventListener('click', (e) => {
    if (!shown) return; // only react if pointer was shown
    if (timer) { clearTimeout(timer); timer = null; }
    hidePointer();
    showMiniPop(window.i18n.t('hint.twoMore'), e.clientX, e.clientY);
  });
})();
