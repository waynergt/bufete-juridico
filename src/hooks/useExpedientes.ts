
import { useState } from 'react';

import type {
  Expediente,
  NuevoExpedienteInput,
  Resultado,
  EstadoExpediente,
} from '../types/expediente';

export function useExpedientes() {
  // Almacenamiento temporal en memoria.
  // Será sustituido por la implementación definitiva con localStorage.
  const [expedientes] = useState<Expediente[]>([]);

  const crear = (
    _input: NuevoExpedienteInput
  ): Resultado<Expediente> => {
    return {
      ok: false,
      errores: {
        general: 'Funcionalidad pendiente de implementación.',
      },
    };
  };

  const agregarActividad = (
    _id: string,
    _descripcion: string,
    _tipoActividad?: string
  ): Resultado<Expediente> => {
    return {
      ok: false,
      errores: {
        general: 'Funcionalidad pendiente de implementación.',
      },
    };
  };

  const pasarASeguimiento = (
    _id: string
  ): Resultado<Expediente> => {
    return {
      ok: false,
      errores: {
        general: 'Funcionalidad pendiente de implementación.',
      },
    };
  };

  const cerrar = (
    _id: string,
    _motivo: string
  ): Resultado<Expediente> => {
    return {
      ok: false,
      errores: {
        general: 'Funcionalidad pendiente de implementación.',
      },
    };
  };

  const buscar = (
    texto: string,
    estado?: EstadoExpediente
  ): Expediente[] => {
    const termino = texto.trim().toLowerCase();

    return expedientes.filter((expediente) => {
      const coincideTexto =
        expediente.id.toLowerCase().includes(termino) ||
        expediente.solicitante.toLowerCase().includes(termino);

      const coincideEstado =
        !estado || expediente.estado === estado;

      return coincideTexto && coincideEstado;
    });
  };

  return {
    expedientes,
    crear,
    agregarActividad,
    pasarASeguimiento,
    cerrar,
    buscar,
  };
}
