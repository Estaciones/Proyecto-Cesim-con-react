// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

/*
  Componente Login:
  - Usa estado controlado para username/password
  - Hace fetch a la misma API que tenías en el JS original
  - Guarda el usuario en localStorage y navega al dashboard con useNavigate()
  - showMessage maneja el área de mensajes (success/error)
*/

export default function Login() {
  const [username, setUsername] = useState(""); // puede ser email o nombre de usuario
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null); // { text, type } type: 'success'|'error'
  const navigate = useNavigate();

  const API_LOGIN = "http://localhost:3000/api/auth/login";
  // Si quieres usar variable de entorno: process.env.REACT_APP_API_BASE + '/auth/login'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

        // Guardamos en localStorage (igual que tu versión original)
        localStorage.setItem("user", JSON.stringify(userData));

        // Navegamos al dashboard (ruta relativa en React)
        navigate("/dashboard");
      } else {
        showMessage("❌ " + (data.error || "Error desconocido"), "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("❌ " + error.message, "error");
    }
  };

  function showMessage(text, type = "error") {
    setMessage({ text, type });
    // Oculta el mensaje después de 6 segundos (opcional)
    setTimeout(() => setMessage(null), 6000);
  }

  return (
    <div className="login-container">
      <form className="login-form" id="loginForm" onSubmit={handleSubmit}>
        <div className="login-header">
          <div className="brand">APP</div>
          <div>
            <h2 className="login-title">Iniciar Sesión</h2>
            <div className="login-sub">Introduce tus credenciales</div>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Entrar</button>

        {/* área de mensajes */}
        <div
          id="message"
          style={{ display: message ? "block" : "none" }}
          className={message ? (message.type === "success" ? "success" : "error") : ""}
        >
          {message ? message.text : null}
        </div>

        <p className="message">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
