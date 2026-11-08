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
  var feedbackLabels = {
    ru: { dialog: 'Заявка', close: 'Закрыть', open: 'Оставить заявку' },
    en: { dialog: 'Request', close: 'Close', open: 'Request a quote' }
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
    updateFeedbackLabels();
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

  /* Форма заявки: плавающая кнопка + модалка с формой Яндекс Форм.
     URL формы задаётся здесь или атрибутом data-feedback-form на <html>. */
  var FEEDBACK_FORM = root.getAttribute('data-feedback-form') || 'https://forms.yandex.ru/u/6af07f5b9029023a7359b948?iframe=1';
  var feedbackBtn = null;
  var feedbackDialog = null;
  var feedbackFrame = null;
  var feedbackClose = null;

  function buildFeedback() {
    feedbackBtn = document.createElement('button');
    feedbackBtn.type = 'button';
    feedbackBtn.className = 'feedback-btn';
    feedbackBtn.setAttribute('aria-haspopup', 'dialog');
    feedbackBtn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9.5L5 21v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>' +
      '<span><span class="i18n-ru">Оставить заявку</span><span class="i18n-en">Request a quote</span></span>';

    feedbackDialog = document.createElement('div');
    feedbackDialog.className = 'feedback';
    feedbackDialog.hidden = true;
    feedbackDialog.setAttribute('role', 'dialog');
    feedbackDialog.setAttribute('aria-modal', 'true');
    feedbackDialog.setAttribute('aria-labelledby', 'feedback-title');
    feedbackDialog.innerHTML =
      '<div class="feedback-panel">' +
      '<button type="button" class="feedback-close"></button>' +
      '<h2 class="feedback-title" id="feedback-title"><span class="i18n-ru">Оставить заявку</span><span class="i18n-en">Send a request</span></h2>' +
      '<p class="feedback-hint"><span class="i18n-ru">Отвечу в течение рабочего дня.</span><span class="i18n-en">I reply within one business day.</span></p>' +
      (FEEDBACK_FORM
        ? '<div class="feedback-frame"><iframe title="Форма заявки" loading="lazy"></iframe></div>' +
          '<p class="feedback-fallback"><span class="i18n-ru">Не открывается? Напишите на <a href="mailto:m_aster@inbox.ru">m_aster@inbox.ru</a> или в <a href="https://t.me/Master_OL" target="_blank" rel="noopener">Telegram</a>.</span><span class="i18n-en">Form not working? Email <a href="mailto:m_aster@inbox.ru">m_aster@inbox.ru</a> or use <a href="https://t.me/Master_OL" target="_blank" rel="noopener">Telegram</a>.</span></p>'
        : '<p class="feedback-note"><span class="i18n-ru">Напишите на <a href="mailto:m_aster@inbox.ru">m_aster@inbox.ru</a> или в <a href="https://t.me/Master_OL" target="_blank" rel="noopener">Telegram</a> — этого достаточно, чтобы обсудить задачу.</span><span class="i18n-en">Email <a href="mailto:m_aster@inbox.ru">m_aster@inbox.ru</a> or message me on <a href="https://t.me/Master_OL" target="_blank" rel="noopener">Telegram</a> — that is enough to discuss your task.</span></p>') +
      '</div>';

    feedbackFrame = feedbackDialog.querySelector('iframe');
    feedbackClose = feedbackDialog.querySelector('.feedback-close');

    feedbackClose.addEventListener('click', closeFeedback);
    feedbackDialog.addEventListener('click', function (e) {
      if (e.target === feedbackDialog) closeFeedback();
    });
    feedbackBtn.addEventListener('click', openFeedback);

    document.body.appendChild(feedbackBtn);
    document.body.appendChild(feedbackDialog);
  }

  function updateFeedbackLabels() {
    if (!feedbackDialog) return;
    var dict = feedbackLabels[root.lang] || feedbackLabels.ru;
    feedbackDialog.setAttribute('aria-label', dict.dialog);
    feedbackClose.setAttribute('aria-label', dict.close);
    feedbackClose.setAttribute('title', dict.close);
    feedbackBtn.setAttribute('aria-label', dict.open);
    feedbackBtn.setAttribute('title', dict.open);
  }

  function openFeedback() {
    if (!feedbackDialog) buildFeedback();
    if (feedbackFrame && !feedbackFrame.getAttribute('src')) feedbackFrame.src = FEEDBACK_FORM;
    updateFeedbackLabels();
    feedbackDialog.hidden = false;
    document.body.classList.add('feedback-open');
    feedbackClose.focus();
    if (window.siteGoal) window.siteGoal('feedback_open');
  }

  function closeFeedback() {
    if (!feedbackDialog || feedbackDialog.hidden) return;
    feedbackDialog.hidden = true;
    document.body.classList.remove('feedback-open');
    feedbackBtn.focus();
  }

  buildFeedback();
  updateFeedbackLabels();

  document.addEventListener('keydown', function (e) {
    if (!feedbackDialog || feedbackDialog.hidden) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeFeedback();
    }
  });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var storedTheme;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch (e) { storedTheme = null; }
  applyTheme(storedTheme === 'light' ? 'light' : 'dark');
  apply(detect());
})();
