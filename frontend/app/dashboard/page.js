'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';

function Stats({ estadisticas = {} }) {
  return (
    <div className="stats">
      {Object.entries(estadisticas).map(([key, value]) => (
        <div className="stat" key={key}>
          <span>{key.replaceAll('_', ' ')}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}


function UserManagementPanel() {
  const [tipo, setTipo] = useState('entrenador');
  const [entrenadores, setEntrenadores] = useState([]);
  const [deportistas, setDeportistas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const initial = {
    nombre_usuario: '', correo: '', contrasena: '', nombre: '', apellido: '',
    documento: '', telefono: '', especialidad: '', fecha_contratacion: '',
    fecha_nacimiento: '', direccion: '',
  };
  const [form, setForm] = useState(initial);

  const cargar = async () => {
    const [e, d] = await Promise.all([
      apiFetch('/usuarios/entrenadores'),
      apiFetch('/usuarios/deportistas'),
    ]);
    setEntrenadores(e);
    setDeportistas(d);
  };

  useEffect(() => {
    cargar().catch((e) => setError(e.message));
  }, []);

  const cambiar = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }));

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setGuardando(true);
    try {
      const endpoint = tipo === 'entrenador' ? '/usuarios/entrenadores' : '/usuarios/deportistas';
      const body = { ...form };
      if (tipo === 'entrenador') {
        delete body.fecha_nacimiento;
        delete body.direccion;
      } else {
        delete body.especialidad;
        delete body.fecha_contratacion;
      }
      const result = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
      setMensaje(result.mensaje || 'Registro creado correctamente.');
      setForm(initial);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Administración de usuarios</div>
          <h2>Entrenadores y deportistas</h2>
          <p className="muted">Crea perfiles con acceso propio a EliteSport. Cada registro crea el usuario de inicio de sesión y su ficha deportiva.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="action-row" style={{ marginBottom: 18 }}>
          <button type="button" className={`btn ${tipo === 'entrenador' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setTipo('entrenador'); setMensaje(''); setError(''); }}>+ Nuevo entrenador</button>
          <button type="button" className={`btn ${tipo === 'deportista' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setTipo('deportista'); setMensaje(''); setError(''); }}>+ Nuevo deportista</button>
        </div>
        <h3>{tipo === 'entrenador' ? 'Registrar entrenador' : 'Registrar deportista'}</h3>
        <form className="form-grid" onSubmit={guardar}>
          <label className="label">Nombre
            <input className="input" value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} required maxLength={50} />
          </label>
          <label className="label">Apellido
            <input className="input" value={form.apellido} onChange={(e) => cambiar('apellido', e.target.value)} required maxLength={50} />
          </label>
          <label className="label">Documento
            <input className="input" value={form.documento} onChange={(e) => cambiar('documento', e.target.value)} required maxLength={30} />
          </label>
          <label className="label">Teléfono
            <input className="input" value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)} maxLength={20} />
          </label>
          <label className="label">Nombre de usuario
            <input className="input" value={form.nombre_usuario} onChange={(e) => cambiar('nombre_usuario', e.target.value)} required maxLength={50} autoComplete="off" />
          </label>
          <label className="label">Correo electrónico
            <input className="input" type="email" value={form.correo} onChange={(e) => cambiar('correo', e.target.value)} required maxLength={100} />
          </label>
          <label className="label">Contraseña inicial
            <input className="input" type="password" value={form.contrasena} onChange={(e) => cambiar('contrasena', e.target.value)} required minLength={8} autoComplete="new-password" />
            <span className="muted">Mínimo 8 caracteres.</span>
          </label>
          {tipo === 'entrenador' ? (
            <>
              <label className="label">Especialidad
                <input className="input" value={form.especialidad} onChange={(e) => cambiar('especialidad', e.target.value)} maxLength={100} placeholder="Ej. Fútbol, natación" />
              </label>
              <label className="label">Fecha de contratación
                <input className="input" type="date" value={form.fecha_contratacion} onChange={(e) => cambiar('fecha_contratacion', e.target.value)} required />
              </label>
            </>
          ) : (
            <>
              <label className="label">Fecha de nacimiento
                <input className="input" type="date" value={form.fecha_nacimiento} onChange={(e) => cambiar('fecha_nacimiento', e.target.value)} required />
              </label>
              <label className="label">Dirección
                <input className="input" value={form.direccion} onChange={(e) => cambiar('direccion', e.target.value)} maxLength={150} />
              </label>
            </>
          )}
          <div className="full">
            <button className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : tipo === 'entrenador' ? 'Crear entrenador' : 'Crear deportista'}</button>
          </div>
        </form>
        {mensaje && <p className="muted" role="status">{mensaje}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Entrenadores registrados ({entrenadores.length})</h3>
          {entrenadores.length === 0 ? <div className="empty">Aún no hay entrenadores registrados.</div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Nombre</th><th>Usuario</th><th>Especialidad</th><th>Estado</th></tr></thead>
              <tbody>{entrenadores.map((x) => <tr key={x.id_entrenador || x.id}>
                <td>{x.nombre} {x.apellido}</td><td>{x.nombre_usuario}<br /><span className="muted">{x.correo}</span></td>
                <td>{x.especialidad || 'Sin especificar'}</td><td>{x.estado && x.estado_usuario ? 'Activo' : 'Inactivo'}</td>
              </tr>)}</tbody>
            </table></div>
          )}
        </div>
        <div className="card">
          <h3>Deportistas registrados ({deportistas.length})</h3>
          {deportistas.length === 0 ? <div className="empty">Aún no hay deportistas registrados.</div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Nombre</th><th>Usuario</th><th>Documento</th><th>Estado</th></tr></thead>
              <tbody>{deportistas.map((x) => <tr key={x.id_deportista || x.id}>
                <td>{x.nombre} {x.apellido}</td><td>{x.nombre_usuario}<br /><span className="muted">{x.correo}</span></td>
                <td>{x.documento}</td><td>{x.estado && x.estado_usuario ? 'Activo' : 'Inactivo'}</td>
              </tr>)}</tbody>
            </table></div>
          )}
        </div>
      </div>
    </section>
  );
}

function AdminPanel() {
  const [deportes, setDeportes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [categoriaForm, setCategoriaForm] = useState({ id_deporte: '', nombre: '', edad_minima: '5', edad_maxima: '60', descripcion: '' });
  const [equipoForm, setEquipoForm] = useState({ id_categoria: '', nombre: '' });
  const [instalacionForm, setInstalacionForm] = useState({ nombre: '', tipo: '', ubicacion: '', capacidad: '' });

  const cargar = async () => {
    const [listaDeportes, listaCategorias, listaEquipos, listaInstalaciones] = await Promise.all([
      apiFetch('/deportes'), apiFetch('/equipos/categorias'), apiFetch('/equipos'), apiFetch('/instalaciones'),
    ]);
    setDeportes(listaDeportes);
    setCategorias(listaCategorias);
    setEquipos(listaEquipos);
    setInstalaciones(listaInstalaciones);
  };

  useEffect(() => {
    cargar().catch((e) => setMensaje(e.message));
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const body = { nombre, descripcion, estado: true };
      if (editando) {
        await apiFetch(`/deportes/${editando}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/deportes', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      setNombre('');
      setDescripcion('');
      setEditando(null);
      setMensaje('Guardado correctamente.');
      await cargar();
    } catch (e) {
      setMensaje(e.message);
    }
  };

  const editar = (d) => {
    setEditando(d.id_deporte);
    setNombre(d.nombre);
    setDescripcion(d.descripcion || '');
  };

  const cancelar = () => {
    setEditando(null);
    setNombre('');
    setDescripcion('');
  };

  const borrar = async (id) => {
    if (!window.confirm('¿Eliminar este deporte?')) return;
    try {
      await apiFetch(`/deportes/${id}`, { method: 'DELETE' });
      setMensaje('Deporte eliminado.');
      await cargar();
    } catch (e) {
      setMensaje(e.message);
    }
  };

  const crearCategoria = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/deportes/categorias', {
        method: 'POST',
        body: JSON.stringify({ ...categoriaForm, id_deporte: Number(categoriaForm.id_deporte), edad_minima: Number(categoriaForm.edad_minima), edad_maxima: Number(categoriaForm.edad_maxima) }),
      });
      setCategoriaForm({ id_deporte: '', nombre: '', edad_minima: '5', edad_maxima: '60', descripcion: '' });
      setMensaje('Categoría creada.');
      await cargar();
    } catch (e) { setMensaje(e.message); }
  };

  const crearEquipoAdmin = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/equipos', {
        method: 'POST',
        body: JSON.stringify({ id_categoria: Number(equipoForm.id_categoria), nombre: equipoForm.nombre.trim() }),
      });
      setEquipoForm({ id_categoria: '', nombre: '' });
      setMensaje('Equipo creado y asociado a su categoría.');
      await cargar();
    } catch (e) { setMensaje(e.message); }
  };

  const crearInstalacion = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/instalaciones', {
        method: 'POST',
        body: JSON.stringify({
          ...instalacionForm,
          capacidad: instalacionForm.capacidad ? Number(instalacionForm.capacidad) : null,
        }),
      });
      setInstalacionForm({ nombre: '', tipo: '', ubicacion: '', capacidad: '' });
      setMensaje('Instalación creada y disponible para entrenamientos.');
      await cargar();
    } catch (e) { setMensaje(e.message); }
  };

  const borrarCategoriaAdmin = async (categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}" del deporte ${categoria.deporte}?`)) return;
    try {
      await apiFetch(`/equipos/categorias/${categoria.id_categoria}`, { method: 'DELETE' });
      setMensaje('Categoría eliminada.');
      await cargar();
    } catch (e) { setMensaje(e.message); }
  };

  const borrarEquipoAdmin = async (equipo) => {
    if (!window.confirm(`¿Eliminar el equipo "${equipo.nombre}"? Se eliminarán sus asignaciones y su inscripción a torneos.`)) return;
    try {
      await apiFetch(`/equipos/${equipo.id_equipo}`, { method: 'DELETE' });
      setMensaje('Equipo eliminado.');
      await cargar();
    } catch (e) { setMensaje(e.message); }
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Administrador</div>
          <h2>Gestión de deportes</h2>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>{editando ? 'Editar deporte' : 'Nuevo deporte'}</h3>
          <form className="form" onSubmit={guardar}>
            <label className="label">
              Nombre
              <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label className="label">
              Descripción
              <textarea className="textarea" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </label>
            <div className="action-row">
              <button className="btn btn-primary">{editando ? 'Actualizar' : 'Crear'}</button>
              {editando && (
                <button type="button" className="btn btn-secondary" onClick={cancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
          {mensaje && <p className="muted">{mensaje}</p>}
        </div>

        <div className="card">
          <h3>Deportes registrados</h3>
          {deportes.length === 0 ? (
            <div className="empty">No hay deportes registrados.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {deportes.map((d) => (
                    <tr key={d.id_deporte}>
                      <td>{d.nombre}</td>
                      <td>{d.estado ? 'Activo' : 'Inactivo'}</td>
                      <td>
                        <div className="action-row">
                          <button className="btn btn-secondary btn-small" onClick={() => editar(d)}>Editar</button>
                          <button className="btn btn-danger btn-small" onClick={() => borrar(d.id_deporte)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 28 }}>
        <div><div className="eyebrow">Organización deportiva</div><h2>Categorías y equipos</h2></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Crear categoría</h3>
          <form className="form" onSubmit={crearCategoria}>
            <label className="label">Deporte
              <select className="select" value={categoriaForm.id_deporte} onChange={(e) => setCategoriaForm({ ...categoriaForm, id_deporte: e.target.value })} required>
                <option value="">Selecciona un deporte</option>
                {deportes.filter((d) => d.estado).map((d) => <option key={d.id_deporte} value={d.id_deporte}>{d.nombre}</option>)}
              </select>
            </label>
            <label className="label">Nombre de la categoría
              <input className="input" value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })} required maxLength={50} placeholder="Ej. Juvenil" />
            </label>
            <div className="form-grid">
              <label className="label">Edad mínima
                <input className="input" type="number" min="0" value={categoriaForm.edad_minima} onChange={(e) => setCategoriaForm({ ...categoriaForm, edad_minima: e.target.value })} required />
              </label>
              <label className="label">Edad máxima
                <input className="input" type="number" min="0" value={categoriaForm.edad_maxima} onChange={(e) => setCategoriaForm({ ...categoriaForm, edad_maxima: e.target.value })} required />
              </label>
            </div>
            <label className="label">Descripción
              <textarea className="textarea" value={categoriaForm.descripcion} onChange={(e) => setCategoriaForm({ ...categoriaForm, descripcion: e.target.value })} maxLength={150} />
            </label>
            <button className="btn btn-primary" disabled={!deportes.some((d) => d.estado)}>Crear categoría</button>
          </form>
        </div>
        <div className="card">
          <h3>Crear equipo</h3>
          <form className="form" onSubmit={crearEquipoAdmin}>
            <label className="label">Deporte y categoría
              <select className="select" value={equipoForm.id_categoria} onChange={(e) => setEquipoForm({ ...equipoForm, id_categoria: e.target.value })} required>
                <option value="">Selecciona una categoría</option>
                {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.deporte} · {c.nombre}</option>)}
              </select>
            </label>
            <label className="label">Nombre del equipo
              <input className="input" value={equipoForm.nombre} onChange={(e) => setEquipoForm({ ...equipoForm, nombre: e.target.value })} required maxLength={80} placeholder="Ej. Elite FC Juvenil" />
            </label>
            <button className="btn btn-primary" disabled={!categorias.length}>Crear equipo</button>
          </form>
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Categorías registradas ({categorias.length})</h3>
          {categorias.length ? <div className="table-wrap"><table><thead><tr><th>Deporte</th><th>Categoría</th><th>Edades</th><th>Acciones</th></tr></thead><tbody>{categorias.map((c) => <tr key={c.id_categoria}><td>{c.deporte}</td><td>{c.nombre}</td><td>{c.edad_minima}–{c.edad_maxima}</td><td><button type="button" className="btn btn-danger btn-small" onClick={() => borrarCategoriaAdmin(c)}>Eliminar</button></td></tr>)}</tbody></table></div> : <div className="empty">Aún no hay categorías.</div>}
        </div>
        <div className="card">
          <h3>Equipos registrados ({equipos.length})</h3>
          {equipos.length ? <div className="table-wrap"><table><thead><tr><th>Equipo</th><th>Deporte</th><th>Categoría</th><th>Acciones</th></tr></thead><tbody>{equipos.map((x) => <tr key={x.id_equipo}><td>{x.nombre}</td><td>{x.deporte}</td><td>{x.categoria}</td><td><button type="button" className="btn btn-danger btn-small" onClick={() => borrarEquipoAdmin(x)}>Eliminar</button></td></tr>)}</tbody></table></div> : <div className="empty">Aún no hay equipos.</div>}
        </div>
      </div>
      <div className="section-header" style={{ marginTop: 28 }}>
        <div><div className="eyebrow">Espacios deportivos</div><h2>Instalaciones</h2></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Crear instalación</h3>
          <form className="form" onSubmit={crearInstalacion}>
            <label className="label">Nombre
              <input className="input" value={instalacionForm.nombre} onChange={(e) => setInstalacionForm({ ...instalacionForm, nombre: e.target.value })} required maxLength={80} placeholder="Ej. Piscina olímpica" />
            </label>
            <label className="label">Tipo
              <input className="input" value={instalacionForm.tipo} onChange={(e) => setInstalacionForm({ ...instalacionForm, tipo: e.target.value })} required maxLength={50} placeholder="Ej. Piscina" />
            </label>
            <label className="label">Ubicación
              <input className="input" value={instalacionForm.ubicacion} onChange={(e) => setInstalacionForm({ ...instalacionForm, ubicacion: e.target.value })} maxLength={150} placeholder="Ej. Sede principal" />
            </label>
            <label className="label">Capacidad
              <input className="input" type="number" min="1" value={instalacionForm.capacidad} onChange={(e) => setInstalacionForm({ ...instalacionForm, capacidad: e.target.value })} placeholder="Opcional" />
            </label>
            <button className="btn btn-primary">Crear instalación</button>
          </form>
        </div>
        <div className="card">
          <h3>Instalaciones disponibles ({instalaciones.length})</h3>
          {instalaciones.length === 0 ? <div className="empty">No hay instalaciones activas disponibles.</div> : (
            <div className="table-wrap"><table><thead><tr><th>Instalación</th><th>Tipo</th><th>Ubicación</th><th>Capacidad</th></tr></thead>
              <tbody>{instalaciones.map((x) => <tr key={x.id_instalacion}><td>{x.nombre}</td><td>{x.tipo}</td><td>{x.ubicacion || '—'}</td><td>{x.capacidad || '—'}</td></tr>)}</tbody>
            </table></div>
          )}
        </div>
      </div>
    </section>
  );
}

function TrainerPanel({ usuario }) {
  const [equipos, setEquipos] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [equipoGestion, setEquipoGestion] = useState('');
  const [jugadoresEquipo, setJugadoresEquipo] = useState([]);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [torneosDisponibles, setTorneosDisponibles] = useState([]);
  const [equiposTorneo, setEquiposTorneo] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [recursos, setRecursos] = useState(null);
  const [form, setForm] = useState({
    id_equipo: '',
    id_entrenador: '',
    id_instalacion: '',
    dia_semana: 'Lunes',
    hora_inicio: '16:00',
    hora_fin: '17:30',
    fecha: '',
    descripcion: '',
  });

  const cargar = async () => {
    const [e, c, t, disponibles, torneos] = await Promise.all([
      apiFetch('/equipos'),
      apiFetch('/equipos/categorias'),
      apiFetch('/entrenamientos'),
      apiFetch('/equipos/disponibles'),
      apiFetch('/torneos/disponibles'),
    ]);
    setEquipos(e);
    setCategorias(c);
    setEntrenamientos(t);
    setEquiposDisponibles(disponibles);
    setTorneosDisponibles(torneos);
    if (!recursos) setRecursos(await apiFetch('/entrenamientos/recursos'));
  };

  useEffect(() => {
    cargar().catch((e) => setMensaje(e.message));
  }, []);

  useEffect(() => {
    if (!equipoGestion) { setJugadoresEquipo([]); setJugadoresDisponibles([]); return; }
    Promise.all([
      apiFetch(`/equipos/${equipoGestion}/jugadores`),
      apiFetch(`/equipos/${equipoGestion}/jugadores-disponibles`),
    ]).then(([asignados, disponibles]) => {
      setJugadoresEquipo(asignados);
      setJugadoresDisponibles(disponibles);
      setJugadorSeleccionado('');
    }).catch((e) => setMensaje(e.message));
  }, [equipoGestion]);

  const tomarEquipo = async (id) => {
    try {
      await apiFetch(`/equipos/${id}/asignar`, { method: 'POST' });
      setMensaje('Equipo asignado a tu perfil.');
      setEquipoGestion(String(id));
      await cargar();
    } catch (e) { setMensaje(e.message); }
  };

  const agregarJugador = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/equipos/${equipoGestion}/jugadores`, {
        method: 'POST', body: JSON.stringify({ id_deportista: Number(jugadorSeleccionado) }),
      });
      setMensaje('Jugador agregado al equipo.');
      const [asignados, disponibles] = await Promise.all([
        apiFetch(`/equipos/${equipoGestion}/jugadores`),
        apiFetch(`/equipos/${equipoGestion}/jugadores-disponibles`),
      ]);
      setJugadoresEquipo(asignados);
      setJugadoresDisponibles(disponibles);
      setJugadorSeleccionado('');
    } catch (e) { setMensaje(e.message); }
  };

  const crearEquipo = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/equipos', {
        method: 'POST',
        body: JSON.stringify({ id_categoria: Number(categoria), nombre }),
      });
      setNombre('');
      setCategoria('');
      setMensaje('Equipo creado.');
      await cargar();
    } catch (e) {
      setMensaje(e.message);
    }
  };

  const crearTraining = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/entrenamientos', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          id_equipo: Number(form.id_equipo),
          id_entrenador: Number(form.id_entrenador),
          id_instalacion: Number(form.id_instalacion),
          dia_semana: form.dia_semana,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
        }),
      });
      setMensaje('Entrenamiento creado.');
      setForm({ ...form, fecha: '', descripcion: '' });
      await cargar();
    } catch (e) {
      setMensaje(e.message);
    }
  };

  const inscribirEnTorneo = async (torneo) => {
    const idEquipo = equiposTorneo[torneo.id_torneo];
    if (!idEquipo) { setMensaje('Selecciona el equipo que participará.'); return; }
    try {
      await apiFetch(`/torneos/${torneo.id_torneo}/equipos`, {
        method: 'POST', body: JSON.stringify({ id_equipo: Number(idEquipo) }),
      });
      setMensaje('Equipo inscrito al torneo.');
      setEquiposTorneo((actual) => ({ ...actual, [torneo.id_torneo]: '' }));
      await cargar();
    } catch (e) { setMensaje(e.message); }
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Entrenador</div>
          <h2>Equipos y entrenamientos</h2>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Crear equipo</h3>
          <form className="form" onSubmit={crearEquipo}>
            <label className="label">
              Categoría
              <select className="select" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                <option value="">Selecciona</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.deporte} · {c.nombre}</option>
                ))}
              </select>
            </label>
            <label className="label">
              Nombre
              <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Elite FC" required />
            </label>
            <button className="btn btn-primary">Crear equipo</button>
          </form>
        </div>

        <div className="card">
          <h3>Mis equipos</h3>
          {equipos.length === 0 ? (
            <div className="empty">No hay equipos asignados.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Equipo</th><th>Categoría</th><th>Deporte</th></tr></thead>
                <tbody>{equipos.map((e) => <tr key={e.id_equipo}><td>{e.nombre}</td><td>{e.categoria}</td><td>{e.deporte}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Elegir un equipo existente</h3>
        {equiposDisponibles.length === 0 ? <div className="empty">No hay equipos disponibles para asignar.</div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Equipo</th><th>Categoría</th><th>Deporte</th><th></th></tr></thead>
            <tbody>{equiposDisponibles.map((x) => <tr key={x.id_equipo}>
              <td>{x.nombre}</td><td>{x.categoria}</td><td>{x.deporte}</td>
              <td><button className="btn btn-secondary btn-small" onClick={() => tomarEquipo(x.id_equipo)}>Elegir equipo</button></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Jugadores de mis equipos</h3>
        {equipos.length === 0 ? <div className="empty">Primero crea o elige un equipo.</div> : <>
          <label className="label">Equipo
            <select className="select" value={equipoGestion} onChange={(e) => setEquipoGestion(e.target.value)}>
              <option value="">Selecciona un equipo</option>
              {equipos.map((x) => <option key={x.id_equipo} value={x.id_equipo}>{x.nombre} · {x.deporte}</option>)}
            </select>
          </label>
          {equipoGestion && <>
            <form className="action-row" style={{ margin: '16px 0' }} onSubmit={agregarJugador}>
              <select className="select" value={jugadorSeleccionado} onChange={(e) => setJugadorSeleccionado(e.target.value)} required>
                <option value="">Selecciona un jugador inscrito</option>
                {jugadoresDisponibles.map((x) => <option key={x.id_deportista} value={x.id_deportista}>{x.nombre} {x.apellido} · {x.documento}</option>)}
              </select>
              <button className="btn btn-primary" disabled={!jugadoresDisponibles.length}>Agregar jugador</button>
            </form>
            {jugadoresDisponibles.length === 0 && <p className="muted">No hay otros deportistas registrados disponibles para este equipo.</p>}
            {jugadoresEquipo.length === 0 ? <div className="empty">Este equipo aún no tiene jugadores asignados.</div> : (
              <div className="table-wrap"><table>
                <thead><tr><th>Jugador</th><th>Documento</th><th>Fecha de ingreso</th></tr></thead>
                <tbody>{jugadoresEquipo.map((x) => <tr key={x.id_deportista}><td>{x.nombre} {x.apellido}</td><td>{x.documento}</td><td>{String(x.fecha_ingreso).slice(0, 10)}</td></tr>)}</tbody>
              </table></div>
            )}
          </>}
        </>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Torneos disponibles</h3>
        {torneosDisponibles.length === 0 ? <div className="empty">No hay torneos disponibles para tus equipos en este momento.</div> : (
          <div className="grid-2">
            {torneosDisponibles.map((torneo) => <div className="card" key={torneo.id_torneo}>
              <h3>{torneo.nombre}</h3>
              <p className="muted">{torneo.estado} · {String(torneo.fecha_inicio).slice(0, 10)} a {String(torneo.fecha_fin).slice(0, 10)}</p>
              {torneo.descripcion && <p>{torneo.descripcion}</p>}
              <label className="label">Equipo participante
                <select className="select" value={equiposTorneo[torneo.id_torneo] || ''} onChange={(e) => setEquiposTorneo({ ...equiposTorneo, [torneo.id_torneo]: e.target.value })}>
                  <option value="">Selecciona un equipo</option>
                  {torneo.equipos.map((equipo) => <option key={equipo.id_equipo} value={equipo.id_equipo}>{equipo.nombre}</option>)}
                </select>
              </label>
              <button type="button" className="btn btn-primary" onClick={() => inscribirEnTorneo(torneo)}>Inscribir equipo</button>
            </div>)}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Crear entrenamiento</h3>
        {recursos ? (
          <form className="form-grid" onSubmit={crearTraining}>
            <label className="label">Equipo
              <select className="select" value={form.id_equipo} onChange={(e) => setForm({ ...form, id_equipo: e.target.value })} required>
                <option value="">Selecciona</option>
                {equipos.map((x) => <option key={x.id_equipo} value={x.id_equipo}>{x.nombre}</option>)}
              </select>
            </label>
            {usuario?.rol === 'Administrador' && <label className="label">Entrenador
              <select className="select" value={form.id_entrenador} onChange={(e) => setForm({ ...form, id_entrenador: e.target.value })} required>
                <option value="">Selecciona</option>
                {recursos.entrenadores.map((x) => <option key={x.id_entrenador} value={x.id_entrenador}>{x.nombre}</option>)}
              </select>
            </label>}
            <label className="label">Instalación
              <select className="select" value={form.id_instalacion} onChange={(e) => setForm({ ...form, id_instalacion: e.target.value })} required>
                <option value="">Selecciona</option>
                {recursos.instalaciones.map((x) => <option key={x.id_instalacion} value={x.id_instalacion}>{x.nombre}</option>)}
              </select>
            </label>
            <label className="label">Día de entrenamiento
              <select className="select" value={form.dia_semana} onChange={(e) => setForm({ ...form, dia_semana: e.target.value })} required>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </label>
            <label className="label">Hora de inicio
              <input className="input" type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} required />
            </label>
            <label className="label">Hora de finalización
              <input className="input" type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} required />
            </label>
            <label className="label">Fecha
              <input className="input" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
            </label>
            <label className="label">Descripción
              <input className="input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </label>
            <div className="full"><button className="btn btn-primary">Crear entrenamiento</button></div>
          </form>
        ) : <div className="loading">Cargando recursos...</div>}
        {mensaje && <p className="muted">{mensaje}</p>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Entrenamientos</h3>
        {entrenamientos.length === 0 ? (
          <div className="empty">No hay entrenamientos.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Fecha</th><th>Equipo</th><th>Instalación</th><th>Horario</th></tr></thead>
              <tbody>{entrenamientos.map((x) => <tr key={x.id_entrenamiento}><td>{String(x.fecha).slice(0, 10)}</td><td>{x.equipo}</td><td>{x.instalacion}</td><td>{x.dia_semana} {String(x.hora_inicio).slice(0, 5)}–{String(x.hora_fin).slice(0, 5)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function AthletePanel() {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    Promise.all([apiFetch('/entrenamientos'), apiFetch('/torneos'), apiFetch('/equipos/mis')])
      .then(([a, b, e]) => { setEntrenamientos(a); setTorneos(b); setEquipos(e); })
      .catch((e) => setMensaje(e.message));
  }, []);

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Deportista</div>
          <h2>Mi actividad deportiva</h2>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Mis equipos</h3>
          {equipos.length === 0 ? <div className="empty">Aún no estás asignado a un equipo.</div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Equipo</th><th>Deporte</th><th>Categoría</th></tr></thead>
              <tbody>{equipos.map((x) => <tr key={x.id_equipo}><td>{x.equipo}</td><td>{x.deporte}</td><td>{x.categoria}</td></tr>)}</tbody>
            </table></div>
          )}
        </div>
        <div className="card">
          <h3>Próximos entrenamientos</h3>
          {entrenamientos.length === 0 ? <div className="empty">No hay entrenamientos disponibles.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Fecha</th><th>Equipo</th><th>Deporte</th><th>Día y hora</th><th>Entrenador</th><th>Instalación</th></tr></thead>
                <tbody>{entrenamientos.map((x) => <tr key={x.id_entrenamiento}><td>{String(x.fecha).slice(0, 10)}</td><td>{x.equipo}</td><td>{x.deporte}</td><td>{x.dia_semana} {String(x.hora_inicio).slice(0, 5)}–{String(x.hora_fin).slice(0, 5)}</td><td>{x.entrenador}</td><td>{x.instalacion}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card">
          <h3>Torneos</h3>
          {torneos.length === 0 ? <div className="empty">No hay torneos registrados.</div> : torneos.map((t) => (
            <div key={t.id_torneo} style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
              <strong>{t.nombre}</strong>
              <div className="muted">{t.estado} · {String(t.fecha_inicio).slice(0, 10)} → {String(t.fecha_fin).slice(0, 10)}</div>
            </div>
          ))}
        </div>
      </div>
      {mensaje && <div className="error">{mensaje}</div>}
    </section>
  );
}

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('elitesport_token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    Promise.all([apiFetch('/auth/me'), apiFetch('/dashboard')])
      .then(([perfil, data]) => { setUsuario(perfil); setDashboard(data); })
      .catch((e) => {
        localStorage.removeItem('elitesport_token');
        setError(e.message);
      })
      .finally(() => setCargando(false));
  }, []);

  const nombre = useMemo(() => {
    if (!usuario) return 'Usuario';
    if (usuario.nombre_deportista) return `${usuario.nombre_deportista} ${usuario.apellido_deportista}`;
    if (usuario.nombre_entrenador) return `${usuario.nombre_entrenador} ${usuario.apellido_entrenador}`;
    return usuario.nombre_usuario;
  }, [usuario]);

  const salir = () => {
    localStorage.removeItem('elitesport_token');
    localStorage.removeItem('elitesport_user');
    window.location.href = '/';
  };

  if (cargando) return <div className="loading" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Cargando EliteSport...</div>;
  if (error) return <div className="login-shell"><div className="login-card"><div className="error">{error}</div><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { window.location.href = '/'; }}>Volver al login</button></div></div>;

  return (
    <main className="page">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">Elite<span>Sport</span></div>
          <div className="user-area">
            <div><strong>{nombre}</strong> <span className="badge">{usuario?.rol}</span></div>
            <button className="btn btn-secondary btn-small" onClick={salir}>Cerrar sesión</button>
          </div>
        </div>
      </header>
      <div className="container">
        <section className="hero">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Panel de control</div>
              <h1>Bienvenido a EliteSport.</h1>
              <p>Plataforma de gestión deportiva desarrollada con PostgreSQL, Express.js y Next.js. Las funciones visibles dependen del rol autenticado.</p>
            </div>
            <div className="hero-panel">
              <div className="muted">API</div><strong>http://localhost:4000</strong>
              <div className="muted">Frontend</div><strong>http://localhost:3000</strong>
              <div className="muted">Seguridad</div><strong>JWT + control por roles</strong>
            </div>
          </div>
        </section>
        {dashboard && <Stats estadisticas={dashboard.estadisticas} />}
        {usuario?.rol === 'Administrador' && <AdminPanel />}
        {usuario?.rol === 'Administrador' && <UserManagementPanel />}
        {usuario?.rol === 'Entrenador' && <TrainerPanel usuario={usuario} />}
        {usuario?.rol === 'Deportista' && <AthletePanel />}
        <footer className="footer">EliteSport · Proyecto Final de Programación 5</footer>
      </div>
    </main>
  );
}
