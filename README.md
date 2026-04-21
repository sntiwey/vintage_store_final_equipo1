

# La Boutique Vintage & Co.
### E-commerce de ropa vintage — Spring Boot + React + MySQL + Docker

---

## Mac Apple Silicon (M1/M2/M3) — Inicio rápido

```bash
# 1. Dar permisos al script
chmod +x arrancar.sh

# 2. Ejecutar (detecta tu arquitectura automáticamente)
./arrancar.sh

# Si tuviste problemas antes, limpia y vuelve a empezar:
./arrancar.sh --limpiar
```

---

## Solución de problemas comunes en M1/M2/M3

**Error: "no matching manifest for linux/arm64"**
```bash
export DOCKER_DEFAULT_PLATFORM=linux/arm64/v8
docker compose build --no-cache
docker compose up -d
```

**MySQL se reinicia en bucle**
```bash
docker compose down -v
docker volume rm tienda-vintage_datos_mysql 2>/dev/null || true
./arrancar.sh
```

**Backend no conecta a MySQL**
```bash
# Levantar solo MySQL primero, esperar que diga "ready for connections"
docker compose up mysql -d
docker compose logs -f mysql
# Luego levantar el resto
docker compose up backend frontend -d
```

**Puerto 3306 ya ocupado (MySQL local corriendo)**
En `docker-compose.yml` cambia `"3306:3306"` a `"3307:3306"` y conecta Workbench al puerto 3307.

---

## Arquitectura por Capas

```
[ Controladores ]  ←→  HTTP / JSON
       ↓
[ Servicios    ]   ←→  Lógica de negocio
       ↓
[ Repositorios ]   ←→  Spring Data JPA
       ↓
[ Modelos      ]   ←→  Entidades MySQL
```

---

## Credenciales por defecto

| Rol   | Correo                  | Contraseña |
|-------|-------------------------|------------|
| Admin | admin@tiendavintage.com | admin123   |

---

##  MySQL Workbench

| Campo      | Valor          |
|------------|----------------|
| Host       | 127.0.0.1      |
| Puerto     | 3306           |
| Usuario    | vintage_user   |
| Contraseña | vintage1234    |
| BD         | tienda_vintage |

---

##Endpoints

| Método | Ruta                         | Auth  | Descripción          |
|--------|------------------------------|-------|----------------------|
| POST   | /api/autenticacion/registrar | No    | Crear cuenta         |
| POST   | /api/autenticacion/login     | No    | Login                |
| GET    | /api/productos               | No    | Listar productos     |
| GET    | /api/productos/destacados    | No    | Destacados           |
| GET    | /api/productos/buscar?q=     | No    | Buscar               |
| GET    | /api/carrito                 | JWT   | Ver carrito          |
| POST   | /api/carrito/agregar         | JWT   | Agregar al carrito   |
| POST   | /api/pedidos                 | JWT   | Crear pedido         |
| GET    | /api/pedidos/mis-pedidos     | JWT   | Mis pedidos          |
| POST   | /api/admin/productos         | ADMIN | Crear producto       |
| PUT    | /api/admin/productos/{id}    | ADMIN | Actualizar producto  |
| DELETE | /api/admin/productos/{id}    | ADMIN | Desactivar producto  |

*Hecho con  — compatible con Apple Silicon y x86*

