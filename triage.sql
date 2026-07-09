-- =====================================================================
-- BASE DE DATOS `triage` — ESQUEMA MEJORADO
-- Adaptado para 3 métodos de clasificación: IGU-IMSS, ISSSTE, START/JumpSTART
-- Motor: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================
--
-- CAMBIOS PRINCIPALES vs. el dump original:
--  1. El bug original de `pacientes` (KEY apuntando a fk_contacto y
--     fk_hospital, columnas que nunca se definieron) queda resuelto
--     de raíz: para el MVP esas columnas simplemente no existen.
--  2. `edad` deja de ser texto libre: se agrega `edad_meses` (numérico,
--     necesario para los rangos pediátricos del IMSS y JumpSTART) y
--     un flag `edad_estimada` para cuando el paciente llega sin datos
--     (típico de urgencias/desastres).
--  3. El `triage` genérico se separa en: 1 tabla cabecera (común a los
--     3 métodos) + 3 tablas de detalle, una por algoritmo, porque cada
--     uno evalúa variables distintas (IMSS = acciones dx/tx y riesgo;
--     ISSSTE = signos vitales + Glasgow + glucosa + patología;
--     START = deambulación/respiración/perfusión/estado mental).
--  4. Catálogos `metodos_triage`, `niveles_triage` y `patologias_isste`
--     en vez de ENUMs gigantes, para poder agregar/editar niveles o
--     patologías sin alterar la estructura de las tablas.
--
-- NOTA MVP: se omiten `hospitales` y `contactos` por ahora (no
-- necesarias en esta etapa). Ver comentario al final del archivo por
-- si luego quieres agregarlas sin rediseñar `pacientes` de nuevo.
-- =====================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- pacientes (corregida)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `pacientes`;
CREATE TABLE `pacientes` (
  `id_paciente` INT NOT NULL AUTO_INCREMENT,
  `nombre_completo` VARCHAR(50) DEFAULT NULL,
  `fecha_nacimiento` DATE DEFAULT NULL,
  -- Edad numérica en meses: permite aplicar los rangos pediátricos
  -- exactos del criterio D (IMSS) y de JumpSTART sin parsear texto.
  `edad_meses` INT UNSIGNED DEFAULT NULL,
  `edad_estimada` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = edad aproximada (paciente sin identificar/no responde)',
  `sexo` ENUM('Masculino','Femenino') NOT NULL,
  `nss` VARCHAR(15) DEFAULT NULL,
  `tipo_sangre` ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','DESCONOCIDO') DEFAULT 'DESCONOCIDO',
  `donador_organos` ENUM('SI','NO') NOT NULL DEFAULT 'NO',
  `estado` ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `fecha_creacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- persona (personal médico) — se mantiene igual, solo se limpia charset
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `persona`;
CREATE TABLE `persona` (
  `id_persona` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `apellidos` VARCHAR(50) NOT NULL,
  `rol` ENUM('Medico(a)','Paramedico(a)','Enfermero(a)','Admin') NOT NULL,
  `usuario` VARCHAR(30) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `estado` ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `fecha_creacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Catálogo: métodos de evaluación soportados (solo los 3 que usas)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `metodos_triage`;
CREATE TABLE `metodos_triage` (
  `id_metodo` TINYINT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(20) NOT NULL COMMENT 'IGU_IMSS | ISSSTE | START_JUMPSTART',
  `nombre` VARCHAR(60) NOT NULL,
  `ambito` ENUM('Hospitalario','Prehospitalario / IMV') NOT NULL,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_metodo`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `metodos_triage` (`id_metodo`, `codigo`, `nombre`, `ambito`, `descripcion`) VALUES
(1, 'IGU_IMSS', 'Índice de Gravedad de Urgencia (IMSS)', 'Hospitalario', 'Algoritmo IMSS de 5 niveles para urgencias hospitalarias.'),
(2, 'ISSSTE', 'Sistema de Triaje ISSSTE', 'Hospitalario', 'Clasificación ISSSTE de 3 niveles de prioridad.'),
(3, 'START_JUMPSTART', 'START / JumpSTART', 'Prehospitalario / IMV', 'Triaje rápido para incidentes con múltiples víctimas.');

-- ---------------------------------------------------------------------
-- Catálogo: niveles/colores resultantes, ligados a su método
-- (unifica el color final que ve el usuario, sin importar el método)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `niveles_triage`;
CREATE TABLE `niveles_triage` (
  `id_nivel` SMALLINT NOT NULL AUTO_INCREMENT,
  `fk_metodo` TINYINT NOT NULL,
  `codigo_nivel` VARCHAR(20) NOT NULL COMMENT 'Ej: "1", "Naranja", "Prioridad I", "Rojo"',
  `nombre` VARCHAR(40) NOT NULL,
  `color` ENUM('ROJO','NARANJA','AMARILLO','VERDE','AZUL','NEGRO') NOT NULL,
  `orden_prioridad` TINYINT NOT NULL COMMENT '1 = más urgente',
  `tiempo_atencion` VARCHAR(60) DEFAULT NULL,
  PRIMARY KEY (`id_nivel`),
  KEY `fk_nivel_metodo` (`fk_metodo`),
  CONSTRAINT `fk_nivel_metodo` FOREIGN KEY (`fk_metodo`) REFERENCES `metodos_triage` (`id_metodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `niveles_triage` (`fk_metodo`, `codigo_nivel`, `nombre`, `color`, `orden_prioridad`, `tiempo_atencion`) VALUES
-- IGU-IMSS (5 niveles)
(1, '1', 'Nivel 1 - Rojo', 'ROJO', 1, 'Inmediata'),
(1, '2', 'Nivel 2 - Naranja', 'NARANJA', 2, 'Muy urgente'),
(1, '3', 'Nivel 3 - Amarillo', 'AMARILLO', 3, 'Urgente'),
(1, '4', 'Nivel 4 - Verde', 'VERDE', 4, 'Poco urgente'),
(1, '5', 'Nivel 5 - Azul', 'AZUL', 5, 'No urgente'),
-- ISSSTE (3 prioridades)
(2, 'I', 'Prioridad I - Rojo', 'ROJO', 1, 'Inmediata'),
(2, 'II', 'Prioridad II - Amarillo', 'AMARILLO', 2, '30-60 minutos'),
(2, 'III', 'Prioridad III - Verde', 'VERDE', 3, 'Sin límite establecido'),
-- START / JumpSTART (4 categorías)
(3, 'ROJO', 'Inmediato', 'ROJO', 1, 'Inmediata'),
(3, 'AMARILLO', 'Diferido', 'AMARILLO', 2, 'Puede esperar'),
(3, 'VERDE', 'Menor', 'VERDE', 3, 'Ambulatorio'),
(3, 'NEGRO', 'Fallecido / Expectante', 'NEGRO', 4, 'N/A');

-- ---------------------------------------------------------------------
-- Catálogo: patologías sugerentes de gravedad (ISSSTE), por nivel
-- Reemplaza el texto libre en comentarios por datos consultables.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patologias_isste`;
CREATE TABLE `patologias_isste` (
  `id_patologia` SMALLINT NOT NULL AUTO_INCREMENT,
  `fk_nivel` SMALLINT NOT NULL COMMENT 'Nivel ISSSTE al que sugiere esta patología',
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_patologia`),
  KEY `fk_patologia_nivel` (`fk_nivel`),
  CONSTRAINT `fk_patologia_nivel` FOREIGN KEY (`fk_nivel`) REFERENCES `niveles_triage` (`id_nivel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Se cargan a partir de las notas ISSSTE (rojo = id_nivel 6, amarillo = 7, verde = 8)
INSERT INTO `patologias_isste` (`fk_nivel`, `nombre`) VALUES
(6,'Trauma de cráneo severo'),(6,'Quemaduras extensas'),(6,'Quemaduras por corriente eléctrica'),
(6,'Quemaduras en cara'),(6,'Quemaduras en genitales'),(6,'Dificultad respiratoria'),(6,'Disnea'),
(6,'Aumento del trabajo respiratorio'),(6,'Síncope'),(6,'Dolor torácico'),(6,'Hemorragia severa'),
(6,'Trauma severo'),(6,'Trauma en múltiples órganos'),(6,'Extremidades frías'),(6,'Extremidades sin pulso'),
(6,'Amputación'),(6,'Diaforesis'),(6,'Palpitaciones persistentes aun con ECG'),
(6,'Hemorragia durante el embarazo'),(6,'Pérdida del estado de alerta'),(6,'Deshidratación severa'),
(6,'Confusión'),(6,'Desorientación'),(6,'Obstrucción de la vía aérea'),
(7,'Cefalea mayor de 8 horas'),(7,'Alteraciones neurológicas mayores de 8 horas'),
(7,'Dolor abdominal agudo'),(7,'Patología vascular crónica'),(7,'Trauma menor'),(7,'Contusiones'),
(7,'Fracturas no recientes'),(7,'Infección respiratoria con fiebre'),(7,'Hematuria'),
(7,'Pie diabético con compromiso sistémico'),(7,'Datos de sepsis'),(7,'Insuficiencia arterial aguda'),
(7,'Diarrea con deshidratación leve'),(7,'Lumbalgia aguda'),(7,'Urticaria'),
(7,'Reacciones a medicamentos'),(7,'Infecciones agudas'),(7,'Quemaduras leves'),(7,'Vómito'),
(8,'Gastroenteritis sin deshidratación'),(8,'Quemadura solar'),(8,'Contusiones leves'),
(8,'Dolor muscular'),(8,'Patologías crónicas no agudizadas'),(8,'Infecciones que no requieren hospitalización'),
(8,'Cefalea leve'),(8,'Infección de vías urinarias'),(8,'Cambios de sonda por mal funcionamiento'),
(8,'Pie diabético sin compromiso sistémico');

-- ---------------------------------------------------------------------
-- triage (CABECERA) — común a los 3 métodos
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `triage`;
CREATE TABLE `triage` (
  `id_triage` INT NOT NULL AUTO_INCREMENT,
  `fk_paciente` INT NOT NULL,
  `fk_persona` INT NOT NULL,
  `fk_metodo` TINYINT NOT NULL,
  `fk_nivel` SMALLINT DEFAULT NULL COMMENT 'Nivel/color resultante; NULL hasta que el algoritmo concluye',
  `sintomas` VARCHAR(150) NOT NULL,
  `comentarios` VARCHAR(150) DEFAULT NULL,
  `habitacion` VARCHAR(20) DEFAULT NULL,
  `estado` ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `fecha_triage` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_creacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_triage`),
  KEY `fk_triage_persona` (`fk_persona`),
  KEY `fk_triage_paciente` (`fk_paciente`),
  KEY `fk_triage_metodo` (`fk_metodo`),
  KEY `fk_triage_nivel` (`fk_nivel`),
  CONSTRAINT `fk_triage_paciente` FOREIGN KEY (`fk_paciente`) REFERENCES `pacientes` (`id_paciente`),
  CONSTRAINT `fk_triage_persona` FOREIGN KEY (`fk_persona`) REFERENCES `persona` (`id_persona`),
  CONSTRAINT `fk_triage_metodo` FOREIGN KEY (`fk_metodo`) REFERENCES `metodos_triage` (`id_metodo`),
  CONSTRAINT `fk_triage_nivel` FOREIGN KEY (`fk_nivel`) REFERENCES `niveles_triage` (`id_nivel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- triage_imss — detalle específico del Índice de Gravedad de Urgencia
-- Sigue el árbol: A) reanimación -> B) alto riesgo -> C) acciones dx/tx
-- -> D) signos vitales en zona de riesgo
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `triage_imss`;
CREATE TABLE `triage_imss` (
  `fk_triage` INT NOT NULL,
  -- Criterio A
  `requiere_reanimacion` TINYINT(1) NOT NULL DEFAULT 0,
  -- Criterio B
  `alto_riesgo` TINYINT(1) NOT NULL DEFAULT 0,
  `deterioro_neurologico_agudo` TINYINT(1) NOT NULL DEFAULT 0,
  `dolor_severo` TINYINT(1) NOT NULL DEFAULT 0,
  `dificultad_respiratoria_severa` TINYINT(1) NOT NULL DEFAULT 0,
  -- Criterio C
  `num_acciones_dx_tx` ENUM('Ninguna','Una','Varias') DEFAULT NULL,
  -- Criterio D: signos vitales (solo se llenan si C = 'Varias')
  `frecuencia_cardiaca` SMALLINT DEFAULT NULL,
  `frecuencia_respiratoria` SMALLINT DEFAULT NULL,
  `saturacion_oxigeno` DECIMAL(4,1) DEFAULT NULL,
  `signos_vitales_en_riesgo` TINYINT(1) DEFAULT NULL,
  PRIMARY KEY (`fk_triage`),
  CONSTRAINT `fk_imss_triage` FOREIGN KEY (`fk_triage`) REFERENCES `triage` (`id_triage`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- triage_isste — detalle específico ISSSTE
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `triage_isste`;
CREATE TABLE `triage_isste` (
  `fk_triage` INT NOT NULL,
  `glasgow` TINYINT DEFAULT NULL COMMENT '3-15',
  `presion_sistolica` SMALLINT DEFAULT NULL,
  `presion_diastolica` SMALLINT DEFAULT NULL,
  `frecuencia_cardiaca` SMALLINT DEFAULT NULL,
  `frecuencia_respiratoria` SMALLINT DEFAULT NULL,
  `temperatura` DECIMAL(4,1) DEFAULT NULL,
  `saturacion_oxigeno` DECIMAL(4,1) DEFAULT NULL,
  `glucosa_capilar` SMALLINT DEFAULT NULL,
  `fk_patologia` SMALLINT DEFAULT NULL COMMENT 'Patología sugerente que motivó el nivel',
  PRIMARY KEY (`fk_triage`),
  KEY `fk_isste_patologia` (`fk_patologia`),
  CONSTRAINT `fk_isste_triage` FOREIGN KEY (`fk_triage`) REFERENCES `triage` (`id_triage`) ON DELETE CASCADE,
  CONSTRAINT `fk_isste_patologia` FOREIGN KEY (`fk_patologia`) REFERENCES `patologias_isste` (`id_patologia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- triage_start — detalle específico START / JumpSTART
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `triage_start`;
CREATE TABLE `triage_start` (
  `fk_triage` INT NOT NULL,
  `tipo_paciente` ENUM('Adulto','Pediatrico') NOT NULL DEFAULT 'Adulto',
  `deambula` TINYINT(1) DEFAULT NULL COMMENT '¿Puede caminar?',
  `respira` TINYINT(1) DEFAULT NULL,
  `frecuencia_respiratoria` SMALLINT DEFAULT NULL,
  `perfusion_alterada` TINYINT(1) DEFAULT NULL COMMENT 'Llenado capilar >2s o pulso radial ausente (adulto) / pulso no palpable (pediátrico)',
  `estado_mental_alterado` TINYINT(1) DEFAULT NULL COMMENT 'No obedece órdenes (adulto) / AVPU no apropiado (pediátrico)',
  `ventilaciones_administradas` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Pediátrico: 5 ventilaciones de rescate',
  `intervenciones_criticas` VARCHAR(150) DEFAULT NULL COMMENT 'Control de hemorragia, vía aérea, descompresión torácica, etc.',
  PRIMARY KEY (`fk_triage`),
  CONSTRAINT `fk_start_triage` FOREIGN KEY (`fk_triage`) REFERENCES `triage` (`id_triage`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
