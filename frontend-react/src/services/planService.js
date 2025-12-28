import { api } from "../utils/api"

export const PlanService = {
  getAll: (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const path = queryString
      ? `planes?${queryString}`
      : "planes"
    return api.get(path, options)
  },

  getById: (id, options = {}) => api.get(`planes/${id}`, options),

  create: (planData) => api.post("planes", planData),

  update: (id, planData) => api.patch(`planes/${id}`, planData),

  delete: (id) => api.delete(`planes/${id}`),

  updatePrescription: (presId, prescriptionData) =>
    api.patch(`prescripcion/${presId}`, prescriptionData),

  getPrescription: (presId, options = {}) =>
    api.get(`prescripcion/${presId}`, options)
}
