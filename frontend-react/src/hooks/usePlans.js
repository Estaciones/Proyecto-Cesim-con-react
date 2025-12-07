import { useState, useCallback } from "react"
import { useAuth } from "./useAuth"

/**
 * Hook personalizado para manejar operaciones con planes de tratamiento
 */
export function usePlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const { getToken, user } = useAuth()
  const API_URL = "http://localhost:3000/api"

  /**
   * Cargar planes de tratamiento
   */
  const loadPlans = useCallback(
    async (patientId = null) => {
      try {
        setLoading(true)
        setError(null)

        const token = getToken()
        if (!token) {
          throw new Error("No autenticado")
        }

        let url = `${API_URL}/plans`

        if (patientId) {
          url += `?patient_id=${patientId}`
        } else if (user?.tipo === "paciente") {
          url += `?patient_id=${user.id}`
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar planes")
        }

        setPlans(data.plans || data)
        return { success: true, plans: data.plans || data }
      } catch (error) {
        setError(error.message)
        return { success: false, error: error.message }
      } finally {
        setLoading(false)
      }
    },
    [API_URL, getToken, user]
  )

  /**
   * Crear nuevo plan de tratamiento
   */
  const createPlan = async (planData) => {
    try {
      setLoading(true)
      setError(null)

      const token = getToken()
      if (!token) {
        throw new Error("No autenticado")
      }

      const response = await fetch(`${API_URL}/plans`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(planData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear plan")
      }

      setPlans((prev) => [...prev, data.plan])
      return { success: true, plan: data.plan }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualizar plan de tratamiento
   */
  const updatePlan = async (planId, planData) => {
    try {
      setLoading(true)
      setError(null)

      const token = getToken()
      if (!token) {
        throw new Error("No autenticado")
      }

      const response = await fetch(`${API_URL}/plans/${planId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(planData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar plan")
      }

      setPlans((prev) =>
        prev.map((plan) =>
          plan.id_plan === planId ? { ...plan, ...data.plan } : plan
        )
      )

      return { success: true, plan: data.plan }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Eliminar plan de tratamiento
   */
  const deletePlan = async (planId) => {
    try {
      setLoading(true)
      setError(null)

      const token = getToken()
      if (!token) {
        throw new Error("No autenticado")
      }

      const response = await fetch(`${API_URL}/plans/${planId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar plan")
      }

      setPlans((prev) => prev.filter((plan) => plan.id_plan !== planId))
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualizar prescripción
   */
  const updatePrescripcion = async (prescripcionId, prescripcionData) => {
    try {
      setLoading(true)
      setError(null)

      const token = getToken()
      if (!token) {
        throw new Error("No autenticado")
      }

      const response = await fetch(
        `${API_URL}/prescripciones/${prescripcionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(prescripcionData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar prescripción")
      }

      // Actualizar plan que contiene esta prescripción
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.prescripciones) {
            return {
              ...plan,
              prescripciones: plan.prescripciones.map((pres) =>
                pres.id_prescripcion === prescripcionId
                  ? { ...pres, ...data.prescripcion }
                  : pres
              )
            }
          }
          return plan
        })
      )

      return { success: true, prescripcion: data.prescripcion }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    // Estado
    plans,
    loading,
    error,
    selectedPlan,

    // Funciones
    loadPlans,
    createPlan,
    updatePlan,
    deletePlan,
    updatePrescripcion,
    setSelectedPlan
  }
}

export default usePlans
