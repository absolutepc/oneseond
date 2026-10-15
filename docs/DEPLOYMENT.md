# Размещение One Second вне ChatGPT

Это полный серверный проект на Vinext/Vite с Cloudflare Workers, D1 и R2. Вход администратора независим от ChatGPT. Публикация выполняется в вашем аккаунте Cloudflare.

## 1. Установить зависимости и создать ресурсы

```sh
git clone https://github.com/absolutepc/oneseond.git
cd oneseond
pnpm install --frozen-lockfile
pnpm exec wrangler login
pnpm exec wrangler d1 create one-second-db
pnpm exec wrangler r2 bucket create one-second-photos
```

В `wrangler.jsonc` замените фиктивный `database_id` на полученный ID. Имена базы и bucket должны совпадать с созданными ресурсами. `DB` и `BUCKET` — имена привязок в коде, менять их не нужно. Не переносите старые привязки Sites: это отдельные новые ресурсы.

## 2. Создать пароль

```sh
pnpm admin:hash
```

Введите собственный пароль длиной 16–128 символов дважды. Ввод скрыт. Команда выводит только строку хеша вида `pbkdf2$100000$…`. Сохраните пароль в менеджере паролей; в Cloudflare передайте полученный хеш:

```sh
pnpm exec wrangler secret put ADMIN_INITIAL_PASSWORD_HASH
```

На запрос Wrangler вставьте всю строку хеша. Если Wrangler предлагает создать Worker `one-second`, подтвердите создание. Не вставляйте хеш в исходные файлы или `wrangler.jsonc`.

Первый корректный запрос входа создаст запись `admin` с этим хешем. Сменённый через панель пароль сохраняется в D1 и не заменяется начальным секретом при следующих публикациях.

## 3. Миграции, сборка и публикация

```sh
pnpm db:migrate:remote
pnpm build
pnpm exec wrangler deploy --config dist/server/wrangler.json
```

Wrangler вернёт адрес `workers.dev`. Откройте `/admin/login`: логин `admin`, пароль из шага 2. Проверьте вход, каталог, загрузку фото и выход. Следующие обновления: получить `main`, установить зависимости, применить новые миграции и повторить сборку/публикацию. Миграции меняют только схему; каталог не очищается.

Сборка не выполняет публикацию. Не запускайте `deploy`, пока ID базы, bucket и секрет не настроены.

## 4. Собственный домен

Добавьте домен в свой аккаунт Cloudflare и завершите его настройку DNS. В настройках Worker откройте **Domains & Routes → Add → Custom Domain** и выберите домен или поддомен, например `shop.example.com`.

Также можно добавить в корень `wrangler.jsonc`:

```json
"routes": [{ "pattern": "shop.example.com", "custom_domain": true }]
```

Замените пример своим реальным доменом, затем пересоберите и опубликуйте. Это привязка домена, а не покупка/регистрация. Используйте HTTPS: cookies администратора имеют флаг Secure. Формы и API используют текущий origin; адрес ChatGPT не нужен.

## 5. Перенести каталог и новые фотографии

Без переноса данных новый сайт получит встроенный каталог из `lib/seed.json`. Для сохранения изменений старого магазина:

1. Скачайте экспорт каталога в прежней админ-панели. Держите резервную копию отдельно.
2. Скопируйте загруженные фотографии из прежнего R2 в новый bucket с теми же ключами `photos/<имя>`. Встроенные `assets/catalog/...` уже входят в репозиторий.
3. Авторизуйтесь на новом сайте. Через его защищённый API `PUT /api/admin/catalog` можно загрузить `document` из экспорта и актуальный `revision`, полученный из `GET /api/admin/catalog`. Это выполняется в сессии администратора с заголовком Origin нового сайта. Формат документа: `{products, brands, settings}`. Не отправляйте устаревшую ревизию.
4. Убедитесь, что все `/uploads/...` доступны и контакты магазина верны.

Экспортированный каталог можно проверить через `catalogSchema` в `lib/catalog-validation.ts`. Для переноса без запросов к API допустимо подготовить проверенный JSON в `lib/seed.json` **до первого сохранения каталога в новой базе**. Секреты, таблицы сессий и старые учётные записи переносить не требуется. Если вы не можете выгрузить R2 из прежнего хостинга, сначала сохраните использованные изображения через доступные URL; не отключайте старый сайт до проверки переноса.

## 6. Локальная разработка

```sh
pnpm db:migrate:local
pnpm dev
```

Для проверки входа добавьте в игнорируемый `.dev.vars`:

```text
ADMIN_INITIAL_PASSWORD_HASH="<строка хеша, созданная командой pnpm admin:hash>"
```

Файл не коммитить. Локальная D1 и R2 изолированы от production. Полную проверку Secure-cookie выполняйте через HTTPS. Production-секреты локально автоматически не скачиваются.

## Восстановление пароля

Изменение `ADMIN_INITIAL_PASSWORD_HASH` не сбрасывает существующую учётную запись. При утере пароля используйте доверенный доступ администратора Cloudflare к D1: обновите `admin_account.password_hash` новым проверенным хешем, увеличьте `version` и удалите записи `admin_session`. Не делайте публичную страницу сброса без дополнительного подтверждения личности.

## Источники документации

- https://developers.cloudflare.com/workers/vite-plugin/
- https://developers.cloudflare.com/d1/wrangler-commands/
- https://developers.cloudflare.com/r2/buckets/create-buckets/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/configuration/secrets/

В проекте закреплены существующие версии Vinext и Cloudflare Vite plugin v1. Не обновляйте их на новые major-версии одновременно с переносом без отдельной проверки сборки.
