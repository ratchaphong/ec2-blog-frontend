# --- 1) ติดตั้ง dependencies (dev+prod) ด้วย Yarn ---
# ใช้เลเยอร์นี้เพื่อ cache การติดตั้งให้ build ครั้งต่อไปเร็วขึ้น
FROM node:20-alpine AS deps
WORKDIR /app

# คัดลอกไฟล์ที่เกี่ยวกับ yarn ให้ครบ (รองรับทั้ง classic และ berry)
COPY package.json ./
COPY yarn.lock* ./
COPY .yarnrc.yml* ./
COPY .yarn/ ./.yarn/

# เปิด corepack เพื่อให้ใช้ yarn ที่ประกาศใน package.json/.yarnrc.yml ได้
# - ถ้าเป็น Yarn Berry และตั้ง nodeLinker เป็น node-modules จะสร้าง node_modules ให้
# - ถ้าเป็น Yarn v1 (classic) ก็ใช้ --frozen-lockfile ได้ตามปกติ
RUN corepack enable && \
    if [ -f .yarnrc.yml ]; then \
      yarn install --immutable; \
    else \
      yarn install --frozen-lockfile; \
    fi


# --- 2) build (ไม่รับ ENV/ARG อะไร ตามที่ต้องการ) ---
FROM node:20-alpine AS builder
WORKDIR /app

# ต้องคัดลอกไฟล์ yarn config ด้วย ถ้าเป็น Yarn Berry
COPY .yarnrc.yml* ./
COPY .yarn/ ./.yarn/

# ใช้ node_modules จากสเตจ deps เพื่อ build ได้ทันที
COPY --from=deps /app/node_modules ./node_modules

# คัดลอกซอร์สทั้งหมด
COPY . .

# สร้างไฟล์ build ของ Next.js
RUN corepack enable && yarn build


# --- 3) run stage (production) ---
# แนวทางง่าย: ยก node_modules จากสเตจ deps มาใช้ตอนรันด้วย (สะดวก/เสถียร)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# คัดลอกไฟล์ที่ต้องใช้ตอนรัน
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# คัดลอก node_modules ที่ติดตั้งไว้แล้ว (มีทั้ง prod/dev — ง่ายและชัวร์)
COPY --from=deps /app/node_modules ./node_modules

# (ออปชัน) ถ้าใช้ Yarn Berry และมีไฟล์ config
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/.yarn ./.yarn

# เปิดพอร์ตในคอนเทนเนอร์
EXPOSE 3000

# รันด้วย next start
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
# หรือจะใช้: CMD ["npx", "next", "start", "-p", "3000"] ก็ได้
