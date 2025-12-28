import { api } from "../utils/api"

/**
 * HistoryService
 * - Todas las funciones aceptan un segundo parámetro `options` que será
 *   pasado a `api.get/patch/post/delete` (por ejemplo: { signal }).
 */
export const HistoryService = {
  getAll: (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const path = queryString ? `historia?${queryString}` : "historia"
    return api.get(path, options)
  },

  getById: (id, options = {}) => {
    return api.get(`historia/${id}`, options)
  },

  create: (historyData) => {
    return api.post("historia", historyData)
  },

  update: (id, historyData) => {
    return api.patch(`historia/${id}`, historyData)
  },

  delete: (id) => {
    return api.delete(`historia/${id}`)
  }
}
