
"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function iconoDeporte(nombre = "") {
  const n = nombre.toLowerCase();

  if (n.includes("fútbol") || n.includes("futbol")) return "⚽";
  if (n.includes("baloncesto") || n.includes("basket")) return "🏀";
  if (n.includes("natación") || n.includes("natacion")) return "🏊";
  if (n.includes("tenis")) return "🎾";
  if (n.includes("ciclismo")) return "🚴";
  if (n.includes("voleibol") || n.includes("voleib")) return "🏐";
  if (n.includes("atletismo")) return "🏃";

  return "🏆";
}

export default function Home() {
  const [deportes, setDeportes] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [intento, setIntento] = useState(0);

  const cargarDeportes = useCallback(async () => {
    setEstado("cargando");

    try {
      const respuesta = await fetch(`${API_URL}/deportes`, {
        cache: "no-store",
      });

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista de deportes");
      }

      setDeportes(datos);
      setEstado("ok");
    } catch (error) {
      console.error("Error al cargar deportes:", error);
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    cargarDeportes();
  }, [cargarDeportes, intento]);

  const enlaces = [
    { href: "#inicio", texto: "Inicio" },
    { href: "#deportes", texto: "Deportes" },
    { href: "#equipos", texto: "Equipos" },
    { href: "#torneos", texto: "Torneos" },
  ];

  function navegar(href) {
    setMenuAbierto(false);

    if (href.startsWith("#")) {
      const destino = document.querySelector(href);
      destino?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = href;
    }
  }

  return (
    <main className="site">
      <nav className="navbar">
        <div className="container navbar-inner">
          <a
            href="#inicio"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              navegar("#inicio");
            }}
            aria-label="EliteSport, ir al inicio"
          >
            Elite<span>Sport</span>
            <span className="brand-mark">●</span>
          </a>

          <div className="nav-links">
            {enlaces.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={(e) => {
                  e.preventDefault();
                  navegar(enlace.href);
                }}
              >
                {enlace.texto}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <span className={`connection connection-${estado}`}>
              <span className="connection-dot" />
              {estado === "ok"
                ? "Sistema conectado"
                : estado === "error"
                  ? "Sin conexión"
                  : "Conectando"}
            </span>

            <a className="button button-primary button-login" href="/login">
              Iniciar sesión <span aria-hidden="true">↗</span>
            </a>

            <button
              className="menu-toggle"
              type="button"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
            >
              {menuAbierto ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuAbierto && (
          <div className="mobile-menu">
            {enlaces.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={(e) => {
                  e.preventDefault();
                  navegar(enlace.href);
                }}
              >
                {enlace.texto}
                <span aria-hidden="true">→</span>
              </a>
            ))}

            <a className="mobile-login" href="/login">
              Iniciar sesión →
            </a>
          </div>
        )}
      </nav>

      <section className="hero" id="inicio">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Plataforma de gestión deportiva
            </div>

            <h1>
              El deporte merece una gestión{" "}
              <span className="gradient-text">extraordinaria.</span>
            </h1>

            <p className="hero-description">
              Organiza disciplinas deportivas, administra tus equipos y lleva
              cada competencia al siguiente nivel con EliteSport.
            </p>

            <div className="hero-actions">
              <a className="button button-primary button-large" href="/login">
                Explorar plataforma <span aria-hidden="true">↗</span>
              </a>

              <a
                className="button button-outline button-large"
                href="#deportes"
                onClick={(e) => {
                  e.preventDefault();
                  navegar("#deportes");
                }}
              >
                Descubrir deportes <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="hero-note">
              <span className="hero-note-icon">✓</span>
              Una plataforma para organizar y potenciar el deporte.
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />

            <div className="visual-label">
              <span className="visual-label-dot" />
              TU CENTRO DE CONTROL
            </div>

            <div className="visual-main-card">
              <div className="visual-card-top">
                <div>
                  <span className="visual-kicker">ELITESPORT / RESUMEN</span>
                  <h2>Tu deporte, organizado.</h2>
                </div>
                <div className="visual-emblem">ES</div>
              </div>

              <div className="visual-feature">
                <div className="feature-icon">🏆</div>
                <div className="feature-copy">
                  <strong>Gestión deportiva</strong>
                  <span>Todo conectado en un mismo lugar</span>
                </div>
                <span className="feature-arrow">↗</span>
              </div>

              <div className="visual-feature">
                <div className="feature-icon">⚡</div>
                <div className="feature-copy">
                  <strong>Organización eficiente</strong>
                  <span>Accede a las herramientas de tu plataforma</span>
                </div>
                <span className="feature-arrow">↗</span>
              </div>

              <div className="visual-bottom">
                <span>DISCIPLINA</span>
                <span>DEDICACIÓN</span>
                <span>RESULTADOS</span>
              </div>
            </div>

            <div className="floating-card floating-card-top">
              <span className="floating-icon">⚽</span>
              <div>
                <strong>Deportes</strong>
                <span>En una plataforma</span>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span className="floating-icon">📈</span>
              <div>
                <strong>Tu siguiente nivel</strong>
                <span>Empieza aquí</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-stats">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-icon">🏅</span>
            <div>
              <strong>{estado === "ok" ? deportes.length : "—"}</strong>
              <span>Deportes registrados</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <div>
              <strong>Equipos</strong>
              <span>Gestión de grupos deportivos</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">📅</span>
            <div>
              <strong>Entrenamientos</strong>
              <span>Organización de actividades</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <div>
              <strong>Torneos</strong>
              <span>Gestión de competencias</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section sports-section" id="deportes">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                Explora las disciplinas
              </div>
              <h2>
                El deporte que te mueve.
                <br />
                <span className="gradient-text">Todo en un solo lugar.</span>
              </h2>
              <p>
                Estas son las disciplinas registradas actualmente en EliteSport.
              </p>
            </div>

            <a className="text-link" href="/login">
              Ir a la plataforma <span aria-hidden="true">↗</span>
            </a>
          </div>

          {estado === "cargando" && (
            <div className="state-panel">
              <span className="loading-spinner" />
              <p>Estamos cargando los deportes...</p>
            </div>
          )}

          {estado === "error" && (
            <div className="state-panel error-panel">
              <span className="state-icon">!</span>
              <h3>No pudimos cargar los deportes</h3>
              <p>
                Verifica que el backend esté ejecutándose y vuelve a intentarlo.
              </p>
              <button
                className="button button-primary"
                type="button"
                onClick={() => setIntento((anterior) => anterior + 1)}
              >
                Reintentar conexión ↻
              </button>
            </div>
          )}

          {estado === "ok" && deportes.length === 0 && (
            <div className="state-panel">
              <span className="state-icon">🏅</span>
              <h3>Aún no hay deportes registrados</h3>
              <p>Cuando registres una disciplina, aparecerá en esta sección.</p>
            </div>
          )}

          {estado === "ok" && deportes.length > 0 && (
            <div className="sports-grid">
              {deportes.map((deporte) => (
                <article className="sport-card" key={deporte.id_deporte}>
                  <div className="sport-card-top">
                    <div className="sport-icon">
                      {iconoDeporte(deporte.nombre)}
                    </div>
                    <span
                      className={`status-badge ${
                        deporte.estado ? "status-active" : "status-inactive"
                      }`}
                    >
                      <span />
                      {deporte.estado ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="sport-card-content">
                    <span className="sport-number">
                      DISCIPLINA /{" "}
                      {String(deporte.id_deporte).padStart(2, "0")}
                    </span>
                    <h3>{deporte.nombre}</h3>
                    <p>
                      {deporte.descripcion || "Sin descripción registrada."}
                    </p>
                  </div>

                  <a className="sport-card-link" href="/login">
                    Explorar disciplina <span aria-hidden="true">↗</span>
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section management-section" id="equipos">
        <div className="container management-grid">
          <div className="management-art" aria-hidden="true">
            <div className="management-art-circle">
              <span>👥</span>
            </div>
            <div className="management-mini-card mini-card-one">
              <span>⚽</span> Organización
            </div>
            <div className="management-mini-card mini-card-two">
              <span>✓</span> Trabajo en equipo
            </div>
          </div>

          <div className="management-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Crecemos en equipo
            </div>
            <h2>
              Los grandes resultados se construyen{" "}
              <span className="gradient-text">en equipo.</span>
            </h2>
            <p>
              Accede a EliteSport para consultar y gestionar tus equipos
              deportivos de acuerdo con los permisos de tu cuenta.
            </p>
            <ul className="benefit-list">
              <li>
                <span>✓</span> Organización de grupos deportivos
              </li>
              <li>
                <span>✓</span> Acceso desde tu cuenta
              </li>
              <li>
                <span>✓</span> Herramientas centralizadas
              </li>
            </ul>
            <a className="button button-primary button-large" href="/login">
              Acceder a equipos <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section tournaments-section" id="torneos">
        <div className="container">
          <div className="tournament-banner">
            <div className="tournament-decoration" aria-hidden="true">
              🏆
            </div>
            <div className="tournament-content">
              <div className="eyebrow">
                <span className="eyebrow-line" />
                El siguiente desafío te espera
              </div>
              <h2>
                Cada competencia es una oportunidad para{" "}
                <span className="gradient-text">superarte.</span>
              </h2>
              <p>
                Ingresa a la plataforma para consultar las funciones de gestión
                de torneos disponibles para tu usuario.
              </p>
              <a className="button button-primary button-large" href="/login">
                Explorar torneos <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="tournament-side-label">COMPITE · SUPÉRATE · CRECE</div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner">
          <div>
            <span className="cta-kicker">ELITESPORT / TU PLATAFORMA</span>
            <h2>¿Listo para llevarlo al siguiente nivel?</h2>
            <p>Entra a tu cuenta y descubre las herramientas disponibles.</p>
          </div>
          <a className="button button-light button-large" href="/login">
            Entrar a EliteSport <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <a className="brand footer-brand" href="#inicio">
            Elite<span>Sport</span>
          </a>
          <p>Plataforma de gestión deportiva.</p>
          <a
            className="footer-top-link"
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              navegar("#inicio");
            }}
          >
            Volver al inicio ↑
          </a>
          <span className="copyright">
            © {new Date().getFullYear()} EliteSport
          </span>
        </div>
      </footer>
    </main>
  );
}