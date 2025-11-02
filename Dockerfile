# -----------------------------
# 🏗️  Stage 1: Build the app
# -----------------------------
FROM node:25-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (no dev dependencies for production build)
RUN npm install --production=false

# Copy all source code to container
COPY . .

# Run your build script (e.g., compiles TypeScript or builds Next.js)
RUN npm run build


# -----------------------------
# 🚀 Stage 2: Run the built app
# -----------------------------
FROM node:25-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm install --production

# Set environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Expose the app port
EXPOSE 3000

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health')" || exit 1

# Run the application
CMD ["npm", "start"]
