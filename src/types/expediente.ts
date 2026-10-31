
export type EstadoExpediente = 'Abierto' | 'En seguimiento' | 'Cerrado';

export type Categoria = 'Civil' | 'Familiar' | 'Laboral';

export type TipoEvento = 'apertura' | 'actividad' | 'cambio_estado';

export interface EventoHistorial {
  id: string;
  tipo: TipoEvento;
  fecha: string; // ISO
  descripcion: string;
  tipoActividad?: string;
  estadoAnterior?: EstadoExpediente;
  estadoNuevo?: EstadoExpediente;
  motivo?: string;
}

export interface Expediente {
  id: string; // formato EXP-0001, secuencial y único aunque se recargue
  solicitante: string;
  asunto: string;
  responsable: string;
  categoria?: Categoria;
  estado: EstadoExpediente;
  fechaApertura: string;
  fechaCierre?: string;
  motivoCierre?: string;
  historial: EventoHistorial[];
}

export interface NuevoExpedienteInput {
  solicitante: string;
  asunto: string;
  responsable: string;
  categoria?: Categoria;
}

export type Resultado<T> =
  | { ok: true; data: T }
  | { ok: false; errores: Record<string, string> };
