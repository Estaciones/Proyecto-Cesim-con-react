import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";
import { useAuthContext } from "../../../context/AuthContext";
import styles from "./Register.module.css";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { register } = useAuthContext();

  const [formData, setFormData] = useState({
    nombre_usuario: "",
    nombre: "",
    apellidos: "",
    genero: "",
    ci: "",
    telefono: "",
    email: "",
    tipo_usuario: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState(null);
  const [emailErrorVisible, setEmailErrorVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  useEffect(() => {
    setPasswordScore(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 6000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailErrorVisible(false);
    setMessage(null);

    setSubmitting(true);
    try {
      // Delegamos validación y registro al hook useAuth.register
      await register(formData);

      showMessage("✅ Registro exitoso. Redirigiendo al login...", "success");
      showToast("Registro exitoso", "success", 1500);

      setFormData({
        nombre_usuario: "",
        nombre: "",
        apellidos: "",
        genero: "",
        ci: "",
        telefono: "",
        email: "",
        tipo_usuario: "",
        password: "",
        confirmPassword: ""
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Register - Error:", err);
      const text = err.message || "Error desconocido";

      showMessage("❌ " + text, "error");
      showToast(text, "error");

      // Si el backend indicó que el email ya existe, mostrar nota específica
      if (text.toLowerCase().includes("email")) {
        setEmailErrorVisible(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordPercent = `${(passwordScore / 4) * 100}%`;
  let passwordColor = "#ef4444";
  let passwordText = "Muy débil";

  if (passwordScore <= 1) {
    passwordColor = "#ef4444";
    passwordText = "Muy débil";
  } else if (passwordScore === 2) {
    passwordColor = "#f59e0b";
    passwordText = "Débil";
  } else if (passwordScore === 3) {
    passwordColor = "#10b981";
    passwordText = "Buena";
  } else {
    passwordColor = "#059669";
    passwordText = "Fuerte";
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🏥</div>
            <div className={styles.logoContent}>
              <span className={styles.logoTitle}>Health System</span>
              <span className={styles.logoSubtitle}>Salud Integral</span>
            </div>
          </div>

          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Registra tu usuario para acceder a la plataforma</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.grid}>
            <div className={styles.column}>
              <div className={styles.inputGroup}>
                <label htmlFor="nombre_usuario">Nombre de usuario *</label>
                <input
                  id="nombre_usuario"
                  name="nombre_usuario"
                  type="text"
                  required
                  autoComplete="username"
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="juanperez"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Juan"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="apellidos">Apellidos *</label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Pérez"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="genero">Género *</label>
                <select
                  id="genero"
                  name="genero"
                  required
                  value={formData.genero}
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="">Selecciona tu género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="ci">Carnet de Identidad (CI) *</label>
                <input
                  id="ci"
                  name="ci"
                  type="text"
                  required
                  maxLength={11}
                  value={formData.ci}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div className={styles.column}>
              <div className={styles.inputGroup}>
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  maxLength={10}
                  value={formData.telefono}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0987654321"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="juan@ejemplo.com"
                />
                {emailErrorVisible && (
                  <small className={styles.errorText}>El email ya está registrado</small>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="tipo_usuario">Tipo de Usuario *</label>
                <select
                  id="tipo_usuario"
                  name="tipo_usuario"
                  required
                  value={formData.tipo_usuario}
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="paciente">Paciente</option>
                  <option value="medico">Médico</option>
                  <option value="gestor_casos">Gestor de Casos</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Contraseña *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                />
                <small className={styles.helpText}>
                  Mínimo 8 caracteres, una mayúscula, un número y un carácter especial
                </small>

                <div className={styles.passwordStrength}>
                  <div className={styles.passwordBar}>
                    <div
                      className={styles.passwordFill}
                      style={{
                        width: passwordPercent,
                        backgroundColor: passwordColor
                      }}
                    />
                  </div>
                  <small className={styles.passwordText}>{passwordText}</small>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <small className={styles.errorText}>Las contraseñas no coinciden</small>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`${styles.button} ${submitting ? styles.loading : ""}`}
          >
            {submitting ? "Registrando..." : "Registrarse"}
          </button>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <p className={styles.footer}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className={styles.link}>
              Inicia Sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
