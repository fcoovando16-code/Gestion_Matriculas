CREATE DATABASE IF NOT EXISTS gestion_matriculas;

USE gestion_matriculas;

DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS estudiantes;
DROP TABLE IF EXISTS carreras;

CREATE TABLE carreras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  rut VARCHAR(20) NOT NULL UNIQUE,
  correo VARCHAR(150) NOT NULL
);

CREATE TABLE matriculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  carrera_id INT NOT NULL,
  anio_academico INT NOT NULL,
  jornada VARCHAR(50) NOT NULL,
  estado_matricula VARCHAR(50) NOT NULL,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  FOREIGN KEY (carrera_id) REFERENCES carreras(id)
);

INSERT INTO carreras (nombre) VALUES
("Ingenieria en Sistemas"),
("Ingenieria Civil Industrial"),
("Analista Programador"),
("Administracion de Empresas"),
("Contador Auditor");
