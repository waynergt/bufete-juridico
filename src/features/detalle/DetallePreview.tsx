import { useState } from 'react';
import type { Expediente, Resultado } from '../../types/expediente';
import DetalleExpediente from './DetalleExpediente';

const ahora = () => new Date().toISOString();
const nuevoId = () => Math.random().toString(36).slice(2, 10);

const EXPEDIENTE_PRUEBA: Expediente = {
  id: 'EXP-0001',
  solicitante: 'María Ejemplo (alias)',
  asunto: 'Consulta ficticia sobre un trámite familiar',
  responsable: 'Lic. Ficticio Pérez',
  categoria: 'Familiar',
  estado: 'Abierto',
  fechaApertura: '2026-10-31T14:00:00.000Z',
  historial: [
    {
      id: 'h1',
      tipo: 'apertura',
      fecha: '2026-10-31T14:00:00.000Z',
      descripcion: 'Expediente abierto',
      estadoNuevo: 'Abierto',
    },
  ],
};

export default function DetallePreview() {
  const [exp, setExp] = useState<Expediente>(EXPEDIENTE_PRUEBA);

  const guardar = (nuevo: Expediente): Resultado<Expediente> => {
    setExp(nuevo);
    return { ok: true, data: nuevo };
  };

  const agregar = (descripcion: string, tipo?: string): Resultado<Expediente> => {
    if (exp.estado === 'Cerrado') return { ok: false, errores: { estado: 'El expediente está cerrado.' } };
    if (!descripcion.trim()) return { ok: false, errores: { descripcion: 'La descripción es obligatoria.' } };
    return guardar({
      ...exp,
      historial: [
        ...exp.historial,
        { id: nuevoId(), tipo: 'actividad', fecha: ahora(), descripcion: descripcion.trim(), tipoActividad: tipo },
      ],
    });
  };

  const pasar = (): Resultado<Expediente> => {
    if (exp.estado !== 'Abierto')
      return { ok: false, errores: { estado: 'Solo un expediente Abierto puede pasar a seguimiento.' } };
    return guardar({
      ...exp,
      estado: 'En seguimiento',
      historial: [
        ...exp.historial,
        {
          id: nuevoId(),
          tipo: 'cambio_estado',
          fecha: ahora(),
          descripcion: 'Pasó a seguimiento',
          estadoAnterior: 'Abierto',
          estadoNuevo: 'En seguimiento',
        },
      ],
    });
  };

  const cerrar = (motivo: string): Resultado<Expediente> => {
    if (exp.estado !== 'En seguimiento')
      return { ok: false, errores: { estado: 'Solo se puede cerrar desde "En seguimiento".' } };
    if (!exp.historial.some((e) => e.tipo === 'actividad'))
      return { ok: false, errores: { estado: 'Debe existir al menos una actividad.' } };
    if (!motivo.trim()) return { ok: false, errores: { motivo: 'El motivo es obligatorio.' } };
    const f = ahora();
    return guardar({
      ...exp,
      estado: 'Cerrado',
      fechaCierre: f,
      motivoCierre: motivo.trim(),
      historial: [
        ...exp.historial,
        {
          id: nuevoId(),
          tipo: 'cambio_estado',
          fecha: f,
          descripcion: 'Expediente cerrado',
          estadoAnterior: 'En seguimiento',
          estadoNuevo: 'Cerrado',
          motivo: motivo.trim(),
        },
      ],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DetalleExpediente
        expediente={exp}
        onAgregarActividad={agregar}
        onPasarASeguimiento={pasar}
        onCerrar={cerrar}
        onVolver={() => alert('Aquí volvería al listado (simulado).')}
      />
    </div>
  );
}