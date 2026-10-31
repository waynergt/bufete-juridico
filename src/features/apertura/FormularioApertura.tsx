
import type {
  NuevoExpedienteInput,
  Expediente,
  Resultado,
} from '../../types/expediente';

interface FormularioAperturaProps {
  onCrear: (i: NuevoExpedienteInput) => Resultado<Expediente>;
  onCancelar: () => void;
}

export function FormularioApertura({
  onCancelar,
}: FormularioAperturaProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        Apertura de expediente
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Formulario pendiente de implementación.
      </p>

      <button
        type="button"
        onClick={onCancelar}
        className="mt-5 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        Cancelar
      </button>
    </section>
  );
}
