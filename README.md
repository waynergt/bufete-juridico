# 1. Análisis y organización del proyecto

## 1.1. Problema, usuario y prioridades

### Problema

El Bufete Popular necesita una herramienta que permita organizar y dar seguimiento a los expedientes de personas solicitantes de asesoría y asistencia jurídica gratuita. Actualmente, el reto consiste en disponer de un mecanismo sencillo para registrar expedientes, consultar su estado, documentar actividades y conservar un historial cronológico de los cambios realizados.

### Usuario objetivo

Personal responsable de gestionar los expedientes del Bufete Popular, encargado de registrar solicitudes, consultar información, documentar actividades y actualizar los estados de los expedientes.

Los datos utilizados durante la competencia serán ficticios y exclusivamente demostrativos.

### Prioridades (MoSCoW)

| Prioridad | Requerimientos |
|---|---|
| **Must Have** | Apertura de expedientes con validación de campos obligatorios, generación automática de identificador, fecha y estado inicial. Consulta, búsqueda por identificador o solicitante, registro de actividades, historial cronológico, transiciones de estado, cierre validado y persistencia mediante localStorage. |
| **Should Have** | Interfaz clara, mensajes de confirmación y error comprensibles, filtro de expedientes por estado y presentación organizada del historial. |
| **Could Have** | Selección de categoría opcional (Civil, Familiar o Laboral) y tipo de actividad opcional. |
| **Won't Have** | Backend, autenticación, base de datos externa, asesoría jurídica, archivos adjuntos, notificaciones, reportes externos y funcionalidades para editar o eliminar expedientes. |

## 1.2. Datos principales, reglas de negocio y supuestos

### Datos principales

La aplicación utilizará las siguientes entidades y estructuras:

- **Expediente:** identificador único (`EXP-0001`), solicitante, asunto, responsable, categoría opcional, estado, fecha de apertura, fecha de cierre, motivo de cierre e historial.
- **EventoHistorial:** identificador, tipo de evento, fecha en formato ISO, descripción, tipo de actividad opcional, estado anterior, estado nuevo y motivo opcional.
- **EstadoExpediente:** Abierto, En seguimiento o Cerrado.
- **Categoria:** Civil, Familiar o Laboral.
- **TipoEvento:** apertura, actividad o cambio_estado.
- **NuevoExpedienteInput:** solicitante, asunto, responsable y categoría opcional.

### Reglas de negocio

| ID | Regla |
|---|---|
| R1 | Los campos solicitante, asunto y responsable son obligatorios y no pueden contener únicamente espacios en blanco. |
| R2 | Cada expediente tendrá un identificador único, secuencial y persistente, con formato `EXP-0001`. |
| R3 | Todo expediente nuevo inicia con estado Abierto y registra automáticamente su fecha y hora de apertura. |
| R4 | La categoría del expediente es opcional y admite Civil, Familiar o Laboral. |
| R5 | Un expediente Abierto únicamente puede pasar a En seguimiento mediante una acción explícita del usuario. |
| R6 | Un expediente solamente puede pasar de En seguimiento a Cerrado cuando tiene al menos una actividad registrada y se proporciona un motivo de cierre no vacío ni compuesto únicamente por espacios. |
| R7 | No se permite pasar directamente de Abierto a Cerrado. |
| R8 | Las actividades requieren una descripción obligatoria y una fecha y hora automáticas. El tipo de actividad es opcional. |
| R9 | Solamente se pueden registrar actividades en expedientes Abiertos o En seguimiento. |
| R10 | Los expedientes Cerrados no permiten nuevas actividades ni cambios de estado. |
| R11 | La apertura y cada cambio de estado deben generar un evento en el historial. Cada actividad también debe conservarse como un evento independiente. |
| R12 | El historial debe presentar los acontecimientos en orden cronológico y distinguir entre apertura, actividades y cambios de estado. |
| R13 | Al cerrar un expediente se conservarán la fecha, hora y motivo de cierre. |
| R14 | Los expedientes y sus historiales deben conservarse al recargar o volver a abrir la aplicación mediante localStorage. |
| R15 | Los expedientes Cerrados permanecen disponibles para consulta. |

### Supuestos

- Los nombres de solicitantes y responsables serán ficticios o alias; no se almacenará información personal real.
- Cada expediente representa un registro independiente dentro del almacenamiento local del navegador.
- El identificador secuencial se generará considerando los expedientes previamente almacenados para evitar duplicaciones después de recargar.
- Las fechas y horas se generarán automáticamente desde el entorno del navegador y se conservarán en formato ISO.
- El almacenamiento se limita al navegador y dispositivo donde se utiliza la aplicación; no existe sincronización entre dispositivos.
- La aplicación es un prototipo académico y no sustituye procedimientos oficiales ni proporciona asesoría jurídica.

## 1.3. Responsabilidades del equipo

| Integrante | Responsabilidad | Entregables principales |
|---|---|---|
| **1. Tech Lead / Integración** | Definir y mantener el contrato técnico, coordinar el desarrollo y resolver conflictos de integración. | `src/types/expediente.ts`, `src/App.tsx`, revisión de contratos y merges. |
| **2. Dominio y persistencia** | Implementar las reglas de negocio, operaciones de expedientes y almacenamiento local. | Dominio, Repository sobre localStorage y `src/hooks/useExpedientes.ts`. |
| **3. UI de apertura y listado** | Desarrollar los formularios de apertura, listado y búsqueda de expedientes. | `src/features/apertura/FormularioApertura.tsx` y `src/features/listado/ListadoExpedientes.tsx`. |
| **4. UI de detalle, historial y estados** | Implementar la visualización del expediente, registro de actividades, historial y acciones de cambio de estado. | `src/features/detalle/DetalleExpediente.tsx`. |
| **5. QA, README y demostración** | Verificar los recorridos funcionales, documentar resultados, registrar decisiones de IA y preparar la demostración. | Pruebas manuales, comprobaciones del README y datos ficticios para la demo. |

### Estrategia de integración con Git

Se utilizará una estrategia de ramas independientes para facilitar el trabajo simultáneo y reducir conflictos.

- Cada integrante desarrollará su aporte en una rama `feat/*`.
- La rama `main` conservará la versión integrada y funcional del proyecto.
- El Tech Lead revisará los cambios y verificará que respeten las interfaces, nombres, rutas y firmas acordadas.
- Se realizarán dos hitos principales de integración:
  - **Minuto 50:** primer merge a `main` para integrar los módulos principales y comprobar su compatibilidad.
  - **Minuto 70:** segundo merge a `main` para incorporar correcciones, completar funcionalidades y resolver conflictos.
- El tiempo restante se reservará para pruebas integrales, correcciones finales, actualización del README y commit de entrega.

## 1.4. Arquitectura propuesta

Se utilizará una arquitectura por capas para separar la interfaz, la lógica de aplicación, las reglas de negocio y la persistencia.

```mermaid
flowchart TD
    A["UI - React"]
    A1["Formulario de apertura"]
    A2["Listado y búsqueda"]
    A3["Detalle e historial"]

    B["Hook: useExpedientes"]
    C["Domain: reglas de negocio puras"]
    D["Storage: Repository"]
    E[("localStorage")]

    A --> A1
    A --> A2
    A --> A3
    A1 --> B
    A2 --> B
    A3 --> B
    B --> C
    C --> D
    D --> E
    E --> D
    D --> C
    C --> B
    B --> A
```

**Descripción de las capas:**

1. **UI (features):** contiene los componentes visuales de apertura, listado y detalle. Recibe propiedades y comunica las acciones del usuario.
2. **Hook (useExpedientes):** centraliza las operaciones de expedientes, administra el estado de la aplicación y conecta la interfaz con el dominio.
3. **Domain:** contiene las reglas de negocio y validaciones independientes de la interfaz y del almacenamiento.
4. **Storage (Repository):** administra la lectura y escritura de expedientes e historiales en localStorage, conservando la información entre recargas.

La arquitectura mantiene separadas las responsabilidades y permite integrar los aportes de los cinco integrantes respetando el contrato compartido.# 
