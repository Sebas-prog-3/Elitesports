const pool = require('../config/database');

const listarEntrenamientos = async (usuario) => {
  if (usuario.rol === 'Deportista') {
    const resultado = await pool.query(`
      SELECT DISTINCT
        en.id_entrenamiento,
        en.fecha,
        en.descripcion,
        e.nombre AS equipo,
        sp.nombre AS deporte,
        i.nombre AS instalacion,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin,
        CONCAT(ent.nombre, ' ', ent.apellido) AS entrenador
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.equipos e ON e.id_equipo = en.id_equipo
      INNER JOIN elitesport.categorias c ON c.id_categoria = e.id_categoria
      INNER JOIN elitesport.deportes sp ON sp.id_deporte = c.id_deporte
      INNER JOIN elitesport.instalaciones i ON i.id_instalacion = en.id_instalacion
      INNER JOIN elitesport.horarios h ON h.id_horario = en.id_horario
      INNER JOIN elitesport.entrenadores ent ON ent.id_entrenador = en.id_entrenador
      INNER JOIN elitesport.equipo_deportista ed ON ed.id_equipo = en.id_equipo AND ed.estado = TRUE
      INNER JOIN elitesport.deportistas d ON d.id_deportista = ed.id_deportista
      WHERE d.id_usuario = $1
      ORDER BY en.fecha, h.hora_inicio;
    `, [usuario.id_usuario]);
    return resultado.rows;
  }

  if (usuario.rol === 'Entrenador') {
    const resultado = await pool.query(`
      SELECT en.id_entrenamiento, en.fecha, en.descripcion,
             e.nombre AS equipo, sp.nombre AS deporte, i.nombre AS instalacion,
             h.dia_semana, h.hora_inicio, h.hora_fin
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.equipos e ON e.id_equipo = en.id_equipo
      INNER JOIN elitesport.categorias c ON c.id_categoria = e.id_categoria
      INNER JOIN elitesport.deportes sp ON sp.id_deporte = c.id_deporte
      INNER JOIN elitesport.instalaciones i ON i.id_instalacion = en.id_instalacion
      INNER JOIN elitesport.horarios h ON h.id_horario = en.id_horario
      INNER JOIN elitesport.entrenadores ent ON ent.id_entrenador = en.id_entrenador
      WHERE ent.id_usuario = $1
      ORDER BY en.fecha, h.hora_inicio;
    `, [usuario.id_usuario]);
    return resultado.rows;
  }

  const resultado = await pool.query(`
    SELECT en.id_entrenamiento, en.fecha, en.descripcion,
           e.nombre AS equipo, sp.nombre AS deporte, i.nombre AS instalacion,
           h.dia_semana, h.hora_inicio, h.hora_fin,
           CONCAT(ent.nombre, ' ', ent.apellido) AS entrenador
    FROM elitesport.entrenamientos en
    INNER JOIN elitesport.equipos e ON e.id_equipo = en.id_equipo
    INNER JOIN elitesport.categorias c ON c.id_categoria = e.id_categoria
    INNER JOIN elitesport.deportes sp ON sp.id_deporte = c.id_deporte
    INNER JOIN elitesport.instalaciones i ON i.id_instalacion = en.id_instalacion
    INNER JOIN elitesport.horarios h ON h.id_horario = en.id_horario
    INNER JOIN elitesport.entrenadores ent ON ent.id_entrenador = en.id_entrenador
    ORDER BY en.fecha, h.hora_inicio;
  `);
  return resultado.rows;
};

const obtenerRecursosEntrenamiento = async () => {
  const [equipos, entrenadores, instalaciones, horarios] = await Promise.all([
    pool.query('SELECT id_equipo, nombre FROM elitesport.equipos WHERE estado = TRUE ORDER BY nombre'),
    pool.query("SELECT id_entrenador, CONCAT(nombre, ' ', apellido) AS nombre FROM elitesport.entrenadores WHERE estado = TRUE ORDER BY nombre"),
    pool.query('SELECT id_instalacion, nombre FROM elitesport.instalaciones WHERE estado = TRUE ORDER BY nombre'),
    pool.query('SELECT id_horario, dia_semana, hora_inicio, hora_fin FROM elitesport.horarios ORDER BY id_horario'),
  ]);
  return {
    equipos: equipos.rows,
    entrenadores: entrenadores.rows,
    instalaciones: instalaciones.rows,
    horarios: horarios.rows,
  };
};

const crearEntrenamiento = async ({ id_equipo, id_entrenador, id_instalacion, dia_semana, hora_inicio, hora_fin, fecha, descripcion }, usuario) => {
  const resultado = await pool.query(`
    WITH horario_guardado AS (
      INSERT INTO elitesport.horarios (dia_semana, hora_inicio, hora_fin)
      VALUES ($8::varchar, $9::time, $10::time)
      ON CONFLICT (dia_semana, hora_inicio, hora_fin)
      DO UPDATE SET dia_semana = EXCLUDED.dia_semana
      RETURNING id_horario
    )
    INSERT INTO elitesport.entrenamientos
      (id_equipo, id_entrenador, id_instalacion, id_horario, fecha, descripcion)
    SELECT e.id_equipo,
      CASE WHEN $6 = 'Entrenador' THEN en.id_entrenador ELSE en2.id_entrenador END,
      $3, h.id_horario, $4, $5
    FROM elitesport.equipos e
    CROSS JOIN horario_guardado h
    LEFT JOIN elitesport.entrenador_equipo ee ON ee.id_equipo = e.id_equipo AND ee.estado = TRUE
    LEFT JOIN elitesport.entrenadores en ON en.id_entrenador = ee.id_entrenador AND en.id_usuario = $7 AND en.estado = TRUE
    LEFT JOIN elitesport.entrenadores en2 ON en2.id_entrenador = $2 AND en2.estado = TRUE
    WHERE e.id_equipo = $1 AND e.estado = TRUE
      AND (($6 = 'Entrenador' AND en.id_entrenador IS NOT NULL) OR ($6 = 'Administrador' AND en2.id_entrenador IS NOT NULL))
    RETURNING id_entrenamiento, id_equipo, id_entrenador, id_instalacion, id_horario, fecha, descripcion;
  `, [id_equipo, id_entrenador, id_instalacion, fecha, descripcion || null, usuario.rol, usuario.id_usuario, dia_semana, hora_inicio, hora_fin]);
  if (!resultado.rowCount) throw Object.assign(new Error('Solo puedes programar entrenamientos para tus equipos.'), { status: 403 });
  return resultado.rows[0];
};

module.exports = { listarEntrenamientos, obtenerRecursosEntrenamiento, crearEntrenamiento };
