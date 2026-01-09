import React, { useEffect, useCallback, useMemo, useState } from "react"
import { useAuthContext } from "../../../../context/AuthContext"
import { useModal } from "../../../../hooks/useModal"
import { usePatients } from "../../../../hooks/usePatients"
import Button from "../../../ui/Button/Button"
import Card from "../../../ui/Card/Card"
import styles from "./Pacientes.module.css"

export default function Pacientes({ onSelectPatient }) {
  const { profile } = useAuthContext()
  const { openModal, openAsignarGestor, openCrearPlanWithPatient, openRegistroWithPatient } = useModal()
  const { patients, loading, error, fetchPatients } = usePatients()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)

  const isPaciente = useMemo(() => profile?.tipo_usuario === "paciente", [profile])
  const isMedico = useMemo(() => profile?.tipo_usuario === "medico", [profile])
  const isGestor = useMemo(() => 
    profile?.tipo_usuario === "gestor_casos" || 
    (typeof profile?.tipo_usuario === "string" && profile.tipo_usuario.includes("gestor")),
    [profile]
  )

  const buildParams = useCallback(() => {
    const params = {}
    const idUsuario = profile?.id_usuario

    if (isMedico && idUsuario) {
      params.medico_id = idUsuario
    } else if (isGestor && idUsuario) {
      params.gestor_id = idUsuario
    }

    return params
  }, [profile, isMedico, isGestor])

  useEffect(() => {
    if (isPaciente) return

    const controller = new AbortController()
    const params = buildParams()

    fetchPatients(params, { signal: controller.signal }).catch((err) => {
      if (err?.name !== "AbortError") {
        console.error("Error fetchPatients:", err)
      }
    })

    return () => controller.abort()
  }, [fetchPatients, buildParams, isPaciente])

  const handleSelectPatient = useCallback((patient, action = null) => {
    console.log("👤 Pacientes - Seleccionando paciente:", {
      id: patient.id_paciente,
      nombre: patient.nombre,
      action
    })

    const patientData = {
      id_paciente: patient.id_paciente || patient.id,
      ci: patient.ci,
      nombre: patient.nombre,
      apellido: patient.apellido,
      email: patient.email
    }

    setSelectedPatient(patientData)

    if (onSelectPatient) {
      onSelectPatient(patientData)
    }

    switch (action) {
      case "registro":
        openRegistroWithPatient(Number(patient.id_paciente || patient.id))
        break
      case "crearPlan":
        openCrearPlanWithPatient(patient.id_paciente || patient.id)
        break
      case "asignarGestor":
        openAsignarGestor(patient.id_paciente || patient.id)
        break
      default:
        break
    }
  }, [onSelectPatient, openRegistroWithPatient, openCrearPlanWithPatient, openAsignarGestor])

  const filteredPatients = useMemo(() => {
    if (!Array.isArray(patients)) return []
    const query = searchQuery.trim().toLowerCase()
    if (!query) return patients

    return patients.filter((p) => {
      if (!p) return false
      
      const searchString = `
        ${p.nombre || ""} 
        ${p.apellido || ""} 
        ${p.ci || ""} 
        ${p.email || ""}
      `.toLowerCase()
      
      return searchString.includes(query)
    })
  }, [patients, searchQuery])

  const getInitials = (nombre, apellido) => {
    const first = nombre?.charAt(0) || ""
    const last = apellido?.charAt(0) || ""
    return `${first}${last}`.toUpperCase()
  }

  const getStatusBadge = (estado) => {
    const isActive = estado === true || estado === "activo" || estado === 1
    
    return (
      <span 
        className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}
        title={isActive ? "Paciente activo" : "Paciente inactivo"}
      >
        {isActive ? "Activo" : "Inactivo"}
      </span>
    )
  }

  if (isPaciente) {
    return (
      <section className={styles.container}>
        <div className={styles.accessDenied}>
          <div className={styles.accessDeniedIcon}>🚫</div>
          <h2 className={styles.accessDeniedTitle}>Acceso restringido</h2>
          <p className={styles.accessDeniedText}>
            Los pacientes no pueden acceder a la lista de otros pacientes.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>👥</span>
              {isMedico ? "Mis Pacientes" : "Pacientes Asignados"}
            </h1>
            <p className={styles.subtitle}>
              {isMedico 
                ? "Gestiona y administra tus pacientes" 
                : "Pacientes bajo tu gestión"}
            </p>
          </div>

          <div className={styles.headerActions}>
            {/* Barra de Búsqueda */}
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, CI o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={styles.clearButton}
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className={styles.actionButtons}>
              {isMedico && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => openModal("nuevoPaciente")}
                    className={styles.actionButton}
                    disabled={loading}
                  >
                    <span className={styles.buttonIcon}>➕</span>
                    Nuevo Paciente
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => {
                      if (selectedPatient?.id_paciente) {
                        openCrearPlanWithPatient(selectedPatient.id_paciente)
                      } else {
                        openModal("crearPlan")
                      }
                    }}
                    className={styles.actionButton}
                    disabled={loading || (!selectedPatient && filteredPatients.length > 0)}
                    title={selectedPatient ? 
                      `Crear plan para ${selectedPatient.nombre}` : 
                      "Selecciona un paciente primero"
                    }
                  >
                    <span className={styles.buttonIcon}>📋</span>
                    Crear Plan
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {!loading && !error && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>👥</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{filteredPatients.length}</span>
                <span className={styles.statLabel}>pacientes</span>
              </div>
            </div>
            
            {selectedPatient && (
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🎯</span>
                <div className={styles.statContent}>
                  <span className={styles.statValue} title={selectedPatient.nombre}>
                    {selectedPatient.nombre?.split(" ")[0] || "Seleccionado"}
                  </span>
                  <span className={styles.statLabel}>seleccionado</span>
                </div>
              </div>
            )}
            
            {searchQuery && (
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🔍</span>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>"{searchQuery}"</span>
                  <span className={styles.statLabel}>búsqueda</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Cargando lista de pacientes...</p>
          </div>
        ) : error ? (
          <Card className={styles.errorCard}>
            <div className={styles.errorContent}>
              <span className={styles.errorIcon}>⚠️</span>
              <h3 className={styles.errorTitle}>Error al cargar</h3>
              <p className={styles.errorMessage}>{String(error)}</p>
              <Button
                variant="secondary"
                onClick={() => fetchPatients(buildParams())}
                className={styles.retryButton}
              >
                Reintentar
              </Button>
            </div>
          </Card>
        ) : filteredPatients.length === 0 ? (
          <Card className={styles.emptyCard}>
            <div className={styles.emptyContent}>
              <span className={styles.emptyIcon}>
                {searchQuery ? "🔍" : "👥"}
              </span>
              <h3 className={styles.emptyTitle}>
                {searchQuery ? "No se encontraron pacientes" : "No hay pacientes asignados"}
              </h3>
              <p className={styles.emptyDescription}>
                {searchQuery
                  ? "No hay pacientes que coincidan con tu búsqueda."
                  : isMedico
                  ? "Comienza agregando nuevos pacientes a tu lista."
                  : "Aún no tienes pacientes asignados."}
              </p>
              {isMedico && !searchQuery && (
                <Button
                  variant="primary"
                  onClick={() => openModal("nuevoPaciente")}
                  className={styles.emptyAction}
                >
                  Agregar Primer Paciente
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className={styles.patientsGrid}>
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id_paciente || patient.id}
                className={`${styles.patientCard} ${
                  selectedPatient?.id_paciente === patient.id_paciente ? styles.selected : ""
                }`}
                onClick={() => handleSelectPatient(patient)}
              >
                {/* Encabezado del Paciente */}
                <div className={styles.cardHeader}>
                  <div className={styles.patientAvatar}>
                    <div className={styles.avatarCircle}>
                      {getInitials(patient.nombre, patient.apellido)}
                    </div>
                    {getStatusBadge(patient.estado)}
                  </div>
                  
                  <div className={styles.patientInfo}>
                    <h3 className={styles.patientName}>
                      {patient.nombre || "Sin nombre"} {patient.apellido || ""}
                    </h3>
                    <div className={styles.patientMeta}>
                      <span className={styles.patientCI}>
                        <span className={styles.metaIcon}>🆔</span>
                        CI: {patient.ci || "No especificado"}
                      </span>
                      {patient.email && (
                        <span className={styles.patientEmail}>
                          <span className={styles.metaIcon}>📧</span>
                          {patient.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del Paciente */}
                <div className={styles.cardBody}>
                  <div className={styles.infoGrid}>
                    {patient.telefono && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoIcon}>📞</span>
                        <span className={styles.infoLabel}>Teléfono:</span>
                        <span className={styles.infoValue}>{patient.telefono}</span>
                      </div>
                    )}
                    
                    {patient.direccion && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoIcon}>📍</span>
                        <span className={styles.infoLabel}>Dirección:</span>
                        <span className={styles.infoValue} title={patient.direccion}>
                          {patient.direccion.length > 30 
                            ? `${patient.direccion.slice(0, 30)}...` 
                            : patient.direccion}
                        </span>
                      </div>
                    )}
                    
                    {patient.alergias && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoIcon}>⚠️</span>
                        <span className={styles.infoLabel}>Alergias:</span>
                        <span className={styles.infoValue}>{patient.alergias}</span>
                      </div>
                    )}
                    
                    {patient.condiciones_cronicas && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoIcon}>❤️</span>
                        <span className={styles.infoLabel}>Condiciones:</span>
                        <span className={styles.infoValue}>{patient.condiciones_cronicas}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerActions}>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectPatient(patient)
                      }}
                      className={styles.actionButton}
                    >
                      <span className={styles.buttonIcon}>👁️</span>
                      Ver detalles
                    </Button>

                    {isMedico && (
                      <>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectPatient(patient, "asignarGestor")
                          }}
                          className={styles.actionButton}
                        >
                          <span className={styles.buttonIcon}>👨‍⚕️</span>
                          Asignar gestor
                        </Button>

                        <Button
                          variant="secondary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectPatient(patient, "crearPlan")
                          }}
                          className={styles.actionButton}
                        >
                          <span className={styles.buttonIcon}>📋</span>
                          Crear plan
                        </Button>

                        <Button
                          variant="secondary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectPatient(patient, "registro")
                          }}
                          className={styles.actionButton}
                        >
                          <span className={styles.buttonIcon}>📝</span>
                          Nuevo Registro
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}