
import type {
  Expediente,
  EstadoExpediente,
} from '../../types/expediente';

interface ListadoExpedientesProps {
  buscar: (texto: string, estado?: EstadoExpediente) => Expediente[];
  total: number;
  onVerDetalle: (id: string) => void;
  onNuevo: () => void;
}

export function ListadoExpedientes({
  buscar,
  total,
  onVerDetalle,
  onNuevo,
}: ListadoExpedientesProps) {
  const resultados = buscar('');

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Expedientes
          </h2>

          <p className="text-sm text-slate-500">
            Total de expedientes: {total}
          </p>
        </div>

        <button
          type="button"
          onClick={onNuevo}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo expediente
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="font-semibold">
          Listado de expedientes
        </h3>

        {resultados.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No existen expedientes registrados.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {resultados.map((expediente) => (
              <button
                key={expediente.id}
                type="button"
                onClick={() => onVerDetalle(expediente.id)}
                className="flex w-full flex-wrap justify-between gap-2 rounded-lg border p-4 text-left hover:bg-slate-50"
              >
                <span>
                  <strong>{expediente.id}</strong>
                  <span className="ml-3">
                    {expediente.solicitante}
                  </span>
                </span>

                <span className="text-sm text-slate-500">
                  {expediente.estado}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
