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

## Правка содержимого

- Тексты — прямо в `index.html`, двуязычные блоки помечены классами `i18n-ru` / `i18n-en`
  (видимостью управляет атрибут `lang` на `<html>`, переключатель — `assets/main.js`).
- Стили — `assets/style.css`, переменные темы в `:root` (`--accent` — акцентный цвет).
- Язык запоминается в `localStorage`, можно принудительно задать через `?lang=en`.

## Локальный просмотр

Открыть `index.html` в браузере либо поднять статический сервер:

```powershell
python -m http.server 8080 --directory C:\1C_EDT\masterolm.github.io
```
