# -----------------------------
# Stage 1 — Build dependencies and app
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# -----------------------------
# Stage 2 — Production image
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built app + dependencies from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000')" || exit 1

CMD ["node", "dist/server.js"]
