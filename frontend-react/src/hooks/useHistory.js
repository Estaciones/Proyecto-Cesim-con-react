import { useState, useCallback } from "react"
import { HistoryService } from "../services/historyService"

export function useHistory() {
  const [historia, setHistoria] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistoria = useCallback(async (params = {}, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await HistoryService.getAll(params, options)
      console.log("📊 useHistory.fetchHistoria - respuesta raw:", data)

      // Normalización robusta: acepta array directo o wrappers comunes
      let arr = []
      if (Array.isArray(data)) {
        arr = data
      } else if (data && Array.isArray(data.data)) {
        arr = data.data
      } else if (data && Array.isArray(data.historia)) {
        arr = data.historia
      } else if (data && Array.isArray(data.results)) {
        arr = data.results
      } else if (data && Array.isArray(data.items)) {
        arr = data.items
      } else if (data && typeof data === 'object') {
        // Si es un solo objeto (no array), lo convertimos en array
        arr = [data]
        console.log("🔄 useHistory.fetchHistoria - Objeto único convertido a array")
      } else {
        console.warn(
          "⚠️ useHistory.fetchHistoria - payload inesperado, se normaliza a []",
          data
        )
        arr = []
      }

      // Asegurar que cada registro tenga al menos un identificador
      arr = arr.map(item => ({
        ...item,
        // Asegurar que tenga un id para usar como key
        _id: item.id_registro || item.id || Math.random().toString(36).substr(2, 9)
      }))

      console.log(`✅ useHistory.fetchHistoria - ${arr.length} registros cargados`)
      setHistoria(arr)
      return arr
    } catch (err) {
      if (err && err.name === "AbortError") {
        console.log("⏹️ useHistory.fetchHistoria - aborted")
        return null
      }
      console.error("❌ useHistory.fetchHistoria - ERROR", err)
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])


  // resto de CRUD (opcional: si quieres que acepten options, los podemos añadir)
  const createRegistro = useCallback(async (historyData) => {
    setLoading(true)
    try {
      const newRegistro = await HistoryService.create(historyData)
      setHistoria((prev) => [...prev, newRegistro])
      return newRegistro
    } catch (err) {
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRegistro = useCallback(async (id, historyData) => {
    setLoading(true)
    try {
      const updatedRegistro = await HistoryService.update(id, historyData)
      setHistoria((prev) =>
        prev.map((r) => (r.id_registro === id ? updatedRegistro : r))
      )
      return updatedRegistro
    } catch (err) {
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteRegistro = useCallback(async (id) => {
    setLoading(true)
    try {
      await HistoryService.delete(id)
      setHistoria((prev) => prev.filter((r) => r.id_registro !== id))
    } catch (err) {
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    historia,
    loading,
    error,
    fetchHistoria,
    createRegistro,
    updateRegistro,
    deleteRegistro
  }
}
