import { useRef, useState, type FormEvent } from 'react';
import type {
  Categoria,
  Expediente,
  NuevoExpedienteInput,
  Resultado,
} from '../../types/expediente';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

interface Props {
  onCrear: (i: NuevoExpedienteInput) => Resultado<Expediente>;
  onCancelar: () => void;
}

type Campo = 'solicitante' | 'asunto' | 'responsable';

const ORDEN: Campo[] = ['solicitante', 'asunto', 'responsable'];
const CATEGORIAS: Categoria[] = ['Civil', 'Familiar', 'Laboral'];

const MENSAJES: Record<Campo, string> = {
  solicitante: 'Ingresa el nombre o alias de la persona solicitante.',
  asunto: 'Describe brevemente el asunto.',
  responsable: 'Indica el nombre del responsable.',
};

interface Valores {
  solicitante: string;
  asunto: string;
  responsable: string;
  categoria: '' | Categoria;
}

const VACIO: Valores = { solicitante: '', asunto: '', responsable: '', categoria: '' };

/** Validación local: obligatorio, no vacío ni solo espacios. */
function validar(v: Valores): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const campo of ORDEN) {
    if (v[campo].trim() === '') errores[campo] = MENSAJES[campo];
  }
  return errores;
}

const claseControl = (conError: boolean) =>
  `w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    conError
      ? 'border-red-500 focus:ring-red-200'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
  }`;

export default function FormularioApertura({ onCrear, onCancelar }: Props) {
  const [valores, setValores] = useState<Valores>(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [intentado, setIntentado] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const refs = useRef<Partial<Record<Campo, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const cambiar = (campo: keyof Valores, valor: string) => {
    const nuevos = { ...valores, [campo]: valor } as Valores;
    setValores(nuevos);
    setConfirmacion('');
    // Tras el primer intento, el error del campo desaparece en cuanto se corrige.
    if (intentado && campo !== 'categoria') {
      const e = validar(nuevos);
      setErrores((prev) => {
        const copia = { ...prev };
        if (e[campo]) copia[campo] = e[campo];
        else delete copia[campo];
        return copia;
      });
    }
  };

  const enfocarPrimerError = (e: Record<string, string>) => {
    const primero = ORDEN.find((c) => e[c]);
    if (primero) refs.current[primero]?.focus();
  };

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    setIntentado(true);
    setConfirmacion('');

    const locales = validar(valores);
    if (Object.keys(locales).length > 0) {
      setErrores(locales);
      enfocarPrimerError(locales);
      return;
    }

    const resultado = onCrear({
      solicitante: valores.solicitante.trim(),
      asunto: valores.asunto.trim(),
      responsable: valores.responsable.trim(),
      ...(valores.categoria ? { categoria: valores.categoria } : {}),
    });

    if (!resultado.ok) {
      setErrores(resultado.errores);
      enfocarPrimerError(resultado.errores);
      return;
    }

    // Éxito: confirmación con el ID y formulario limpio para registrar otro.
    setConfirmacion(
      `Expediente ${resultado.data.id} abierto correctamente con estado ${resultado.data.estado}.`,
    );
    setValores(VACIO);
    setErrores({});
    setIntentado(false);
    refs.current.solicitante?.focus();
  };

  const hayErroresCampo = ORDEN.some((c) => errores[c]);
  // Errores del hook que no pertenecen a un campo visible (ej. "general").
  const erroresSinCampo = Object.entries(errores).filter(([k]) => !ORDEN.includes(k as Campo));

  const ErrorCampo = ({ campo }: { campo: Campo }) =>
    errores[campo] ? (
      <p id={`error-${campo}`} className="mt-1 text-sm text-red-600">
        {errores[campo]}
      </p>
    ) : null;

  return (
    <Card
      title="Nuevo expediente"
      subtitle="Registra los datos básicos. El identificador, la fecha y el estado se asignan automáticamente."
    >
      <form onSubmit={enviar} noValidate className="space-y-5">
        {confirmacion && (
          <div role="status">
            <Alert message={`✓ ${confirmacion}`} onClose={() => setConfirmacion('')} />
          </div>
        )}

        {hayErroresCampo && (
          <div role="alert">
            <Alert
              message="Revisa los campos marcados para continuar."
              onClose={() => setErrores({})}
            />
          </div>
        )}

        {erroresSinCampo.map(([k, msg]) => (
          <div role="alert" key={k}>
            <Alert
              message={msg}
              onClose={() =>
                setErrores((prev) => {
                  const copia = { ...prev };
                  delete copia[k];
                  return copia;
                })
              }
            />
          </div>
        ))}

        <p className="text-xs text-slate-500">
          <span className="text-red-600">*</span> Campos obligatorios
        </p>

        {/* Persona solicitante */}
        <div>
          <label htmlFor="solicitante" className="mb-1 block text-sm font-medium text-slate-700">
            Persona solicitante <span className="text-red-600">*</span>
          </label>
          <input
            id="solicitante"
            ref={(el) => {
              refs.current.solicitante = el;
            }}
            type="text"
            autoComplete="off"
            value={valores.solicitante}
            onChange={(e) => cambiar('solicitante', e.target.value)}
            placeholder="Nombre ficticio o alias (ej. Ana P.)"
            aria-invalid={!!errores.solicitante}
            aria-describedby={errores.solicitante ? 'error-solicitante' : undefined}
            className={claseControl(!!errores.solicitante)}
          />
          <ErrorCampo campo="solicitante" />
        </div>

        {/* Asunto */}
        <div>
          <label htmlFor="asunto" className="mb-1 block text-sm font-medium text-slate-700">
            Descripción del asunto <span className="text-red-600">*</span>
          </label>
          <textarea
            id="asunto"
            ref={(el) => {
              refs.current.asunto = el;
            }}
            rows={3}
            value={valores.asunto}
            onChange={(e) => cambiar('asunto', e.target.value)}
            placeholder="Resumen breve del caso, sin datos personales reales"
            aria-invalid={!!errores.asunto}
            aria-describedby={errores.asunto ? 'error-asunto' : undefined}
            className={claseControl(!!errores.asunto)}
          />
          <ErrorCampo campo="asunto" />
        </div>

        {/* Responsable */}
        <div>
          <label htmlFor="responsable" className="mb-1 block text-sm font-medium text-slate-700">
            Responsable <span className="text-red-600">*</span>
          </label>
          <input
            id="responsable"
            ref={(el) => {
              refs.current.responsable = el;
            }}
            type="text"
            autoComplete="off"
            value={valores.responsable}
            onChange={(e) => cambiar('responsable', e.target.value)}
            placeholder="Nombre de quien atenderá el expediente"
            aria-invalid={!!errores.responsable}
            aria-describedby={errores.responsable ? 'error-responsable' : undefined}
            className={claseControl(!!errores.responsable)}
          />
          <ErrorCampo campo="responsable" />
        </div>

        {/* Categoría (opcional) */}
        <div>
          <label htmlFor="categoria" className="mb-1 block text-sm font-medium text-slate-700">
            Categoría <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <select
            id="categoria"
            value={valores.categoria}
            onChange={(e) => cambiar('categoria', e.target.value)}
            className={claseControl(false)}
          >
            <option value="">Sin categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          Al guardar se asignará automáticamente: identificador (EXP-####), fecha y hora de
          apertura y estado <strong>Abierto</strong>.
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" type="submit">
            Guardar expediente
          </Button>
          <Button variant="ghost" type="button" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>

        <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
          Esta herramienta solo organiza expedientes; no brinda asesoría jurídica. Usa únicamente
          datos ficticios.
        </p>
      </form>
    </Card>
  );
}
