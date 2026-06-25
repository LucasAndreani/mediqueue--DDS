# 2. Modelo de datos

## Diagrama Entidad-Relacion



```mermaid
erDiagram
    PROFESIONALES ||--o{ TURNOS : atiende
    PACIENTES ||--o{ TURNOS : reserva
    PROFESIONALES ||--o{ LISTA_ESPERA : tiene
    PACIENTES ||--o{ LISTA_ESPERA : espera

    PROFESIONALES {
        string id PK
        string nombre
        string especialidad
        int duracion_turno_min
    }
    PACIENTES {
        string id PK
        string nombre
        string email
        string telefono
    }
    TURNOS {
        string id PK
        string paciente_id FK
        string profesional_id FK
        string fecha_hora
        string estado
        string creado_en
    }
    LISTA_ESPERA {
        string id PK
        string paciente_id FK
        string profesional_id FK
        string fecha_hora
        string creado_en
    }
```



## Script DDL

El detalle completo esta en src/db/schema.sql. A nivel de reglas implementadas en la base de
datos, el estado de un turno queda restringido a reservado, cancelado o completado mediante un
CHECK constraint. Tambien existe una restriccion UNIQUE sobre profesional, fecha_hora y estado,
que evita que un mismo profesional tenga dos turnos reservados al mismo tiempo, reforzando a
nivel de base de datos la misma regla que ya se valida en TurnoService. Las claves foraneas usan
ON DELETE RESTRICT en turnos y ON DELETE CASCADE en lista de espera.

## Datos de prueba (seed)

Se ejecuta con npm run seed. Esto inserta dos profesionales, tres pacientes y un turno ya
reservado, pensado para poder probar manualmente el caso de "sin disponibilidad" descripto en el
diagrama de secuencia del Primer Parcial. El script completo esta en src/db/seed.js.