const pool = require('../config/database');

const obtenerDashboard = async (usuario) => {
  if (usuario.rol === 'Administrador') {
    const [usuarios, deportistas, entrenadores, deportes, equipos, torneos] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM elitesport.usuarios WHERE estado = TRUE'),
      pool.query('SELECT COUNT(*)::int AS total FROM elitesport.deportistas WHERE estado = TRUE'),
      pool.query('SELECT COUNT(*)::int AS total FROM elitesport.entrenadores WHERE estado = TRUE'),
      pool.query('SELECT COUNT(*)::int AS total FROM elitesport.deportes WHERE estado = TRUE'),
      pool.query('SELECT COUNT(*)::int AS total FROM elitesport.equipos WHERE estado = TRUE'),
      pool.query("SELECT COUNT(*)::int AS total FROM elitesport.torneos WHERE estado IN ('Planificado','Activo')"),
    ]);

    return {
      rol: usuario.rol,
      estadisticas: {
        usuarios: usuarios.rows[0].total,
        deportistas: deportistas.rows[0].total,
        entrenadores: entrenadores.rows[0].total,
        deportes: deportes.rows[0].total,
        equipos: equipos.rows[0].total,
        torneos: torneos.rows[0].total,
      },
    };
  }

  if (usuario.rol === 'Entrenador') {
    const equipos = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM elitesport.entrenador_equipo ee
      INNER JOIN elitesport.entrenadores e ON e.id_entrenador = ee.id_entrenador
      WHERE e.id_usuario = $1 AND ee.estado = TRUE;
    `, [usuario.id_usuario]);

    const entrenamientos = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.entrenadores e ON e.id_entrenador = en.id_entrenador
      WHERE e.id_usuario = $1 AND en.fecha >= CURRENT_DATE;
    `, [usuario.id_usuario]);

    return {
      rol: usuario.rol,
      estadisticas: {
        equipos: equipos.rows[0].total,
        entrenamientos: entrenamientos.rows[0].total,
      },
    };
  }

  const deportista = await pool.query(`
    SELECT id_deportista
    FROM elitesport.deportistas
    WHERE id_usuario = $1;
  `, [usuario.id_usuario]);

  const idDeportista = deportista.rows[0]?.id_deportista;

  if (!idDeportista) {
    return { rol: usuario.rol, estadisticas: { equipos: 0, entrenamientos: 0, torneos: 0 } };
  }

  const [equipos, entrenamientos, torneos] = await Promise.all([
    pool.query(`
      SELECT COUNT(*)::int AS total
      FROM elitesport.equipo_deportista
      WHERE id_deportista = $1 AND estado = TRUE;
    `, [idDeportista]),
    pool.query(`
      SELECT COUNT(DISTINCT en.id_entrenamiento)::int AS total
      FROM elitesport.entrenamientos en
      INNER JOIN elitesport.equipo_deportista ed ON ed.id_equipo = en.id_equipo
      WHERE ed.id_deportista = $1 AND ed.estado = TRUE AND en.fecha >= CURRENT_DATE;
    `, [idDeportista]),
    pool.query(`
      SELECT COUNT(DISTINCT te.id_torneo)::int AS total
      FROM elitesport.torneo_equipo te
      INNER JOIN elitesport.equipo_deportista ed ON ed.id_equipo = te.id_equipo
      WHERE ed.id_deportista = $1 AND ed.estado = TRUE AND te.estado = TRUE;
    `, [idDeportista]),
  ]);

  return {
    rol: usuario.rol,
    estadisticas: {
      equipos: equipos.rows[0].total,
      entrenamientos: entrenamientos.rows[0].total,
      torneos: torneos.rows[0].total,
    },
  };
};

module.exports = { obtenerDashboard };
