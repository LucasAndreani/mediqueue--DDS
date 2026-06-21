-- MediQueue - Modulo de Turnos (Booking Module)
-- Esquema de base de datos (SQLite)

PRAGMA foreign_keys = ON;

-- Entidad: Profesional médico
CREATE TABLE IF NOT EXISTS profesionales (
  id            TEXT PRIMARY KEY,
  nombre        TEXT NOT NULL,
  especialidad  TEXT NOT NULL,
  duracion_turno_min INTEGER NOT NULL DEFAULT 30
);

-- Entidad: Paciente
CREATE TABLE IF NOT EXISTS pacientes (
  id      TEXT PRIMARY KEY,
  nombre  TEXT NOT NULL,
  email   TEXT NOT NULL UNIQUE,
  telefono TEXT
);

-- Entidad: Turno (relaciona Paciente <-> Profesional)
-- estado: 'reservado' | 'cancelado' | 'completado'
CREATE TABLE IF NOT EXISTS turnos (
  id              TEXT PRIMARY KEY,
  paciente_id     TEXT NOT NULL,
  profesional_id  TEXT NOT NULL,
  fecha_hora      TEXT NOT NULL,         -- ISO 8601
  estado          TEXT NOT NULL DEFAULT 'reservado'
                    CHECK (estado IN ('reservado','cancelado','completado')),
  creado_en       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (paciente_id)    REFERENCES pacientes(id)    ON DELETE RESTRICT,
  FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE RESTRICT,
  -- Regla: un profesional no puede tener dos turnos "reservado" en el mismo horario
  UNIQUE (profesional_id, fecha_hora, estado)
);

-- Entidad: Lista de espera (relaciona Paciente <-> Profesional + horario deseado)
CREATE TABLE IF NOT EXISTS lista_espera (
  id              TEXT PRIMARY KEY,
  paciente_id     TEXT NOT NULL,
  profesional_id  TEXT NOT NULL,
  fecha_hora      TEXT NOT NULL,
  creado_en       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (paciente_id)    REFERENCES pacientes(id)     ON DELETE CASCADE,
  FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_turnos_prof_fecha ON turnos(profesional_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_espera_prof_fecha ON lista_espera(profesional_id, fecha_hora);
