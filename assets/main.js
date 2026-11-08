(function () {
  var KEY = 'site-lang';
  var THEME_KEY = 'site-theme';
  var root = document.documentElement;
  var titles = {
    ru: root.getAttribute('data-title-ru') || 'Олег Москвичев — разработка и интеграция 1С',
    en: root.getAttribute('data-title-en') || 'Oleg Moskvichev — 1C development & integration'
  };
  var buttons = document.querySelectorAll('[data-set-lang]');
  var themeBtn = document.querySelector('[data-toggle-theme]');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var themeColors = { dark: '#070b0f', light: '#f2f5f7' };
  var themeLabels = {
    ru: { dark: 'Включить светлую тему', light: 'Включить тёмную тему' },
    en: { dark: 'Switch to light theme', light: 'Switch to dark theme' }
  };

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    if (themeMeta) themeMeta.setAttribute('content', themeColors[theme]);
    if (themeBtn) {
      var dict = themeLabels[root.lang] || themeLabels.ru;
      themeBtn.setAttribute('aria-label', dict[theme]);
      themeBtn.setAttribute('title', dict[theme]);
    }
  }

  function apply(lang) {
    root.lang = lang;
    if (!root.hasAttribute('data-static-title')) {
      document.title = titles[lang] || titles.ru;
    }
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
    });
    if (themeBtn) applyTheme(currentTheme());
    updateLightboxLabels();
  }

  function detect() {
    var fromQuery = new URLSearchParams(location.search).get('lang');
    if (titles[fromQuery]) return fromQuery;
    var stored;
    try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
    if (titles[stored]) return stored;
    return 'ru';
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.dataset.setLang;
      apply(lang);
      try { localStorage.setItem(KEY, lang); } catch (e) { /* приватный режим */ }
    });
  });

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* приватный режим */ }
    });
  }

  var galleryLinks = document.querySelectorAll('.gallery a[href]');
  var lightbox = null;
  var lightboxImg = null;
  var lightboxCaption = null;
  var lightboxClose = null;
  var lightboxTrigger = null;
  var lightboxLabels = {
    ru: { dialog: 'Просмотр скриншота', close: 'Закрыть' },
    en: { dialog: 'Screenshot preview', close: 'Close' }
  };

  function buildLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.innerHTML =
      '<button type="button" class="lightbox-close"></button>' +
      '<figure class="lightbox-figure">' +
      '<img class="lightbox-img" alt="">' +
      '<figcaption class="lightbox-caption"></figcaption>' +
      '</figure>';
    lightboxImg = lightbox.querySelector('.lightbox-img');
    lightboxCaption = lightbox.querySelector('.lightbox-caption');
    lightboxClose = lightbox.querySelector('.lightbox-close');

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.body.appendChild(lightbox);
  }

  function updateLightboxLabels() {
    if (!lightbox) return;
    var dict = lightboxLabels[root.lang] || lightboxLabels.ru;
    lightbox.setAttribute('aria-label', dict.dialog);
    lightboxClose.setAttribute('aria-label', dict.close);
    lightboxClose.setAttribute('title', dict.close);
  }

  function openLightbox(link) {
    if (!lightbox) buildLightbox();
    var img = link.querySelector('img');
    var figure = link.closest('figure');
    var caption = figure ? figure.querySelector('figcaption') : null;

    lightboxImg.src = link.getAttribute('href');
    lightboxImg.alt = img ? img.alt : '';
    if (caption && caption.textContent.trim()) {
      lightboxCaption.innerHTML = caption.innerHTML;
      lightboxCaption.hidden = false;
    } else {
      lightboxCaption.innerHTML = '';
      lightboxCaption.hidden = true;
    }
    updateLightboxLabels();

    lightboxTrigger = link;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.body.classList.remove('lightbox-open');
    if (lightboxTrigger) lightboxTrigger.focus();
    lightboxTrigger = null;
  }

  galleryLinks.forEach(function (link) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openLightbox(link);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      lightboxClose.focus();
    }
  });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var storedTheme;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch (e) { storedTheme = null; }
  applyTheme(storedTheme === 'light' ? 'light' : 'dark');
  apply(detect());
})();
