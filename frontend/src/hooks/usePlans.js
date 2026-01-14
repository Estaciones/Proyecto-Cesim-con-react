// src/hooks/usePlans.js
import { useState, useCallback, useRef } from "react"
import { PlanService } from "../services/planService"

export function usePlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const serviceRef = useRef(PlanService)
  const inFlightRef = useRef(null)

  const fetchPlans = useCallback(async (params = {}, options = {}) => {
    // Si se pasó un signal ya abortado, salir temprano
    if (options.signal && options.signal.aborted) return null

    if (inFlightRef.current && !options.signal) {
      return inFlightRef.current
    }

    const promise = (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await serviceRef.current.getAll(params, options)

        let arr = []
        if (Array.isArray(data)) arr = data
        else if (data && Array.isArray(data.data)) arr = data.data
        else if (data && Array.isArray(data.planes)) arr = data.planes
        else if (data && Array.isArray(data.results)) arr = data.results
        else if (data && Array.isArray(data.items)) arr = data.items
        else {
          arr = []
        }

        setPlans(arr)
        return data
      } catch (err) {
        if (err && err.name === "AbortError") {
          // petición abortada intencionalmente: no es error para mostrar
          return null
        }
        console.error("❌ usePlans.fetchPlans - ERROR:", err)
        setError(err?.message || String(err))
        throw err
      } finally {
        setLoading(false)
        inFlightRef.current = null
      }
    })()

    if (!options.signal) inFlightRef.current = promise
    return promise
  }, [])

  // resto de funciones (create/update/delete) se mantienen igual
  const createPlan = useCallback(async (planData) => {
    setLoading(true)
    try {
      const newPlan = await serviceRef.current.create(planData)
      setPlans((prev) => [...prev, newPlan])
      return newPlan
    } catch (err) {
      console.error("❌ usePlans.createPlan - ERROR:", err)
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePlan = useCallback(async (id_plan, planData) => {
    setLoading(true)
    try {
      const updated = await serviceRef.current.update(id_plan, planData)
      setPlans((prev) =>
        prev.map((p) =>
          p.id_plan === id_plan || p.id === id_plan ? updated : p
        )
      )
      return updated
    } catch (err) {
      console.error("❌ usePlans.updatePlan - ERROR:", err)
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePlan = useCallback(async (id_plan) => {
    setLoading(true)
    try {
      await serviceRef.current.delete(id_plan)
      setPlans((prev) =>
        prev.filter((p) => !(p.id_plan === id_plan || p.id === id_plan))
      )
    } catch (err) {
      console.error("❌ usePlans.deletePlan - ERROR:", err)
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePrescription = useCallback(async (presId, prescriptionData) => {
    setLoading(true)
    try {
      const updatedPres = await serviceRef.current.updatePrescription(
        presId,
        prescriptionData
      )

      setPlans((prev) =>
        prev.map((plan) => {
          if (
            Array.isArray(plan.prescripciones) &&
            plan.prescripciones.some(
              (p) => p.id_prescripcion === presId || p.id === presId
            )
          ) {
            return {
              ...plan,
              prescripciones: plan.prescripciones.map((p) =>
                p.id_prescripcion === presId || p.id === presId
                  ? updatedPres
                  : p
              )
            }
          }
          return plan
        })
      )

      return updatedPres
    } catch (err) {
      console.error("❌ usePlans.updatePrescription - ERROR:", err)
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    updatePrescription
  }
}
