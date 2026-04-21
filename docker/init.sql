-- ============================================================
--  Tienda Vintage - Script de inicialización de base de datos
-- ============================================================

CREATE DATABASE IF NOT EXISTS tienda_vintage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tienda_vintage;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    correo      VARCHAR(150) NOT NULL UNIQUE,
    contrasena  VARCHAR(255) NOT NULL,
    telefono    VARCHAR(20),
    activo      BOOLEAN DEFAULT TRUE,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol_id      BIGINT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url  VARCHAR(500),
    activo      BOOLEAN DEFAULT TRUE
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    precio          DECIMAL(10,2) NOT NULL,
    precio_oferta   DECIMAL(10,2),
    stock           INT NOT NULL DEFAULT 0,
    talla           VARCHAR(20),
    color           VARCHAR(50),
    marca           VARCHAR(100),
    era             VARCHAR(50) COMMENT 'Ej: 70s, 80s, 90s',
    condicion       ENUM('EXCELENTE','BUENO','REGULAR') DEFAULT 'BUENO',
    imagen_url      VARCHAR(500),
    imagenes_extra  JSON,
    activo          BOOLEAN DEFAULT TRUE,
    destacado       BOOLEAN DEFAULT FALSE,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categoria_id    BIGINT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla de carritos
CREATE TABLE IF NOT EXISTS carritos (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  BIGINT UNIQUE,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS carrito_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    carrito_id  BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad    INT NOT NULL DEFAULT 1,
    FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      BIGINT NOT NULL,
    total           DECIMAL(10,2) NOT NULL,
    estado          ENUM('PENDIENTE','PAGADO','ENVIADO','ENTREGADO','CANCELADO') DEFAULT 'PENDIENTE',
    direccion       TEXT,
    ciudad          VARCHAR(100),
    codigo_postal   VARCHAR(10),
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de items del pedido
CREATE TABLE IF NOT EXISTS pedido_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       BIGINT NOT NULL,
    producto_id     BIGINT NOT NULL,
    cantidad        INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- ============================================================
--  Datos iniciales
-- ============================================================

INSERT INTO roles (nombre) VALUES ('ADMIN'), ('CLIENTE');

INSERT INTO categorias (nombre, descripcion) VALUES
('Camisetas',   'Tees y camisetas vintage urbanas'),
('Camisas',     'Flannels, hawaianas y overshirts'),
('Pantalones',  'Jeans, cargos y pantalones de epoca'),
('Accesorios',  'Gorras, cinturones, bolsos y mas'),
('Abrigos',     'Chamarras, bombers y abrigos vintage');

-- Contrasena: admin123 (BCrypt)
INSERT INTO usuarios (nombre, apellido, correo, contrasena, activo, rol_id)
VALUES ('Admin', 'Tienda', 'admin@tiendavintage.com',
        '$2a$10$g5.6j8zVhqrV7dD1R9xyZui3Stsy116kvkE0BVVd4a0QqN2uOoimy', TRUE, 1);

-- ============================================================
--  Productos vintage urbanos
-- ============================================================

-- Camisetas (categoria 1)
INSERT INTO productos (nombre, descripcion, precio, precio_oferta, stock, talla, color, marca, era, condicion, imagen_url, destacado, activo, categoria_id) VALUES
('Tee Grafica Rap 90s', 'Camiseta de algodon pesado con grafico de rap old school. Cuello redondo, corte relajado boxy fit.', 420.00, 320.00, 3, 'L', 'Negro', 'Fruit of the Loom', '90s', 'BUENO', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80', TRUE, TRUE, 1),
('Tee Tie-Dye 70s', 'Camiseta tie-dye original de los 70s. Colores vivos en espiral, 100% algodon grueso.', 380.00, NULL, 2, 'M', 'Multicolor', 'Hanes', '70s', 'BUENO', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80', TRUE, TRUE, 1),
('Tee Universitaria 80s', 'Camiseta universitaria americana de los 80s. Letras en relieve, cuello acanalado reforzado.', 350.00, NULL, 4, 'XL', 'Gris', 'Champion', '80s', 'EXCELENTE', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', FALSE, TRUE, 1),
('Tee Banda Rock 90s', 'Camiseta de banda de rock de los 90s. Grafico frontal y trasero, algodon suave desgastado.', 550.00, 450.00, 1, 'M', 'Negro', 'Anvil', '90s', 'BUENO', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80', TRUE, TRUE, 1),
('Tee Skate Logo 90s', 'Camiseta de skate con logo bordado en pecho izquierdo. Corte boxy, algodon grueso 180g.', 480.00, NULL, 2, 'L', 'Blanco', 'Sin marca', '90s', 'EXCELENTE', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', FALSE, TRUE, 1),
('Tee Estampado Tribal 90s', 'Camiseta con estampado tribal all-over. Colores tierra, corte regular fit.', 390.00, 300.00, 3, 'S', 'Cafe/Naranja', 'Sin marca', '90s', 'BUENO', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80', FALSE, TRUE, 1),

-- Camisas (categoria 2)
('Flannel Cuadros 90s', 'Camisa de franela a cuadros rojo y negro. Icono del grunge, corte oversized, bolsillos al pecho.', 620.00, NULL, 3, 'L', 'Rojo/Negro', 'Woolrich', '90s', 'BUENO', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', TRUE, TRUE, 2),
('Camisa Hawaiana 70s', 'Camisa hawaiana de rayon con estampado floral tropical. Botones de nacar, manga corta.', 580.00, 480.00, 2, 'M', 'Azul/Verde', 'Kahala', '70s', 'EXCELENTE', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80', TRUE, TRUE, 2),
('Overshirt Denim 80s', 'Camisa de mezclilla gruesa tipo overshirt. Bolsillos frontales con solapa, corte recto.', 750.00, NULL, 2, 'XL', 'Azul medio', 'Levis', '80s', 'BUENO', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80', FALSE, TRUE, 2),
('Camisa Bowling 80s', 'Camisa de bowling con rayas laterales y bordado en pecho. Poliester vintage, cuello camp.', 490.00, NULL, 3, 'M', 'Negro/Blanco', 'Sin marca', '80s', 'BUENO', 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80', FALSE, TRUE, 2),
('Flannel Verde Militar 90s', 'Camisa de franela en tono verde militar. Corte largo, ideal para usar abierta sobre tee.', 560.00, 440.00, 4, 'L', 'Verde', 'Pendleton', '90s', 'EXCELENTE', 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=80', TRUE, TRUE, 2),

-- Pantalones (categoria 3)
('Jeans Baggy 90s', 'Jeans baggy de los 90s. Corte ancho desde cadera, denim pesado 14oz, lavado medio.', 850.00, 700.00, 2, '32', 'Azul lavado', 'JNCO', '90s', 'BUENO', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', TRUE, TRUE, 3),
('Cargo Pants 90s', 'Pantalon cargo con multiples bolsillos laterales. Tela ripstop, corte relajado, cintura ajustable.', 780.00, NULL, 3, '30', 'Verde olivo', 'Dickies', '90s', 'EXCELENTE', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', TRUE, TRUE, 3),
('Jeans Acampanados 70s', 'Jeans acampanados autenticos de los 70s. Cintura alta, campana pronunciada desde la rodilla.', 920.00, NULL, 1, '28', 'Azul oscuro', 'Wrangler', '70s', 'BUENO', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80', FALSE, TRUE, 3),
('Pantalon Chino 80s', 'Pantalon chino de pinzas en color crema. Corte recto, tela de algodon, pretina alta.', 650.00, 520.00, 4, '32', 'Crema', 'Dockers', '80s', 'EXCELENTE', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80', FALSE, TRUE, 3),
('Jeans Slim 90s Desgastados', 'Jeans slim con desgaste natural en rodillas y muslos. Denim elastico, tiro medio.', 720.00, 580.00, 3, '30', 'Azul claro', 'Calvin Klein', '90s', 'BUENO', 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80', TRUE, TRUE, 3),

-- Accesorios (categoria 4)
('Gorra Snapback 90s', 'Gorra snapback con logo bordado frontal. Visera plana, ajuste trasero de plastico.', 320.00, NULL, 5, 'Unica', 'Negro', 'New Era', '90s', 'EXCELENTE', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80', TRUE, TRUE, 4),
('Cinturon Hebilla Grande 80s', 'Cinturon de cuero genuino con hebilla metalica grande estilo western. Largo ajustable.', 280.00, NULL, 4, 'Unica', 'Cafe', 'Sin marca', '80s', 'BUENO', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', FALSE, TRUE, 4),
('Mochila Nylon 90s', 'Mochila de nylon con multiples compartimentos y parches decorativos. Estilo urbano 90s.', 450.00, 380.00, 2, 'Unica', 'Negro', 'JanSport', '90s', 'BUENO', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80', FALSE, TRUE, 4),
('Gorra Trucker 80s', 'Gorra trucker con malla trasera y panel frontal bordado. Ajuste snapback, ala curva.', 260.00, NULL, 6, 'Unica', 'Blanco/Azul', 'Sin marca', '80s', 'BUENO', 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&q=80', FALSE, TRUE, 4),

-- Abrigos (categoria 5)
('Bomber Varsity 90s', 'Chamarra bomber estilo varsity. Mangas de cuero sintetico, cuerpo de lana. Parches bordados en espalda.', 1200.00, 980.00, 2, 'L', 'Negro/Rojo', 'Sin marca', '90s', 'EXCELENTE', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80', TRUE, TRUE, 5),
('Chamarra Denim 80s', 'Chamarra de mezclilla clasica con botones metalicos dorados. Corte recto, tela gruesa 12oz.', 950.00, NULL, 3, 'M', 'Azul medio', 'Levis', '80s', 'BUENO', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80', TRUE, TRUE, 5),
('Windbreaker 90s', 'Rompevientos de los 90s en nylon brillante. Capucha guardable en cuello, colores contrastantes.', 880.00, 720.00, 2, 'XL', 'Azul/Amarillo', 'Nike', '90s', 'BUENO', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', TRUE, TRUE, 5),
('Abrigo Trench 70s', 'Trench coat de los 70s en gabardina beige. Doble botonadura, cinturon incluido, forro interior.', 1450.00, NULL, 1, 'M', 'Beige', 'Burberry', '70s', 'EXCELENTE', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', FALSE, TRUE, 5),
('Chamarra Cuero 80s', 'Chamarra de cuero genuino negro estilo moto. Cremallera diagonal, hombreras, forro de seda.', 1800.00, 1500.00, 1, 'M', 'Negro', 'Wilson', '80s', 'EXCELENTE', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80', TRUE, TRUE, 5);
