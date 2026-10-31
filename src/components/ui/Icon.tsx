import type { SVGProps } from 'react';

/**
 * Íconos SVG en línea (sin librerías externas), trazo de 2px y color heredado
 * (`currentColor`), para que se adapten al color del texto que los rodea.
 */
export type NombreIcono =
  | 'apertura'
  | 'actividad'
  | 'cambio'
  | 'cierre'
  | 'reapertura'
  | 'exito'
  | 'advertencia';

const TRAZOS: Record<NombreIcono, string[]> = {
  // Carpeta abierta
  apertura: [
    'M6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2',
  ],
  // Portapapeles con líneas
  actividad: [
    'M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
    'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
    'M8 11h8',
    'M8 16h5',
  ],
  // Flechas de intercambio
  cambio: ['M16 3l4 4-4 4', 'M20 7H4', 'M8 21l-4-4 4-4', 'M4 17h16'],
  // Candado cerrado
  cierre: [
    'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
    'M7 11V7a5 5 0 0 1 10 0v4',
  ],
  // Candado abierto
  reapertura: [
    'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
    'M7 11V7a5 5 0 0 1 9.9-1',
  ],
  // Círculo con check
  exito: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z', 'M9 12l2 2 4-4'],
  // Triángulo de advertencia
  advertencia: [
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    'M12 9v4',
    'M12 17h.01',
  ],
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: NombreIcono;
  /** Texto para lectores de pantalla; si se omite, el ícono es decorativo. */
  title?: string;
}

export function Icon({ name, title, className = 'h-4 w-4', ...resto }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...resto}
    >
      {title && <title>{title}</title>}
      {TRAZOS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default Icon;
