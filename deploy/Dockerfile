# EcoScape VR web app, served from the root of its own domain (VPS deploy).
FROM node:22-alpine AS build
WORKDIR /src/app
COPY app/package.json app/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY app/ ./
RUN npx vite build --base=/
COPY design/directions/index.html /src/app/dist/brand/index.html

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/app/dist /usr/share/nginx/html
