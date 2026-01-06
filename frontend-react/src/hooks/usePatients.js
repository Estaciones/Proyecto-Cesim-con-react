import { useState, useCallback, useRef, useEffect } from "react";
import { PatientService } from "../services/patientService";

let hookCallCount = 0;
let fetchPatientsCallCount = 0;

export function usePatients() {
  hookCallCount++;
  console.log(`🟡 usePatients - HOOK LLAMADO #${hookCallCount}`);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const serviceRef = useRef(PatientService);
  const inFlightRef = useRef(null);

  const fetchPatients = useCallback(async (params = {}, options = {}) => {
    fetchPatientsCallCount++;
    console.log(`🔄 usePatients.fetchPatients - LLAMADA #${fetchPatientsCallCount}`, {
      params,
      hasSignal: !!options.signal,
    });

    if (inFlightRef.current && !options.signal) {
      console.log("🔒 usePatients.fetchPatients - petición ya en curso (reuso)");
      return inFlightRef.current;
    }

    const promise = (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceRef.current.getAll(params, options);
        console.log("usePatients.fetchPatients - respuesta raw:", data);

        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (data && Array.isArray(data.data)) arr = data.data;
        else if (data && Array.isArray(data.pacientes)) arr = data.pacientes;
        else if (data && Array.isArray(data.results)) arr = data.results;
        else if (data && Array.isArray(data.items)) arr = data.items;
        else {
          console.warn("usePatients.fetchPatients - payload inesperado, se normaliza a []", data);
          arr = [];
        }

        setPatients(arr);
        return data;
      } catch (err) {
        if (err && err.name === "AbortError") {
          console.log("usePatients.fetchPatients - aborted");
          return null;
        }
        console.error("❌ usePatients.fetchPatients - ERROR:", err);
        setError(err?.message || String(err));
        throw err;
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    if (!options.signal) inFlightRef.current = promise;
    return promise;
  }, []);

  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    try {
      const newPatient = await serviceRef.current.create(patientData);
      setPatients((prev) => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id, patientData) => {
    setLoading(true);
    try {
      const updated = await serviceRef.current.update(id, patientData);
      setPatients((prev) => prev.map((p) => (p.id_paciente === id ? updated : p)));
      return updated;
    } catch (err) {
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePatient = useCallback(async (id) => {
    setLoading(true);
    try {
      await serviceRef.current.delete(id);
      setPatients((prev) => prev.filter((p) => p.id_paciente !== id));
    } catch (err) {
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignGestor = useCallback(async (data) => {
    setLoading(true);
    try {
      const result = await serviceRef.current.assignGestor(data);
      return result;
    } catch (err) {
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGestores = useCallback(async (options = {}) => {
    setLoading(true);
    try {
      const data = await serviceRef.current.getGestores(options);
      return data;
    } catch (err) {
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("🎯 usePatients - EFECTO DE MONTAJE (hook creado)");
    return () => console.log("🧹 usePatients - EFECTO DE DESMONTAJE (hook destruido)");
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