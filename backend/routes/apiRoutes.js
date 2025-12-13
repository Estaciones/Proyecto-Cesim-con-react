// backend/routes/apiRoutes.js
import express from "express"
import * as controllers from "../controllers/apiControllers.js"

const router = express.Router()

// profile
router.get("/profile", controllers.getProfile)
router.patch("/profile/:id", controllers.updateProfile)

// Pacientes
router.get("/pacientes", controllers.getPacientes)
router.get("/pacientes/:id", controllers.getPacienteById)
router.post("/pacientes", controllers.createPatient)
router.patch("/pacientes/:id", controllers.updatePatient)
router.delete("/pacientes/:id", controllers.deletePatient)

// Historia Clínica
router.get("/historia", controllers.getHistoria)
router.get("/historia/:id", controllers.getHistoriaById)
router.post("/historia", controllers.postHistoria)
router.patch("/historia/:id", controllers.patchHistoria)
router.delete("/historia/:id", controllers.deleteHistoria)

// Planes de Tratamiento
router.get("/planes", controllers.getPlanes)
router.get("/planes/:id", controllers.getPlanById)
router.post("/planes", controllers.postPlanTratamiento)
router.patch("/planes/:id", controllers.patchPlanTratamiento)
router.delete("/planes/:id", controllers.deletePlanTratamiento)

// Prescripciones
router.get("/prescripciones/:id", controllers.getPrescripcion)
router.post("/prescripciones", controllers.createPrescripcion)
router.patch("/prescripciones/:id", controllers.patchPrescripcion)
router.delete("/prescripciones/:id", controllers.deletePrescripcion)

// Gestores
router.get("/gestores", controllers.getGestores)
router.get("/gestores/:id", controllers.getGestorById)
router.post("/gestores", controllers.createGestor)
router.patch("/gestores/:id", controllers.updateGestor)
router.delete("/gestores/:id", controllers.deleteGestor)
router.post("/asignar-gestor", controllers.postAsignarGestor)
router.delete("/asignar-gestor", controllers.deleteAsignacionGestor)

export default router
