# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (full install required to run `prisma generate`)
RUN npm ci && npm cache clean --force

# Copy Prisma schema and built application (assume project was built locally)
# We need the schema to run `prisma generate` and produce the generated client
COPY prisma ./prisma
COPY . .
RUN npm run build


# Generate Prisma client so generated files are present in node_modules/.prisma
RUN npx prisma generate

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init and OpenSSL libraries for Prisma query engine
RUN apk add --no-cache dumb-init openssl-libs-static openssl

# Copy package files
COPY package*.json ./

# Install production dependencies

# Install only production dependencies in the final image
RUN npm ci --only=production && npm cache clean --force

# Copy generated Prisma client from builder stage so @prisma/client initializes correctly
COPY --from=0 /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=0 /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application from host context
COPY ./dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start application
# Allow Node to resolve extension-less local imports at runtime (helps with ESM imports
# emitted by TypeScript when source imports don't include .js extensions).
# Note: this uses an experimental resolver flag available in Node 18.
CMD ["node", "--experimental-specifier-resolution=node", "dist/src/server.js"]
