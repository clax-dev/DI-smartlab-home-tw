import React from 'react';
import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react';
import { checkmarkCircleOutline, refreshOutline, trashOutline } from 'ionicons/icons';
import { Incident, IncidentPriority } from '../types/incident';

const PRIORITY_BADGE_STYLES: Record<IncidentPriority, string> = {
  alta: 'bg-brut-red',
  media: 'bg-brut-yellow',
  baja: 'bg-brut-green',
};

export interface IncidentItemProps {
  incident: Incident;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  /** Abre la ficha técnica /incident/:id (el padre decide cómo navegar). */
  onOpenDetail: (id: string) => void;
}

/**
 * Tarjeta de incidencia (estilo brutalista: borde grueso, sombra dura, tipografía en mayúsculas).
 * - Móvil/tablet: acciones ocultas tras el gesto de deslizar (IonItemSliding).
 * - Escritorio (lg): no hay gesto táctil, así que las acciones se muestran como botones visibles.
 * El componente no modifica datos: avisa al padre con callbacks (flujo unidireccional).
 */
const IncidentItem: React.FC<IncidentItemProps> = ({ incident, onToggleStatus, onDelete, onOpenDetail }) => {
  const isResolved = incident.status === 'resuelta';

  return (
    // Hover: la tarjeta se levanta (solo con ratón). Sin efecto "pulsar" para no interferir con el gesto de deslizar.
    // animate-pop: entrada al montarse (p. ej. al crear una incidencia); se desactiva con "reducir movimiento".
    <IonItemSliding
      className="animate-pop overflow-hidden border-[3px] border-brut-ink bg-white shadow-brut transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brut-lg motion-reduce:animate-none motion-reduce:transition-none"
    >
      {/* El aspecto interno de IonItem (Shadow DOM) se ajusta con variables CSS: ver .incident-item en variables.css */}
      <IonItem
        className={`incident-item h-full ${isResolved ? 'incident-item--resolved' : ''}`}
        lines="none"
      >
        <article className="flex h-full w-full flex-col py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-brut-ink px-1.5 py-0.5 text-xs font-bold text-brut-yellow">{incident.id}</span>
              <span
                className={`border-2 border-brut-ink px-2 py-0.5 text-xs font-bold uppercase ${
                  PRIORITY_BADGE_STYLES[incident.priority]
                }`}
              >
                {incident.priority}
              </span>
            </div>
            <span className="text-xs font-bold">{incident.createdAt}</span>
          </div>

          <h3
            className={`mt-2 font-display text-lg uppercase leading-tight lg:text-xl ${
              isResolved ? 'line-through decoration-4' : ''
            }`}
          >
            {incident.title}
          </h3>
          {/* line-clamp: la tarjeta muestra un resumen; la descripción completa está en la ficha */}
          <p className="mt-1 line-clamp-3 flex-1 text-sm">{incident.description}</p>

          {/* Enlace a la ficha técnica: botón nativo, accesible con teclado (Tab + Enter) */}
          <button
            type="button"
            onClick={() => onOpenDetail(incident.id)}
            aria-label={`Ver ficha técnica de ${incident.id}`}
            className="mt-2 self-start border-b-[3px] border-brut-ink text-xs font-bold uppercase transition-colors duration-150 hover:bg-brut-yellow focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brut-blue"
          >
            Ver ficha →
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t-[3px] border-brut-ink pt-3">
            <span className="text-xs font-bold uppercase">
              ▲ <span className="underline decoration-2 underline-offset-2">{incident.location}</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Botón de estado: 44px de alto (min-h-11) y efecto de pulsado físico */}
              <button
                type="button"
                onClick={() => onToggleStatus(incident.id)}
                aria-label={`Marcar ${incident.id} como ${isResolved ? 'pendiente' : 'resuelta'}`}
                className={`brut-press-sm min-h-11 border-2 border-brut-ink px-3 text-xs font-bold uppercase ${
                  isResolved ? 'bg-brut-green' : 'bg-brut-yellow'
                }`}
              >
                {isResolved ? '✓ Resuelta' : '● Pendiente'}
              </button>

              {/* Solo escritorio: borrar sin gesto de deslizar */}
              <button
                type="button"
                onClick={() => onDelete(incident.id)}
                aria-label={`Eliminar ${incident.id}`}
                className="brut-press-sm hidden min-h-11 min-w-11 items-center justify-center border-2 border-brut-ink bg-brut-red lg:inline-flex"
              >
                <IonIcon icon={trashOutline} aria-hidden="true" className="text-lg" />
              </button>
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
