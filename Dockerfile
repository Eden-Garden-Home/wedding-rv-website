FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run test:sites && npm run test:invites

FROM node:24-alpine AS api
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./server/
EXPOSE 8787
CMD ["node", "server/start.mjs"]

FROM nginx:stable-alpine AS web
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client/ /usr/share/nginx/html/
COPY --from=build /app/dist/admin/ /usr/share/nginx/admin/
EXPOSE 8080 8081
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
