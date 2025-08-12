# --- 1) ติดตั้ง deps (ไม่ใช้ lockfile) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
# ติดตั้งแบบไม่ใช้/ไม่สร้าง yarn.lock -> ไม่ต้องมี yarn.lock ในรีโป
RUN corepack enable && yarn set version classic && yarn install --no-lockfile

# --- 2) build ---
FROM node:20-alpine AS builder
WORKDIR /app
# ใช้ node_modules จากขั้น deps
COPY --from=deps /app/node_modules ./node_modules
# คัดลอกซอร์สทั้งหมด
COPY . .
# สร้างไฟล์ Next.js
RUN corepack enable && yarn set version classic && yarn build

# --- 3) run (production only) ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# ติดตั้งเฉพาะ prod deps ใหม่แบบไม่ใช้ lockfile (ภาพจะเล็กกว่า copy ทั้ง node_modules)
COPY package.json ./
RUN yarn install --no-lockfile

# คัดลอกผล build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
# ฟังพอร์ตจาก env (ไม่มี env ก็ใช้ 3000) และ bind 0.0.0.0
CMD ["sh","-c","yarn set version classic >/dev/null 2>&1 || true; yarn start -p ${PORT:-3000} -H 0.0.0.0"]
