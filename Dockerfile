# --- 1) ติดตั้ง deps ด้วย Yarn classic ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# --- 2) build ---
FROM node:20-alpine AS builder
WORKDIR /app
# ใช้ node_modules ที่ติดตั้งไว้แล้วจากสเตจ deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && yarn build

# --- 3) run (production) ---
# แนวทางง่าย: ยก node_modules มาด้วย (ภาพใหญ่ขึ้นนิดหน่อย แต่ไม่วุ่น)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["sh","-c","node node_modules/next/dist/bin/next start -p ${PORT:-3000} -H 0.0.0.0"]
