/**
 * Dominio de expedientes: reglas de negocio puras.
 *
 * - Ninguna función muta el expediente recibido: siempre devuelven una copia.
 * - Ninguna función toca localStorage ni React.
 * - Todas devuelven Resultado<Expediente> con errores por campo en español.
 * - El parámetro opcional `ahora` permite fijar la fecha (útil para pruebas);
 *   por defecto se usa la fecha actual en formato ISO.
 */
import type {
  Categoria,
  EstadoExpediente,
  EventoHistorial,
  Expediente,
  NuevoExpedienteInput,
  Resultado,
} from '../types/expediente';

export const CATEGORIAS: readonly Categoria[] = ['Civil', 'Familiar', 'Laboral'];

export const MENSAJES = {
  solicitante: 'Ingrese el nombre ficticio o alias de la persona solicitante.',
  asunto: 'Ingrese una descripción breve del asunto.',
  responsable: 'Ingrese el nombre del responsable.',
  categoria: 'Seleccione una categoría válida: Civil, Familiar o Laboral.',
  descripcion: 'Ingrese la descripción de la actividad.',
  motivo: 'Ingrese el motivo de cierre.',
  noEncontrado: 'No se encontró el expediente indicado.',
  guardado: 'No se pudieron guardar los datos en el navegador. Intente de nuevo.',
  actividadEnCerrado: 'El expediente está cerrado y no admite nuevas actividades.',
  cambioEnCerrado: 'El expediente está cerrado y no admite cambios de estado.',
  yaEnSeguimiento: 'El expediente ya está en seguimiento.',
  cerrarDesdeAbierto:
    "No se puede cerrar un expediente Abierto. Primero páselo a 'En seguimiento'.",
  cerrarSinActividad:
    'Para cerrar el expediente debe registrar al menos una actividad.',
} as const;

type Errores = Record<string, string>;

const fechaActual = (): string => new Date().toISOString();

const limpiar = (valor: unknown): string =>
  typeof valor === 'string' ? valor.trim() : '';

const exito = (data: Expediente): Resultado<Expediente> => ({ ok: true, data });

const fallo = (errores: Errores): Resultado<Expediente> => ({ ok: false, errores });

/** Id del evento derivado del expediente: único y determinista (función pura). */
const idEvento = (exp: Expediente): string =>
  `${exp.id}-EV-${String(exp.historial.length + 1).padStart(3, '0')}`;

const conEvento = (
  exp: Expediente,
  evento: Omit<EventoHistorial, 'id'>,
  cambios: Partial<Expediente> = {},
): Expediente => ({
  ...exp,
  ...cambios,
  historial: [...exp.historial, { id: idEvento(exp), ...evento }],
});

export const esCategoria = (valor: unknown): valor is Categoria =>
  typeof valor === 'string' && (CATEGORIAS as readonly string[]).includes(valor);

export const contarActividades = (exp: Expediente): number =>
  exp.historial.filter((evento) => evento.tipo === 'actividad').length;

export const admiteActividades = (exp: Expediente): boolean =>
  exp.estado === 'Abierto' || exp.estado === 'En seguimiento';

export const puedePasarASeguimiento = (exp: Expediente): boolean =>
  exp.estado === 'Abierto';

export const puedeCerrarse = (exp: Expediente): boolean =>
  exp.estado === 'En seguimiento' && contarActividades(exp) > 0;

/** Valida la apertura y devuelve TODOS los errores a la vez. */
export function validarNuevoExpediente(input: NuevoExpedienteInput): Errores {
  const errores: Errores = {};
  if (!limpiar(input.solicitante)) errores.solicitante = MENSAJES.solicitante;
  if (!limpiar(input.asunto)) errores.asunto = MENSAJES.asunto;
  if (!limpiar(input.responsable)) errores.responsable = MENSAJES.responsable;
  if (input.categoria !== undefined && !esCategoria(input.categoria)) {
    errores.categoria = MENSAJES.categoria;
  }
  return errores;
}

/** Crea un expediente en estado Abierto con su evento de apertura. */
export function crearExpediente(
  input: NuevoExpedienteInput,
  siguienteId: string,
  ahora: string = fechaActual(),
): Resultado<Expediente> {
  const errores = validarNuevoExpediente(input);
  if (Object.keys(errores).length > 0) return fallo(errores);

  const base: Expediente = {
    id: siguienteId,
    solicitante: limpiar(input.solicitante),
    asunto: limpiar(input.asunto),
    responsable: limpiar(input.responsable),
    ...(input.categoria ? { categoria: input.categoria } : {}),
    estado: 'Abierto',
    fechaApertura: ahora,
    historial: [],
  };

  return exito(
    conEvento(base, {
      tipo: 'apertura',
      fecha: ahora,
      descripcion: 'Apertura del expediente.',
      estadoNuevo: 'Abierto',
    }),
  );
}

/** Registra una actividad. Solo en Abierto o En seguimiento. */
export function agregarActividad(
  exp: Expediente,
  descripcion: string,
  tipo?: string,
  ahora: string = fechaActual(),
): Resultado<Expediente> {
  if (!admiteActividades(exp)) return fallo({ estado: MENSAJES.actividadEnCerrado });

  const texto = limpiar(descripcion);
  if (!texto) return fallo({ descripcion: MENSAJES.descripcion });

  const tipoActividad = limpiar(tipo);
  return exito(
    conEvento(exp, {
      tipo: 'actividad',
      fecha: ahora,
      descripcion: texto,
      ...(tipoActividad ? { tipoActividad } : {}),
    }),
  );
}

const cambioDeEstado = (
  exp: Expediente,
  estadoNuevo: EstadoExpediente,
  ahora: string,
  motivo?: string,
): Expediente =>
  conEvento(
    exp,
    {
      tipo: 'cambio_estado',
      fecha: ahora,
      descripcion: `Cambio de estado: ${exp.estado} → ${estadoNuevo}.`,
      estadoAnterior: exp.estado,
      estadoNuevo,
      ...(motivo ? { motivo } : {}),
    },
    {
      estado: estadoNuevo,
      ...(estadoNuevo === 'Cerrado' ? { fechaCierre: ahora, motivoCierre: motivo } : {}),
    },
  );

/** Abierto → En seguimiento, por acción explícita del usuario. */
export function pasarASeguimiento(
  exp: Expediente,
  ahora: string = fechaActual(),
): Resultado<Expediente> {
  if (exp.estado === 'Cerrado') return fallo({ estado: MENSAJES.cambioEnCerrado });
  if (exp.estado === 'En seguimiento') return fallo({ estado: MENSAJES.yaEnSeguimiento });
  return exito(cambioDeEstado(exp, 'En seguimiento', ahora));
}

/** En seguimiento → Cerrado, con ≥1 actividad y motivo no vacío. Nunca desde Abierto. */
export function cerrarExpediente(
  exp: Expediente,
  motivo: string,
  ahora: string = fechaActual(),
): Resultado<Expediente> {
  if (exp.estado === 'Cerrado') return fallo({ estado: MENSAJES.cambioEnCerrado });
  if (exp.estado === 'Abierto') return fallo({ estado: MENSAJES.cerrarDesdeAbierto });

  const errores: Errores = {};
  if (contarActividades(exp) === 0) errores.estado = MENSAJES.cerrarSinActividad;
  const motivoLimpio = limpiar(motivo);
  if (!motivoLimpio) errores.motivo = MENSAJES.motivo;
  if (Object.keys(errores).length > 0) return fallo(errores);

  return exito(cambioDeEstado(exp, 'Cerrado', ahora, motivoLimpio));
}
