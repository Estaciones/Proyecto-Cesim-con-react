// backend/routes/apiRoutes.js
import express from 'express';
import {
  getProfile,
  getHistoria,
  postHistoria,
  patchHistoria,
  getPlanes,
  postPlanTratamiento,
  patchPlanTratamiento,
  getPacientes,
  getPrescripcion,
  patchPrescripcion,
  getGestores,
  postAsignarGestor,
  createPatient
} from '../controllers/apiController.js';

const router = express.Router();

// profile
router.get('/profile', getProfile);

// historia_clinica
router.get('/historia', getHistoria);
router.post('/historia', postHistoria);
router.patch('/historia/:id', patchHistoria);

// plan_tratamiento
router.get('/plan_tratamiento', getPlanes);
router.post('/plan_tratamiento', postPlanTratamiento);
router.patch('/plan_tratamiento/:id', patchPlanTratamiento);

// prescripcion
router.get('/prescripcion/:id', getPrescripcion);
router.patch('/prescripcion/:id', patchPrescripcion);

// pacientes
router.get('/pacientes', getPacientes);


// gestores
router.get('/gestores', getGestores);

// asignar gestor
router.post('/asignar_gestor', postAsignarGestor);

// crear paciente + asignar a medico
router.post('/pacientes', createPatient);

export default router;
