import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_LOGIN = 'http://localhost:3000/api/auth/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(API_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          nombre_usuario: username,
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales incorrectas');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.message === 'Login correcto') {
        const userData = {
          id: data.user.id_usuario,
          email: data.user.email,
          tipo: data.user.tipo_usuario,
          nombre_usuario: data.user.nombre_usuario,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        
        // Mostrar mensaje de éxito y navegar
        setMessage({ text: '✅ Login exitoso. Redirigiendo...', type: 'success' });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
      } else {
        setMessage({ text: '❌ ' + (data.error || 'Error desconocido'), type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: '❌ ' + error.message, type: 'error' });
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
            className={`${styles.button} ${loading ? styles.loading : ''}`}
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <p className={styles.footer}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className={styles.link}>
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}