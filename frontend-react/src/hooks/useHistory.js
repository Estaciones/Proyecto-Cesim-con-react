// src/hooks/useHistory.js
import { useState, useCallback } from 'react';
import { HistoryService } from '../services/historyService';

export function useHistory() {
  const [historia, setHistoria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistoria = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await HistoryService.getAll(params);
      setHistoria(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRegistro = useCallback(async (historyData) => {
    setLoading(true);
    try {
      const newRegistro = await HistoryService.create(historyData);
      setHistoria(prev => [...prev, newRegistro]);
      return newRegistro;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRegistro = useCallback(async (id, historyData) => {
    setLoading(true);
    try {
      const updatedRegistro = await HistoryService.update(id, historyData);
      setHistoria(prev => prev.map(r => r.id_registro === id ? updatedRegistro : r));
      return updatedRegistro;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRegistro = useCallback(async (id) => {
    setLoading(true);
    try {
      await HistoryService.delete(id);
      setHistoria(prev => prev.filter(r => r.id_registro !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    historia,
    loading,
    error,
    fetchHistoria,
    createRegistro,
    updateRegistro,
    deleteRegistro,
  };
}