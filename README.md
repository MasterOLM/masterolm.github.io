# masterolm.github.io

Статичный сайт-визитка (GitHub Pages, без сборки): `index.html` + `assets/`.

## Публикация

Опубликованный адрес: <https://masterolm.github.io/>

Ветка `main`, корень репозитория — Pages отдаёт файлы как есть. В Settings → Pages источник должен быть
`Deploy from a branch` → `main` → `/ (root)`. Сборка Jekyll отключена файлом `.nojekyll`.

## Свой домен

1. В Settings → Pages → Custom domain вписать домен (например `example.ru`), сохранить.
2. У регистратора/в DNS:
   - для апекса (`example.ru`): `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`;
   - для `www`: `CNAME` → `masterolm.github.io`.
3. В репозиторий добавить файл `CNAME` с одной строкой — именем домена (без `https://` и без слэша).
4. Дождаться выпуска сертификата и включить `Enforce HTTPS`.

## Структура

- `index.html` — визитка: услуги, карточка продукта, контакты
- `product.html` — страница продукта «Обмен JSON» (что переносится, возможности, схема работы, скриншоты, видео, требования, лицензирование)
- `404.html` — страница «не найдено»
- `assets/style.css`, `assets/product.css` — тема и стили страницы продукта
- `assets/main.js` — переключатель RU/EN (язык в `localStorage`, принудительно — `?lang=en`)
- `assets/product/*.png` — скриншоты для страницы продукта
- `favicon.svg`, `.nojekyll`, `.gitattributes`

## Правка содержимого

- Тексты — прямо в `index.html` / `product.html`, двуязычные блоки помечены классами `i18n-ru` / `i18n-en`
  (видимостью управляет атрибут `lang` на `<html>`).
- Заголовок вкладки на каждой странице свой: атрибуты `data-title-ru` / `data-title-en` на `<html>`.
- Ссылки на видео — в блоке «Видео-демо» (`product.html`, ссылки YouTube и RuTube).
- Стили — `assets/style.css` (общая тема, переменные в `:root`, `--accent` — акцентный цвет) и `assets/product.css`.

## Локальный просмотр

Открыть `index.html` в браузере либо поднять статический сервер:

```powershell
python -m http.server 8080 --directory C:\1C_EDT\masterolm.github.io
```
