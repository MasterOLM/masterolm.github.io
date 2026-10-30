(function () {
  var YM_ID = 113935350; // счётчик Яндекс.Метрики для obmenjson.ru
  if (!YM_ID) return;

  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) return; }
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  window.ym(YM_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    ecommerce: 'dataLayer'
  });

  var GA_ID = 'G-7CZCH0RRQ7'; // Google Analytics 4 для obmenjson.ru
  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(ga);
  }

  // Одно и то же событие уходит в Метрику (цель) и в GA4.
  function goal(name) {
    try { window.ym(YM_ID, 'reachGoal', name); } catch (e) { /* счётчик не загрузился */ }
    try { if (window.gtag) window.gtag('event', name); } catch (e) { /* GA не загрузился */ }
  }

  // Цели: обращение по e-mail/Telegram, переход к покупке, просмотр видео.
  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('mailto:') === 0) { goal('email_click'); return; }
    if (href.indexOf('https://t.me/') === 0) { goal('telegram_click'); return; }
    if (href.indexOf('purchase.html') !== -1) { goal('purchase_open'); return; }
    if (href.indexOf('youtu.be') !== -1 || href.indexOf('rutube.ru') !== -1) { goal('video_open'); }
  }, true);
})();
