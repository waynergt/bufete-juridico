import { useMemo, useState } from 'react';
import type { EstadoExpediente, Expediente } from '../../types/expediente';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface Props {
  buscar: (texto: string, estado?: EstadoExpediente) => Expediente[];
  total: number;
  onVerDetalle: (id: string) => void;
  onNuevo: () => void;
}

const ESTADOS: EstadoExpediente[] = ['Abierto', 'En seguimiento', 'Cerrado'];

const ESTILO_ESTADO: Record<EstadoExpediente, string> = {
  Abierto: 'bg-blue-100 text-blue-800 ring-blue-200',
  'En seguimiento': 'bg-amber-100 text-amber-800 ring-amber-200',
  Cerrado: 'bg-slate-200 text-slate-700 ring-slate-300',
};

function BadgeEstado({ estado }: { estado: EstadoExpediente }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ESTILO_ESTADO[estado]}`}
    >
      {estado}
    </span>
  );
}

const claseControl =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

export default function ListadoExpedientes({ buscar, total, onVerDetalle, onNuevo }: Props) {
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<'' | EstadoExpediente>('');

  // `total` cambia cuando se crean expedientes; se incluye para refrescar la lista.
  const resultados = useMemo(
    () => buscar(texto, estado || undefined),
    [buscar, texto, estado, total],
  );

  const hayFiltro = texto.trim() !== '' || estado !== '';
  const limpiar = () => {
    setTexto('');
    setEstado('');
  };

  const encabezado = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-600">
        {total === 1 ? '1 expediente registrado' : `${total} expedientes registrados`}
      </p>
      <Button variant="primary" onClick={onNuevo}>
        + Nuevo expediente
      </Button>
    </div>
  );

  // Estado vacío: no existe ningún expediente.
  if (total === 0) {
    return (
      <Card title="Expedientes" subtitle="Organiza expedientes, actividades y su seguimiento.">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-base font-medium text-slate-800">
            Aún no hay expedientes registrados.
          </p>
          <p className="max-w-sm text-sm text-slate-500">
            Crea el primero para comenzar a registrar actividades y su seguimiento.
          </p>
          <Button variant="primary" onClick={onNuevo}>
            + Nuevo expediente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Expedientes" subtitle="Organiza expedientes, actividades y su seguimiento.">
      <div className="space-y-4">
        {encabezado}

        {/* Barra de búsqueda */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label htmlFor="buscar" className="block text-sm font-medium text-slate-700">
              Buscar
            </label>
            <input
              id="buscar"
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por ID (EXP-0001) o nombre/alias"
              className={claseControl}
            />
          </div>
          <div className="space-y-1 sm:w-48">
            <label htmlFor="filtro-estado" className="block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              id="filtro-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as '' | EstadoExpediente)}
              className={claseControl}
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          {hayFiltro && (
            <Button variant="ghost" onClick={limpiar}>
              Limpiar
            </Button>
          )}
        </div>

        {hayFiltro && resultados.length > 0 && (
          <p className="text-xs text-slate-500">
            Mostrando {resultados.length} de {total}
          </p>
        )}

        {/* Sin resultados */}
        {resultados.length === 0 ? (
          <div
            role="status"
            className="flex flex-col items-center gap-2 rounded-md border border-dashed border-slate-300 py-8 text-center"
          >
            <p className="text-sm font-medium text-slate-800">
              No se encontraron expedientes
              {texto.trim() ? ` para "${texto.trim()}"` : ''}
              {estado ? ` con estado ${estado}` : ''}.
            </p>
            <p className="text-sm text-slate-500">
              Revisa el ID o el nombre, o limpia los filtros.
            </p>
            <Button variant="ghost" onClick={limpiar}>
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          /* Tabla */
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3">ID</th>
                  <th scope="col" className="px-4 py-3">Persona</th>
                  <th scope="col" className="hidden px-4 py-3 sm:table-cell">Responsable</th>
                  <th scope="col" className="px-4 py-3">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="sr-only">Acción</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {resultados.map((exp) => (
                  <tr
                    key={exp.id}
                    onClick={() => onVerDetalle(exp.id)}
                    className="cursor-pointer transition-colors hover:bg-blue-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-slate-900">
                      {exp.id}
                    </td>
                    <td className="px-4 py-3 text-slate-800">{exp.solicitante}</td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                      {exp.responsable}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado estado={exp.estado} />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" onClick={() => onVerDetalle(exp.id)}>
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
