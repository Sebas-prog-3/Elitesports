const pool = require('../config/database');

const obtenerEquipos = async (usuario) => {
  if (usuario.rol === 'Administrador') {
    const resultado = await pool.query(`
      SELECT e.id_equipo, e.nombre, e.estado,
             c.nombre AS categoria, d.nombre AS deporte
      FROM elitesport.equipos e
      INNER JOIN elitesport.categorias c ON c.id_categoria = e.id_categoria
      INNER JOIN elitesport.deportes d ON d.id_deporte = c.id_deporte
      ORDER BY e.id_equipo;
    `);
    return resultado.rows;
  }

  const resultado = await pool.query(`
    SELECT DISTINCT e.id_equipo, e.nombre, e.estado,
           c.nombre AS categoria, d.nombre AS deporte
    FROM elitesport.equipos e
    INNER JOIN elitesport.categorias c ON c.id_categoria = e.id_categoria
    INNER JOIN elitesport.deportes d ON d.id_deporte = c.id_deporte
    INNER JOIN elitesport.entrenador_equipo ee ON ee.id_equipo = e.id_equipo AND ee.estado = TRUE
    INNER JOIN elitesport.entrenadores en ON en.id_entrenador = ee.id_entrenador
    WHERE en.id_usuario = $1
    ORDER BY e.id_equipo;
  `, [usuario.id_usuario]);

  return resultado.rows;
};

const obtenerEquiposDeportista = async (usuario) => {
  const resultado = await pool.query(`
    SELECT e.id_equipo, e.nombre AS equipo, c.nombre AS categoria,
           d.nombre AS deporte, ed.fecha_ingreso
    FROM elitesport.deportistas dep
    JOIN elitesport.equipo_deportista ed ON ed.id_deportista = dep.id_deportista AND ed.estado = TRUE
    JOIN elitesport.equipos e ON e.id_equipo = ed.id_equipo AND e.estado = TRUE
    JOIN elitesport.categorias c ON c.id_categoria = e.id_categoria
    JOIN elitesport.deportes d ON d.id_deporte = c.id_deporte
    WHERE dep.id_usuario = $1 AND dep.estado = TRUE
    ORDER BY e.nombre;
  `, [usuario.id_usuario]);
  return resultado.rows;
};

const obtenerEquiposDisponibles = async (usuario) => {
  const resultado = await pool.query(`
    SELECT e.id_equipo, e.nombre, c.id_categoria, c.nombre AS categoria,
           d.nombre AS deporte
    FROM elitesport.equipos e
    JOIN elitesport.categorias c ON c.id_categoria = e.id_categoria
    JOIN elitesport.deportes d ON d.id_deporte = c.id_deporte
    WHERE e.estado = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM elitesport.entrenador_equipo ee
        WHERE ee.id_equipo = e.id_equipo AND ee.estado = TRUE
      )
    ORDER BY d.nombre, c.nombre, e.nombre;
  `);
  return resultado.rows;
};

const asignarEquipoEntrenador = async (idEquipo, usuario) => {
  const resultado = await pool.query(`
    INSERT INTO elitesport.entrenador_equipo (id_entrenador, id_equipo, estado)
    SELECT en.id_entrenador, e.id_equipo, TRUE
    FROM elitesport.entrenadores en
    JOIN elitesport.equipos e ON e.id_equipo = $1 AND e.estado = TRUE
    WHERE en.id_usuario = $2 AND en.estado = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM elitesport.entrenador_equipo ee
        WHERE ee.id_equipo = e.id_equipo AND ee.estado = TRUE
      )
    RETURNING id_entrenador_equipo;
  `, [idEquipo, usuario.id_usuario]);
  if (!resultado.rowCount) throw Object.assign(new Error('El equipo no está disponible o ya tiene entrenador.'), { status: 409 });
  return { mensaje: 'Equipo asignado correctamente.' };
};

const listarJugadoresEquipo = async (idEquipo, usuario) => {
  const resultado = await pool.query(`
    SELECT d.id_deportista, d.nombre, d.apellido, d.documento,
           ed.fecha_ingreso
    FROM elitesport.equipo_deportista ed
    JOIN elitesport.deportistas d ON d.id_deportista = ed.id_deportista
    JOIN elitesport.usuarios u ON u.id_usuario = d.id_usuario AND u.estado = TRUE
    JOIN elitesport.entrenador_equipo ee ON ee.id_equipo = ed.id_equipo AND ee.estado = TRUE
    JOIN elitesport.entrenadores en ON en.id_entrenador = ee.id_entrenador
    WHERE ed.id_equipo = $1 AND ed.estado = TRUE AND d.estado = TRUE
      AND en.id_usuario = $2
    ORDER BY d.apellido, d.nombre;
  `, [idEquipo, usuario.id_usuario]);
  return resultado.rows;
};

const obtenerJugadoresDisponibles = async (idEquipo, usuario) => {
  const resultado = await pool.query(`
    SELECT d.id_deportista, d.nombre, d.apellido, d.documento
    FROM elitesport.equipos e
    JOIN elitesport.entrenador_equipo ee ON ee.id_equipo = e.id_equipo AND ee.estado = TRUE
    JOIN elitesport.entrenadores en ON en.id_entrenador = ee.id_entrenador AND en.id_usuario = $2
    JOIN elitesport.deportistas d ON d.estado = TRUE
    JOIN elitesport.usuarios u ON u.id_usuario = d.id_usuario AND u.estado = TRUE
    WHERE e.id_equipo = $1 AND e.estado = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM elitesport.equipo_deportista ed
        WHERE ed.id_deportista = d.id_deportista AND ed.estado = TRUE
      )
    ORDER BY d.apellido, d.nombre;
  `, [idEquipo, usuario.id_usuario]);
  return resultado.rows;
};

const asignarJugadorEquipo = async (idEquipo, idDeportista, usuario) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const jugador = await client.query(`
      SELECT id_deportista FROM elitesport.deportistas
      WHERE id_deportista = $1 AND estado = TRUE
      FOR UPDATE;
    `, [idDeportista]);
    if (!jugador.rowCount) throw Object.assign(new Error('Jugador no disponible.'), { status: 400 });

    const yaAsignado = await client.query(`
      SELECT 1 FROM elitesport.equipo_deportista
      WHERE id_deportista = $1 AND estado = TRUE
      LIMIT 1;
    `, [idDeportista]);
    if (yaAsignado.rowCount) throw Object.assign(new Error('Este jugador ya pertenece a otro equipo.'), { status: 409 });

    const resultado = await client.query(`
    INSERT INTO elitesport.equipo_deportista (id_equipo, id_deportista, estado)
    SELECT e.id_equipo, d.id_deportista, TRUE
    FROM elitesport.equipos e
    JOIN elitesport.entrenador_equipo ee ON ee.id_equipo = e.id_equipo AND ee.estado = TRUE
    JOIN elitesport.entrenadores en ON en.id_entrenador = ee.id_entrenador AND en.id_usuario = $3
    JOIN elitesport.deportistas d ON d.id_deportista = $2 AND d.estado = TRUE
    JOIN elitesport.usuarios u ON u.id_usuario = d.id_usuario AND u.estado = TRUE
    WHERE e.id_equipo = $1 AND e.estado = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM elitesport.equipo_deportista ed
        WHERE ed.id_deportista = d.id_deportista AND ed.estado = TRUE
      )
    RETURNING id_equipo_deportista;
    `, [idEquipo, idDeportista, usuario.id_usuario]);
    if (!resultado.rowCount) throw Object.assign(new Error('Jugador no disponible o este equipo no te pertenece.'), { status: 400 });
    await client.query('COMMIT');
    return { mensaje: 'Jugador asignado correctamente al equipo.' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const crearEquipo = async ({ id_categoria, nombre }, usuario) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await client.query(`
    INSERT INTO elitesport.equipos (id_categoria, nombre, estado)
    VALUES ($1, $2, TRUE)
    RETURNING id_equipo, id_categoria, nombre, fecha_creacion, estado;
  `, [id_categoria, nombre]);
    if (usuario.rol === 'Entrenador') {
      await client.query(`
        INSERT INTO elitesport.entrenador_equipo (id_entrenador, id_equipo, estado)
        SELECT id_entrenador, $1, TRUE FROM elitesport.entrenadores
        WHERE id_usuario = $2 AND estado = TRUE;
      `, [resultado.rows[0].id_equipo, usuario.id_usuario]);
    }
    await client.query('COMMIT');
  return resultado.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const eliminarEquipo = async (idEquipo) => {
  const resultado = await pool.query(`
    DELETE FROM elitesport.equipos
    WHERE id_equipo = $1
    RETURNING id_equipo, nombre;
  `, [idEquipo]);
  return resultado.rows[0];
};

const eliminarCategoria = async (idCategoria) => {
  const resultado = await pool.query(`
    DELETE FROM elitesport.categorias
    WHERE id_categoria = $1
    RETURNING id_categoria, nombre;
  `, [idCategoria]);
  return resultado.rows[0];
};

const obtenerCategorias = async () => {
  const resultado = await pool.query(`
    SELECT c.id_categoria, c.nombre, c.edad_minima, c.edad_maxima,
           d.nombre AS deporte
    FROM elitesport.categorias c
    INNER JOIN elitesport.deportes d ON d.id_deporte = c.id_deporte
    ORDER BY d.nombre, c.nombre;
  `);
  return resultado.rows;
};

module.exports = { obtenerEquipos, obtenerEquiposDeportista, obtenerEquiposDisponibles, asignarEquipoEntrenador, listarJugadoresEquipo, obtenerJugadoresDisponibles, asignarJugadorEquipo, crearEquipo, eliminarEquipo, eliminarCategoria, obtenerCategorias };
