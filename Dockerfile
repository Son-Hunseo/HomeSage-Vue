# 1. Node.js를 사용하여 앱을 빌드합니다.
FROM node:16 as build-stage
WORKDIR /app

# 2. 패키지 파일을 복사하고, npm install을 실행합니다.
COPY package*.json ./
RUN npm install

# 3. 애플리케이션 코드를 복사하고 빌드합니다.
COPY . .

# 빌드에 필요한 환경 변수 설정
ARG VITE_SERVER_URL
ARG VITE_KAKAO_MAP_KEY

RUN npm run build

# 4. Nginx로 배포하기 위한 설정입니다.
FROM nginx:stable-alpine as production-stage

# 5. Nginx 설정 파일을 추가하여 SPA 문제를 해결합니다.
# Nginx 설정 파일을 작성합니다.
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# 6. 빌드된 파일을 Nginx가 제공할 위치로 복사합니다.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 7. 포트를 노출시키고 Nginx를 시작합니다.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]