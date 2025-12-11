# Development Guide

## 📖 Введение

Этот документ содержит руководство для разработчиков, работающих с backend проектом Leads.

## 🏗️ Архитектура проекта

Проект использует **модульную архитектуру** с разделением на слои:

```
Request
  ↓
Routes (маршруты)
  ↓
Middleware (аутентификация, обработка ошибок)
  ↓
Controller (обработка запроса)
  ↓
Service (бизнес-логика)
  ↓
Repository (работа с БД)
  ↓
Database (PostgreSQL)
```

## 📚 Структура модуля

Каждый модуль содержит:

```
module/
├── module.controller.ts    # Обработчики HTTP запросов
├── module.service.ts       # Бизнес-логика
├── module.repository.ts    # Работа с БД
└── module.routes.ts        # Маршруты
```

### Пример: auth модуль

```
auth/
├── auth.controller.ts      # login, register handlers
├── auth.service.ts         # бизнес-логика аутентификации
└── auth.routes.ts          # POST /auth/login, POST /auth/register
```

## 🔄 Поток данных

### Пример: Создание лида

1. **Request** → POST `/api/leads` с данными
2. **Middleware** → authMiddleware проверяет JWT токен
3. **Controller** → leadController.createLead()
4. **Service** → leadService.createLead() - бизнес-логика
5. **Repository** → сохраняет в БД через Prisma
6. **Response** → возвращает созданный лид

```typescript
// lead.controller.ts
async createLead(req: AuthRequest, res: Response) {
  const data = req.body;
  const lead = await leadService.createLead(data); // delegate to service
  res.status(201).json({ success: true, data: lead });
}

// lead.service.ts
async createLead(data) {
  // validate business rules
  // create consent
  // create lead public
  // create lead private
  // log audit
  return lead;
}

// lead.repository.ts (extends BaseRepository)
async findByMarketer(marketerId) {
  return prisma.leadPublic.findMany({ where: { marketerId } });
}
```

## 🛠️ Добавление нового модуля

### Шаг 1: Создать структуру

```bash
mkdir -p src/modules/newmodule
touch src/modules/newmodule/{newmodule.controller.ts,newmodule.service.ts,newmodule.repository.ts,newmodule.routes.ts}
```

### Шаг 2: Определить типы в schema.prisma

```prisma
model NewEntity {
  id        String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId    String   @db.Uuid
  // ... other fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  @@map("new_entities")
}
```

### Шаг 3: Repository

```typescript
// newmodule.repository.ts
import BaseRepository from '../../core/BaseRepository';

export class NewModuleRepository extends BaseRepository<INewEntity> {
  constructor() {
    super(prisma.newEntity);
  }

  async customQuery() {
    return prisma.newEntity.findMany({});
  }
}
```

### Шаг 4: Service

```typescript
// newmodule.service.ts
import BaseService from '../../core/BaseService';

export class NewModuleService extends BaseService<INewEntity> {
  private repository: NewModuleRepository;

  constructor() {
    const repository = new NewModuleRepository();
    super(repository);
    this.repository = repository;
  }

  async createNewEntity(data) {
    // Business logic
    return this.create(data);
  }
}
```

### Шаг 5: Controller

```typescript
// newmodule.controller.ts
export class NewModuleController {
  async create(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const result = await newModuleService.create(data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
```

### Шаг 6: Routes

```typescript
// newmodule.routes.ts
import { Router } from 'express';
import newModuleController from './newmodule.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, (req, res) =>
  newModuleController.create(req, res),
);

export default router;
```

### Шаг 7: Подключить в routes/index.ts

```typescript
import newModuleRoutes from '../modules/newmodule/newmodule.routes';

router.use('/new-module', newModuleRoutes);
```

## 📦 Базовые классы

### BaseRepository

Предоставляет основные CRUD операции:

```typescript
class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(prisma.user); // Передаем Prisma модель
  }

  // Встроенные методы:
  // - findById(id)
  // - findMany(where?, skip?, take?)
  // - findOne(where)
  // - create(data)
  // - update(id, data)
  // - delete(id)
  // - count(where?)

  // Добавляйте свои методы:
  async findByEmail(email: string) {
    return this.model.findUnique({ where: { email } });
  }
}
```

### BaseService

Управляет бизнес-логикой и использует repository:

```typescript
class UserService extends BaseService<IUser> {
  private userRepository: UserRepository;

  constructor() {
    const repository = new UserRepository();
    super(repository);
    this.userRepository = repository;
  }

  // Встроенные методы:
  // - getById(id)
  // - getMany(where?, skip?, take?)
  // - getTotal(where?)
  // - create(data)
  // - update(id, data)
  // - delete(id)
  // - getOne(where)
  // - getPaginationParams(page, limit)
  // - getPaginatedResponse(items, total, page, limit)

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
```

## 🔐 Аутентификация

### Использование authMiddleware

```typescript
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware';

router.get('/profile', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id; // user добавлен middleware
});
```

### JWT токены

```typescript
import { generateToken, verifyToken } from '../../utils/jwt';

// Генерировать токен
const token = generateToken({
  id: user.id,
  email: user.email,
  role: user.role,
});

// Проверить токен
const decoded = verifyToken(token);
```

## 🔒 Пароли

```typescript
import { hashPassword, comparePassword } from '../../utils/password';

// Хешировать пароль
const hash = await hashPassword('password123');

// Проверить пароль
const isValid = await comparePassword('password123', hash);
```

## ✅ Валидация

```typescript
import {
  validateEmail,
  validatePhoneNumber,
  validateUUID,
  validatePaginationParams,
} from '../../utils/validation';

if (!validateEmail(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}

const { page, limit } = validatePaginationParams(
  req.query.page,
  req.query.limit,
);
```

## 📊 Аудит логирования

```typescript
import AuditService from '../audit/audit.service';

const auditService = new AuditService();

await auditService.logAction({
  userId: req.user.id,
  action: 'CREATE_LEAD',
  entity: 'lead',
  entityId: leadId,
  metadata: { leadTypeId, city },
});
```

## 🧪 Тестирование API

### Используя Postman

Импортируйте `postman_collection.json` для готовых запросов.

### Используя cURL

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'

# Получить токен
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}' \
  | jq -r '.data.token')

# Использовать токен
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users/profile
```

## 🔧 Работа с Prisma

### Миграции

```bash
# Создать миграцию
npm run prisma:migrate

# Просмотреть все миграции
npx prisma migrate status

# Откатить последнюю миграцию
npx prisma migrate resolve --rolled-back

# Reset БД (осторожно!)
npm run prisma:migrate reset
```

### Prisma Studio

```bash
# Открыть веб-интерфейс для БД
npm run prisma:studio
```

### Работа с Prisma в коде

```typescript
import prisma from '../../config/db';

// Найти
const user = await prisma.user.findUnique({ where: { id } });

// Создать
const user = await prisma.user.create({
  data: { email, passwordHash, role: 'MARKETER' },
});

// Обновить
const user = await prisma.user.update({
  where: { id },
  data: { balance: newBalance },
});

// Удалить
await prisma.user.delete({ where: { id } });

// Транзакция
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { balance } }),
  prisma.auditLog.create({ data: { ...logData } }),
]);
```

## 📝 Обработка ошибок

### В Controller

```typescript
try {
  const result = await service.doSomething();
  res.json({ success: true, data: result });
} catch (error: any) {
  res.status(400).json({
    success: false,
    error: error.message || 'Operation failed',
  });
}
```

### Middleware ошибок

```typescript
// Все необработанные ошибки будут обработаны errorMiddleware
// Расположен в src/middleware/errorMiddleware.ts
```

## 🚀 Production чек-лист

- [ ] Обновить JWT_SECRET на сильный ключ
- [ ] Установить BCRYPT_ROUNDS = 12
- [ ] Настроить переменные окружения в .env.production
- [ ] Включить HTTPS/SSL
- [ ] Настроить CORS для конкретных доменов
- [ ] Добавить rate limiting
- [ ] Включить логирование в файлы
- [ ] Настроить мониторинг
- [ ] Регулярные резервные копии БД
- [ ] Настроить CI/CD pipeline

## 📖 Дополнительные ресурсы

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Information](https://jwt.io/)

## 🤝 Conventions

### Именование файлов

- Controllers: `{module}.controller.ts`
- Services: `{module}.service.ts`
- Repositories: `{module}.repository.ts`
- Routes: `{module}.routes.ts`

### Переменные окружения

- Используют UPPER_SNAKE_CASE
- Определены в `.env` и `src/config/env.ts`

### Классы и интерфейсы

- Классы: PascalCase (AuthService, UserController)
- Интерфейсы: PascalCase с префиксом I (IUser, ILead)
- Функции: camelCase (hashPassword, validateEmail)

## 📞 Поддержка разработчиков

При возникновении вопросов:

1. Проверьте документацию в `README.md`
2. Посмотрите примеры в других модулях
3. Проверьте логи: `docker-compose logs -f backend`
4. Откройте issue в репозитории
