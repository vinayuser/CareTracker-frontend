# Production build served by nginx inside Docker.
#
# Quick start:
#   cp .env.docker.example .env.docker
#   nano .env.docker                    # set VITE_API_BASE_URL
#   docker compose --env-file .env.docker up -d --build
#
# Or manual build:
#   docker build -t caretracker-admin \
#     --build-arg VITE_API_BASE_URL=https://your-api.com/api .

FROM node:20-alpine AS build

WORKDIR /app

# Vite bakes this into the JS bundle at build time
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5137

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5137/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
