# =========================
# Build stage
# =========================
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# 2. Копируем Prisma schema и код
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src

# 3. Генерируем Prisma Client ПОД ALPINE (musl)
RUN npx prisma generate

# 4. Собираем TypeScript
RUN npm run build


# =========================
# Production stage
# =========================
FROM node:18-alpine

WORKDIR /app

# 5. Минимальные системные зависимости для Prisma
RUN apk add --no-cache dumb-init openssl

# 6. Устанавливаем ТОЛЬКО production-зависимости
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 7. Копируем Prisma Client, сгенерированный В BUILDER
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 8. Копируем собранный JS (ТОЛЬКО из builder!)
COPY --from=builder /app/dist ./dist

# 9. Порт
EXPOSE 3000

# 10. Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => { if (r.statusCode !== 200) process.exit(1) })"

# 11. Запуск
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/server.js"]
