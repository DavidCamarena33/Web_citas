-- ======================================
-- BASE DE DATOS
-- ======================================
CREATE DATABASE IF NOT EXISTS citas_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE citas_db;

-- ======================================
-- USUARIOS
-- ======================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,

  genero ENUM('hombre','mujer') NOT NULL,
  orientacion ENUM('hetero','bi','homosexual') NOT NULL,

  descripcion TEXT,
  lat DECIMAL(10,8) DEFAULT NULL,
  lng DECIMAL(11,8) DEFAULT NULL,

  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- INTERESES (TIPO DE PLAN)
-- ======================================
CREATE TABLE intereses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT
);

-- ======================================
-- PLANES
-- ======================================
CREATE TABLE planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_interes INT NOT NULL,

  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,

  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,

  fecha_plan DATETIME DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_plan_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_plan_interes
    FOREIGN KEY (id_interes) REFERENCES intereses(id)
);

-- ======================================
-- FOTOS USUARIOS
-- ======================================
CREATE TABLE fotos_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  orden INT DEFAULT 0,

  CONSTRAINT fk_foto_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ======================================
-- FOTOS PLANES
-- ======================================
CREATE TABLE fotos_planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_plan INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  orden INT DEFAULT 0,

  CONSTRAINT fk_foto_plan
    FOREIGN KEY (id_plan) REFERENCES planes(id)
    ON DELETE CASCADE
);

-- ======================================
-- SOLICITUDES
-- ======================================
CREATE TABLE solicitudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_plan INT NOT NULL,
  id_solicitante INT NOT NULL,

  mensaje TEXT,
  estado ENUM('pendiente','aceptada','rechazada') DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (id_plan, id_solicitante),

  CONSTRAINT fk_solicitud_plan
    FOREIGN KEY (id_plan) REFERENCES planes(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_solicitud_usuario
    FOREIGN KEY (id_solicitante) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ======================================
-- MENSAJES
-- ======================================
CREATE TABLE mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_solicitud INT NOT NULL,
  id_emisor INT NOT NULL,

  mensaje TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_mensaje_solicitud
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_mensaje_emisor
    FOREIGN KEY (id_emisor) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ======================================
-- NOTIFICACIONES
-- ======================================
CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_solicitud INT NOT NULL,

  tipo ENUM('recibida','aceptada','rechazada') NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notificacion_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_notificacion_solicitud
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id)
    ON DELETE CASCADE
);
