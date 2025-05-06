# 1) 빌드 스테이지
FROM node:23 AS builder
WORKDIR /app

# 의존성 + 타입스크립트 설정만 먼저 복사
COPY package*.json tsconfig.json ./
RUN npm install

# 소스 복사 & 빌드
COPY src ./src
RUN npm run build

# 2) 프로덕션 스테이지
FROM node:23-slim
WORKDIR /app

# 빌드 결과물만 복사
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# 프로덕션용 의존성 설치
RUN npm install --production

# 실제 실행
CMD ["npm", "run", "start"]
