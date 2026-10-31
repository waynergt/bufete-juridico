import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  EstadoExpediente,
  Expediente,
  NuevoExpedienteInput,
  Resultado,
} from '../types/expediente';
import * as dominio from '../domain/expedientes';
import {
  CLAVE_STORAGE,
  expedienteRepository,
  formatearId,
  numeroDeId,
} from '../storage/expedienteRepository';

export interface UseExpedientes {
  expedientes: Expediente[];
  crear(input: NuevoExpedienteInput): Resultado<Expediente>;
  agregarActividad(id: string, descripcion: string, tipoActividad?: string): Resultado<Expediente>;
  pasarASeguimiento(id: string): Resultado<Expediente>;
  cerrar(id: string, motivo: string): Resultado<Expediente>;
  /** Parte 2: Cerrado → En seguimiento con motivo obligatorio. */
  reabrir(id: string, motivo: string): Resultado<Expediente>;
  buscar(texto: string, estado?: EstadoExpediente): Expediente[];
}

/** Minúsculas, sin acentos ni espacios extremos: "José " → "jose". */
export const normalizar = (texto: string): string =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const repo = expedienteRepository;

export function useExpedientes(): UseExpedientes {
  const [expedientes, setExpedientes] = useState<Expediente[]>(() => repo.cargarTodos());

  // Copia síncrona del estado: permite devolver el Resultado al instante
  // aunque se hagan varias operaciones seguidas antes del re-render.
  const actual = useRef(expedientes);

  const confirmar = useCallback((lista: Expediente[]): boolean => {
    if (!repo.guardarTodos(lista)) return false;
    actual.current = lista;
    setExpedientes(lista);
    return true;
  }, []);

  // Si otra pestaña modifica o borra los datos (key null = localStorage.clear()),
  // se recargan aquí para no mostrar información desactualizada.
  useEffect(() => {
    const alCambiar = (evento: StorageEvent) => {
      if (evento.key !== null && evento.key !== CLAVE_STORAGE) return;
      const lista = repo.cargarTodos();
      actual.current = lista;
      setExpedientes(lista);
    };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  /** Busca el expediente, aplica la regla de dominio y persiste si fue válida. */
  const aplicar = useCallback(
    (id: string, operacion: (exp: Expediente) => Resultado<Expediente>): Resultado<Expediente> => {
      const existente = actual.current.find((exp) => exp.id === id);
      if (!existente) return { ok: false, errores: { id: dominio.MENSAJES.noEncontrado } };

      const resultado = operacion(existente);
      if (!resultado.ok) return resultado;

      const lista = actual.current.map((exp) => (exp.id === id ? resultado.data : exp));
      return confirmar(lista)
        ? resultado
        : { ok: false, errores: { general: dominio.MENSAJES.guardado } };
    },
    [confirmar],
  );

  const crear = useCallback(
    (input: NuevoExpedienteInput): Resultado<Expediente> => {
      // Respaldo en memoria por si localStorage no estuviera disponible.
      const enMemoria = actual.current.reduce((max, exp) => Math.max(max, numeroDeId(exp.id)), 0);
      const id = formatearId(Math.max(numeroDeId(repo.siguienteId()), enMemoria + 1));

      const resultado = dominio.crearExpediente(input, id);
      if (!resultado.ok) return resultado;

      return confirmar([...actual.current, resultado.data])
        ? resultado
        : { ok: false, errores: { general: dominio.MENSAJES.guardado } };
    },
    [confirmar],
  );

  const agregarActividad = useCallback(
    (id: string, descripcion: string, tipoActividad?: string) =>
      aplicar(id, (exp) => dominio.agregarActividad(exp, descripcion, tipoActividad)),
    [aplicar],
  );

  const pasarASeguimiento = useCallback(
    (id: string) => aplicar(id, (exp) => dominio.pasarASeguimiento(exp)),
    [aplicar],
  );

  const cerrar = useCallback(
    (id: string, motivo: string) => aplicar(id, (exp) => dominio.cerrarExpediente(exp, motivo)),
    [aplicar],
  );

  const reabrir = useCallback(
    (id: string, motivo: string) => aplicar(id, (exp) => dominio.reabrirExpediente(exp, motivo)),
    [aplicar],
  );

  /** Filtra por id o solicitante (sin mayúsculas ni acentos) y estado opcional. */
  const buscar = useCallback(
    (texto: string, estado?: EstadoExpediente): Expediente[] => {
      const termino = normalizar(texto ?? '');
      return expedientes.filter(
        (exp) =>
          (!estado || exp.estado === estado) &&
          (!termino ||
            normalizar(exp.id).includes(termino) ||
            normalizar(exp.solicitante).includes(termino)),
      );
    },
    [expedientes],
  );

  return { expedientes, crear, agregarActividad, pasarASeguimiento, cerrar, reabrir, buscar };
}
