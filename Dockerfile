FROM node:20-alpine AS runner

# fix: npm may fail if bash or libc missing
RUN apk add --no-cache bash libc6-compat

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm install --omit=dev

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
