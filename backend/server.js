import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import apiRoutes from "./routes/apiRoutes.js"

dotenv.config()

const app = express()

// ✅ Configurar CORS específico en lugar del wildcard '*'
const corsOptions = {
  origin: ["http://localhost:5173"], // Orígenes permitidos
  credentials: true, // Permitir credenciales
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(helmet())
app.use(cors(corsOptions)) // ✅ Usar configuración específica
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api", apiRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
