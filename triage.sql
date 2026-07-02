-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 23-06-2026 a las 18:12:42
-- Versión del servidor: 8.4.7
-- Versión de PHP: 8.3.28
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `triage`
--

-------------------------------------------------

--
-- Estructura de tabla para la tabla `contactoemergencia`
--

DROP TABLE IF EXISTS `contactoemergencia`;
CREATE TABLE IF NOT EXISTS `contactoemergencia` (
  `id_contacto` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentesco` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_contacto`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `contactoemergencia`
--

INSERT INTO `contactoemergencia` (`id_contacto`, `nombre_completo`, `parentesco`, `contacto`, `estado`, `fecha_creacion`) VALUES
(1, 'NO EXISTE', 'N/A', 'N/A', 'Activo', '2026-06-19 04:41:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hospital`
--

DROP TABLE IF EXISTS `hospital`;
CREATE TABLE IF NOT EXISTS `hospital` (
  `id_hospital` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidad` enum('SI','NO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_hospital`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `hospital`
--

INSERT INTO `hospital` (`id_hospital`, `nombre`, `direccion`, `capacidad`, `estado`, `fecha_creacion`) VALUES
(1, 'Hospital Gral 450', 'Blvd.  José María Patoni #403, Col. El Ciprés, 34217 Durango, Dgo., México. ', 'SI', 'Activo', '2026-06-19 04:44:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
CREATE TABLE IF NOT EXISTS `pacientes` (
  `id_paciente` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT '0000-00-00',
  `edad` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sexo` enum('Masculino','Femenino') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nss` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_sangre` enum('A+','A-','B+','B-','AB+','AB-','O+','O-','DESCONOCIDO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `donador_organos` enum('SI','NO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NO',
  `fk_contacto` int NOT NULL,
  `fk_hospital` int NOT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_paciente`),
  KEY `fk_paciente_contacto` (`fk_contacto`),
  KEY `fk_paciente_hospital` (`fk_hospital`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id_paciente`, `nombre_completo`, `fecha_nacimiento`, `edad`, `sexo`, `nss`, `tipo_sangre`, `donador_organos`, `fk_contacto`, `fk_hospital`, `estado`, `fecha_creacion`) VALUES
(6, 'es', '2006-08-07', '20', 'Masculino', '74551', 'DESCONOCIDO', 'NO', 1, 1, 'Inactivo', '2026-06-19 04:44:31'),
(8, 'Daira Roldan', '2006-01-01', 'Aprox 20 años', 'Femenino', NULL, 'DESCONOCIDO', 'NO', 1, 1, 'Activo', '2026-06-20 06:36:30'),
(9, 'Liliana Limon', NULL, 'APROX 35', 'Femenino', NULL, 'DESCONOCIDO', 'NO', 1, 1, 'Activo', '2026-06-22 00:27:34'),
(10, 'Hazzol Medina', NULL, 'APROX 20', 'Femenino', NULL, 'DESCONOCIDO', 'NO', 1, 1, 'Activo', '2026-06-22 01:02:22'),
(11, 'Imanol Alvarado', NULL, 'APROX 19 años', 'Masculino', NULL, 'A+', 'NO', 1, 1, 'Activo', '2026-06-22 04:45:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

DROP TABLE IF EXISTS `persona`;
CREATE TABLE IF NOT EXISTS `persona` (
  `id_persona` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('Medico(a)','Paramedico(a)','Enfermero(a)','Admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`id_persona`, `nombre`, `apellidos`, `rol`, `usuario`, `password`, `estado`, `fecha_creacion`) VALUES
(1, 'Juan', 'Perez', 'Admin', 'juanp', '$2a$10$l6QDFPAFr3HDf6EPtFk2mu/vdu.ms/ynHTZOx.92xMKdsjNRtHMAy', 'Activo', '2026-06-19 04:29:10'),
(2, 'Juana', 'undefined', 'Medico(a)', 'juanab', '$2y$10$O6hnC/v/oAH55gQvcEECL.9d28oP6WzdrZDPrDzfge5sjTYOom8yO', 'Inactivo', '2026-06-20 20:52:29'),
(7, 'Juana Ines', 'Belen', 'Medico(a)', 'Juanona', '$2y$12$xJbni6QGHk/8Fqtvh5Y2xOAkP5x72rnifuIEqgJRdCpqx74RjUvq2', 'Inactivo', '2026-06-20 20:59:55'),
(8, 'Hazzol', 'Medina', 'Paramedico(a)', 'hyaz', '$2y$12$eMmUYawiy6uJYG8IBXNgEe.U4SsPFF7o7qC40YF017Vw0TwEOO3lu', 'Activo', '2026-06-20 21:03:43'),
(9, 'Daira', 'Roldan', 'Medico(a)', 'dai', '$2y$12$P5sp/WOuU3f/Uc2LhcSDd.aPft0ym8z3zJiKoyR1PzIDQanHcwFqS', 'Activo', '2026-06-20 21:04:13'),
(10, 'Imanol', 'Alvarado', 'Enfermero(a)', 'immnol', '$2y$12$pldwG5rzhdeL0TqRsaoLUui/dlfkUUVrHG.sFMjvUkjVqrr6pr65e', 'Activo', '2026-06-20 21:04:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona_hospital`
--

DROP TABLE IF EXISTS `persona_hospital`;
CREATE TABLE IF NOT EXISTS `persona_hospital` (
  `id_personahospital` int NOT NULL AUTO_INCREMENT,
  `fk_hospital` int NOT NULL,
  `fk_persona` int NOT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_personahospital`),
  KEY `fk_personahospital_hospital` (`fk_hospital`),
  KEY `fk_personahospital_persona` (`fk_persona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `triage`
--

DROP TABLE IF EXISTS `triage`;
CREATE TABLE IF NOT EXISTS `triage` (
  `id_triage` int NOT NULL AUTO_INCREMENT,
  `sintomas` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metodo_evaluacion` enum('START','JumpSTART','META','Manchester','ESI','ABCDE','NEWS2','Triage IMSS','Triage ISSSTE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel_evaluacion` enum('ROJO','NARANJA','AMARILLO','VERDE','AZUL','BLANCO','NEGRO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frecuencia_cardiaca` smallint NOT NULL,
  `presion_arterial` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `temperatura` decimal(4,1) NOT NULL,
  `habitacion` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_persona` int NOT NULL,
  `fk_paciente` int NOT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_triage` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_triage`),
  KEY `fk_triage_persona` (`fk_persona`),
  KEY `fk_triage_paciente` (`fk_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `triage`
--

INSERT INTO `triage` (`id_triage`, `sintomas`, `metodo_evaluacion`, `nivel_evaluacion`, `comentarios`, `frecuencia_cardiaca`, `presion_arterial`, `temperatura`, `habitacion`, `fk_persona`, `fk_paciente`, `estado`, `fecha_triage`, `fecha_creacion`) VALUES
(1, 'xugvkj', 'Triage IMSS', 'NARANJA', 'yrtxufcgkh b,', 70, '110/80', 36.7, 'A1', 1, 6, 'Inactivo', '2026-06-18 22:56:08', '2026-06-19 04:56:08'),
(2, 'bvdscax', 'START', 'ROJO', 'garsfeDWS', 90, '120/80', 36.0, NULL, 1, 6, 'Inactivo', '2026-06-19 12:40:26', '2026-06-19 18:40:26'),
(7, 'dxcfjhkgvjbhldsfwdwazfdsxcdrgwrwfdvfrgefw', 'Triage IMSS', 'NARANJA', 'dxufcgkhgvhjbl.', 120, '170/90', 36.7, 'A1', 1, 8, 'Activo', '2026-06-20 01:22:24', '2026-06-20 07:22:24'),
(8, 'cfytkgvuylh', 'META', 'NARANJA', 'hgcvjhbk', 60, '120/80', 36.7, NULL, 1, 8, 'Inactivo', '2026-06-21 18:25:03', '2026-06-22 00:25:03'),
(9, 'CGVBHLKJNKL', 'JumpSTART', 'ROJO', 'FGKHVJLBKJ', 120, '120/80', 36.7, NULL, 1, 9, 'Inactivo', '2026-06-21 18:28:00', '2026-06-22 00:28:00'),
(10, 'dxtfchbjkjnk', 'START', 'ROJO', 'm g,m', 120, '120/80', 36.7, NULL, 1, 9, 'Activo', '2026-06-21 18:29:42', '2026-06-22 00:29:42'),
(11, 'hbkjnkl', 'START', 'ROJO', 'hkbjlkn', 120, '120/80', 36.7, NULL, 1, 10, 'Activo', '2026-06-21 19:09:06', '2026-06-22 01:09:06');

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `fk_paciente_contacto` FOREIGN KEY (`fk_contacto`) REFERENCES `contactoemergencia` (`id_contacto`),
  ADD CONSTRAINT `fk_paciente_hospital` FOREIGN KEY (`fk_hospital`) REFERENCES `hospital` (`id_hospital`);

--
-- Filtros para la tabla `persona_hospital`
--
ALTER TABLE `persona_hospital`
  ADD CONSTRAINT `fk_personahospital_hospital` FOREIGN KEY (`fk_hospital`) REFERENCES `hospital` (`id_hospital`),
  ADD CONSTRAINT `fk_personahospital_persona` FOREIGN KEY (`fk_persona`) REFERENCES `persona` (`id_persona`);

--
-- Filtros para la tabla `triage`
--
ALTER TABLE `triage`
  ADD CONSTRAINT `fk_triage_paciente` FOREIGN KEY (`fk_paciente`) REFERENCES `pacientes` (`id_paciente`),
  ADD CONSTRAINT `fk_triage_persona` FOREIGN KEY (`fk_persona`) REFERENCES `persona` (`id_persona`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
