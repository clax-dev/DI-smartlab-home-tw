import React from 'react';
import { IonIcon } from '@ionic/react';

/** Tonos permitidos: cada uno mapea a clases Tailwind completas (Tailwind no detecta clases construidas por concatenación). */
export type KpiTone = 'neutral' | 'warning' | 'danger' | 'success';

const TONE_BG: Record<KpiTone, string> = {
  neutral: 'bg-brut-blue',
  warning: 'bg-brut-yellow',
  danger: 'bg-brut-red',
  success: 'bg-brut-green',
};

export interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  tone: KpiTone;
  /** true si este indicador es el filtro activo del listado */
  active: boolean;
  onSelect: () => void;
}

/**
 * Indicador clicable: además de mostrar la métrica, filtra el listado.
 * Estado activo = colores invertidos y "hundido" (sin sombra), como un interruptor físico.
 * Sigue siendo un componente de presentación: no conoce el filtro, solo avisa con onSelect.
 */
const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, tone, active, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={active}
    aria-label={`Filtrar: ${label} (${value})`}
    className={`flex min-h-[12vh] flex-col justify-between border-[3px] border-brut-ink p-3 text-left lg:p-4 ${
      active
        ? 'translate-x-[6px] translate-y-[6px] bg-brut-ink text-brut-yellow shadow-none'
        : `${TONE_BG[tone]} brut-press text-brut-ink`
    }`}
  >
    <span className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider">
      {label}
      <IonIcon icon={icon} aria-hidden="true" className="text-xl" />
    </span>
    <span className="mt-2 font-display text-4xl leading-none lg:text-5xl">{value}</span>
  </button>
);

export default KpiCard;
