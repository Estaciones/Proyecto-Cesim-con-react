// src/hooks/usePlans.js
import { useState, useCallback } from 'react';
import { PlanService } from '../services/planService';

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await PlanService.getAll(params);
      setPlans(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (planData) => {
    setLoading(true);
    try {
      const newPlan = await PlanService.create(planData);
      setPlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (id, planData) => {
    setLoading(true);
    try {
      const updatedPlan = await PlanService.update(id, planData);
      setPlans(prev => prev.map(p => p.id_plan === id ? updatedPlan : p));
      return updatedPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (id) => {
    setLoading(true);
    try {
      await PlanService.delete(id);
      setPlans(prev => prev.filter(p => p.id_plan !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrescription = useCallback(async (presId, prescriptionData) => {
    setLoading(true);
    try {
      const updatedPres = await PlanService.updatePrescription(presId, prescriptionData);
      // Actualizar el plan que contiene esta prescripción
      setPlans(prev => prev.map(plan => {
        if (plan.prescripciones?.some(p => p.id_prescripcion === presId)) {
          return {
            ...plan,
            prescripciones: plan.prescripciones.map(p =>
              p.id_prescripcion === presId ? updatedPres : p
            ),
          };
        }
        return plan;
      }));
      return updatedPres;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    updatePrescription,
  };
}