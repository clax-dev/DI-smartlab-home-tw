import React, { useMemo, useRef, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToast,
  IonToolbar,
  RefresherEventDetail,
} from '@ionic/react';
import {
  addOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  layersOutline,
  timeOutline,
} from 'ionicons/icons';
import KpiCard from '../components/KpiCard';
import IncidentItem from '../components/IncidentItem';
import NewIncidentModal from '../components/NewIncidentModal';
import { INITIAL_INCIDENTS } from '../data/initialIncidents';
import { FilterOption, Incident, NewIncidentData } from '../types/incident';

/**
 * Home: componente "contenedor".
 * - Es el dueño del estado (lista, búsqueda, filtro, modal, toast).
 * - Los hijos (KpiCard, IncidentItem, NewIncidentModal) reciben datos por props
 *   y devuelven eventos por callbacks → flujo de datos unidireccional.
 *
 * Estrategia responsive (mobile-first, breakpoints de Tailwind):
 *   Mobile  (<768px)    → 1 columna, KPIs 2×2, botón flotante (FAB) para crear.
 *   Tablet  (md ≥768px) → KPIs en 1 fila de 4, tarjetas en 2 columnas.
 *   Desktop (lg ≥1024px)→ layout de 2 columnas: panel lateral fijo (KPIs + filtros + botón)
 *                         y rejilla de tarjetas; el FAB se oculta.
 */
const Home: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Referencia a IonList para cerrar las tarjetas deslizadas tras una acción
  const listRef = useRef<HTMLIonListElement | null>(null);

  // Datos derivados: se recalculan solo cuando cambia la lista (useMemo)
  const metrics = useMemo(() => {
    const pending = incidents.filter((i) => i.status === 'pendiente');
    return {
      total: incidents.length,
      pending: pending.length,
      resolved: incidents.length - pending.length,
      critical: pending.filter((i) => i.priority === 'alta').length,
    };
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return incidents.filter((i) => {
      const matchesStatus = activeFilter === 'todas' || i.status === activeFilter;
      const matchesQuery =
        query === '' ||
        i.title.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [incidents, activeFilter, searchQuery]);

  // ---- Manejadores de eventos (los hijos los invocan vía props) ----

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      setToastMessage('Estado sincronizado con el servidor');
      event.detail.complete();
    }, 700);
  };

  const handleToggleStatus = async (id: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === 'pendiente' ? 'resuelta' : 'pendiente' } : i
      )
    );
    await listRef.current?.closeSlidingItems();
    setToastMessage(`Estado de ${id} actualizado`);
  };

  const handleDelete = async (id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    await listRef.current?.closeSlidingItems();
    setToastMessage(`Incidencia ${id} eliminada`);
  };

  const handleCreate = (data: NewIncidentData) => {
    const newIncident: Incident = {
      ...data,
      id: `INC-${Math.floor(106 + Math.random() * 893)}`,
      status: 'pendiente',
      createdAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
    setIncidents((prev) => [newIncident, ...prev]);
    setIsModalOpen(false);
    setToastMessage(`Incidencia ${newIncident.id} registrada`);
  };

  return (
    <IonPage>
      {/* ---------- Cabecera ---------- */}
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonTitle className="font-semibold tracking-tight">
            SmartLab Monitor
            <span className="ml-2 hidden text-sm font-normal text-blue-100 md:inline">
              · Gestión de incidencias del centro
            </span>
          </IonTitle>
          <IonButtons slot="end">
            <div className="mr-3 flex items-center gap-2" aria-live="polite">
              <span className="hidden text-xs font-medium text-blue-50 sm:inline">Pendientes:</span>
              <IonBadge color="light" className="px-2.5 py-1 font-bold text-blue-800">
                {metrics.pending}
              </IonBadge>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="crescent"
            refreshingText="Sincronizando..."
          />
        </IonRefresher>

        {/* Contenedor centrado: el ancho máximo evita líneas larguísimas en monitores grandes */}
        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12">
          {/* ---------- Intro + indicador de breakpoint ---------- */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
                Panel de incidencias
              </h1>
              <p className="mt-1 text-sm text-slate-600 lg:text-base">
                Laboratorios y aulas del ciclo DAM · actualizado en tiempo real
              </p>
            </div>
            {/* Muestra qué layout está activo: útil para comprobar el RWD en la defensa */}
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
              <span className="md:hidden">Vista Mobile</span>
              <span className="hidden md:inline lg:hidden">Vista Tablet</span>
              <span className="hidden lg:inline">Vista Desktop</span>
            </span>
          </div>

          {/* ---------- Layout principal: 1 columna → 2 columnas en lg ---------- */}
          <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-8">
            {/* Panel lateral (en móvil/tablet queda arriba, en escritorio a la izquierda y fijo) */}
            <aside className="space-y-6 lg:sticky lg:top-4">
              <section aria-labelledby="kpi-title">
                <h2
                  id="kpi-title"
                  className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Estado operativo
                </h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2">
                  <KpiCard label="Total" value={metrics.total} icon={layersOutline} tone="neutral" />
                  <KpiCard label="Pendientes" value={metrics.pending} icon={timeOutline} tone="warning" />
                  <KpiCard label="Críticas" value={metrics.critical} icon={alertCircleOutline} tone="danger" />
                  <KpiCard
                    label="Resueltas"
                    value={metrics.resolved}
                    icon={checkmarkCircleOutline}
                    tone="success"
                  />
                </div>
              </section>

              <section aria-label="Filtros de búsqueda" className="space-y-3">
                <IonSearchbar
                  value={searchQuery}
                  onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
                  placeholder="Código, título o aula"
                  debounce={200}
                  className="px-0"
                  aria-label="Buscar incidencias"
                />
                <IonSegment
                  value={activeFilter}
                  onIonChange={(e) => setActiveFilter((e.detail.value as FilterOption) ?? 'todas')}
                  className="rounded-lg bg-white"
                >
                  {/* IonLabel está en el Light DOM: aquí Tailwind sí aplica (normal-case quita las mayúsculas de Material).
                      Sin contadores: ya los muestran las KPI y así el texto cabe en 360px */}
                  <IonSegmentButton value="todas">
                    <IonLabel className="normal-case">Todas</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="pendiente">
                    <IonLabel className="normal-case">Pendientes</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="resuelta">
                    <IonLabel className="normal-case">Resueltas</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </section>

              {/* En escritorio no hay FAB: botón visible en el panel */}
              <IonButton
                expand="block"
                className="hidden font-semibold lg:block"
                onClick={() => setIsModalOpen(true)}
              >
                <IonIcon slot="start" icon={addOutline} />
                Nueva incidencia
              </IonButton>
            </aside>

            {/* ---------- Listado ---------- */}
            <section aria-labelledby="list-title" className="mt-6 lg:mt-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 id="list-title" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Incidencias registradas ({filteredIncidents.length})
                </h2>
                <span className="text-xs text-slate-500 lg:hidden">Desliza una tarjeta para ver acciones</span>
              </div>

              {filteredIncidents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No hay incidencias que coincidan con el filtro aplicado.
                  </p>
                </div>
              ) : (
                <IonList
                  ref={listRef}
                  lines="none"
                  className="grid gap-3 bg-transparent p-0 md:grid-cols-2 lg:gap-4"
                >
                  {filteredIncidents.map((incident) => (
                    <IncidentItem
                      key={incident.id}
                      incident={incident}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                    />
                  ))}
                </IonList>
              )}
            </section>
          </div>
        </div>

        {/* Botón flotante: solo móvil y tablet */}
        <IonFab slot="fixed" vertical="bottom" horizontal="end" className="mb-3 mr-3 lg:hidden">
          <IonFabButton onClick={() => setIsModalOpen(true)} aria-label="Registrar nueva incidencia">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <NewIncidentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
          onInvalid={setToastMessage}
        />

        <IonToast
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

export default Home;
