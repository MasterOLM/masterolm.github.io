(function () {
  var KEY = 'site-lang';
  var titles = {
    ru: 'Олег Москвичев — разработка и интеграция 1С',
    en: 'Oleg Moskvichev — 1C development & integration'
  };
  var buttons = document.querySelectorAll('[data-set-lang]');

  function apply(lang) {
    document.documentElement.lang = lang;
    if (!document.documentElement.hasAttribute('data-static-title')) {
      document.title = titles[lang] || titles.ru;
    }
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
    });
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

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  apply(detect());
})();
