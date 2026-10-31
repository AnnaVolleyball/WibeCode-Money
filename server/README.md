# Сервер синхронизации Монетки

`sync_server.py` — маленький сервер на Python 3 без сторонних библиотек (встроенный `sqlite3`).
Хранит **только шифр**: телефон шифрует каждую запись до отправки, ключ на сервер не попадает.
Как устроено шифрование и обмен — `docs/ARCHITECTURE.md`, раздел «Синхронизация».

Адреса и подробности конкретного сервера в репозиторий не пишем (он публичный). Для сервера Анны
действует её инструкция `~/.claude/ANNA-SERVER.md`.

## API
- `GET /health` → `{"ok": true}`
- `POST /sync`, заголовок `Authorization: Bearer <токен из ключа>`, тело
  `{"space": hex32, "since": число, "push": [{"rid": hex32, "ts": число, "blob": "iv.шифр"}]}`
  → `{"cursor", "items": [...], "more"}`; если `since` больше, чем знает сервер, → `{"reset": true}`.
  Побеждает запись с бОльшим `ts`. Первое обращение с новым `space` создаёт «пространство» (если разрешено).

## Настройки (переменные окружения)
| Переменная | По умолчанию | Что это |
|---|---|---|
| `MONETKA_HOST` | `127.0.0.1` | слушать только локально; наружу — через Caddy |
| `MONETKA_PORT` | `8787` | порт |
| `MONETKA_DB` | `./data/sync.db` | файл базы |
| `MONETKA_ORIGINS` | `https://annavolleyball.github.io` | откуда разрешены запросы браузера (через запятую) |
| `MONETKA_MAX_SPACES` | `2` | сколько наборов данных можно создать |
| `MONETKA_NEW_SPACES` | `open` | `closed` — новые создавать нельзя (после подключения своих устройств) |
| `MONETKA_RATE` | `120` | запросов в минуту с одного адреса |

## Проверить локально
```bash
MONETKA_DB=/tmp/monetka-test.db MONETKA_ORIGINS=http://localhost:8000 python3 server/sync_server.py
python3 -m http.server 8000   # в другом окне, из корня репозитория
```
В приложении: Настройки → Синхронизация, сервер `http://localhost:8787` (http разрешён только для localhost).

## Установка (systemd + Caddy)
Файлы — в `deploy/`. Пример для пользователя `anna`, каталог `/srv/monetka-sync`:
```bash
sudo install -d -o anna -g anna /srv/monetka-sync /srv/monetka-sync/data
# скопировать sync_server.py в /srv/monetka-sync/
sudo cp deploy/monetka-sync.service deploy/monetka-sync-backup.service deploy/monetka-sync-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now monetka-sync monetka-sync-backup.timer
curl -s 127.0.0.1:8787/health
```
Caddy (официальный пакет из репозитория Caddy): `/etc/caddy/Caddyfile` по образцу `deploy/Caddyfile.example`,
`sudo systemctl reload caddy`, порты `sudo ufw allow 80,443/tcp`. Наружу доступно только то, что проксирует Caddy.

## Обслуживание
- Журнал: `sudo journalctl -u monetka-sync -n 50` (запросы и адреса не пишутся).
- Копии базы: `/srv/monetka-sync/data/backups/sync-ГГГГ-ММ-ДД.db`, хранятся 14 дней (таймер `monetka-sync-backup`).
- Обновить сервер: заменить `sync_server.py`, `sudo systemctl restart monetka-sync`.
- Восстановить из копии: остановить сервис, подложить файл как `sync.db`, запустить. Телефоны получат `reset`
  и сами отправят свои данные заново.
- Переезд на свой домен: поменять имя в Caddyfile, `sudo systemctl reload caddy`, на устройствах — новый адрес
  в «Синхронизации» (тот же ключ).
