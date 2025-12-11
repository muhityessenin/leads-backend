# 🚀 GETTING STARTED - Первый запуск

Добро пожаловать в Leads Backend! Этот файл содержит пошаговые инструкции для первого запуска проекта.

## ⚡ Самый быстрый способ (Docker)

### Требования

- Docker установлен
- Docker Compose установлен

### Запуск (2 команды!)

```bash
# 1. Запустить все сервисы
docker-compose up -d

# 2. Готово!
# Проверьте здоровье сервера:
# http://localhost:3000/api/health
```

**Все готово! 🎉**

---

## 📋 Локальная установка без Docker

### Требования

- Node.js 18+
- PostgreSQL 12+
- npm

### Шаг 1: Установить зависимости

```bash
npm install
```

### Шаг 2: Настроить БД

Создать PostgreSQL базу данных:

```bash
# Подключиться к PostgreSQL
psql postgres

# Выполнить SQL команды:
CREATE DATABASE leads_db;
CREATE USER leads_user WITH PASSWORD 'leads_password';
ALTER ROLE leads_user SET client_encoding TO 'utf8';
ALTER ROLE leads_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE leads_db TO leads_user;
\q
```

### Шаг 3: Настроить окружение

```bash
cp .env.example .env

# Убедитесь что DATABASE_URL правильный:
# DATABASE_URL=postgresql://leads_user:leads_password@localhost:5432/leads_db
```

### Шаг 4: Запустить миграции

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Шаг 5: Заполнить тестовые данные

```bash
npm run prisma:seed
```

### Шаг 6: Запустить сервер

```bash
# Режим разработки с горячей перезагрузкой
npm run dev

# Или production сборка
npm run build
npm start
```

**Сервер доступен:** http://localhost:3000

---

## 🧪 Тестирование API

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Тестовые учетные данные

После `npm run prisma:seed`:

| Role | Email | Password |
|------|-------|----------|
| Marketer | marketer@example.com | Marketer123! |
| Manager | manager@example.com | Manager123! |
| Admin | admin@example.com | Admin123! |

### Логин и получение токена

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marketer@example.com",
    "password": "Marketer123!"
  }'
```

Ответ будет содержать `token`. Используйте его для других запросов:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/profile
```

---

## 📚 Документация

- **API**: Смотрите [API.md](./API.md) для полного справочника endpoints
- **Quickstart**: Смотрите [QUICKSTART.md](./QUICKSTART.md) для быстрого старта
- **Development**: Смотрите [DEVELOPMENT.md](./DEVELOPMENT.md) для гайда разработчика
- **Deployment**: Смотрите [DEPLOYMENT.md](./DEPLOYMENT.md) для production развертывания
- **README**: Смотрите [README.md](./README.md) для полной информации о проекте

---

## 🐛 Решение проблем

### Ошибка подключения к БД

```bash
# Проверьте что PostgreSQL запущен
psql -U postgres

# Проверьте DATABASE_URL в .env
# Формат: postgresql://username:password@host:port/database
```

### Ошибка портов (address already in use)

```bash
# Проверьте какой процесс занимает порт
lsof -i :3000
lsof -i :5432

# Либо измените PORT в .env
PORT=3001
```

### Docker ошибки

```bash
# Просмотрите логи
docker-compose logs backend

# Перезагрузите сервисы
docker-compose restart

# Или пересоздайте
docker-compose down -v
docker-compose up -d
```

### Ошибки миграций

```bash
# Сбросьте БД (внимание: удалит все данные!)
npm run prisma:migrate reset

# Или в Docker:
docker-compose exec backend npm run prisma:migrate reset
```

---

## 🎯 Основной рабочий процесс

### 1. Маркетолог создает и продает лиды

```bash
# a. Логиниться
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marketer@example.com","password":"Marketer123!"}' \
  | jq -r '.data.token')

# b. Создать тип лида
curl -X POST http://localhost:3000/api/lead-types \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Leads",
    "description": "High-quality leads",
    "basePrice": 150.00
  }'

# Сохраните leadTypeId из ответа

# c. Создать лид
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadTypeId": "LEAD_TYPE_ID",
    "city": "Moscow",
    "price": 150.00,
    "phone": "+79998887766",
    "fullName": "John Doe",
    "consentText": "I agree",
    "clientIp": "192.168.1.1",
    "userAgent": "Mozilla/5.0"
  }'

# d. Опубликовать лид
curl -X PUT http://localhost:3000/api/leads/LEAD_ID/publish \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Менеджер покупает лид

```bash
# a. Логиниться
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"Manager123!"}' \
  | jq -r '.data.token')

# b. Посмотреть каталог
curl http://localhost:3000/api/leads/catalog?page=1&limit=10

# c. Создать заказ
curl -X POST http://localhost:3000/api/orders/LEAD_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150.00}'

# d. Создать платеж
curl -X POST http://localhost:3000/api/payments/create/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# e. Имитировать webhook платежа (успешный платеж)
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "payment_XXXXX",
    "status": "success",
    "signature": "webhook_secret_key"
  }'

# f. Получить номер телефона лида
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/leads/LEAD_ID/full
```

---

## 📊 Инструменты

### Postman

Импортируйте `postman_collection.json` для готовых запросов:

1. Откройте Postman
2. Нажмите "Import"
3. Выберите файл `postman_collection.json`
4. Используйте готовые запросы

### Prisma Studio

```bash
npm run prisma:studio
```

Откроет веб-интерфейс для просмотра и редактирования БД на http://localhost:5555

### Docker Desktop

Для графического управления Docker контейнерами установите Docker Desktop.

---

## 🚀 Следующие шаги

1. **Изучите API**: Прочитайте [API.md](./API.md)
2. **Разработка**: Смотрите [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Production**: Смотрите [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Команды**: `npm run` для просмотра всех команд

---

## 💡 Советы

- 🔍 Используйте `docker-compose logs -f` для просмотра логов
- 📝 Изменения в коде автоматически перезагружаются в режиме разработки
- 🔐 Всегда используйте сильные пароли в production
- 🐛 Проверяйте логи если что-то не работает
- ✅ Запускайте `npm run build` перед commit'ом

---

## 🎓 Архитектура

```
Request → Routes → Middleware → Controller → Service → Repository → Database
```

Подробнее в [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 📞 Нужна помощь?

1. Проверьте логи: `docker-compose logs backend`
2. Читайте документацию в README.md
3. Откройте issue в репозитории

---

**Готово! Начните разработку! 🎉**

```bash
npm run dev
```

Сервер запущен на: **http://localhost:3000**

Health check: **http://localhost:3000/api/health**
