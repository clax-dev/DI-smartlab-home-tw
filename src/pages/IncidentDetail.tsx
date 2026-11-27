import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { useIncidentsStorage } from '../hooks/useIncidentsStorage';
import { IncidentPriority } from '../types/incident';

const PRIORITY_BG: Record<IncidentPriority, string> = {
  alta: 'bg-brut-red',
  media: 'bg-brut-yellow',
  baja: 'bg-brut-green',
};

const PRIORITY_TEXT: Record<IncidentPriority, string> = {
  alta: 'Alta (crítica)',
  media: 'Media (operativa)',
  baja: 'Baja (mantenimiento)',
};

/**
 * Ficha técnica de una incidencia (Mejora 3 de la guía).
 * - Ruta /incident/:id registrada en IonRouterOutlet (App.tsx); el id llega por la URL (useParams).
 * - IonBackButton vuelve a Home; si se entra directamente por la URL, defaultHref="/home" da la salida.
 * - Permite editar la descripción: el borrador es estado local y solo se guarda al pulsar "Guardar".
 * - Los datos salen del mismo almacén que Home (useIncidentsStorage), así que el cambio se ve al volver.
 */
const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { incidents, updateDescription, toggleStatus } = useIncidentsStorage();
  const incident = incidents.find((i) => i.id === id);

  const [draft, setDraft] = useState(incident?.description ?? '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Si cambia la incidencia mostrada (otra :id), el borrador se reinicia con su descripción
  useEffect(() => {
    setDraft(incident?.description ?? '');
    // Depende solo del id: si dependiera de la descripción, guardar pisaría lo que se está escribiendo
  }, [incident?.id]);

  const isDirty = incident !== undefined && draft.trim() !== incident.description;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;
    const value = draft.trim();
    if (value === '') {
      setToastMessage('La descripción no puede quedar vacía');
      return;
    }
    updateDescription(incident.id, value);
    setDraft(value);
    setToastMessage(`Descripción de ${incident.id} guardada`);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="brut-toolbar">
          <IonButtons slot="start">
            {/* Botón de retorno nativo de Ionic: usa el historial; sin historial, va a /home */}
            <IonBackButton defaultHref="/home" text="Volver" className="brut-back" />
          </IonButtons>
          <IonTitle className="font-display uppercase tracking-tight">Ficha técnica</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="brut-bg">
        {!incident ? (
          // Id inexistente (borrada o URL escrita a mano)
          <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
            <p className="font-display text-3xl uppercase">No existe la incidencia {id}</p>
            <p className="mt-2 text-sm font-bold">Puede que se haya eliminado. Vuelve al panel con el botón superior.</p>
          </section>
        ) : (
          <>
            {/* Cabecera de la ficha: alto relativo a la ventana, como el hero de Home */}
            <section
              aria-labelledby="detail-title"
              className={`flex min-h-[26vh] flex-col justify-end border-b-4 border-brut-ink ${PRIORITY_BG[incident.priority]}`}
            >
              <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-6 sm:px-6 lg:px-8">
                <span className="mb-3 inline-block bg-brut-ink px-2 py-0.5 text-sm font-bold text-brut-yellow">
                  {incident.id}
                </span>
                <h1
                  id="detail-title"
                  className={`font-display text-3xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl ${
                    incident.status === 'resuelta' ? 'line-through decoration-4' : ''
                  }`}
                >
                  {incident.title}
                </h1>
              </div>
            </section>

            <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 lg:px-8">
              {/* Datos de la incidencia: lista de definiciones (dl) = pares campo/valor accesibles */}
              <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                {[
                  ['Ubicación', incident.location],
                  ['Prioridad', PRIORITY_TEXT[incident.priority]],
                  ['Estado', incident.status === 'resuelta' ? 'Resuelta' : 'Pendiente'],
                  ['Registrada', incident.createdAt],
                ].map(([label, value]) => (
                  <div key={label} className="border-[3px] border-brut-ink bg-white p-3 shadow-brut-sm">
                    <dt className="text-xs font-bold uppercase tracking-widest">{label}</dt>
                    <dd className="mt-1 font-display text-lg uppercase leading-tight">{value}</dd>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => toggleStatus(incident.id)}
                  className={`brut-press col-span-2 min-h-11 border-[3px] border-brut-ink py-3 font-display uppercase lg:col-span-1 ${
                    incident.status === 'resuelta' ? 'bg-brut-yellow' : 'bg-brut-green'
                  }`}
                >
                  {incident.status === 'resuelta' ? 'Reabrir incidencia' : 'Marcar como resuelta'}
                </button>
              </dl>

              {/* Edición de la descripción */}
              <form onSubmit={handleSave} className="mt-8 lg:mt-0">
                <label htmlFor="detail-description" className="mb-2 block text-xs font-bold uppercase tracking-widest">
                  ■ Descripción técnica (editable)
                </label>
                <textarea
                  id="detail-description"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={8}
                  className="min-h-[30vh] w-full resize-y border-[3px] border-brut-ink bg-white p-3 text-base shadow-brut-sm outline-none transition-[box-shadow,background-color] duration-150 focus:bg-brut-paper focus:shadow-brut motion-reduce:transition-none"
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={!isDirty}
                    className="brut-press min-h-11 border-[3px] border-brut-ink bg-brut-yellow px-6 py-3 font-display uppercase disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    Guardar descripción
                  </button>
                  <span className="text-xs font-bold uppercase" aria-live="polite">
                    {isDirty ? '● Cambios sin guardar' : '✓ Guardado'}
                  </span>
                </div>
              </form>
            </div>
          </>
        )}

        <IonToast
          className="brut-toast"
          isOpen={toastMessage !== null}
          message={toastMessage ?? ''}
          duration={2200}
          position="bottom"
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default IncidentDetail;
