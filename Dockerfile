FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN echo "===== package.json =====" && grep -n '"typescript"' package.json || true
RUN echo "===== package-lock.json =====" && grep -n '"typescript"\|"4.9.5"\|"6.0.2"' package-lock.json | head -n 50 || true
RUN npm ci --omit=dev

FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8000
CMD ["node", "backend/server.js"]


# # ── Stage 1: install production dependencies ──────────────────────────────────
# FROM node:22-alpine AS deps
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --omit=dev

# # ── Stage 2: runtime image ─────────────────────────────────────────────────────
# FROM node:22-alpine
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# EXPOSE 8000
# CMD ["node", "backend/server.js"]

