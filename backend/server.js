import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import cookieParser from "cookie-parser" // <-- NUEVO
import authRoutes from "./routes/authRoutes.js"
import apiRoutes from "./routes/apiRoutes.js"
import { verifyToken } from "./middlewares/authMiddleware.js"
dotenv.config()

const app = express()

// ✅ 1. Configurar cookie-parser PRIMERO
app.use(cookieParser())

// ✅ 2. Configurar CORS para aceptar cookies
const corsOptions = {
  origin: ["http://localhost:5173"], // Tu frontend
  credentials: true, // ← IMPORTANTE: permite enviar cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"] // Opcional: expone headers de cookies
}

app.use(helmet())
app.use(cors(corsOptions)) // Usar la nueva configuración
app.use(express.json())

app.use("/api/auth", authRoutes) // Rutas públicas
app.use("/api", verifyToken, apiRoutes) // ¡TODAS las rutas /api requieren token!
const PORT = 4000
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`)
  console.log(`✅ Cookies HTTP-Only habilitadas`)
})