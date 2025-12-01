// src/components/Register.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // reutiliza el CSS del login (contiene .login-container con overflow-y)

export default function Register() {
    const navigate = useNavigate();

    // URL de la API: si quieres usar .env, pon REACT_APP_API_BASE (ej: http://localhost:3000)
    const API_URL = "http://localhost:3000/api/auth/register";

    // estados para cada campo (controlados)
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [genero, setGenero] = useState("");
    const [ci, setCi] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI helpers
    const [message, setMessage] = useState(null); // { text, type: 'success'|'error' }
    const [emailErrorVisible, setEmailErrorVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pwdScore, setPwdScore] = useState(0); // 0..4

    // calcula la fortaleza como en tu JS original
    function passwordStrength(pwd) {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    }

    useEffect(() => {
        setPwdScore(passwordStrength(password));
        // hide match message while typing
        // (we show mismatch only en submit o en el área de confirmación)
    }, [password]);

    // validaciones cliente (mismo comportamiento que tu función validateForm)
    function validateForm(payload) {
        if (
            !payload.email ||
            !payload.password ||
            !payload.tipo_usuario ||
            !payload.nombre_usuario ||
            !payload.nombre ||
            !payload.apellido ||
            !payload.genero ||
            !payload.telefono ||
            !payload.ci
        ) {
            return { ok: false, msg: "Todos los campos son obligatorios." };
        }
        if (payload.password.length < 8) {
            return { ok: false, msg: "La contraseña debe tener al menos 8 caracteres." };
        }
        if (
            !/[A-Z]/.test(payload.password) ||
            !/[0-9]/.test(payload.password) ||
            !/[^A-Za-z0-9]/.test(payload.password)
        ) {
            return {
                ok: false,
                msg: "La contraseña debe incluir mayúscula, número y carácter especial.",
            };
        }
        if (!/^\d{10,11}$/.test(payload.ci)) {
            return { ok: false, msg: "CI inválido. Debe ser 10 o 11 dígitos (solo números)." };
        }
        if (!/^\d{7,10}$/.test(payload.telefono)) {
            return { ok: false, msg: "Teléfono inválido. Solo dígitos." };
        }
        return { ok: true };
    }

    function showMessage(text, type = "info") {
        setMessage({ text, type });
        // auto-hide
        setTimeout(() => setMessage(null), 6000);
    }

    function clearMessage() {
        setMessage(null);
    }

    // envía el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        clearMessage();
        setEmailErrorVisible(false);

        // construir payload con las mismas claves que tu backend espera
        const payload = {
            email: email.trim(),
            password: password,
            tipo_usuario: tipoUsuario,
            nombre_usuario: nombreUsuario.trim(),
            nombre: nombre.trim(),
            apellido: apellidos.trim(),
            genero: genero.trim(),
            telefono: telefono.trim(),
            ci: ci.trim(),
        };

        // verificar coincidencia de contraseña
        if (password !== confirmPassword) {
            setMessage({ text: "Las contraseñas no coinciden", type: "error" });
            return;
        }

        const v = validateForm(payload);
        if (!v.ok) {
            showMessage(v.msg, "error");
            return;
        }

        // enviar
        setSubmitting(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // parse muy defensivo (por si no viene JSON)
            const json = await res.json().catch(() => ({}));

            if (res.ok) {
                showMessage(json.message || "Registro exitoso", "success");
                // resetear formulario
                setNombreUsuario("");
                setNombre("");
                setApellidos("");
                setGenero("");
                setCi("");
                setTelefono("");
                setEmail("");
                setTipoUsuario("");
                setPassword("");
                setConfirmPassword("");
                setPwdScore(0);

                // redirigir al login después de 1.5s
                setTimeout(() => navigate("/login"), 1500);
            } else {
                // manejar errores como en tu JS original
                if (res.status === 400) {
                    showMessage(json.error || "Datos inválidos", "error");
                } else if (res.status === 409) {
                    showMessage(json.error || "El email o nombre de usuario ya existe", "error");
                    if (json.error && json.error.toLowerCase().includes("email")) {
                        setEmailErrorVisible(true);
                    }
                } else {
                    showMessage(json.error || "Error del servidor", "error");
                }
            }
        } catch (err) {
            console.error("Error al conectar al backend:", err);
            showMessage("No se pudo conectar con el servidor. ¿Está corriendo?", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // helpers para estilo de la barra de password
    const pwdPercent = `${(pwdScore / 4) * 100}%`;
    let pwdColor = "#ff6b6b";
    let pwdText = "";
    if (pwdScore <= 1) {
        pwdColor = "#ff6b6b";
        pwdText = "Muy débil";
    } else if (pwdScore === 2) {
        pwdColor = "#ffb86b";
        pwdText = "Débil";
    } else if (pwdScore === 3) {
        pwdColor = "#ffe66d";
        pwdText = "Buena";
    } else {
        pwdColor = "#2ed573";
        pwdText = "Fuerte";
    }

    return (
        <div className="login-container" role="main" aria-label="Registro container">
            <div className="login-header">
                <div className="brand">HS</div>
                <div>
                    <div className="login-title">Crear cuenta</div>
                    <div className="login-sub">Registra tu usuario para acceder a la plataforma</div>
                </div>
            </div>

            <form id="registerForm" className="login-form" onSubmit={handleSubmit} noValidate>
                <h2 className="visually-hidden">Formulario de registro</h2>

                <div className="input-group">
                    <label htmlFor="nombre_usuario">Nombre de usuario</label>
                    <input
                        id="nombre_usuario"
                        name="nombre_usuario"
                        type="text"
                        required
                        autoComplete="username"
                        value={nombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        required
                        autoComplete="given-name"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="apellidos">Apellidos</label>
                    <input
                        id="apellidos"
                        name="apellidos"
                        type="text"
                        required
                        autoComplete="family-name"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="genero">Género</label>
                    <select
                        id="genero"
                        name="genero"
                        required
                        value={genero}
                        onChange={(e) => setGenero(e.target.value)}
                    >
                        <option value="">Selecciona tu género</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="ci">Carnet de Identidad (CI)</label>
                    <input
                        id="ci"
                        name="ci"
                        type="text"
                        required
                        maxLength={11}
                        value={ci}
                        onChange={(e) => setCi(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        maxLength={10}
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <small
                        id="emailError"
                        className="input-dynamic"
                        style={{ display: emailErrorVisible ? "block" : "none", color: "#e05252" }}
                    >
                        El email ya está registrado
                    </small>
                </div>

                <div className="input-group">
                    <label htmlFor="tipo_usuario">Tipo de Usuario</label>
                    <select
                        id="tipo_usuario"
                        name="tipo_usuario"
                        required
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                    >
                        <option value="">Selecciona un tipo</option>
                        <option value="paciente">Paciente</option>
                        <option value="medico">Médico</option>
                        <option value="gestor_casos">Gestor de Casos</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <small className="small-muted">
                        Mínimo 8 caracteres, una mayúscula, un número y un carácter especial
                    </small>

                    <div id="passwordStrength" aria-hidden="true" style={{ marginTop: 8 }}>
                        <div style={{ height: 8, background: "#eee", borderRadius: 8, overflow: "hidden" }}>
                            <div
                                id="passwordBar"
                                style={{
                                    width: pwdPercent,
                                    height: "100%",
                                    borderRadius: 8,
                                    transition: "width .25s ease",
                                    background: pwdColor,
                                }}
                            />
                        </div>
                        <small id="passwordMessage" className="small-muted" style={{ display: "block", marginTop: 6 }}>
                            {pwdText}
                        </small>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <small
                        id="passwordMatch"
                        className="input-dynamic"
                        style={{ display: password && confirmPassword && password !== confirmPassword ? "block" : "none", color: "#e05252" }}
                    >
                        Las contraseñas no coinciden
                    </small>
                </div>

                <button type="submit" id="submitBtn" disabled={submitting}>
                    {submitting ? "Registrando..." : "Registrarse"}
                </button>

                <div id="message" aria-live="polite" style={{ display: message ? "block" : "none", marginTop: 12 }}>
                    {message ? (
                        <div
                            style={{
                                padding: "10px 12px",
                                borderRadius: 8,
                                fontWeight: 700,
                                background: message.type === "error" ? "#fff0f0" : "#e6ffef",
                                color: message.type === "error" ? "#b00" : "#046c35",
                                border: message.type === "error" ? "1px solid #f5c6c6" : "1px solid #c6f5d2",
                            }}
                        >
                            {message.text}
                        </div>
                    ) : null}
                </div>

                <p className="message">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
                </p>
            </form>
        </div>
    );
}
