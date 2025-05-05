# 1. Node.js 기반 이미지 사용
FROM node:23

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 종속성 설치
COPY package*.json ./
RUN npm install

# 4. 소스 복사
COPY . .

# 5. TypeScript 빌드
RUN npm run build

# 6. 앱 실행
CMD ["node", "dist/index.js"]