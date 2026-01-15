import { api } from "../utils/api"

export const PatientService = {

  getAll: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const path = queryString ? `pacientes?${queryString}` : "pacientes"
    return api.get(path, options)
  },

  getById: (id, options = {}) => {
    return api.get(`pacientes/${id}`, options)
  },

  create: (patientData) => {
    return api.post("pacientes", patientData)
  },

  update: (id, patientData) => {
    return api.patch(`pacientes/${id}`, patientData)
  },

  delete: (id) => {
    return api.delete(`pacientes/${id}`)
  },

  getGestores: (options = {}) => {
    return api.get("gestores", options)
  },

  assignGestor: (data) => {
    return api.post("asignar_gestor", data)
  }
}
