
import type {
  Expediente,
  Resultado,
} from '../../types/expediente';

interface DetalleExpedienteProps {
  expediente: Expediente;
  onAgregarActividad: (
    descripcion: string,
    tipo?: string
  ) => Resultado<Expediente>;
  onPasarASeguimiento: () => Resultado<Expediente>;
  onCerrar: (motivo: string) => Resultado<Expediente>;
  onVolver: () => void;
}

export function DetalleExpediente({
  expediente,
  onVolver,
}: DetalleExpedienteProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold">
          Detalle del expediente
        </h2>

        <button
          type="button"
          onClick={onVolver}
          className="rounded-lg border px-4 py-2 hover:bg-slate-100"
        >
          Volver
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <p>
          <strong>Identificador:</strong> {expediente.id}
        </p>

        <p>
          <strong>Solicitante:</strong> {expediente.solicitante}
        </p>

        <p>
          <strong>Asunto:</strong> {expediente.asunto}
        </p>

        <p>
          <strong>Responsable:</strong> {expediente.responsable}
        </p>

        <p>
          <strong>Estado:</strong> {expediente.estado}
        </p>

        <p>
          <strong>Fecha de apertura:</strong>{' '}
          {expediente.fechaApertura}
        </p>
      </div>

      <div className="mt-6 border-t pt-5">
        <h3 className="font-semibold">
          Historial
        </h3>

        {expediente.historial.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No hay eventos registrados.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {expediente.historial.map((evento) => (
              <li
                key={evento.id}
                className="rounded-lg border p-3"
              >
                <p className="font-medium">
                  {evento.tipo}
                </p>

                <p className="text-sm text-slate-600">
                  {evento.descripcion}
                </p>

                <p className="text-xs text-slate-400">
                  {evento.fecha}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
