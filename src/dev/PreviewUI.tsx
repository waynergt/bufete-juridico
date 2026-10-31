/**
 * SOLO PARA DESARROLLO. Vista previa del formulario y el listado con datos de prueba,
 * mientras no exista el hook real useExpedientes. Borrar o dejar sin usar al integrar.
 */
import { useCallback, useState } from 'react';
import type {
  EstadoExpediente,
  Expediente,
  NuevoExpedienteInput,
  Resultado,
} from '../types/expediente';
import FormularioApertura from '../features/apertura/FormularioApertura';
import ListadoExpedientes from '../features/listado/ListadoExpedientes';

const ahora = () => new Date().toISOString();

const DATOS_PRUEBA: Expediente[] = [
  {
    id: 'EXP-0001',
    solicitante: 'Ana P.',
    asunto: 'Consulta ficticia sobre pensión alimenticia',
    responsable: 'Lic. Morales',
    categoria: 'Familiar',
    estado: 'Abierto',
    fechaApertura: ahora(),
    historial: [{ id: 'h1', tipo: 'apertura', fecha: ahora(), descripcion: 'Expediente abierto' }],
  },
  {
    id: 'EXP-0002',
    solicitante: 'Don Chepe',
    asunto: 'Caso ficticio de despido sin liquidación',
    responsable: 'Lcda. Ruiz',
    categoria: 'Laboral',
    estado: 'En seguimiento',
    fechaApertura: ahora(),
    historial: [],
  },
  {
    id: 'EXP-0003',
    solicitante: 'María L.',
    asunto: 'Asunto civil ficticio sobre un contrato de arrendamiento',
    responsable: 'Lic. Morales',
    estado: 'Cerrado',
    fechaApertura: ahora(),
    fechaCierre: ahora(),
    motivoCierre: 'Caso resuelto (ficticio)',
    historial: [],
  },
];

export default function PreviewUI() {
  const [vista, setVista] = useState<'listado' | 'nuevo'>('listado');
  const [expedientes, setExpedientes] = useState<Expediente[]>(DATOS_PRUEBA);
  const [vacio, setVacio] = useState(false);

  const lista = vacio ? [] : expedientes;

  const crear = (input: NuevoExpedienteInput): Resultado<Expediente> => {
    const errores: Record<string, string> = {};
    if (!input.solicitante?.trim()) errores.solicitante = 'Ingresa el nombre o alias de la persona solicitante.';
    if (!input.asunto?.trim()) errores.asunto = 'Describe brevemente el asunto.';
    if (!input.responsable?.trim()) errores.responsable = 'Indica el nombre del responsable.';
    if (Object.keys(errores).length) return { ok: false, errores };

    const fecha = ahora();
    const nuevo: Expediente = {
      id: `EXP-${String(expedientes.length + 1).padStart(4, '0')}`,
      solicitante: input.solicitante.trim(),
      asunto: input.asunto.trim(),
      responsable: input.responsable.trim(),
      categoria: input.categoria,
      estado: 'Abierto',
      fechaApertura: fecha,
      historial: [{ id: crypto.randomUUID(), tipo: 'apertura', fecha, descripcion: 'Expediente abierto' }],
    };
    setExpedientes((prev) => [...prev, nuevo]);
    setVacio(false);
    return { ok: true, data: nuevo };
  };

  const buscar = useCallback(
    (texto: string, estado?: EstadoExpediente) => {
      const t = texto.trim().toLowerCase();
      return lista.filter(
        (e) =>
          (!estado || e.estado === estado) &&
          (!t || e.id.toLowerCase().includes(t) || e.solicitante.toLowerCase().includes(t)),
      );
    },
    [lista],
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between rounded-md border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span>Vista previa con datos de prueba (no es el hook real).</span>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={vacio} onChange={(e) => setVacio(e.target.checked)} />
            Simular sin expedientes
          </label>
        </div>

        {vista === 'listado' ? (
          <ListadoExpedientes
            buscar={buscar}
            total={lista.length}
            onVerDetalle={(id) => alert(`Aquí App abriría el detalle de ${id}`)}
            onNuevo={() => setVista('nuevo')}
          />
        ) : (
          <FormularioApertura onCrear={crear} onCancelar={() => setVista('listado')} />
        )}
      </div>
    </div>
  );
}
