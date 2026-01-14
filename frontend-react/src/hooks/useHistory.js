// src/hooks/useHistory.js
import { useState, useCallback } from "react"
import { HistoryService } from "../services/historyService"

export function useHistory() {
  const [historia, setHistoria] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistoria = useCallback(async (params = {}, options = {}) => {
    if (options.signal && options.signal.aborted) return null

    setLoading(true)
    setError(null)
    try {
      const data = await HistoryService.getAll(params, options)

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
        arr = [data]
      } else {
        arr = []
      }

      arr = arr.map(item => ({
        ...item,
        _id: item.id_registro || item.id || Math.random().toString(36).substr(2, 9)
      }))

      setHistoria(arr)
      return arr
    } catch (err) {
      if (err && err.name === "AbortError") {
        return null
      }
      console.error("❌ useHistory.fetchHistoria - ERROR", err)
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // create/update/delete igual que antes
  const createRegistro = useCallback(async (historyData) => {
    setLoading(true)
    try {
      const newRegistro = await HistoryService.create(historyData)
      setHistoria((prev) => [...prev, newRegistro])
      return newRegistro
    } catch (err) {
      console.error("❌ useHistory.createRegistro - ERROR", err)
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
      console.error("❌ useHistory.updateRegistro - ERROR", err)
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
      console.error("❌ useHistory.deleteRegistro - ERROR", err)
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
