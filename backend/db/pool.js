import pkg from "pg"
import dotenv from "dotenv"

dotenv.config()
const { Pool } = pkg

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "plataforma_atencion",
  password: "1234",
  port: "5432"
})

export default pool
