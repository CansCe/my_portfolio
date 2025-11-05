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
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// Language switcher (VI/EN)
(function i18n() {
  const select = document.getElementById('langSelect');
  if (!select) return;
  const dict = {
    vi: {
      'nav.about': 'Thông tin',
      'nav.goal': 'Mục tiêu',
      'nav.education': 'Học vấn',
      'nav.skills': 'Kỹ năng',
      'nav.certs': 'Chứng chỉ',
      'nav.projects': 'Dự án',
      'nav.others': 'Khác',
      'labels.birth': 'Ngày sinh:',
      'labels.phone': 'Điện thoại:',
      'labels.email': 'Email:',
      'labels.address': 'Địa chỉ:',
      'sections.goal': 'Mục tiêu',
      'content.goal': 'Tìm môi trường thân thiện, năng động, có cơ hội học hỏi và thăng tiến. Mong muốn tham gia đội ngũ phát triển sản phẩm thực tế, đóng góp giá trị rõ ràng.',
      'sections.education': 'Học vấn',
      'content.education.title': 'Đại học PHENIKAA – Công nghệ thông tin (08/2020 – nay)',
      'content.education.note': 'Sinh viên năm 4',
      'sections.skills': 'Kỹ năng',
      'skills.languages.title': 'Ngôn ngữ',
      'skills.languages.items': 'Việt, Anh, Nhật; sẵn sàng học thêm khi cần',
      'skills.vcs.title': 'Hệ thống quản lý mã',
      'skills.vcs.items': 'Git, GitHub, Fork',
      'skills.programming.title': 'Lập trình',
      'skills.programming.items': 'C, C++, C#, HTML, CSS, JavaScript, Markdown',
      'skills.office.title': 'Ứng dụng văn phòng',
      'skills.office.items': 'Word, Excel',
      'skills.game.title': 'Game engine',
      'skills.game.items': 'Unity, RPG Maker',
      'skills.qa.title': 'Kiểm thử',
      'skills.qa.items': 'Automation test cơ bản',
      'skills.mobile.title': 'Ứng dụng di động',
      'skills.mobile.items': 'Flutter, Dart',
      'sections.certs': 'Chứng chỉ',
      'certs.dlbd.title': 'Deep Learning & Big Data',
      'certs.link': 'liên kết',
      'certs.toeic.note': '(Listening & Reading)',
      'sections.projects': 'Dự án cá nhân',
      'roles.devdes': 'Developer, Designer',
      'roles.dev': 'Developer',
      'projects.transmodel': 'Model phiên dịch (01/2025 – 03/2023)',
      'projects.transmodel.desc': 'PyTorch, CUDA; mô hình Seq2Seq; train trên máy cá nhân và Kaggle',
      'projects.healthapp': 'App theo dõi sức khỏe (01/2025 – 03/2023)',
      'sections.others': 'Các dự án khác',
      'others.tds': 'làm việc nhóm qua Fork, Unity 2D'
    },
    en: {
      'nav.about': 'About',
      'nav.goal': 'Objective',
      'nav.education': 'Education',
      'nav.skills': 'Skills',
      'nav.certs': 'Certificates',
      'nav.projects': 'Projects',
      'nav.others': 'Others',
      'labels.birth': 'Birth date:',
      'labels.phone': 'Phone:',
      'labels.email': 'Email:',
      'labels.address': 'Address:',
      'sections.goal': 'Objective',
      'content.goal': 'Seek a friendly, dynamic environment with growth and learning opportunities. Aim to join a real product team and contribute clear value.',
      'sections.education': 'Education',
      'content.education.title': 'PHENIKAA University – Information Technology (08/2020 – present)',
      'content.education.note': '4th-year student',
      'sections.skills': 'Skills',
      'skills.languages.title': 'Languages',
      'skills.languages.items': 'Vietnamese, English, Japanese; willing to learn more as needed',
      'skills.vcs.title': 'Version control',
      'skills.vcs.items': 'Git, GitHub, Fork',
      'skills.programming.title': 'Programming',
      'skills.programming.items': 'C, C++, C#, HTML, CSS, JavaScript, Markdown',
      'skills.office.title': 'Office apps',
      'skills.office.items': 'Word, Excel',
      'skills.game.title': 'Game engines',
      'skills.game.items': 'Unity, RPG Maker',
      'skills.qa.title': 'Testing',
      'skills.qa.items': 'Basic automation testing',
      'skills.mobile.title': 'Mobile',
      'skills.mobile.items': 'Flutter, Dart',
      'sections.certs': 'Certificates',
      'certs.dlbd.title': 'Deep Learning & Big Data',
      'certs.link': 'link',
      'certs.toeic.note': '(Listening & Reading)',
      'sections.projects': 'Personal projects',
      'roles.devdes': 'Developer, Designer',
      'roles.dev': 'Developer',
      'projects.transmodel': 'Translation model (01/2025 – 03/2023)',
      'projects.transmodel.desc': 'PyTorch, CUDA; Seq2Seq model; trained on personal machine and Kaggle',
      'projects.healthapp': 'Health tracking app (01/2025 – 03/2023)',
      'sections.others': 'Other projects',
      'others.tds': 'teamwork via Fork, Unity 2D'
    }
  };

  const applyLang = (lang) => {
    const map = dict[lang] || dict.vi;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && map[key]) el.innerHTML = map[key];
    });
  };

  const saved = localStorage.getItem('lang') || 'vi';
  select.value = saved;
  applyLang(saved);
  select.addEventListener('change', () => {
    const lang = select.value;
    localStorage.setItem('lang', lang);
    applyLang(lang);
  });
})();



