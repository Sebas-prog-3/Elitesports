const pool = require('../config/database');

const listarTorneos = async () => {
  const resultado = await pool.query(`
    SELECT id_torneo, nombre, descripcion, fecha_inicio, fecha_fin, estado
    FROM elitesport.torneos
    ORDER BY fecha_inicio DESC, id_torneo DESC;
  `);
  return resultado.rows;
};

const listarTorneosDisponibles = async (usuario) => {
  const resultado = await pool.query(`
    SELECT t.id_torneo, t.nombre, t.descripcion, t.fecha_inicio, t.fecha_fin, t.estado,
           COALESCE(
             json_agg(json_build_object('id_equipo', e.id_equipo, 'nombre', e.nombre))
               FILTER (WHERE e.id_equipo IS NOT NULL),
             '[]'::json
           ) AS equipos
    FROM elitesport.torneos t
    JOIN elitesport.entrenador_equipo ee ON ee.estado = TRUE
    JOIN elitesport.entrenadores en ON en.id_entrenador = ee.id_entrenador
      AND en.id_usuario = $1 AND en.estado = TRUE
    JOIN elitesport.equipos e ON e.id_equipo = ee.id_equipo AND e.estado = TRUE
    WHERE t.estado IN ('Planificado', 'Activo') AND t.fecha_fin >= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM elitesport.torneo_equipo te
        WHERE te.id_torneo = t.id_torneo AND te.id_equipo = e.id_equipo AND te.estado = TRUE
      )
    GROUP BY t.id_torneo
    ORDER BY t.fecha_inicio, t.nombre;
  `, [usuario.id_usuario]);
  return resultado.rows;
};

const inscribirEquipoTorneo = async (idTorneo, idEquipo, usuario) => {
  const resultado = await pool.query(`
    INSERT INTO elitesport.torneo_equipo (id_torneo, id_equipo, estado)
    SELECT t.id_torneo, e.id_equipo, TRUE
    FROM elitesport.torneos t
    JOIN elitesport.equipos e ON e.id_equipo = $2 AND e.estado = TRUE
    JOIN elitesport.entrenador_equipo ee ON ee.id_equipo = e.id_equipo AND ee.estado = TRUE
    JOIN elitesport.entrenadores en ON en.id_entrenador = ee.id_entrenador
      AND en.id_usuario = $3 AND en.estado = TRUE
    WHERE t.id_torneo = $1 AND t.estado IN ('Planificado', 'Activo')
      AND t.fecha_fin >= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM elitesport.torneo_equipo te
        WHERE te.id_torneo = t.id_torneo AND te.id_equipo = e.id_equipo AND te.estado = TRUE
      )
    ON CONFLICT (id_torneo, id_equipo)
    DO UPDATE SET estado = TRUE, fecha_inscripcion = CURRENT_DATE
      WHERE elitesport.torneo_equipo.estado = FALSE
    RETURNING id_torneo_equipo;
  `, [idTorneo, idEquipo, usuario.id_usuario]);
  if (!resultado.rowCount) throw Object.assign(new Error('El torneo ya no está disponible para este equipo.'), { status: 409 });
  return { mensaje: 'Equipo inscrito al torneo correctamente.' };
};

module.exports = { listarTorneos, listarTorneosDisponibles, inscribirEquipoTorneo };
