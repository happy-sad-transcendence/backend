# 1) 빌드 스테이지
FROM node:23 AS builder
WORKDIR /app

# Corepack 활성화 + pnpm shim 다운로드/활성화 (prompt 없이)
RUN corepack enable \
 && corepack prepare pnpm@10.11.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

COPY src ./src
RUN pnpm run build


# 2) 프로덕션 스테이지
FROM node:23-slim
WORKDIR /app

# Corepack 활성화 + pnpm shim 준비
RUN corepack enable \
 && corepack prepare pnpm@10.11.0 --activate

COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

CMD ["pnpm", "run", "start"]
