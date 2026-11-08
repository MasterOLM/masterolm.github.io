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
    ru: {
      dialog: 'Заявка', close: 'Закрыть', open: 'Оставить заявку',
      needContact: 'Укажите e-mail или телефон — иначе не смогу ответить.',
      needMessage: 'Напишите пару слов о задаче.',
      needConsent: 'Нужно согласие на обработку персональных данных.',
      opened: 'Готово. В открывшемся окне нажмите «Отправить» — скриншоты и файлы можно приложить там же.'
    },
    en: {
      dialog: 'Request', close: 'Close', open: 'Request a quote',
      needContact: 'Please add an e-mail or phone number, otherwise I cannot reply.',
      needMessage: 'Please describe your task in a few words.',
      needConsent: 'Consent to personal data processing is required.',
      opened: 'Done. Press “Send” in the window that opened — you can attach screenshots there.'
    }
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
    updateShotsLabels();
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

  /* Скриншоты в модальном окне: кнопка в шапке страницы продукта.
     Кадры описаны в <script type="application/json" id="shots-data"> и
     подгружаются только после открытия окна. */
  var shotsOpen = document.querySelector('[data-shots-open]');
  var shotsDataEl = document.getElementById('shots-data');
  var shotsModal = null;
  var shotsList = [];
  var shotsThumbButtons = [];
  var shotsIndex = 0;
  var shotsTrigger = null;
  var shotsLabels = {
    ru: { dialog: 'Скриншоты «Обмен JSON»', close: 'Закрыть', prev: 'Предыдущий скриншот', next: 'Следующий скриншот', frame: 'Скриншот' },
    en: { dialog: '“JSON Exchange” screenshots', close: 'Close', prev: 'Previous screenshot', next: 'Next screenshot', frame: 'Screenshot' }
  };

  function shotsDict() {
    return shotsLabels[root.lang] || shotsLabels.ru;
  }

  function shotsCaption(item) {
    return (root.lang === 'en' ? item.en : item.ru) || item.ru || item.en || '';
  }

  function showShots(index) {
    if (!shotsModal || !shotsList.length) return;
    shotsIndex = (index + shotsList.length) % shotsList.length;
    var item = shotsList[shotsIndex];
    var img = shotsModal.querySelector('.lightbox-img');
    img.src = item.src;
    img.alt = item.alt || shotsCaption(item);
    shotsModal.querySelector('.lightbox-caption').textContent = shotsCaption(item);
    shotsModal.querySelector('[data-shots-index]').textContent = String(shotsIndex + 1);
    shotsThumbButtons.forEach(function (btn, i) {
      btn.setAttribute('aria-current', i === shotsIndex ? 'true' : 'false');
    });
  }

  function buildShots() {
    shotsModal = document.createElement('div');
    shotsModal.className = 'lightbox shots-modal';
    shotsModal.hidden = true;
    shotsModal.setAttribute('role', 'dialog');
    shotsModal.setAttribute('aria-modal', 'true');
    shotsModal.innerHTML =
      '<button type="button" class="lightbox-close"></button>' +
      '<p class="shots-count" aria-live="polite"><span data-shots-index>1</span> / ' + shotsList.length + '</p>' +
      '<button type="button" class="shots-nav prev" data-shots-prev></button>' +
      '<button type="button" class="shots-nav next" data-shots-next></button>' +
      '<figure class="lightbox-figure">' +
      '<img class="lightbox-img" alt="">' +
      '<figcaption class="lightbox-caption"></figcaption>' +
      '<ul class="shots-thumbs" data-shots-thumbs></ul>' +
      '</figure>';

    shotsModal.querySelector('.lightbox-close').addEventListener('click', closeShots);
    shotsModal.querySelector('[data-shots-prev]').addEventListener('click', function () {
      showShots(shotsIndex - 1);
    });
    shotsModal.querySelector('[data-shots-next]').addEventListener('click', function () {
      showShots(shotsIndex + 1);
    });
    shotsModal.addEventListener('click', function (e) {
      if (e.target === shotsModal) closeShots();
    });

    var thumbs = shotsModal.querySelector('[data-shots-thumbs]');
    shotsList.forEach(function (item, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      var thumb = document.createElement('img');
      btn.type = 'button';
      btn.className = 'shots-thumb';
      thumb.alt = '';
      thumb.loading = 'lazy';
      thumb.decoding = 'async';
      thumb.src = item.src;
      btn.appendChild(thumb);
      btn.addEventListener('click', function () { showShots(i); });
      li.appendChild(btn);
      thumbs.appendChild(li);
      shotsThumbButtons.push(btn);
    });

    document.body.appendChild(shotsModal);
  }

  function updateShotsLabels() {
    if (!shotsModal) return;
    var dict = shotsDict();
    var close = shotsModal.querySelector('.lightbox-close');
    var prev = shotsModal.querySelector('[data-shots-prev]');
    var next = shotsModal.querySelector('[data-shots-next]');
    shotsModal.setAttribute('aria-label', dict.dialog);
    close.setAttribute('aria-label', dict.close);
    close.setAttribute('title', dict.close);
    prev.setAttribute('aria-label', dict.prev);
    prev.setAttribute('title', dict.prev + ' (←)');
    next.setAttribute('aria-label', dict.next);
    next.setAttribute('title', dict.next + ' (→)');
    shotsThumbButtons.forEach(function (btn, i) {
      btn.setAttribute('aria-label', dict.frame + ' ' + (i + 1) + '. ' + shotsCaption(shotsList[i]));
    });
    showShots(shotsIndex);
  }

  function openShots() {
    if (!shotsModal) buildShots();
    updateShotsLabels();
    shotsTrigger = shotsOpen;
    shotsModal.hidden = false;
    document.body.classList.add('lightbox-open');
    shotsModal.querySelector('.lightbox-close').focus();
  }

  function closeShots() {
    if (!shotsModal || shotsModal.hidden) return;
    shotsModal.hidden = true;
    document.body.classList.remove('lightbox-open');
    if (shotsTrigger) shotsTrigger.focus();
    shotsTrigger = null;
  }

  if (shotsOpen && shotsDataEl) {
    try {
      shotsList = JSON.parse(shotsDataEl.textContent) || [];
    } catch (e) {
      shotsList = [];
    }
    if (shotsList.length) {
      shotsOpen.hidden = false;
      shotsOpen.setAttribute('aria-haspopup', 'dialog');
      shotsOpen.addEventListener('click', openShots);
    }
  }

  document.addEventListener('keydown', function (e) {
    if (!shotsModal || shotsModal.hidden) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeShots();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showShots(shotsIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      showShots(shotsIndex + 1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      shotsModal.querySelector('.lightbox-close').focus();
    }
  });

  /* Форма заявки: плавающая кнопка + модалка со своей формой.
     Данные формируются в браузере и уходят в выбранный посетителем канал
     (Telegram, WhatsApp, почта) — сторонние сервисы форм не используются.
     data-feedback-form — ссылка на расширенную форму для вложений (необязательно). */
  var FEEDBACK_FORM = root.getAttribute('data-feedback-form') || 'https://forms.yandex.ru/u/6af07f5b9029023a7359b948?iframe=1';
  var FEEDBACK_CHANNELS = {
    telegram: 'https://t.me/Master_OL',
    whatsapp: 'https://wa.me/79685756688',
    email: 'm_aster@inbox.ru'
  };
  var feedbackBtn = null;
  var feedbackDialog = null;
  var feedbackForm = null;
  var feedbackStatus = null;
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
      '<div class="feedback-tabs" role="tablist">' +
      '<button type="button" class="feedback-tab is-active" role="tab" aria-selected="true" data-pane="quick"><span class="i18n-ru">Быстрая заявка</span><span class="i18n-en">Quick request</span></button>' +
      '<button type="button" class="feedback-tab" role="tab" aria-selected="false" data-pane="files"><span class="i18n-ru">С файлами</span><span class="i18n-en">With files</span></button>' +
      '</div>' +
      '<div class="feedback-pane" data-pane="quick">' +
      '<form class="feedback-form" novalidate>' +
      '<label class="field">' +
      '<span class="field-label"><span class="i18n-ru">Ваше имя</span><span class="i18n-en">Your name</span></span>' +
      '<input type="text" name="name" autocomplete="name" maxlength="80">' +
      '</label>' +
      '<label class="field">' +
      '<span class="field-label"><span class="i18n-ru">Контакт для ответа</span><span class="i18n-en">Contact</span> <span class="field-req">*</span></span>' +
      '<input type="text" name="contact" autocomplete="email" maxlength="120" placeholder="E-mail, телефон или @telegram">' +
      '</label>' +
      '<label class="field">' +
      '<span class="field-label"><span class="i18n-ru">Задача</span><span class="i18n-en">Task</span> <span class="field-req">*</span></span>' +
      '<textarea name="message" rows="4" maxlength="2000"></textarea>' +
      '</label>' +
      '<label class="consent">' +
      '<input type="checkbox" name="consent">' +
      '<span><span class="i18n-ru">Согласен на <a href="privacy.html" target="_blank" rel="noopener">обработку персональных данных</a>.</span><span class="i18n-en">I agree to the <a href="privacy.html" target="_blank" rel="noopener">processing of my personal data</a>.</span></span>' +
      '</label>' +
      '<p class="feedback-status" role="status" aria-live="polite"></p>' +
      '<div class="feedback-actions">' +
      '<button type="submit" class="btn btn-primary" data-channel="telegram"><span class="i18n-ru">Отправить в Telegram</span><span class="i18n-en">Send via Telegram</span></button>' +
      '<button type="button" class="btn" data-channel="whatsapp">WhatsApp</button>' +
      '<button type="button" class="btn" data-channel="email">E-mail</button>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '<div class="feedback-pane" data-pane="files" hidden>' +
      '<div class="feedback-frame"><iframe title="Форма заявки с файлами"></iframe></div>' +
      '<p class="feedback-fallback"><span class="i18n-ru">Форма Яндекс Форм: до 20 файлов, до 20 МБ. <a href="' + FEEDBACK_FORM + '" target="_blank" rel="noopener">Открыть в новой вкладке</a>.</span><span class="i18n-en">Yandex Forms: up to 20 files, 20 MB. <a href="' + FEEDBACK_FORM + '" target="_blank" rel="noopener">Open in a new tab</a>.</span></p>' +
      '</div>' +
      '</div>';

    feedbackForm = feedbackDialog.querySelector('.feedback-form');
    feedbackStatus = feedbackDialog.querySelector('.feedback-status');
    feedbackClose = feedbackDialog.querySelector('.feedback-close');
    feedbackFrame = feedbackDialog.querySelector('.feedback-frame iframe');

    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      sendFeedback('telegram');
    });
    feedbackForm.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-channel]');
      if (btn && btn.type !== 'submit') sendFeedback(btn.dataset.channel);
    });
    feedbackClose.addEventListener('click', closeFeedback);
    feedbackDialog.addEventListener('click', function (e) {
      var tab = e.target.closest('.feedback-tab');
      if (tab) { switchPane(tab.dataset.pane); return; }
      if (e.target === feedbackDialog) closeFeedback();
    });
    feedbackBtn.addEventListener('click', openFeedback);

    document.body.appendChild(feedbackBtn);
    document.body.appendChild(feedbackDialog);
  }

  function switchPane(name) {
    var tabs = feedbackDialog.querySelectorAll('.feedback-tab');
    var panes = feedbackDialog.querySelectorAll('.feedback-pane');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].dataset.pane === name;
      tabs[i].classList.toggle('is-active', on);
      tabs[i].setAttribute('aria-selected', String(on));
    }
    for (var j = 0; j < panes.length; j++) {
      panes[j].hidden = panes[j].dataset.pane !== name;
    }
    if (name === 'files' && feedbackFrame && !feedbackFrame.getAttribute('src')) {
      feedbackFrame.src = FEEDBACK_FORM;
      if (window.siteGoal) window.siteGoal('feedback_files_open');
    }
  }

  function feedbackMessage(channel) {
    var dict = feedbackLabels[root.lang] || feedbackLabels.ru;
    var name = feedbackForm.elements['name'].value.trim();
    var contact = feedbackForm.elements['contact'].value.trim();
    var message = feedbackForm.elements['message'].value.trim();
    var isRu = root.lang !== 'en';

    if (!contact) { setFeedbackStatus(dict.needContact, 'contact'); return null; }
    if (!message) { setFeedbackStatus(dict.needMessage, 'message'); return null; }
    if (!feedbackForm.elements['consent'].checked) { setFeedbackStatus(dict.needConsent, 'consent'); return null; }

    var lines = [isRu ? 'Заявка с сайта obmenjson.ru' : 'Request from obmenjson.ru', ''];
    if (name) lines.push((isRu ? 'Имя: ' : 'Name: ') + name);
    lines.push((isRu ? 'Контакт: ' : 'Contact: ') + contact);
    lines.push('');
    lines.push(message);

    setFeedbackStatus(dict.opened, null);
    return {
      text: lines.join('\n'),
      subject: (isRu ? 'Заявка с сайта obmenjson.ru' : 'Request from obmenjson.ru') + (name ? ' — ' + name : '')
    };
  }

  function setFeedbackStatus(text, fieldName) {
    if (!feedbackStatus) return;
    feedbackStatus.textContent = text || '';
    feedbackStatus.classList.toggle('is-error', Boolean(fieldName));
    for (var i = 0; i < feedbackForm.elements.length; i++) {
      feedbackForm.elements[i].classList && feedbackForm.elements[i].classList.remove('is-invalid');
    }
    if (fieldName) {
      var field = feedbackForm.elements[fieldName];
      if (field) {
        field.classList.add('is-invalid');
        field.focus();
      }
    }
  }

  function sendFeedback(channel) {
    var payload = feedbackMessage(channel);
    if (!payload) return;
    var url;
    if (channel === 'whatsapp') {
      url = FEEDBACK_CHANNELS.whatsapp + '?text=' + encodeURIComponent(payload.text);
      window.open(url, '_blank', 'noopener');
    } else if (channel === 'email') {
      url = 'mailto:' + FEEDBACK_CHANNELS.email +
        '?subject=' + encodeURIComponent(payload.subject) +
        '&body=' + encodeURIComponent(payload.text);
      window.location.href = url;
    } else {
      url = FEEDBACK_CHANNELS.telegram + '?text=' + encodeURIComponent(payload.text);
      window.open(url, '_blank', 'noopener');
    }
    if (window.siteGoal) window.siteGoal('feedback_send_' + channel);
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
