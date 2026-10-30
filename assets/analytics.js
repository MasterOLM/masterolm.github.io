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

  function goal(name) {
    try { window.ym(YM_ID, 'reachGoal', name); } catch (e) { /* счётчик не загрузился */ }
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
