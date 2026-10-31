/**
 * Repository de expedientes sobre localStorage.
 *
 * Se guarda UN solo objeto JSON bajo una clave, con el contador y los datos
 * juntos, para que nunca se desincronicen:
 *   { version: 1, ultimoNumero: number, expedientes: Expediente[] }
 *
 * - siguienteId() usa max(contador guardado, mayor número de los ids) + 1,
 *   así el id no se repite al recargar aunque los datos se hayan manipulado.
 * - JSON vacío o corrupto: se respalda el texto original en `<clave>-corrupto`
 *   y se arranca con una lista vacía, sin romper la app.
 * - Si localStorage no está disponible, cargar devuelve [] y guardar devuelve false.
 */
import type { Expediente, EventoHistorial } from '../types/expediente';

export interface ExpedienteRepository {
  cargarTodos(): Expediente[];
  guardarTodos(expedientes: Expediente[]): boolean;
  siguienteId(): string;
}

interface DatosGuardados {
  version: 1;
  ultimoNumero: number;
  expedientes: Expediente[];
}

export const CLAVE_STORAGE = 'bufete-expedientes-v1';

const PATRON_ID = /^EXP-(\d+)$/;
const ESTADOS = ['Abierto', 'En seguimiento', 'Cerrado'];
const TIPOS_EVENTO = ['apertura', 'actividad', 'cambio_estado'];

export const formatearId = (numero: number): string =>
  `EXP-${String(numero).padStart(4, '0')}`;

export const numeroDeId = (id: string): number => {
  const coincidencia = PATRON_ID.exec(id);
  return coincidencia ? Number(coincidencia[1]) : 0;
};

const mayorNumero = (expedientes: Expediente[]): number =>
  expedientes.reduce((max, exp) => Math.max(max, numeroDeId(exp.id)), 0);

const esTexto = (valor: unknown): valor is string => typeof valor === 'string';

const esEvento = (valor: unknown): valor is EventoHistorial => {
  if (typeof valor !== 'object' || valor === null) return false;
  const e = valor as Record<string, unknown>;
  return (
    esTexto(e.id) && esTexto(e.fecha) && esTexto(e.descripcion) &&
    esTexto(e.tipo) && TIPOS_EVENTO.includes(e.tipo)
  );
};

const esExpediente = (valor: unknown): valor is Expediente => {
  if (typeof valor !== 'object' || valor === null) return false;
  const e = valor as Record<string, unknown>;
  return (
    esTexto(e.id) && PATRON_ID.test(e.id) &&
    esTexto(e.solicitante) && esTexto(e.asunto) && esTexto(e.responsable) &&
    esTexto(e.estado) && ESTADOS.includes(e.estado) &&
    esTexto(e.fechaApertura) &&
    Array.isArray(e.historial) && e.historial.every(esEvento)
  );
};

export function crearRepositorioLocalStorage(
  obtenerStorage: () => Storage = () => window.localStorage,
  clave: string = CLAVE_STORAGE,
): ExpedienteRepository {
  const storage = (): Storage | null => {
    try {
      return obtenerStorage();
    } catch {
      return null;
    }
  };

  const respaldarCorrupto = (crudo: string): void => {
    try {
      storage()?.setItem(`${clave}-corrupto`, crudo);
      console.warn(`[expedienteRepository] Datos corruptos respaldados en "${clave}-corrupto".`);
    } catch {
      /* sin espacio para el respaldo: se ignora */
    }
  };

  const leer = (): DatosGuardados => {
    const vacio: DatosGuardados = { version: 1, ultimoNumero: 0, expedientes: [] };
    let crudo: string | null = null;
    try {
      crudo = storage()?.getItem(clave) ?? null;
    } catch {
      return vacio;
    }
    if (crudo === null || crudo.trim() === '') return vacio;

    let datos: unknown;
    try {
      datos = JSON.parse(crudo);
    } catch {
      respaldarCorrupto(crudo);
      return vacio;
    }

    // Se acepta también un arreglo plano por compatibilidad.
    const lista: unknown = Array.isArray(datos)
      ? datos
      : (datos as { expedientes?: unknown } | null)?.expedientes;
    if (!Array.isArray(lista)) {
      respaldarCorrupto(crudo);
      return vacio;
    }

    const expedientes = lista.filter(esExpediente);
    if (expedientes.length !== lista.length) respaldarCorrupto(crudo);

    // Si hubiera ids repetidos por manipulación manual, se conserva el primero.
    const vistos = new Set<string>();
    const unicos = expedientes.filter((exp) =>
      vistos.has(exp.id) ? false : (vistos.add(exp.id), true),
    );

    const contador = Number((datos as { ultimoNumero?: unknown }).ultimoNumero);
    return {
      version: 1,
      ultimoNumero: Math.max(Number.isFinite(contador) ? contador : 0, mayorNumero(unicos)),
      expedientes: unicos,
    };
  };

  return {
    cargarTodos() {
      return leer().expedientes;
    },

    guardarTodos(expedientes) {
      const s = storage();
      if (!s) return false;
      const datos: DatosGuardados = {
        version: 1,
        ultimoNumero: Math.max(leer().ultimoNumero, mayorNumero(expedientes)),
        expedientes,
      };
      try {
        s.setItem(clave, JSON.stringify(datos));
        return true;
      } catch {
        return false;
      }
    },

    siguienteId() {
      return formatearId(leer().ultimoNumero + 1);
    },
  };
}

/** Instancia por defecto usada por la aplicación. */
export const expedienteRepository: ExpedienteRepository = crearRepositorioLocalStorage();
