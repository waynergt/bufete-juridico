export type AlertVariant = 'error' | 'success' | 'info';

export interface AlertProps {
  message: string;
  onClose?: () => void;
  /** Si no se indica: 'success' cuando el mensaje empieza con ✓, si no 'error'. */
  variant?: AlertVariant;
}

const ESTILOS: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export function Alert({ message, onClose, variant }: AlertProps) {
  const tipo: AlertVariant = variant ?? (message.trim().startsWith('✓') ? 'success' : 'error');
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${ESTILOS[tipo]}`}
    >
      <p>{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar mensaje"
          className="shrink-0 rounded px-1 font-bold leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
