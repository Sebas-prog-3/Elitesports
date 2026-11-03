'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('elitesport_token')) {
      window.location.replace('/dashboard');
    }
  }, []);

  const iniciarSesion = async (event) => {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const resultado = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, contrasena }),
      });

      localStorage.setItem('elitesport_token', resultado.token);
      localStorage.setItem('elitesport_user', JSON.stringify(resultado.usuario));
      window.location.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <a className="brand" href="/">Elite<span>Sport</span></a>
        <h1>Iniciar sesión</h1>
        <p className="muted">Accede con tu usuario o correo y contraseña.</p>

        <form className="form" onSubmit={iniciarSesion}>
          <label className="label">
            Usuario o correo
            <input className="input" value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" required />
          </label>
          <label className="label">
            Contraseña
            <input className="input" type="password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} autoComplete="current-password" required />
          </label>
          <button className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
