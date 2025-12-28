import { useState, useCallback, useRef, useEffect } from "react"
import { PlanService } from "../services/planService"

let hookCallCount = 0
let fetchPlansCallCount = 0

export function usePlans() {
  hookCallCount++
  console.log(`🟡 usePlans - HOOK LLAMADO #${hookCallCount}`)

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const serviceRef = useRef(PlanService)
  // inFlightRef guarda la promesa de la llamada *cuando es deduplicable*
  const inFlightRef = useRef(null)

  const fetchPlans = useCallback(async (params = {}, options = {}) => {
    fetchPlansCallCount++
    console.log(`🔄 usePlans.fetchPlans - LLAMADA #${fetchPlansCallCount}`, {
      params,
      hasSignal: !!options.signal
    })

    // Sólo reusar petición en curso si el caller NO pasó un signal explícito.
    if (inFlightRef.current && !options.signal) {
      console.log("🔒 usePlans.fetchPlans - petición ya en curso (reuso)")
      return inFlightRef.current
    }

    const promise = (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await serviceRef.current.getAll(params, options)
        setPlans(Array.isArray(data) ? data : [])
        return data
      } catch (err) {
        if (err && err.name === "AbortError") {
          console.log("usePlans.fetchPlans - aborted")
          return null
        }
        console.error("❌ usePlans.fetchPlans - ERROR:", err)
        setError(err?.message || String(err))
        throw err
      } finally {
        setLoading(false)
        // important: limpiar inFlight solo aquí para que la promesa no quede pegada
        inFlightRef.current = null
      }
    })()

    // Guardar la promesa para posible reuso (solo cuando caller NO pasa signal)
    if (!options.signal) inFlightRef.current = promise

    return promise
  }, [])

  const createPlan = useCallback(async (planData) => {
    setLoading(true)
    try {
      const newPlan = await serviceRef.current.create(planData)
      setPlans((prev) => [...prev, newPlan])
      return newPlan
    } catch (err) {
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

      // Update the prescripciones array inside the plan that contains this prescripción.
      // We keep the API field names (prescripciones, id_prescripcion) intact.
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
      setError(err?.message || String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log("🎯 usePlans - EFECTO DE MONTAJE (hook creado)")
    return () =>
      console.log("🧹 usePlans - EFECTO DE DESMONTAJE (hook destruido)")
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
