import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"
import { useToast } from "../../../hooks/useToast"
import styles from "./Login.module.css"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { login } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      // Usar identifier en lugar de 'email' para que el hook/service lo normalice
      await login({ identifier: username.trim(), password })

      setMessage({ text: "✅ Login exitoso. Redirigiendo...", type: "success" })
      showToast("Login exitoso", "success", 2000)
      setTimeout(() => navigate("/dashboard"), 700)
    } catch (error) {
      console.error("Login error:", error)
      setMessage({ text: "❌ " + (error.message || "Error desconocido"), type: "error" })
      showToast(error.message || "Error desconocido", "error")
    } finally {
      setLoading(false)
    }
  }

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
            className={`${styles.button} ${loading ? styles.loading : ""}`}>
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
  )
}