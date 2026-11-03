const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = require('../src/config/database');

async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function one(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}

async function ensureRole(nombre, descripcion) {
  await query(`
    INSERT INTO elitesport.roles (nombre, descripcion)
    VALUES ($1, $2)
    ON CONFLICT (nombre) DO NOTHING;
  `, [nombre, descripcion]);
  return one('SELECT id_rol FROM elitesport.roles WHERE nombre = $1', [nombre]);
}

async function ensureUser({ roleId, username, email, password }) {
  let user = await one('SELECT id_usuario FROM elitesport.usuarios WHERE nombre_usuario = $1', [username]);
  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    user = await one(`
      INSERT INTO elitesport.usuarios (id_rol, nombre_usuario, correo, contrasena, estado)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id_usuario;
    `, [roleId, username, email, hash]);
  }
  return user;
}

async function ensureSport(nombre, descripcion) {
  let row = await one('SELECT id_deporte FROM elitesport.deportes WHERE nombre = $1', [nombre]);
  if (!row) {
    row = await one(`INSERT INTO elitesport.deportes (nombre, descripcion, estado) VALUES ($1,$2,TRUE) RETURNING id_deporte`, [nombre, descripcion]);
  }
  return row;
}

async function ensureCategory(idDeporte, nombre, min, max, descripcion) {
  let row = await one('SELECT id_categoria FROM elitesport.categorias WHERE id_deporte=$1 AND nombre=$2', [idDeporte, nombre]);
  if (!row) {
    row = await one(`INSERT INTO elitesport.categorias (id_deporte, nombre, edad_minima, edad_maxima, descripcion) VALUES ($1,$2,$3,$4,$5) RETURNING id_categoria`, [idDeporte, nombre, min, max, descripcion]);
  }
  return row;
}

async function ensureTeam(idCategoria, nombre) {
  let row = await one('SELECT id_equipo FROM elitesport.equipos WHERE id_categoria=$1 AND nombre=$2', [idCategoria, nombre]);
  if (!row) row = await one(`INSERT INTO elitesport.equipos (id_categoria, nombre, estado) VALUES ($1,$2,TRUE) RETURNING id_equipo`, [idCategoria, nombre]);
  return row;
}

async function ensureFacility(nombre, tipo, capacidad = 50) {
  let row = await one('SELECT id_instalacion FROM elitesport.instalaciones WHERE nombre=$1', [nombre]);
  if (!row) row = await one(`INSERT INTO elitesport.instalaciones (nombre, tipo, ubicacion, capacidad, estado) VALUES ($1,$2,$3,$4,TRUE) RETURNING id_instalacion`, [nombre, tipo, 'Sede Principal', capacidad]);
  return row;
}

async function ensureSchedule(dia, inicio, fin) {
  let row = await one('SELECT id_horario FROM elitesport.horarios WHERE dia_semana=$1 AND hora_inicio=$2 AND hora_fin=$3', [dia, inicio, fin]);
  if (!row) row = await one(`INSERT INTO elitesport.horarios (dia_semana,hora_inicio,hora_fin) VALUES ($1,$2,$3) RETURNING id_horario`, [dia, inicio, fin]);
  return row;
}

async function main() {
  const adminRole = await ensureRole('Administrador', 'Gestiona y configura toda la plataforma');
  const coachRole = await ensureRole('Entrenador', 'Gestiona equipos, entrenamientos y asistencias');
  const athleteRole = await ensureRole('Deportista', 'Consulta su información, entrenamientos y resultados');

  const admin = await ensureUser({ roleId: adminRole.id_rol, username: 'admin', email: 'admin@elitesport.local', password: 'Admin123!' });
  const coach = await ensureUser({ roleId: coachRole.id_rol, username: 'entrenador', email: 'entrenador@elitesport.local', password: 'Entrenador123!' });
  const athlete = await ensureUser({ roleId: athleteRole.id_rol, username: 'deportista', email: 'deportista@elitesport.local', password: 'Deportista123!' });

  await query(`
    INSERT INTO elitesport.entrenadores (id_usuario, nombre, apellido, documento, telefono, especialidad, fecha_contratacion, estado)
    SELECT $1, 'Carlos', 'Rojas', 'DEMO-ENT-001', '3000000001', 'Fútbol', CURRENT_DATE, TRUE
    WHERE NOT EXISTS (SELECT 1 FROM elitesport.entrenadores WHERE id_usuario=$1);
  `, [coach.id_usuario]);

  await query(`
    INSERT INTO elitesport.deportistas (id_usuario, nombre, apellido, fecha_nacimiento, documento, telefono, direccion, estado)
    SELECT $1, 'Laura', 'Gomez', DATE '2002-05-15', 'DEMO-DEP-001', '3000000002', 'Sede Principal', TRUE
    WHERE NOT EXISTS (SELECT 1 FROM elitesport.deportistas WHERE id_usuario=$1);
  `, [athlete.id_usuario]);

  const football = await ensureSport('Fútbol', 'Entrenamiento y competencia de fútbol');
  const basketball = await ensureSport('Baloncesto', 'Entrenamiento y competencia de baloncesto');
  const sports = [
    ['Natación', 'Entrenamiento de natación en piscina'],
    ['Boxeo', 'Entrenamiento de boxeo y combate'],
    ['Tenis', 'Entrenamiento y competencia de tenis'],
    ['Voleibol', 'Entrenamiento y competencia de voleibol'],
    ['Atletismo', 'Carreras, saltos y lanzamientos'],
    ['Ciclismo', 'Entrenamiento de ciclismo'],
    ['Gimnasia', 'Entrenamiento de gimnasia'],
    ['Karate', 'Entrenamiento de karate'],
    ['Taekwondo', 'Entrenamiento de taekwondo'],
    ['Béisbol', 'Entrenamiento y competencia de béisbol'],
  ];
  for (const [nombre, descripcion] of sports) {
    const sport = await ensureSport(nombre, descripcion);
    await ensureCategory(sport.id_deporte, 'Libre', 5, 60, 'Categoría abierta para conformar equipos');
  }
  await ensureCategory(football.id_deporte, 'Libre', 5, 60, 'Categoría abierta para conformar equipos');
  await ensureCategory(basketball.id_deporte, 'Libre', 5, 60, 'Categoría abierta para conformar equipos');
  const category = await ensureCategory(football.id_deporte, 'Mayores', 18, 40, 'Categoría demostrativa');
  await ensureCategory(basketball.id_deporte, 'Libre', 18, 40, 'Categoría demostrativa');
  const team = await ensureTeam(category.id_categoria, 'Elite FC');

  const coachRow = await one('SELECT id_entrenador FROM elitesport.entrenadores WHERE id_usuario=$1', [coach.id_usuario]);
  const athleteRow = await one('SELECT id_deportista FROM elitesport.deportistas WHERE id_usuario=$1', [athlete.id_usuario]);

  await query(`
    INSERT INTO elitesport.entrenador_equipo (id_entrenador,id_equipo,estado)
    SELECT $1,$2,TRUE
    WHERE NOT EXISTS (SELECT 1 FROM elitesport.entrenador_equipo WHERE id_entrenador=$1 AND id_equipo=$2);
  `, [coachRow.id_entrenador, team.id_equipo]);

  await query(`
    INSERT INTO elitesport.equipo_deportista (id_equipo,id_deportista,estado)
    SELECT $1,$2,TRUE
    WHERE NOT EXISTS (SELECT 1 FROM elitesport.equipo_deportista WHERE id_deportista=$2 AND estado=TRUE);
  `, [team.id_equipo, athleteRow.id_deportista]);

  const facility = await ensureFacility('Cancha EliteSport', 'Cancha múltiple');
  const instalaciones = [
    ['Piscina Olímpica', 'Piscina', 200],
    ['Gimnasio', 'Gimnasio', 60],
    ['Ring de Boxeo', 'Boxeo', 30],
    ['Cancha de Tenis', 'Tenis', 8],
    ['Cancha de Voleibol', 'Voleibol', 24],
    ['Pista de Atletismo', 'Atletismo', 100],
    ['Cancha de Fútbol', 'Fútbol', 50],
    ['Cancha de Baloncesto', 'Baloncesto', 30],
  ];
  for (const [nombre, tipo, capacidad] of instalaciones) {
    await ensureFacility(nombre, tipo, capacidad);
  }
  const schedule = await ensureSchedule('Martes', '18:00', '20:00');

  let training = await one(`
    SELECT id_entrenamiento FROM elitesport.entrenamientos
    WHERE id_equipo=$1 AND id_entrenador=$2 AND fecha=CURRENT_DATE + 1;
  `, [team.id_equipo, coachRow.id_entrenador]);
  if (!training) {
    training = await one(`
      INSERT INTO elitesport.entrenamientos (id_equipo,id_entrenador,id_instalacion,id_horario,fecha,descripcion)
      VALUES ($1,$2,$3,$4,CURRENT_DATE+1,'Entrenamiento técnico y táctico')
      RETURNING id_entrenamiento;
    `, [team.id_equipo, coachRow.id_entrenador, facility.id_instalacion, schedule.id_horario]);
  }

  await query(`
    INSERT INTO elitesport.asistencias (id_entrenamiento,id_deportista,estado,observacion)
    SELECT $1,$2,'Presente','Registro demo'
    WHERE NOT EXISTS (SELECT 1 FROM elitesport.asistencias WHERE id_entrenamiento=$1 AND id_deportista=$2);
  `, [training.id_entrenamiento, athleteRow.id_deportista]);

  let tournament = await one("SELECT id_torneo FROM elitesport.torneos WHERE nombre='Copa EliteSport 2026'");
  if (!tournament) {
    tournament = await one(`
      INSERT INTO elitesport.torneos (nombre,descripcion,fecha_inicio,fecha_fin,estado)
      VALUES ('Copa EliteSport 2026','Torneo demostrativo',CURRENT_DATE+7,CURRENT_DATE+14,'Planificado')
      RETURNING id_torneo;
    `);
  }

  await query(`
    INSERT INTO elitesport.torneo_equipo (id_torneo,id_equipo,estado)
    SELECT $1,$2,TRUE
    WHERE NOT EXISTS (SELECT 1 FROM elitesport.torneo_equipo WHERE id_torneo=$1 AND id_equipo=$2);
  `, [tournament.id_torneo, team.id_equipo]);

  console.log('Demo creada/confirmada.');
  console.log('Administrador: admin / Admin123!');
  console.log('Entrenador: entrenador / Entrenador123!');
  console.log('Deportista: deportista / Deportista123!');
}

main()
  .catch((error) => {
    console.error('Error en seed-demo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
