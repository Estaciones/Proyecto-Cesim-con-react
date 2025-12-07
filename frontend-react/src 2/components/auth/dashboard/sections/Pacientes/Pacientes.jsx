import React, { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '../../../../context/DashboardContext';
import Button from '../../../ui/Button/Button';
import Card from '../../../ui/Card/Card';
import styles from './Pacientes.module.css';

export default function Pacientes() {
  const {
    patients,
    loadPatients,
    loading,
    profile,
    selectPatient,
    openAsignarGestor,
    openCrearPlanWithPatient,
  } = useContext(DashboardContext);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = Array.isArray(patients)
    ? patients.filter((patient) => {
        const searchText = `${patient.nombre || ''} ${patient.apellido || ''} ${patient.ci || ''} ${patient.email || ''}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    : [];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Mis Pacientes</h1>
          <p className={styles.subtitle}>Gestiona y administra tus pacientes</p>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, CI o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearButton}
                aria-label="Limpiar búsqueda"
              >
                <svg className={styles.clearIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando lista de pacientes...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3>
              {searchQuery
                ? 'No se encontraron pacientes'
                : 'No hay pacientes asignados'}
            </h3>
            <p>
              {searchQuery
                ? 'No hay pacientes que coincidan con tu búsqueda.'
                : 'Comienza agregando nuevos pacientes a tu lista.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredPatients.map((patient) => (
            <Card key={patient.id_paciente} className={styles.patientCard}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {patient.nombre?.charAt(0) || 'P'}
                </div>
                <div className={styles.patientInfo}>
                  <h3 className={styles.patientName}>
                    {patient.nombre} {patient.apellido}
                  </h3>
                  <div className={styles.patientMeta}>
                    <span className={styles.patientCI}>CI: {patient.ci}</span>
                    {patient.email && (
                      <span className={styles.patientEmail}>{patient.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.cardContent}>
                {patient.direccion && (
                  <div className={styles.infoItem}>
                    <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className={styles.infoText}>{patient.direccion}</span>
                  </div>
                )}

                {patient.telefono && (
                  <div className={styles.infoItem}>
                    <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className={styles.infoText}>{patient.telefono}</span>
                  </div>
                )}

                {patient.alergias && (
                  <div className={styles.infoItem}>
                    <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className={styles.infoText}>Alergias: {patient.alergias}</span>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.actions}>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() =>
                      selectPatient({
                        id_paciente: patient.id_paciente,
                        ci: patient.ci,
                        nombre: patient.nombre,
                        apellido: patient.apellido,
                      })
                    }
                    className={styles.actionButton}
                  >
                    <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver detalles
                  </Button>

                  {profile?.tipo_usuario === 'medico' && (
                    <>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => openAsignarGestor(patient.id_paciente)}
                        className={styles.actionButton}
                      >
                        <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Asignar gestor
                      </Button>

                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => openCrearPlanWithPatient(patient.id_paciente)}
                        className={styles.actionButton}
                      >
                        <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Crear plan
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredPatients.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''}
            </span>
            {searchQuery && (
              <span className={styles.statHint}>
                Filtrados por: "{searchQuery}"
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}