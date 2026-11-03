
BEGIN;

SET search_path TO elitesport;

CREATE TEMP TABLE tmp_entrenadores (
    codigo VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    documento VARCHAR(30),
    telefono VARCHAR(20),
    especialidad VARCHAR(100)
) ON COMMIT DROP;

INSERT INTO tmp_entrenadores VALUES
('20001','Andres','Morales','ENT-20001','3102000001','Futbol'),
('20002','Diego','Fernandez','ENT-20002','3102000002','Futbol'),
('20003','Jorge','Ramirez','ENT-20003','3102000003','Futbol'),
('20004','Miguel','Castillo','ENT-20004','3102000004','Futbol'),
('20005','Santiago','Vargas','ENT-20005','3102000005','Baloncesto'),
('20006','Daniel','Herrera','ENT-20006','3102000006','Baloncesto'),
('20007','Felipe','Navarro','ENT-20007','3102000007','Baloncesto'),
('20008','Juan','Cabrera','ENT-20008','3102000008','Tenis'),
('20009','Ricardo','Mendoza','ENT-20009','3102000009','Tenis'),
('20010','Gabriel','Ortiz','ENT-20010','3102000010','Tenis');

-- Crear usuarios con el rol Entrenador (id_rol = 2).
-- Se reutiliza el hash de contrasena de un usuario
-- entrenador existente para mantener compatibilidad.
INSERT INTO usuarios (
    id_rol,
    nombre_usuario,
    correo,
    contrasena
)
SELECT
    2,
    'ent_' || t.codigo,
    'ent_' || t.codigo || '@elitesport.local',
    (
        SELECT u.contrasena
        FROM usuarios u
        WHERE u.id_rol = 2
        ORDER BY u.id_usuario
        LIMIT 1
    )
FROM tmp_entrenadores t
WHERE NOT EXISTS (
    SELECT 1
    FROM usuarios u
    WHERE u.nombre_usuario = 'ent_' || t.codigo
       OR u.correo = 'ent_' || t.codigo || '@elitesport.local'
);

-- Registrar los entrenadores.
INSERT INTO entrenadores (
    id_usuario,
    nombre,
    apellido,
    documento,
    telefono,
    especialidad,
    fecha_contratacion
)
SELECT
    u.id_usuario,
    t.nombre,
    t.apellido,
    t.documento,
    t.telefono,
    t.especialidad,
    CURRENT_DATE
FROM tmp_entrenadores t
JOIN usuarios u
    ON u.nombre_usuario = 'ent_' || t.codigo
WHERE NOT EXISTS (
    SELECT 1
    FROM entrenadores e
    WHERE e.id_usuario = u.id_usuario
       OR e.documento = t.documento
);

COMMIT;

-- Verificar los 10 nuevos entrenadores.
SELECT id_entrenador,
       nombre,
       apellido,
       documento,
       especialidad
FROM elitesport.entrenadores
WHERE documento IN (
    'ENT-20001','ENT-20002','ENT-20003','ENT-20004',
    'ENT-20005','ENT-20006','ENT-20007','ENT-20008',
    'ENT-20009','ENT-20010'
)
ORDER BY documento;
