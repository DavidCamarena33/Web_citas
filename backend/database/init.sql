CREATE DATABASE IF NOT EXISTS citas;

use citas;

CREATE TABLE intereses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo ENUM('hombre', 'mujer', 'otro') NOT NULL,
    orientacion ENUM('hetero', 'gay', 'bi', 'otro') NOT NULL,
    descripcion TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_intereses (
    id_usuario INT NOT NULL,
    id_interes INT NOT NULL,
    PRIMARY KEY (id_usuario, id_interes),
    CONSTRAINT fk_ui_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_ui_interes FOREIGN KEY (id_interes) REFERENCES intereses (id) ON DELETE CASCADE
);

CREATE TABLE fotos_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    path VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_anfitrion INT NOT NULL,
    id_interes INT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_usuario FOREIGN KEY (id_anfitrion) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_interes FOREIGN KEY (id_interes) REFERENCES intereses (id) ON DELETE SET NULL
);

CREATE TABLE fotos_planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    CONSTRAINT fk_fp_plan FOREIGN KEY (id_plan) REFERENCES planes (id) ON DELETE CASCADE
);

CREATE TABLE solicitudes_cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitante INT NOT NULL,
    id_plan INT NOT NULL,
    mensaje_presentacion TEXT,
    estado ENUM(
        'pendiente',
        'aceptada',
        'rechazada'
    ) DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_solicitante, id_plan),
    CONSTRAINT fk_sol_usuario FOREIGN KEY (id_solicitante) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_sol_plan FOREIGN KEY (id_plan) REFERENCES planes (id) ON DELETE CASCADE
);

CREATE TABLE mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_emisor INT NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitudes_cita (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_emisor FOREIGN KEY (id_emisor) REFERENCES usuarios (id) ON DELETE CASCADE
);