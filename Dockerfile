# =========================
# Build stage
# =========================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src

# Prisma generate ПОД ALPINE
RUN npx prisma generate

# Build TS
RUN npm run build


# =========================
# Production stage
# =========================
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init openssl

# 🔥 ВАЖНО: запрещаем postinstall
ENV npm_config_ignore_scripts=true

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Возвращаем scripts (на будущее)
ENV npm_config_ignore_scripts=false

# Копируем Prisma client ИЗ BUILDER
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Копируем билд
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/server.js"]
