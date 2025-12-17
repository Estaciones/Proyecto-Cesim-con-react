// src/hooks/usePatients.js
import { useState, useCallback } from 'react';
import { PatientService } from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await PatientService.getAll(params);
      setPatients(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    try {
      const newPatient = await PatientService.create(patientData);
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id, patientData) => {
    setLoading(true);
    try {
      const updatedPatient = await PatientService.update(id, patientData);
      setPatients(prev => prev.map(p => p.id_paciente === id ? updatedPatient : p));
      return updatedPatient;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePatient = useCallback(async (id) => {
    setLoading(true);
    try {
      await PatientService.delete(id);
      setPatients(prev => prev.filter(p => p.id_paciente !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignGestor = useCallback(async (data) => {
    setLoading(true);
    try {
      const result = await PatientService.assignGestor(data);
      // Después de asignar, recargar la lista de pacientes
      await fetchPatients();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPatients]);

  const fetchGestores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PatientService.getGestores();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    assignGestor,
    fetchGestores,
  };
}