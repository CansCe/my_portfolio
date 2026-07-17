/*
 * Single source of truth for all translatable strings.
 * Loaded via <script> before script.js so it works identically over
 * http:// and file:// (no fetch, no CORS, no duplicated fallback).
 *
 * Add a key here once; reference it from HTML (data-i18n / data-i18n-attr /
 * data-note-key) or from JS (window.i18n.t('key')). Keep vi and en in sync.
 */
window.LOCALES = {
  vi: {
    // Navigation
    "nav.about": "Thông tin",
    "nav.goal": "Mục tiêu",
    "nav.education": "Học vấn",
    "nav.skills": "Kỹ năng",
    "nav.certs": "Chứng chỉ",
    "nav.projects": "Dự án",
    "nav.others": "Khác",

    // Contact labels
    "labels.birth": "Ngày sinh:",
    "labels.phone": "Điện thoại:",
    "labels.email": "Email:",
    "labels.address": "Địa chỉ:",

    // Objective
    "sections.goal": "Mục tiêu",
    "content.goal": "Tìm môi trường thân thiện, năng động, có cơ hội học hỏi và thăng tiến. Mong muốn tham gia đội ngũ phát triển sản phẩm thực tế, đóng góp giá trị rõ ràng.",

    // Education
    "sections.education": "Học vấn",
    "content.education.title": "Đại học PHENIKAA – Công nghệ thông tin (08/2020 – 01/2026)",
    "content.education.note": "Đã tốt nghiệp",

    // Skills
    "sections.skills": "Kỹ năng",
    "skills.languages.title": "Ngôn ngữ",
    "skills.languages.items": "Tiếng Việt, Anh; sẵn sàng học thêm theo yêu cầu",
    "skills.languages.note": "Tiếng Việt, Anh.",
    "skills.vcs.title": "Hệ thống quản lý mã",
    "skills.vcs.items": "Git, GitHub, Fork",
    "skills.vcs.note": "<strong>Git</strong> flow, Pull Request, Code Review, Fork workflows. <a href='https://github.com/CansCe' target='_blank' rel='noopener'>GitHub</a>",
    "skills.programming.title": "Lập trình",
    "skills.programming.items": "C, C++, C#, HTML, CSS, JavaScript, Markdown",
    "skills.programming.note": "<strong>C/C#</strong>, web basics (<em>HTML/CSS/JS</em>), Markdown cho tài liệu.",
    "skills.office.title": "Ứng dụng văn phòng",
    "skills.office.items": "Word, Excel",
    "skills.office.note": "Soạn thảo tài liệu, bảng tính báo cáo.",
    "skills.game.title": "Game engine",
    "skills.game.items": "Unity, RPG Maker",
    "skills.game.note": "Unity <strong>2D/3D</strong>, RPG Maker: prototyping & gameplay.",
    "skills.qa.title": "Kiểm thử",
    "skills.qa.items": "Automation test cơ bản",
    "skills.qa.note": "Automation test cơ bản cho UI/API.",
    "skills.mobile.title": "Ứng dụng di động",
    "skills.mobile.items": "Flutter, Dart",
    "skills.mobile.note": "Flutter/Dart: app theo dõi sức khỏe, UI responsive.",

    // Certificates
    "sections.certs": "Chứng chỉ",
    "certs.dlbd.title": "Deep Learning & Big Data",
    "certs.link": "liên kết",
    "certs.toeic.note": "(Listening & Reading)",

    // Personal projects
    "sections.projects": "Dự án cá nhân",
    "roles.devdes": "Developer, Designer",
    "roles.dev": "Developer",
    "projects.transmodel": "Model phiên dịch (01/2025 – 03/2023)",
    "projects.transmodel.desc": "PyTorch, CUDA; mô hình Seq2Seq; train trên máy cá nhân và Kaggle",
    "projects.healthapp": "App theo dõi sức khỏe (01/2025 – 03/2023)",

    // Other projects
    "sections.others": "Các dự án khác",
    "others.tds.title": "TopDownShooter – GameDev",
    "others.tds": "làm việc nhóm qua Fork, Unity 2D",
    "others.news.title": "Web đọc báo – Frontend & Backend",

    // Information
    "sections.info": "Thông tin",
    "content.info.title": "Ngày sinh: 18/07/2003",
    "content.info.hometown": "Quê quán: Đông Hưng, Thái Bình",
    "content.info.note": "Tôi là Nguyễn Cao Anh, sinh viên công nghệ thông tin với niềm đam mê mạnh mẽ dành cho công nghệ và sáng tạo. Tôi yêu thích việc tìm hiểu cách công nghệ có thể được ứng dụng để giải quyết các vấn đề thực tế, từ đó mang lại những trải nghiệm tốt hơn cho người dùng. Trong quá trình học tập, tôi không chỉ tập trung vào việc nâng cao kỹ năng lập trình và tư duy logic, mà còn rèn luyện khả năng làm việc nhóm, quản lý dự án và tư duy thiết kế. Tôi tin rằng công nghệ không chỉ là công cụ, mà còn là cầu nối giúp con người tạo nên những giá trị mới. Mục tiêu của tôi là trở thành một lập trình viên sáng tạo, không ngừng học hỏi, thử thách bản thân và đóng góp cho sự phát triển của cộng đồng công nghệ.",

    // Degrees
    "sections.degrees": "Bằng cấp",
    "degrees.current": "Cử nhân Công nghệ thông tin – PHENIKAA",

    // Hero
    "hero.eyebrow": "Lập trình · Game · Mobile · ML",
    "hero.tagline": "Xây dựng game, ứng dụng di động và mô hình ML — từ ý tưởng đến sản phẩm hoàn chỉnh.",
    "hero.available": "Sẵn sàng cho công việc",
    "cta.email": "Liên hệ",
    "cta.projects": "Xem dự án",
    "cta.github": "GitHub",
    "titleblock.title": "HỒ SƠ",

    // Theme toggle
    "theme.light": "Sáng",
    "theme.dark": "Tối",

    // Scroll-to-top button
    "scrolltop.aria": "Lên đầu trang",

    // Copy-email popup
    "copy.done": "Đã sao chép",

    // Snake widget
    "snake.toggle": "Chơi game",
    "snake.toggle.title": "Chơi Snake",
    "snake.title": "Snake",
    "snake.panel.aria": "Trò chơi Snake",
    "snake.restart.title": "Chơi lại",
    "snake.pause.title": "Tạm dừng/tiếp tục",
    "snake.high.prefix": "HS:",
    "snake.overlay.tip": "Dùng phím mũi tên để di chuyển",
    "snake.overlay.sub": "Space: tạm dừng • Esc: thu gọn",
    "snake.hint": "Mũi tên để di chuyển. Space để Pause. Esc để thu gọn.",

    // Easter-egg popups
    "admin.congrats": "Chúc mừng, bạn giờ là ADMIN",
    "admin.ok": "OkAy",
    "admin.clicksRemaining": "Còn {n} lần click để thành admin",
    "hint.clickThis": "Bấm vào đây",
    "hint.twoMore": "2 lần nữa"
  },

  en: {
    // Navigation
    "nav.about": "About",
    "nav.goal": "Objective",
    "nav.education": "Education",
    "nav.skills": "Skills",
    "nav.certs": "Certificates",
    "nav.projects": "Projects",
    "nav.others": "Others",

    // Contact labels
    "labels.birth": "Birth date:",
    "labels.phone": "Phone:",
    "labels.email": "Email:",
    "labels.address": "Address:",

    // Objective
    "sections.goal": "Objective",
    "content.goal": "Seek a friendly, dynamic environment with growth and learning opportunities. Aim to join a real product team and contribute clear value.",

    // Education
    "sections.education": "Education",
    "content.education.title": "PHENIKAA University – Information Technology (08/2020 – 01/2026)",
    "content.education.note": "Graduated",

    // Skills
    "sections.skills": "Skills",
    "skills.languages.title": "Languages",
    "skills.languages.items": "Vietnamese, English, and willing to learn more per requested",
    "skills.languages.note": "Vietnamese, English",
    "skills.vcs.title": "Version control",
    "skills.vcs.items": "Git, GitHub, Fork",
    "skills.vcs.note": "<strong>Git</strong> flow, Pull Requests, Code Review, Fork workflows. <a href='https://github.com/CansCe' target='_blank' rel='noopener'>GitHub</a>",
    "skills.programming.title": "Programming",
    "skills.programming.items": "C, C++, C#, HTML, CSS, JavaScript, Markdown",
    "skills.programming.note": "<strong>C/C#</strong>, web basics (<em>HTML/CSS/JS</em>), Markdown for docs.",
    "skills.office.title": "Office apps",
    "skills.office.items": "Word, Excel",
    "skills.office.note": "Document editing, reporting spreadsheets.",
    "skills.game.title": "Game engines",
    "skills.game.items": "Unity, RPG Maker",
    "skills.game.note": "Unity <strong>2D/3D</strong>, RPG Maker: prototyping & gameplay.",
    "skills.qa.title": "Testing",
    "skills.qa.items": "Basic automation testing",
    "skills.qa.note": "Basic automation testing for UI/API.",
    "skills.mobile.title": "Mobile",
    "skills.mobile.items": "Flutter, Dart",
    "skills.mobile.note": "Flutter/Dart: health tracking app, responsive UI.",

    // Certificates
    "sections.certs": "Certificates",
    "certs.dlbd.title": "Deep Learning & Big Data",
    "certs.link": "link",
    "certs.toeic.note": "(Listening & Reading)",

    // Personal projects
    "sections.projects": "Personal projects",
    "roles.devdes": "Developer, Designer",
    "roles.dev": "Developer",
    "projects.transmodel": "Translation model (01/2025 – 03/2023)",
    "projects.transmodel.desc": "PyTorch, CUDA; Seq2Seq model; trained on personal machine and Kaggle",
    "projects.healthapp": "Health tracking app (01/2025 – 03/2023)",

    // Other projects
    "sections.others": "Other projects",
    "others.tds.title": "TopDownShooter – GameDev",
    "others.tds": "teamwork via Fork, Unity 2D",
    "others.news.title": "News reader web – Frontend & Backend",

    // Information
    "sections.info": "Information",
    "content.info.title": "Birth date: 18/07/2003",
    "content.info.hometown": "Hometown: Dong Hung, Thai Binh",
    "content.info.note": "I am Nguyen Cao Anh, an Information Technology student with a strong passion for technology and creativity. I enjoy exploring how technology can be applied to solve real-world problems and improve user experiences. Throughout my studies, I have focused on building programming skills and logical thinking while also strengthening teamwork, project management, and design thinking. I believe technology is not only a tool but also a bridge that helps people create new value. My goal is to become a creative developer who continuously learns, challenges myself, and contributes to the growth of the tech community.",

    // Degrees
    "sections.degrees": "Degrees",
    "degrees.current": "B.Sc. in Information Technology – PHENIKAA",

    // Hero
    "hero.eyebrow": "Developer · Game · Mobile · ML",
    "hero.tagline": "Building games, mobile apps and ML models — from idea to functinally working product.",
    "hero.available": "Available for work",
    "cta.email": "Get in touch",
    "cta.projects": "View projects",
    "cta.github": "GitHub",
    "titleblock.title": "PROFILE",

    // Theme toggle
    "theme.light": "Light",
    "theme.dark": "Dark",

    // Scroll-to-top button
    "scrolltop.aria": "Back to top",

    // Copy-email popup
    "copy.done": "Copied",

    // Snake widget
    "snake.toggle": "Play a game",
    "snake.toggle.title": "Play Snake",
    "snake.title": "Snake",
    "snake.panel.aria": "Snake game",
    "snake.restart.title": "Restart",
    "snake.pause.title": "Pause/Resume",
    "snake.high.prefix": "HS:",
    "snake.overlay.tip": "Use arrow keys to move",
    "snake.overlay.sub": "Space: pause • Esc: collapse",
    "snake.hint": "Arrows to move. Space to pause. Esc to collapse.",

    // Easter-egg popups
    "admin.congrats": "Congrats, you are now an ADMIN",
    "admin.ok": "OkAy",
    "admin.clicksRemaining": "{n} more clicks to become admin",
    "hint.clickThis": "Click this",
    "hint.twoMore": "2 more times"
  }
};
