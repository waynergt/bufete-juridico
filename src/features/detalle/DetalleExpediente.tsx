import { useState } from 'react';
import type { FormEvent } from 'react';
import type {
  EstadoExpediente,
  Expediente,
  Resultado,
  TipoEvento,
} from '../../types/expediente';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

interface DetalleExpedienteProps {
  expediente: Expediente;
  onAgregarActividad: (descripcion: string, tipo?: string) => Resultado<Expediente>;
  onPasarASeguimiento: () => Resultado<Expediente>;
  onCerrar: (motivo: string) => Resultado<Expediente>;
  onVolver: () => void;
}

type Mensaje = { tipo: 'exito' | 'error'; texto: string } | null;

const TIPOS_ACTIVIDAD = ['Entrevista', 'Llamada', 'Revisión de documentos', 'Reunión', 'Otro'];

const ESTILO_ESTADO: Record<EstadoExpediente, string> = {
  Abierto: 'bg-blue-100 text-blue-800 border-blue-300',
  'En seguimiento': 'bg-amber-100 text-amber-800 border-amber-300',
  Cerrado: 'bg-gray-200 text-gray-700 border-gray-400',
};

const ESTILO_EVENTO: Record<
  TipoEvento,
  { etiqueta: string; icono: string; punto: string; caja: string }
> = {
  apertura: {
    etiqueta: 'Apertura',
    icono: '📂',
    punto: 'bg-blue-500',
    caja: 'border-blue-200 bg-blue-50',
  },
  actividad: {
    etiqueta: 'Actividad',
    icono: '📝',
    punto: 'bg-emerald-500',
    caja: 'border-emerald-200 bg-emerald-50',
  },
  cambio_estado: {
    etiqueta: 'Cambio de estado',
    icono: '🔄',
    punto: 'bg-purple-500',
    caja: 'border-purple-200 bg-purple-50',
  },
};

function formatearFecha(iso?: string): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'medium' });
}

function Dato({ etiqueta, valor, ancho = false }: { etiqueta: string; valor: string; ancho?: boolean }) {
  return (
    <div className={ancho ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{etiqueta}</dt>
      <dd className="mt-1 break-words text-gray-900">{valor}</dd>
    </div>
  );
}

export function DetalleExpediente({
  expediente,
  onAgregarActividad,
  onPasarASeguimiento,
  onCerrar,
  onVolver,
}: DetalleExpedienteProps) {
  const [descripcion, setDescripcion] = useState('');
  const [tipoActividad, setTipoActividad] = useState('');
  const [errorDescripcion, setErrorDescripcion] = useState('');
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState('');
  const [mensaje, setMensaje] = useState<Mensaje>(null);

  const { estado } = expediente;
  const cantidadActividades = expediente.historial.filter((e) => e.tipo === 'actividad').length;
  const admiteActividades = estado === 'Abierto' || estado === 'En seguimiento';
  const puedeCerrar = estado === 'En seguimiento' && cantidadActividades > 0;
  const razonNoCierre =
    estado === 'Abierto'
      ? 'Para cerrar, primero pase el expediente a "En seguimiento".'
      : 'Para cerrar, registre al menos una actividad en el expediente.';

  const historialOrdenado = [...expediente.historial].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );

  function procesar(resultado: Resultado<Expediente>, textoExito: string): boolean {
    if (resultado.ok) {
      setMensaje({ tipo: 'exito', texto: textoExito });
      return true;
    }
    const texto = Object.values(resultado.errores).join(' ') || 'No se pudo completar la acción.';
    setMensaje({ tipo: 'error', texto });
    return false;
  }

  function handleAgregarActividad(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    if (!descripcion.trim()) {
      setErrorDescripcion('La descripción es obligatoria y no puede contener solo espacios.');
      return;
    }
    setErrorDescripcion('');
    const resultado = onAgregarActividad(descripcion.trim(), tipoActividad || undefined);
    if (procesar(resultado, 'Actividad registrada correctamente en el historial.')) {
      setDescripcion('');
      setTipoActividad('');
    } else if (!resultado.ok && resultado.errores.descripcion) {
      setErrorDescripcion(resultado.errores.descripcion);
    }
  }

  function handlePasarASeguimiento() {
    setMensaje(null);
    procesar(onPasarASeguimiento(), 'El expediente pasó a "En seguimiento".');
  }

  function cancelarCierre() {
    setMostrarCierre(false);
    setMotivo('');
    setErrorMotivo('');
  }

  function handleCerrar(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    if (!puedeCerrar) {
      setMensaje({ tipo: 'error', texto: razonNoCierre });
      return;
    }
    if (!motivo.trim()) {
      setErrorMotivo('Ingrese el motivo de cierre. No puede quedar vacío ni contener solo espacios.');
      return;
    }
    setErrorMotivo('');
    const resultado = onCerrar(motivo.trim());
    if (procesar(resultado, 'Expediente cerrado. Queda disponible solo para consulta.')) {
      cancelarCierre();
    } else if (!resultado.ok && resultado.errores.motivo) {
      setErrorMotivo(resultado.errores.motivo);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <Button variant="ghost" onClick={onVolver}>
          ← Volver al listado
        </Button>
      </div>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Expediente {expediente.id}</h1>
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${ESTILO_ESTADO[estado]}`}>
          {estado}
        </span>
      </header>

      {mensaje?.tipo === 'exito' && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-emerald-800"
        >
          <span>✅ {mensaje.texto}</span>
          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="text-sm font-medium hover:underline"
            aria-label="Cerrar mensaje"
          >
            ✕
          </button>
        </div>
      )}
      {mensaje?.tipo === 'error' && <Alert message={mensaje.texto} onClose={() => setMensaje(null)} />}

      {estado === 'Cerrado' && (
        <div className="rounded-lg border border-gray-300 bg-gray-100 p-4 text-gray-800">
          <p className="font-semibold">🔒 Expediente cerrado</p>
          <p className="text-sm">
            Este expediente solo está disponible para consulta. No admite nuevas actividades ni cambios de estado.
          </p>
        </div>
      )}

      <Card title="Datos del expediente" subtitle="Información registrada en la apertura">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Dato etiqueta="Identificador" valor={expediente.id} />
          <Dato etiqueta="Estado" valor={estado} />
          <Dato etiqueta="Solicitante (nombre ficticio o alias)" valor={expediente.solicitante} />
          <Dato etiqueta="Responsable" valor={expediente.responsable} />
          <Dato etiqueta="Categoría" valor={expediente.categoria ?? 'Sin categoría'} />
          <Dato etiqueta="Fecha y hora de apertura" valor={formatearFecha(expediente.fechaApertura)} />
          <Dato etiqueta="Asunto" valor={expediente.asunto} ancho />
          {estado === 'Cerrado' && (
            <>
              <Dato etiqueta="Fecha y hora de cierre" valor={formatearFecha(expediente.fechaCierre)} />
              <Dato etiqueta="Motivo de cierre" valor={expediente.motivoCierre ?? '—'} ancho />
            </>
          )}
        </dl>
      </Card>

      {estado !== 'Cerrado' && (
        <Card title="Acciones del expediente" subtitle="Flujo: Abierto → En seguimiento → Cerrado">
          <div className="space-y-4">
            {estado === 'Abierto' && (
              <div className="space-y-2">
                <Button variant="primary" onClick={handlePasarASeguimiento}>
                  Pasar a seguimiento
                </Button>
                <p className="text-sm text-gray-600">
                  Indica que el expediente ya está siendo atendido. Desde "En seguimiento" se podrá cerrar.
                </p>
              </div>
            )}

            <div className="space-y-2 border-t border-gray-200 pt-4">
              {!mostrarCierre ? (
                <>
                  <Button
                    variant="danger"
                    disabled={!puedeCerrar}
                    onClick={() => {
                      setMostrarCierre(true);
                      setMensaje(null);
                    }}
                  >
                    Cerrar expediente
                  </Button>
                  {!puedeCerrar && <p className="text-sm text-amber-700">⚠️ {razonNoCierre}</p>}
                </>
              ) : (
                <form
                  onSubmit={handleCerrar}
                  noValidate
                  className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <label htmlFor="motivo-cierre" className="block text-sm font-medium text-gray-800">
                    Motivo de cierre <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="motivo-cierre"
                    rows={3}
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      if (errorMotivo) setErrorMotivo('');
                    }}
                    aria-invalid={!!errorMotivo}
                    placeholder="Ej.: Asunto concluido según lo registrado en las actividades."
                    className={`w-full rounded-md border bg-white p-2 text-sm focus:outline-none focus:ring-2 ${
                      errorMotivo ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                    }`}
                  />
                  {errorMotivo && <p className="text-sm text-red-700">{errorMotivo}</p>}
                  <p className="text-xs text-gray-600">
                    Al confirmar, el expediente quedará cerrado y solo podrá consultarse.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="danger">
                      Confirmar cierre
                    </Button>
                    <Button type="button" variant="ghost" onClick={cancelarCierre}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Card>
      )}

      {admiteActividades && (
        <Card title="Registrar actividad" subtitle="La fecha y la hora se asignan automáticamente">
          <form onSubmit={handleAgregarActividad} noValidate className="space-y-3">
            <div>
              <label htmlFor="descripcion-actividad" className="block text-sm font-medium text-gray-800">
                Descripción <span className="text-red-600">*</span>
              </label>
              <textarea
                id="descripcion-actividad"
                rows={3}
                value={descripcion}
                onChange={(e) => {
                  setDescripcion(e.target.value);
                  if (errorDescripcion) setErrorDescripcion('');
                }}
                aria-invalid={!!errorDescripcion}
                placeholder="Ej.: Se realizó entrevista inicial con la persona solicitante."
                className={`mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 ${
                  errorDescripcion ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                }`}
              />
              {errorDescripcion && <p className="mt-1 text-sm text-red-700">{errorDescripcion}</p>}
            </div>
            <div>
              <label htmlFor="tipo-actividad" className="block text-sm font-medium text-gray-800">
                Tipo de actividad (opcional)
              </label>
              <select
                id="tipo-actividad"
                value={tipoActividad}
                onChange={(e) => setTipoActividad(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 sm:w-64"
              >
                <option value="">Sin tipo</option>
                {TIPOS_ACTIVIDAD.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary">
              Agregar actividad
            </Button>
          </form>
        </Card>
      )}

      <Card title="Historial" subtitle={`${historialOrdenado.length} evento(s) en orden cronológico`}>
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-600">
          {(Object.keys(ESTILO_EVENTO) as TipoEvento[]).map((t) => (
            <span key={t} className="flex items-center gap-1">
              <span className={`inline-block h-3 w-3 rounded-full ${ESTILO_EVENTO[t].punto}`} />
              {ESTILO_EVENTO[t].etiqueta}
            </span>
          ))}
        </div>

        {historialOrdenado.length === 0 ? (
          <p className="text-sm text-gray-600">Este expediente aún no tiene eventos registrados.</p>
        ) : (
          <ol className="relative space-y-4 border-l-2 border-gray-200 pl-6">
            {historialOrdenado.map((ev) => {
              const estilo = ESTILO_EVENTO[ev.tipo];
              return (
                <li key={ev.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[33px] top-3 h-4 w-4 rounded-full border-2 border-white ${estilo.punto}`}
                  />
                  <div className={`rounded-lg border p-3 ${estilo.caja}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {estilo.icono} {estilo.etiqueta}
                        {ev.tipo === 'actividad' && ev.tipoActividad ? ` · ${ev.tipoActividad}` : ''}
                      </span>
                      <time dateTime={ev.fecha} className="text-xs text-gray-600">
                        {formatearFecha(ev.fecha)}
                      </time>
                    </div>
                    {ev.tipo === 'cambio_estado' && (
                      <p className="mt-1 text-sm font-medium text-purple-900">
                        {ev.estadoAnterior ?? '—'} → {ev.estadoNuevo ?? '—'}
                      </p>
                    )}
                    {ev.descripcion && <p className="mt-1 text-sm text-gray-800">{ev.descripcion}</p>}
                    {ev.motivo && (
                      <p className="mt-1 text-sm text-gray-800">
                        <span className="font-medium">Motivo:</span> {ev.motivo}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <p className="text-center text-xs text-gray-500">
        Esta aplicación solo organiza expedientes con datos ficticios y no brinda asesoría jurídica.
      </p>
    </div>
  );
}

export default DetalleExpediente;