# Quick Start Guide

## 🚀 Быстрый старт

### Вариант 1: Локальная установка (без Docker)

```bash
# 1. Установить зависимости
npm install

# 2. Создать .env файл
cp .env.example .env

# 3. Если у вас уже установлена PostgreSQL, обновить DATABASE_URL в .env

# 4. Сгенерировать Prisma клиент
npm run prisma:generate

# 5. Запустить миграции
npm run prisma:migrate

# 6. (Опционально) Заполнить БД тестовыми данными
npm run prisma:seed

# 7. Запустить сервер в режиме разработки
npm run dev
```

**Сервер будет доступен на:** `http://localhost:3000`

---

### Вариант 2: Docker Compose (все сервисы в контейнерах)

```bash
# 1. Собрать и запустить все сервисы
docker-compose up -d

# 2. Проверить статус
docker-compose ps

# 3. Просмотреть логи
docker-compose logs -f backend

# 4. Остановить сервисы
docker-compose down
```

**Сервер будет доступен на:** `http://localhost:3000`

---

## 📝 Тестирование API

### Используя cURL

#### 1. Регистрация

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

#### 2. Вход в систему

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marketer@example.com",
    "password": "Marketer123!"
  }'
```

Сохраните полученный `token`.

#### 3. Использование токена

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/profile
```

---

### Используя Postman

1. Импортируйте `postman_collection.json` в Postman
2. Установите переменную `token` в значение вашего JWT токена
3. Используйте готовые запросы из коллекции

---

## 🔐 Тестовые учетные данные (после npm run prisma:seed)

| Role | Email | Password |
|------|-------|----------|
| Marketer | marketer@example.com | Marketer123! |
| Manager | manager@example.com | Manager123! |
| Admin | admin@example.com | Admin123! |

---

## 🔄 Основной рабочий процесс

### Как маркетолог:

```bash
# 1. Войти
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marketer@example.com","password":"Marketer123!"}' \
  | jq -r '.data.token')

# 2. Создать тип лида
curl -X POST http://localhost:3000/api/lead-types \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Leads",
    "description": "High-quality leads",
    "basePrice": 150
  }'

# 3. Создать лид
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadTypeId": "LEAD_TYPE_ID",
    "city": "Moscow",
    "price": 150,
    "phone": "+79998887766",
    "fullName": "John Doe",
    "consentText": "I agree",
    "clientIp": "192.168.1.1",
    "userAgent": "Mozilla/5.0"
  }'

# 4. Опубликовать лид
curl -X PUT http://localhost:3000/api/leads/LEAD_ID/publish \
  -H "Authorization: Bearer $TOKEN"
```

### Как менеджер:

```bash
# 1. Войти
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"Manager123!"}' \
  | jq -r '.data.token')

# 2. Посмотреть каталог лидов
curl http://localhost:3000/api/leads/catalog?page=1&limit=10

# 3. Создать заказ
curl -X POST http://localhost:3000/api/orders/LEAD_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150}'

# 4. Создать платеж
curl -X POST http://localhost:3000/api/payments/create/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# 5. Имитировать webhook платежа
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "payment_12345",
    "status": "success",
    "signature": "webhook_secret_key"
  }'

# 6. Получить полную информацию о лиде
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/leads/LEAD_ID/full
```

---

## 🐳 Docker команды

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только БД
docker-compose logs -f postgres
```

### Выполнить команду в контейнере

```bash
# Заново запустить миграции
docker-compose exec backend npm run prisma:migrate

# Заполнить БД тестовыми данными
docker-compose exec backend npm run prisma:seed

# Открыть Prisma Studio
docker-compose exec backend npm run prisma:studio
```

### Очистить все

```bash
# Остановить и удалить все контейнеры, тома, образы
docker-compose down -v --rmi all
```

---

## 🔧 Переменные окружения

Основные переменные в `.env`:

```env
NODE_ENV=development          # development | production
PORT=3000                     # Порт сервера
DATABASE_URL=postgresql://... # URL базы данных
JWT_SECRET=...               # Секретный ключ для JWT
JWT_EXPIRY=7d                # Время жизни токена
BCRYPT_ROUNDS=10             # Количество раундов хеширования
LOG_LEVEL=debug              # Уровень логирования
```

---

## 🆘 Решение проблем

### Ошибка подключения к БД

```bash
# Убедитесь, что PostgreSQL запущен (если локально)
psql postgres

# Проверьте DATABASE_URL в .env
# Формат: postgresql://username:password@host:port/database
```

### Ошибка портов

```bash
# Проверить занятость портов
lsof -i :3000
lsof -i :5432

# Либо изменить PORT в .env и docker-compose.yml
```

### Ошибка миграций

```bash
# Очистить и пересоздать БД
npm run prisma:migrate reset

# Или в Docker
docker-compose exec backend npm run prisma:migrate reset
```

---

## 📚 Документация

- [README.md](./README.md) - Полная документация проекта
- [Prisma Docs](https://www.prisma.io/docs/) - Документация ORM
- [Express Docs](https://expressjs.com/) - Документация Express
- [TypeScript Docs](https://www.typescriptlang.org/docs/) - Документация TypeScript

---

## 💡 Полезные команды

```bash
# Разработка
npm run dev           # Запуск в режиме разработки
npm run build         # Сборка TypeScript
npm start             # Запуск сборки

# БД
npm run prisma:generate   # Сгенерировать Prisma клиент
npm run prisma:migrate    # Запустить миграции
npm run prisma:seed       # Заполнить БД тестовыми данными
npm run prisma:studio     # Открыть Prisma Studio

# Код
npm run lint          # Проверить код
npm run format        # Форматировать код
npm test              # Запустить тесты

# Docker
docker-compose up -d       # Запустить все сервисы
docker-compose down        # Остановить все сервисы
docker-compose logs -f     # Просмотреть логи
```

---

**Готово! Начните разработку! 🚀**
