import React, { useMemo, useRef, useState } from 'react';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToast,
  IonToolbar,
  RefresherEventDetail,
  useIonRouter,
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
import { useIncidentsStorage } from '../hooks/useIncidentsStorage';
import { FilterOption, NewIncidentData } from '../types/incident';

/**
 * Home: componente "contenedor".
 * - La lista de incidencias vive en useIncidentsStorage (localStorage, compartida con la ficha de detalle).
 *   Home es dueño del estado de la vista: búsqueda, filtro, modal y toast.
 * - Los hijos (KpiCard, IncidentItem, NewIncidentModal) reciben datos por props
 *   y devuelven eventos por callbacks → flujo de datos unidireccional.
 *
 * Diseño: brutalismo (bordes de 3-4px, sombras duras, colores planos, tipografía enorme).
 *
 * Layout con vh + estrategia responsive (mobile-first, breakpoints de Tailwind):
 *   Hero      → min-h-[38vh] / md:[32vh] / lg:[34vh]: ocupa una fracción fija de la pantalla.
 *   Mobile  (<768px)    → 1 columna, KPIs 2×2, botón flotante (FAB) para crear.
 *   Tablet  (md ≥768px) → KPIs en 1 fila de 4, tarjetas en 2 columnas.
 *   Desktop (lg ≥1024px)→ 2 columnas: panel lateral fijo con alto máx. calc(100vh-…)
 *                         y listado con alto mínimo 60vh; el FAB se oculta.
 */
const Home: React.FC = () => {
  const { incidents, addIncident, toggleStatus, deleteIncident } = useIncidentsStorage();
  const router = useIonRouter();
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
      const matchesStatus =
        activeFilter === 'todas' ||
        (activeFilter === 'critica'
          ? i.status === 'pendiente' && i.priority === 'alta'
          : i.status === activeFilter);
      const matchesQuery =
        query === '' ||
        i.title.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [incidents, activeFilter, searchQuery]);

  // ---- Manejadores de eventos (los hijos los invocan vía props) ----

  /** Pulsar el KPI activo otra vez quita el filtro (comportamiento de interruptor). */
  const handleSelectFilter = (filter: FilterOption) =>
    setActiveFilter((current) => (current === filter ? 'todas' : filter));

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      setToastMessage('Estado sincronizado con el servidor');
      event.detail.complete();
    }, 700);
  };

  // Las acciones modifican el almacén (que persiste en localStorage); Home solo coordina la UI
  const handleToggleStatus = async (id: string) => {
    toggleStatus(id);
    await listRef.current?.closeSlidingItems();
    setToastMessage(`Estado de ${id} actualizado`);
  };

  const handleDelete = async (id: string) => {
    deleteIncident(id);
    await listRef.current?.closeSlidingItems();
    setToastMessage(`Incidencia ${id} eliminada`);
  };

  const handleCreate = (data: NewIncidentData) => {
    const created = addIncident(data);
    setIsModalOpen(false);
    setToastMessage(`Incidencia ${created.id} registrada`);
  };

  /** Navega a la ficha técnica (Mejora 3): la ruta /incident/:id la resuelve IonRouterOutlet. */
  const handleOpenDetail = async (id: string) => {
    await listRef.current?.closeSlidingItems();
    router.push(`/incident/${id}`, 'forward');
  };

  // Texto de la marquesina: se pinta dos veces para que la animación (translateX -50%) sea un bucle sin saltos
  const tickerText = `${metrics.pending} PENDIENTES /// ${metrics.critical} CRÍTICAS /// ${metrics.resolved} RESUELTAS /// LABORATORIOS DAM /// `;

  return (
    <IonPage>
      {/* ---------- Cabecera ---------- */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="brut-toolbar">
          <IonTitle className="font-display uppercase tracking-tight">
            SmartLab<span className="text-white">//</span>Monitor
          </IonTitle>
          <div slot="end" className="mr-4 flex items-center gap-2" aria-live="polite">
            <span className="hidden text-xs font-bold uppercase text-white sm:inline">Pendientes</span>
            <span className="border-2 border-brut-yellow px-2 py-0.5 font-display text-brut-yellow">
              {metrics.pending}
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="brut-bg">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="crescent"
            refreshingText="Sincronizando..."
          />
        </IonRefresher>

        {/* ---------- Hero: alto relativo a la ventana (vh) ---------- */}
        <section
          aria-labelledby="page-title"
          className="flex min-h-[38vh] flex-col justify-end border-b-4 border-brut-ink bg-brut-yellow md:min-h-[32vh] lg:min-h-[34vh]"
        >
          <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
            {/* Pegatina que indica el layout activo: útil para comprobar el RWD en la defensa */}
            <span className="mb-4 inline-block -rotate-2 border-[3px] border-brut-ink bg-white px-3 py-1 text-xs font-bold uppercase shadow-brut-sm transition-transform duration-150 hover:rotate-0">
              <span className="md:hidden">Vista Mobile</span>
              <span className="hidden md:inline lg:hidden">Vista Tablet</span>
              <span className="hidden lg:inline">Vista Desktop</span>
            </span>
            <h1
              id="page-title"
              className="font-display text-[2.6rem] uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-8xl"
            >
              Panel de
              <br />
              incidencias<span className="text-brut-red">.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm font-bold md:text-base">
              Laboratorios y aulas del ciclo DAM · actualizado en tiempo real
            </p>
          </div>
        </section>

        {/* ---------- Marquesina: se para al pasar el ratón y con "reducir movimiento" ---------- */}
        <div
          className="group overflow-hidden border-b-4 border-brut-ink bg-brut-ink py-2 text-brut-yellow"
          aria-hidden="true"
        >
          <div className="flex w-max animate-marquee whitespace-nowrap text-sm font-bold group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            <span className="pr-4">{tickerText.repeat(3)}</span>
            <span className="pr-4">{tickerText.repeat(3)}</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pb-12">
          {/* ---------- Layout principal: 1 columna → 2 columnas en lg ---------- */}
          <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-10">
            {/* Panel lateral: en escritorio queda fijo y su alto máximo depende de la ventana (vh) */}
            <aside className="space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:p-2">
              <section aria-labelledby="kpi-title">
                <h2 id="kpi-title" className="mb-3 text-xs font-bold uppercase tracking-widest">
                  ■ Estado operativo · pulsa para filtrar
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-2">
                  <KpiCard
                    label="Total"
                    value={metrics.total}
                    icon={layersOutline}
                    tone="neutral"
                    active={activeFilter === 'todas'}
                    onSelect={() => setActiveFilter('todas')}
                  />
                  <KpiCard
                    label="Pendientes"
                    value={metrics.pending}
                    icon={timeOutline}
                    tone="warning"
                    active={activeFilter === 'pendiente'}
                    onSelect={() => handleSelectFilter('pendiente')}
                  />
                  <KpiCard
                    label="Críticas"
                    value={metrics.critical}
                    icon={alertCircleOutline}
                    tone="danger"
                    active={activeFilter === 'critica'}
                    onSelect={() => handleSelectFilter('critica')}
                  />
                  <KpiCard
                    label="Resueltas"
                    value={metrics.resolved}
                    icon={checkmarkCircleOutline}
                    tone="success"
                    active={activeFilter === 'resuelta'}
                    onSelect={() => handleSelectFilter('resuelta')}
                  />
                </div>
              </section>

              {/* Buscador nativo: con Tailwind se controla el borde, la sombra y el foco (IonSearchbar los encapsula) */}
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest">■ Buscar</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Código, título o aula"
                  className="w-full border-[3px] border-brut-ink bg-white px-3 py-3 text-base font-bold shadow-brut-sm outline-none transition-[transform,box-shadow,background-color] duration-150 placeholder:font-normal placeholder:text-neutral-600 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:bg-brut-yellow focus:shadow-brut motion-reduce:transition-none"
                />
              </label>

              {/* En escritorio no hay FAB: botón visible en el panel */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="brut-press hidden w-full items-center justify-center gap-2 border-[3px] border-brut-ink bg-brut-red py-4 font-display text-lg uppercase lg:flex"
              >
                <IonIcon icon={addOutline} aria-hidden="true" className="text-2xl" />
                Nueva incidencia
              </button>
            </aside>

            {/* ---------- Listado: alto mínimo en vh para que el layout no "salte" al filtrar ---------- */}
            <section aria-labelledby="list-title" className="mt-10 lg:mt-0 lg:min-h-[60vh]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 id="list-title" className="font-display text-2xl uppercase lg:text-3xl">
                  Incidencias <span className="bg-brut-ink px-2 text-brut-yellow">{filteredIncidents.length}</span>
                </h2>
                <span className="border-2 border-brut-ink bg-white px-2 py-0.5 text-xs font-bold uppercase lg:hidden">
                  ← Desliza una tarjeta
                </span>
              </div>

              {filteredIncidents.length === 0 ? (
                <div className="flex min-h-[30vh] items-center justify-center border-[3px] border-dashed border-brut-ink bg-white p-8 text-center">
                  <p className="font-display text-xl uppercase">Nada por aquí. Cambia el filtro.</p>
                </div>
              ) : (
                <IonList
                  ref={listRef}
                  lines="none"
                  className="grid gap-5 bg-transparent p-2 md:grid-cols-2 lg:gap-6"
                >
                  {filteredIncidents.map((incident) => (
                    <IncidentItem
                      key={incident.id}
                      incident={incident}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                      onOpenDetail={handleOpenDetail}
                    />
                  ))}
                </IonList>
              )}
            </section>
          </div>
        </div>

        {/* Botón flotante: solo móvil y tablet */}
        <IonFab slot="fixed" vertical="bottom" horizontal="end" className="mb-4 mr-4 lg:hidden">
          <IonFabButton
            className="brut-fab"
            onClick={() => setIsModalOpen(true)}
            aria-label="Registrar nueva incidencia"
          >
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

export default Home;
