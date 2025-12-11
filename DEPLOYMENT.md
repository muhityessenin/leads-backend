# Production Deployment Guide

## 🚀 Развертывание на Production

### Предусловия

- VPS/Server с Ubuntu 20.04+ или CentOS 7+
- Docker и Docker Compose установлены
- PostgreSQL 12+ (если не используется Docker)
- Node.js 18+ (если не используется Docker)
- SSL сертификат (Let's Encrypt рекомендуется)
- Domain name

---

## 🐳 Вариант 1: Docker Compose Production (Рекомендуется)

### 1. Подготовить сервер

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверить версии
docker --version
docker-compose --version
```

### 2. Клонировать репозиторий

```bash
cd /opt
sudo git clone <repository-url> leads-backend
cd leads-backend
sudo chown -R $USER:$USER .
```

### 3. Настроить переменные окружения

```bash
# Создать production .env
cp .env.example .env.production

# Отредактировать
nano .env.production
```

**Важные переменные:**

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://leads_user:STRONG_PASSWORD@postgres:5432/leads_db
JWT_SECRET=GENERATE_STRONG_SECRET_KEY
JWT_EXPIRY=7d
BCRYPT_ROUNDS=12
LOG_LEVEL=info
FRONTEND_URL=https://yourdomain.com
PAYMENT_WEBHOOK_SECRET=GENERATE_STRONG_SECRET
```

### 4. Безопасность

```bash
# Сгенерировать сильные пароли
openssl rand -base64 32  # для JWT_SECRET
openssl rand -base64 32  # для DB пароля
openssl rand -base64 32  # для WEBHOOK_SECRET

# Установить правильные права доступа
sudo chmod 600 .env.production
sudo chmod 600 docker-compose.yml
```

### 5. Запустить на Production

```bash
# Создать volume для PostgreSQL
docker volume create postgres_data

# Запустить сервисы
docker-compose -f docker-compose.yml up -d

# Проверить статус
docker-compose ps

# Просмотреть логи
docker-compose logs -f backend
docker-compose logs -f postgres
```

### 6. Настроить Nginx как Reverse Proxy

```bash
# Установить Nginx
sudo apt install nginx -y

# Создать конфиг
sudo nano /etc/nginx/sites-available/leads-backend
```

**Конфиг Nginx:**

```nginx
upstream leads_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL сертификат (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/leads-backend-access.log;
    error_log /var/log/nginx/leads-backend-error.log;

    # Proxy settings
    location / {
        proxy_pass http://leads_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    location ~ ^/api/auth/ {
        limit_req zone=auth burst=10 nodelay;
        proxy_pass http://leads_backend;
    }

    location ~ ^/api/ {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://leads_backend;
    }
}
```

Включить конфиг:

```bash
sudo ln -s /etc/nginx/sites-available/leads-backend /etc/nginx/sites-enabled/

# Проверить конфиг
sudo nginx -t

# Перезагрузить
sudo systemctl restart nginx
```

### 7. Установить SSL сертификат (Let's Encrypt)

```bash
# Установить Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получить сертификат
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматическое продление
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 8. Настроить Firewall

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 5432  # PostgreSQL (только если необходимо)

# Проверить правила
sudo ufw status
```

### 9. Резервное копирование БД

```bash
# Создать скрипт backup
sudo nano /usr/local/bin/backup-leads-db.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/backups/leads-db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/leads_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Создать backup
docker-compose exec -T postgres pg_dump -U leads_user leads_db > $BACKUP_FILE

# Сжать
gzip $BACKUP_FILE

# Удалить старые backup'ы (старше 30 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

Сделать исполняемым:

```bash
sudo chmod +x /usr/local/bin/backup-leads-db.sh

# Добавить в cron для ежедневного backup
sudo crontab -e

# Добавить строку:
# 0 2 * * * /usr/local/bin/backup-leads-db.sh
```

### 10. Мониторинг

```bash
# Установить Portainer для управления Docker
docker run -d -p 8000:8000 -p 9000:9000 \
  --name portainer \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce

# Доступ на https://yourdomain.com:9000
```

### 11. Логирование

```bash
# Просмотреть логи
docker-compose logs -f backend --tail=100

# Сохранить логи
docker-compose logs backend > logs/backend.log

# Логи Nginx
tail -f /var/log/nginx/leads-backend-access.log
tail -f /var/log/nginx/leads-backend-error.log
```

### 12. Масштабирование

Для высоконагруженных систем используйте несколько инстансов backend:

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - INSTANCE_ID=${INSTANCE_ID}
```

---

## 💻 Вариант 2: Нативная установка на VPS

### 1. Установить зависимости

```bash
# Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# PM2 для управления процессами
sudo npm install -g pm2
```

### 2. Подготовить БД

```bash
# Подключиться к PostgreSQL
sudo -u postgres psql

# Создать БД и пользователя
CREATE DATABASE leads_db;
CREATE USER leads_user WITH PASSWORD 'strong_password';
ALTER ROLE leads_user SET client_encoding TO 'utf8';
ALTER ROLE leads_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE leads_user SET default_transaction_deferrable TO on;
ALTER ROLE leads_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE leads_db TO leads_user;
\q
```

### 3. Развернуть приложение

```bash
# Клонировать репо
cd /opt
sudo git clone <repository-url> leads-backend
cd leads-backend

# Установить зависимости
npm install

# Собрать
npm run build

# Создать production .env
cp .env.example .env
# Отредактировать .env
```

### 4. Запустить через PM2

```bash
# Создать PM2 конфиг
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'leads-backend',
      script: './dist/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
EOF

# Запустить
pm2 start ecosystem.config.js

# Сохранить конфиг
pm2 save

# Автозагрузка при перезагрузке
pm2 startup

# Просмотреть статус
pm2 status
pm2 logs
```

---

## 🔒 Security Best Practices

1. **SSH Keys**: Используйте SSH ключи вместо паролей
2. **Firewall**: Ограничьте доступ к портам
3. **SSL/TLS**: Всегда используйте HTTPS
4. **JWT**: Используйте сильные секреты (минимум 32 символа)
5. **Пароли**: Хешируйте с BCRYPT_ROUNDS=12
6. **CORS**: Ограничьте CORS для конкретных доменов
7. **Rate Limiting**: Защитите от DDoS атак
8. **Secrets**: Используйте `.env` для чувствительных данных
9. **Updates**: Регулярно обновляйте зависимости
10. **Logs**: Мониторьте логи на ошибки

---

## 📊 Мониторинг и Алерты

### Используя PM2+

```bash
# Установить PM2+
npm install -g pm2-plus

# Подключить аккаунт
pm2 plus
```

### Используя Prometheus + Grafana

```bash
# Добавить prometheus middleware в app.ts
import prometheus from 'express-prometheus-middleware';

app.use(prometheus({
  metricsPath: '/metrics',
}));
```

---

## 🆘 Troubleshooting

### Сервис не стартует

```bash
docker-compose logs backend
docker-compose logs postgres

# Перезагрузить сервис
docker-compose restart backend
```

### Ошибка базы данных

```bash
# Перегенерировать schema
docker-compose exec backend npx prisma generate
docker-compose exec backend npx prisma migrate reset

# Или удалить volume и создать заново
docker-compose down -v
docker-compose up -d
```

### Высокое использование памяти

```bash
# Увеличить лимит памяти в docker-compose.yml
services:
  backend:
    mem_limit: 1024m
    memswap_limit: 1024m
```

---

## 📈 Performance Tips

1. Включить gzip compression
2. Использовать Redis для кэширования
3. Оптимизировать запросы к БД (индексы)
4. Мониторить performance metrics
5. Использовать CDN для статических файлов
6. Включить connection pooling PostgreSQL

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Создать `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/leads-backend
            git pull origin main
            docker-compose down
            docker-compose up -d
```

---

## ✅ Production Checklist

- [ ] SSL сертификат настроен
- [ ] Nginx reverse proxy настроен
- [ ] Firewall настроен
- [ ] Резервное копирование БД настроено
- [ ] Мониторинг настроен
- [ ] Логирование настроено
- [ ] Rate limiting включен
- [ ] JWT_SECRET - сильный ключ
- [ ] Пароли БД изменены
- [ ] .env файл безопасен
- [ ] Backup и recovery план подготовлен

---

**Готово! Приложение развернуто на Production! 🚀**
