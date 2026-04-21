# ============================================================
#  Dockerfile - Frontend React + TypeScript
#  Compatible con Apple Silicon (M1/M2/M3) y x86_64
#  Etapa 1: Construcción con Node
# ============================================================
FROM --platform=$BUILDPLATFORM node:20-slim AS construccion

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ============================================================
#  Etapa 2: Servir con Nginx (ARM64 nativo)
# ============================================================
FROM nginx:stable

COPY --from=construccion /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
