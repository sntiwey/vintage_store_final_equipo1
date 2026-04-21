#!/bin/bash
# ============================================================
#  arrancar.sh — Script de inicio para Mac M1/M2/M3 y x86
#  Uso: chmod +x arrancar.sh && ./arrancar.sh
# ============================================================

set -e

VERDE='\033[0;32m'
AMARILLO='\033[1;33m'
ROJO='\033[0;31m'
AZUL='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${AZUL}╔══════════════════════════════════════╗${NC}"
echo -e "${AZUL}║          AVR tienda vintage          ║${NC}"
echo -e "${AZUL}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Detectar arquitectura ──
ARCH=$(uname -m)
echo -e "${AMARILLO}► Arquitectura detectada:${NC} $ARCH"

if [[ "$ARCH" == "arm64" ]]; then
  echo -e "${VERDE}✓ Apple Silicon detectado (M1/M2/M3) — usando imágenes ARM64${NC}"
  export DOCKER_DEFAULT_PLATFORM=linux/arm64/v8
else
  echo -e "${VERDE}✓ Intel/AMD detectado — usando imágenes x86_64${NC}"
  export DOCKER_DEFAULT_PLATFORM=linux/amd64
fi

# ── Verificar Docker ──
if ! command -v docker &> /dev/null; then
  echo -e "${ROJO}✗ Docker no está instalado. Descárgalo en: https://www.docker.com/products/docker-desktop${NC}"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${ROJO}✗ Docker Desktop no está corriendo. Ábrelo primero.${NC}"
  exit 1
fi

echo -e "${VERDE}✓ Docker está corriendo${NC}"

# ── Opción de limpieza ──
if [[ "$1" == "--limpiar" ]]; then
  echo ""
  echo -e "${AMARILLO}► Limpiando contenedores y volúmenes anteriores...${NC}"
  docker compose down -v --remove-orphans 2>/dev/null || true
  docker volume rm tienda-vintage_datos_mysql 2>/dev/null || true
  echo -e "${VERDE}✓ Limpieza completada${NC}"
fi

# ── Construir y levantar ──
echo ""
echo -e "${AMARILLO}► Construyendo imágenes Docker...${NC}"
echo -e "${AMARILLO}  (Primera vez puede tardar 3-5 minutos, ten paciencia ☕)${NC}"
echo ""

docker compose build --no-cache

echo ""
echo -e "${AMARILLO}► Levantando servicios...${NC}"
docker compose up -d

# ── Esperar a que estén listos ──
echo ""
echo -e "${AMARILLO}► Esperando que MySQL esté listo...${NC}"
INTENTOS=0
MAX_INTENTOS=20
until docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot1234 --silent 2>/dev/null; do
  INTENTOS=$((INTENTOS + 1))
  if [ $INTENTOS -ge $MAX_INTENTOS ]; then
    echo -e "${ROJO}✗ MySQL tardó demasiado. Revisa los logs: docker compose logs mysql${NC}"
    exit 1
  fi
  echo -e "  Intento $INTENTOS/$MAX_INTENTOS — esperando 5s..."
  sleep 5
done

echo -e "${VERDE}✓ MySQL listo${NC}"

echo ""
echo -e "${AMARILLO}► Esperando que el backend arranque...${NC}"
sleep 10
INTENTOS=0
until curl -s http://localhost:8080/api/productos > /dev/null 2>&1; do
  INTENTOS=$((INTENTOS + 1))
  if [ $INTENTOS -ge 15 ]; then
    echo -e "${AMARILLO}⚠ El backend aún está iniciando, puede tardar un poco más${NC}"
    break
  fi
  echo -e "  Intento $INTENTOS/15 — esperando 5s..."
  sleep 5
done

# ── Resumen ──
echo ""
echo -e "${VERDE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${VERDE}║  ✓ ¡Todo listo! Servicios disponibles:       ║${NC}"
echo -e "${VERDE}╠══════════════════════════════════════════════╣${NC}"
echo -e "${VERDE}║   Frontend  →  http://localhost:3000         ║${NC}"
echo -e "${VERDE}║   Backend   →  http://localhost:8080/api     ║${NC}"
echo -e "${VERDE}║   MySQL     →  localhost:3306                ║${NC}"
echo -e "${VERDE}║                                              ║${NC}"
echo -e "${VERDE}║   Admin: admin@tiendavintage.com             ║${NC}"
echo -e "${VERDE}║   Pass:  admin123                            ║${NC}"
echo -e "${VERDE}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Para ver logs en tiempo real:"
echo -e "  ${AZUL}docker compose logs -f${NC}"
echo ""
echo -e "Para detener todo:"
echo -e "  ${AZUL}docker compose down${NC}"
echo ""
