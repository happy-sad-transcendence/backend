# 1) 빌드 스테이지
FROM node:23 AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# 모노레포 전체 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/auth-server/package.json ./apps/auth-server/
COPY libs/dto/package.json ./libs/dto/

COPY libs/dto ./libs/dto
COPY apps/auth-server ./apps/auth-server

RUN pnpm install --frozen-lockfile

RUN pnpm run build:dto
RUN pnpm run build:auth

# 2) 프로덕션 스테이지 - 빌드된 파일들만 복사
FROM node:23-slim
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# 모노레포 설정 파일들도 복사
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/auth-server/package.json ./apps/auth-server/
COPY --from=builder /app/libs/dto/package.json ./libs/dto/

# 빌드된 결과물만 복사
COPY --from=builder /app/apps/auth-server/dist ./apps/auth-server/dist
COPY --from=builder /app/libs/dto/dist ./libs/dto/dist

# .env 파일 복사 추가
COPY --from=builder /app/apps/auth-server/.env ./apps/auth-server/.env

# 프로덕션 의존성 설치 (모노레포 구조에서)
RUN pnpm install --prod --frozen-lockfile

# auth-server 실행
WORKDIR /app/apps/auth-server
CMD ["pnpm", "run", "start"]
