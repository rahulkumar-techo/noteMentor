# -----------------------------
# Stage 1 — Build dependencies and app
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build app (skip if not TypeScript or Next.js)
RUN npm run build


# -----------------------------
# Stage 2 — Production image
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only package files and built app from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# ✅ Install only production dependencies (npm must exist)
RUN npm install --omit=dev

# Environment setup
# ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Optional healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000')" || exit 1

# Start app
CMD ["node", "dist/server.js"]
