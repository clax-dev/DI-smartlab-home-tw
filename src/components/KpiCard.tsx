import React from 'react';
import { IonIcon } from '@ionic/react';

/** Tonos permitidos: cada uno mapea a clases Tailwind completas (Tailwind no detecta clases construidas por concatenación). */
export type KpiTone = 'neutral' | 'warning' | 'danger' | 'success';

const TONE_STYLES: Record<KpiTone, { icon: string; value: string }> = {
  neutral: { icon: 'text-blue-600', value: 'text-slate-900' },
  warning: { icon: 'text-amber-600', value: 'text-amber-700' },
  danger: { icon: 'text-red-600', value: 'text-red-700' },
  success: { icon: 'text-emerald-600', value: 'text-emerald-700' },
};

export interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  tone: KpiTone;
}

/** Tarjeta de indicador. Componente "tonto": solo recibe datos por props y pinta. */
const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, tone }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-center justify-between text-slate-600">
      <span className="text-xs font-medium sm:text-sm">{label}</span>
      <IonIcon icon={icon} aria-hidden="true" className={`text-lg ${TONE_STYLES[tone].icon}`} />
    </div>
    <p className={`mt-2 text-2xl font-bold lg:text-3xl ${TONE_STYLES[tone].value}`}>{value}</p>
  </div>
);

export default KpiCard;
