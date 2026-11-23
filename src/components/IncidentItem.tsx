import React from 'react';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/react';
import { checkmarkCircleOutline, refreshOutline, trashOutline } from 'ionicons/icons';
import { Incident, IncidentPriority } from '../types/incident';

const PRIORITY_BADGE_STYLES: Record<IncidentPriority, string> = {
  alta: 'bg-red-100 text-red-800 border-red-200',
  media: 'bg-amber-100 text-amber-800 border-amber-200',
  baja: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export interface IncidentItemProps {
  incident: Incident;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Tarjeta de incidencia.
 * - Móvil/tablet: acciones ocultas tras el gesto de deslizar (IonItemSliding).
 * - Escritorio (lg): no hay gesto táctil, así que las acciones se muestran como botones visibles.
 * El componente no modifica datos: avisa al padre con callbacks (flujo unidireccional).
 */
const IncidentItem: React.FC<IncidentItemProps> = ({ incident, onToggleStatus, onDelete }) => {
  const isResolved = incident.status === 'resuelta';

  return (
    <IonItemSliding className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* El aspecto interno de IonItem (Shadow DOM) se ajusta con variables CSS: ver .incident-item en variables.css */}
      <IonItem className="incident-item h-full" lines="none">
        <article className="flex h-full w-full flex-col py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-700">{incident.id}</span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  PRIORITY_BADGE_STYLES[incident.priority]
                }`}
              >
                {incident.priority}
              </span>
            </div>
            <span className="text-xs text-slate-500">{incident.createdAt}</span>
          </div>

          <h3
            className={`mt-1.5 text-base font-semibold lg:text-lg ${
              isResolved ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}
          >
            {incident.title}
          </h3>
          <p className="mt-1 flex-1 text-sm text-slate-600">{incident.description}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="text-xs font-medium text-slate-600">
              Ubicación: <strong className="text-slate-800">{incident.location}</strong>
            </span>

            <div className="flex items-center gap-1">
              {/* Botón de estado: el área clicable mide 44px (min-h-11) aunque la píldora visible sea más pequeña */}
              <button
                type="button"
                onClick={() => onToggleStatus(incident.id)}
                aria-label={`Marcar ${incident.id} como ${isResolved ? 'pendiente' : 'resuelta'}`}
                className="group inline-flex min-h-11 items-center rounded-full px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    isResolved
                      ? 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 group-hover:bg-amber-200'
                  }`}
                >
                  {isResolved ? 'Resuelta' : 'Pendiente'}
                </span>
              </button>

              {/* Solo escritorio: borrar sin gesto de deslizar */}
              <IonButton
                fill="clear"
                color="danger"
                className="hidden min-h-11 lg:inline-block"
                onClick={() => onDelete(incident.id)}
                aria-label={`Eliminar ${incident.id}`}
              >
                <IonIcon slot="icon-only" icon={trashOutline} />
              </IonButton>
            </div>
          </div>
        </article>
      </IonItem>

      {/* Opciones que aparecen al deslizar la tarjeta hacia la izquierda (móvil/tablet) */}
      <IonItemOptions side="end">
        <IonItemOption
          color="success"
          onClick={() => onToggleStatus(incident.id)}
          aria-label={`Cambiar estado de ${incident.id}`}
        >
          <IonIcon slot="icon-only" icon={isResolved ? refreshOutline : checkmarkCircleOutline} />
        </IonItemOption>
        <IonItemOption color="danger" onClick={() => onDelete(incident.id)} aria-label={`Eliminar ${incident.id}`}>
          <IonIcon slot="icon-only" icon={trashOutline} />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default IncidentItem;
