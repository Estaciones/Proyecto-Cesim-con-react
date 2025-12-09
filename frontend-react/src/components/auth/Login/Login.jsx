// src/components/auth/Login/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";
import { apiUrl } from "../../../utils/api";
import { DashboardContext } from "../../../context/DashboardContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Obtener funciones del contexto
  const { login, showToast } = useContext(DashboardContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(apiUrl("auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: username,
          nombre_usuario: username,
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Credenciales incorrectas");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.message === "Login correcto") {
        const userData = {
          id: data.user.id_usuario,
          email: data.user.email,
          tipo: data.user.tipo_usuario,
          nombre_usuario: data.user.nombre_usuario,
        };

        // Actualizamos el contexto y localStorage desde login()
        if (typeof login === "function") {
          login(userData);
        } else {
          // fallback (por compatibilidad)
          try {
            localStorage.setItem("user", JSON.stringify(userData));
          } catch (e) {
            console.warn("No se pudo escribir localStorage", e);
          }
        }

        // Mensaje y toast de éxito
        setMessage({ text: "✅ Login exitoso. Redirigiendo...", type: "success" });
        if (typeof showToast === "function") showToast("Login exitoso", "success", 2000);

        // Pequeña espera para que el usuario vea el mensaje en pantalla
        setTimeout(() => {
          navigate("/dashboard");
        }, 700);
      } else {
        setMessage({ text: "❌ " + (data.error || "Error desconocido"), type: "error" });
        if (typeof showToast === "function") showToast(data.error || "Error desconocido", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ text: "❌ " + error.message, type: "error" });
      if (typeof showToast === "function") showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brand}>APP</div>
          <h1 className={styles.title}>Iniciar Sesión</h1>
          <p className={styles.subtitle}>Introduce tus credenciales</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Usuario o Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
              placeholder="usuario o email@ejemplo.com"
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${loading ? styles.loading : ""}`}
          >
            {loading ? "Iniciando sesión..." : "Entrar"}
          </button>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <p className={styles.footer}>
            ¿No tienes cuenta?{" "}
            <Link to="/register" className={styles.link}>
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
