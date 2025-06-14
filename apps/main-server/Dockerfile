# 1) 빌드 스테이지
FROM node:23 AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# 모노레포 전체 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY libs/dto ./libs/dto
COPY apps/main-server ./apps/main-server

RUN pnpm install --frozen-lockfile

RUN pnpm run build:main
RUN pnpm install --prod --frozen-lockfile

# 2) 프로덕션 스테이지 - 빌드된 파일들만 복사
FROM node:23-slim
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# 모노레포 설정 파일들도 복사
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/main-server/package.json ./apps/main-server/
COPY --from=builder /app/libs/dto/package.json ./libs/dto/ 

# 빌드된 결과물만 복사
COPY --from=builder /app/apps/main-server/dist ./apps/main-server/dist
COPY --from=builder /app/libs/dto/dist ./libs/dto/dist
COPY --from=builder /app/libs/dto/node_modules/ ./libs/dto/node_modules 

# .env 파일 복사 추가
COPY --from=builder /app/apps/main-server/.env ./apps/main-server/.env

# 패키지 복사
COPY --from=builder /app/node_modules/ ./node_modules
COPY --from=builder /app/apps/main-server/node_modules/ ./apps/main-server/node_modules

# auth-server 실행
WORKDIR /app/apps/auth-server
CMD ["pnpm", "run", "start"]
