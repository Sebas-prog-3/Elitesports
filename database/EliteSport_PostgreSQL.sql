-- ============================================================
-- ELITESPORT - MODELO FISICO
-- PostgreSQL
-- 19 tablas - PK, FK, UNIQUE, CHECK e integridad referencial
-- ============================================================

DROP SCHEMA IF EXISTS elitesport CASCADE;
CREATE SCHEMA elitesport;
SET search_path TO elitesport;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
    id_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
);

-- ============================================================
-- 2. USUARIOS
-- ============================================================
CREATE TABLE usuarios (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_rol INTEGER NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- 3. DEPORTISTAS
-- ============================================================
CREATE TABLE deportistas (
    id_deportista INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_deportistas_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- 4. ENTRENADORES
-- ============================================================
CREATE TABLE entrenadores (
    id_entrenador INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    fecha_contratacion DATE NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_entrenadores_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- 5. DEPORTES
-- ============================================================
CREATE TABLE deportes (
    id_deporte INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 6. CATEGORIAS
-- ============================================================
CREATE TABLE categorias (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_deporte INTEGER NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    edad_minima INTEGER NOT NULL,
    edad_maxima INTEGER NOT NULL,
    descripcion VARCHAR(150),

    CONSTRAINT fk_categorias_deporte
        FOREIGN KEY (id_deporte)
        REFERENCES deportes(id_deporte)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_categorias_edad
        CHECK (edad_minima >= 0 AND edad_maxima >= edad_minima),

    CONSTRAINT uq_categorias_deporte_nombre
        UNIQUE (id_deporte, nombre)
);

-- ============================================================
-- 7. EQUIPOS
-- ============================================================
CREATE TABLE equipos (
    id_equipo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_categoria INTEGER NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_equipos_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_equipos_categoria_nombre
        UNIQUE (id_categoria, nombre)
);

-- ============================================================
-- 8. EQUIPO_DEPORTISTA
-- ============================================================
CREATE TABLE equipo_deportista (
    id_equipo_deportista INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_equipo INTEGER NOT NULL,
    id_deportista INTEGER NOT NULL,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_salida DATE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_equipo_deportista_equipo
        FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_equipo_deportista_deportista
        FOREIGN KEY (id_deportista)
        REFERENCES deportistas(id_deportista)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_equipo_deportista_fechas
        CHECK (fecha_salida IS NULL OR fecha_salida >= fecha_ingreso),

    CONSTRAINT uq_equipo_deportista
        UNIQUE (id_equipo, id_deportista, fecha_ingreso)
);

-- ============================================================
-- 9. ENTRENADOR_EQUIPO
-- ============================================================
CREATE TABLE entrenador_equipo (
    id_entrenador_equipo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_entrenador INTEGER NOT NULL,
    id_equipo INTEGER NOT NULL,
    fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_entrenador_equipo_entrenador
        FOREIGN KEY (id_entrenador)
        REFERENCES entrenadores(id_entrenador)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_entrenador_equipo_equipo
        FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_entrenador_equipo
        UNIQUE (id_entrenador, id_equipo, fecha_asignacion)
);

-- ============================================================
-- 10. INSTALACIONES
-- ============================================================
CREATE TABLE instalaciones (
    id_instalacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    ubicacion VARCHAR(150),
    capacidad INTEGER,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_instalaciones_capacidad
        CHECK (capacidad IS NULL OR capacidad > 0)
);

-- ============================================================
-- 11. HORARIOS
-- ============================================================
CREATE TABLE horarios (
    id_horario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    CONSTRAINT chk_horarios_horas
        CHECK (hora_fin > hora_inicio),

    CONSTRAINT chk_horarios_dia
        CHECK (
            dia_semana IN (
                'Lunes', 'Martes', 'Miércoles',
                'Jueves', 'Viernes', 'Sábado', 'Domingo'
            )
        ),

    CONSTRAINT uq_horarios
        UNIQUE (dia_semana, hora_inicio, hora_fin)
);

-- ============================================================
-- 12. ENTRENAMIENTOS
-- ============================================================
CREATE TABLE entrenamientos (
    id_entrenamiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_equipo INTEGER NOT NULL,
    id_entrenador INTEGER NOT NULL,
    id_instalacion INTEGER NOT NULL,
    id_horario INTEGER NOT NULL,
    fecha DATE NOT NULL,
    descripcion VARCHAR(200),

    CONSTRAINT fk_entrenamientos_equipo
        FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_entrenamientos_entrenador
        FOREIGN KEY (id_entrenador)
        REFERENCES entrenadores(id_entrenador)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_entrenamientos_instalacion
        FOREIGN KEY (id_instalacion)
        REFERENCES instalaciones(id_instalacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_entrenamientos_horario
        FOREIGN KEY (id_horario)
        REFERENCES horarios(id_horario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- 13. ASISTENCIAS
-- ============================================================
CREATE TABLE asistencias (
    id_asistencia INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_entrenamiento INTEGER NOT NULL,
    id_deportista INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL,
    observacion VARCHAR(200),

    CONSTRAINT fk_asistencias_entrenamiento
        FOREIGN KEY (id_entrenamiento)
        REFERENCES entrenamientos(id_entrenamiento)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_asistencias_deportista
        FOREIGN KEY (id_deportista)
        REFERENCES deportistas(id_deportista)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_asistencias_estado
        CHECK (estado IN ('Presente', 'Ausente', 'Justificado')),

    CONSTRAINT uq_asistencia_entrenamiento_deportista
        UNIQUE (id_entrenamiento, id_deportista)
);

-- ============================================================
-- 14. TORNEOS
-- ============================================================
CREATE TABLE torneos (
    id_torneo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(30) NOT NULL,

    CONSTRAINT chk_torneos_fechas
        CHECK (fecha_fin >= fecha_inicio),

    CONSTRAINT chk_torneos_estado
        CHECK (estado IN ('Planificado', 'Activo', 'Finalizado', 'Cancelado'))
);

-- ============================================================
-- 15. TORNEO_EQUIPO
-- ============================================================
CREATE TABLE torneo_equipo (
    id_torneo_equipo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_torneo INTEGER NOT NULL,
    id_equipo INTEGER NOT NULL,
    fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_torneo_equipo_torneo
        FOREIGN KEY (id_torneo)
        REFERENCES torneos(id_torneo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_torneo_equipo_equipo
        FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_torneo_equipo
        UNIQUE (id_torneo, id_equipo)
);

-- ============================================================
-- 16. PARTIDOS
-- ============================================================
CREATE TABLE partidos (
    id_partido INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_torneo INTEGER NOT NULL,
    equipo_local INTEGER NOT NULL,
    equipo_visitante INTEGER NOT NULL,
    id_instalacion INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(30) NOT NULL,

    CONSTRAINT fk_partidos_torneo
        FOREIGN KEY (id_torneo)
        REFERENCES torneos(id_torneo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_partidos_equipo_local
        FOREIGN KEY (equipo_local)
        REFERENCES equipos(id_equipo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_partidos_equipo_visitante
        FOREIGN KEY (equipo_visitante)
        REFERENCES equipos(id_equipo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_partidos_instalacion
        FOREIGN KEY (id_instalacion)
        REFERENCES instalaciones(id_instalacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_partidos_equipos_diferentes
        CHECK (equipo_local <> equipo_visitante),

    CONSTRAINT chk_partidos_estado
        CHECK (estado IN ('Programado', 'En curso', 'Finalizado', 'Cancelado'))
);

-- ============================================================
-- 17. RESULTADOS
-- ============================================================
CREATE TABLE resultados (
    id_resultado INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_partido INTEGER NOT NULL UNIQUE,
    puntos_local INTEGER NOT NULL,
    puntos_visitante INTEGER NOT NULL,
    observacion VARCHAR(200),

    CONSTRAINT fk_resultados_partido
        FOREIGN KEY (id_partido)
        REFERENCES partidos(id_partido)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_resultados_puntos
        CHECK (puntos_local >= 0 AND puntos_visitante >= 0)
);

-- ============================================================
-- 18. INSCRIPCIONES
-- ============================================================
CREATE TABLE inscripciones (
    id_inscripcion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_deportista INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(30) NOT NULL,

    CONSTRAINT fk_inscripciones_deportista
        FOREIGN KEY (id_deportista)
        REFERENCES deportistas(id_deportista)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_inscripciones_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_inscripciones_fechas
        CHECK (fecha_vencimiento >= fecha_inscripcion),

    CONSTRAINT chk_inscripciones_estado
        CHECK (estado IN ('Activa', 'Vencida', 'Cancelada', 'Pendiente'))
);

-- ============================================================
-- 19. PAGOS
-- ============================================================
CREATE TABLE pagos (
    id_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_inscripcion INTEGER NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    referencia VARCHAR(100),

    CONSTRAINT fk_pagos_inscripcion
        FOREIGN KEY (id_inscripcion)
        REFERENCES inscripciones(id_inscripcion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_pagos_monto
        CHECK (monto > 0),

    CONSTRAINT chk_pagos_metodo
        CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Tarjeta', 'PSE')),

    CONSTRAINT chk_pagos_estado
        CHECK (estado IN ('Pendiente', 'Pagado', 'Anulado'))
);

-- ============================================================
-- INDICES PARA FK Y CONSULTAS FRECUENTES
-- ============================================================
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX idx_categorias_deporte ON categorias(id_deporte);
CREATE INDEX idx_equipos_categoria ON equipos(id_categoria);
CREATE INDEX idx_equipo_deportista_equipo ON equipo_deportista(id_equipo);
CREATE INDEX idx_equipo_deportista_deportista ON equipo_deportista(id_deportista);
CREATE UNIQUE INDEX uq_equipo_deportista_deportista_activo
    ON equipo_deportista(id_deportista) WHERE estado = TRUE;
CREATE INDEX idx_entrenador_equipo_entrenador ON entrenador_equipo(id_entrenador);
CREATE INDEX idx_entrenador_equipo_equipo ON entrenador_equipo(id_equipo);
CREATE INDEX idx_entrenamientos_equipo ON entrenamientos(id_equipo);
CREATE INDEX idx_entrenamientos_entrenador ON entrenamientos(id_entrenador);
CREATE INDEX idx_entrenamientos_instalacion ON entrenamientos(id_instalacion);
CREATE INDEX idx_asistencias_entrenamiento ON asistencias(id_entrenamiento);
CREATE INDEX idx_asistencias_deportista ON asistencias(id_deportista);
CREATE INDEX idx_torneo_equipo_torneo ON torneo_equipo(id_torneo);
CREATE INDEX idx_torneo_equipo_equipo ON torneo_equipo(id_equipo);
CREATE INDEX idx_partidos_torneo ON partidos(id_torneo);
CREATE INDEX idx_partidos_equipo_local ON partidos(equipo_local);
CREATE INDEX idx_partidos_equipo_visitante ON partidos(equipo_visitante);
CREATE INDEX idx_partidos_instalacion ON partidos(id_instalacion);
CREATE INDEX idx_inscripciones_deportista ON inscripciones(id_deportista);
CREATE INDEX idx_inscripciones_categoria ON inscripciones(id_categoria);
CREATE INDEX idx_pagos_inscripcion ON pagos(id_inscripcion);

-- ============================================================
-- DATOS INICIALES DE ROLES
-- ============================================================
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Gestiona y configura toda la plataforma'),
('Entrenador', 'Gestiona equipos, entrenamientos y asistencias'),
('Deportista', 'Consulta su información, entrenamientos y resultados');

-- ============================================================
-- DEPORTES, CATEGORIAS E INSTALACIONES INICIALES
-- ============================================================
INSERT INTO deportes (nombre, descripcion, estado) VALUES
('Fútbol', 'Entrenamiento y competencia de fútbol', TRUE),
('Baloncesto', 'Entrenamiento y competencia de baloncesto', TRUE),
('Natación', 'Entrenamiento de natación en piscina', TRUE),
('Boxeo', 'Entrenamiento de boxeo y combate', TRUE),
('Tenis', 'Entrenamiento y competencia de tenis', TRUE),
('Voleibol', 'Entrenamiento y competencia de voleibol', TRUE),
('Atletismo', 'Carreras, saltos y lanzamientos', TRUE),
('Ciclismo', 'Entrenamiento de ciclismo', TRUE),
('Gimnasia', 'Entrenamiento de gimnasia', TRUE),
('Karate', 'Entrenamiento de karate', TRUE),
('Taekwondo', 'Entrenamiento de taekwondo', TRUE),
('Béisbol', 'Entrenamiento y competencia de béisbol', TRUE)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO categorias (id_deporte, nombre, edad_minima, edad_maxima, descripcion)
SELECT d.id_deporte, 'Libre', 5, 60, 'Categoría abierta para conformar equipos'
FROM deportes d
WHERE d.nombre IN (
    'Fútbol', 'Baloncesto', 'Natación', 'Boxeo', 'Tenis', 'Voleibol',
    'Atletismo', 'Ciclismo', 'Gimnasia', 'Karate', 'Taekwondo', 'Béisbol'
)
ON CONFLICT (id_deporte, nombre) DO NOTHING;

INSERT INTO instalaciones (nombre, tipo, ubicacion, capacidad, estado)
SELECT nuevos.nombre, nuevos.tipo, 'Sede Principal', nuevos.capacidad, TRUE
FROM (VALUES
    ('Piscina Olímpica', 'Piscina', 200),
    ('Gimnasio', 'Gimnasio', 60),
    ('Ring de Boxeo', 'Boxeo', 30),
    ('Cancha de Tenis', 'Tenis', 8),
    ('Cancha de Voleibol', 'Voleibol', 24),
    ('Pista de Atletismo', 'Atletismo', 100),
    ('Cancha de Fútbol', 'Fútbol', 50),
    ('Cancha de Baloncesto', 'Baloncesto', 30)
) AS nuevos(nombre, tipo, capacidad)
WHERE NOT EXISTS (
    SELECT 1 FROM instalaciones i WHERE i.nombre = nuevos.nombre
);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
