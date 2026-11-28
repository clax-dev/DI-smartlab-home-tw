import { useCallback, useSyncExternalStore } from 'react';
import { INITIAL_INCIDENTS } from '../data/initialIncidents';
import { Incident, NewIncidentData } from '../types/incident';

/**
 * Persistencia de incidencias en localStorage (Mejora 2 de la guía).
 *
 * Por qué un "almacén externo" y no un simple useState + useEffect:
 * Home y la ficha de detalle (/incident/:id) usan el hook a la vez. IonRouterOutlet
 * mantiene Home montado al navegar, así que con un useState por componente habría
 * DOS copias de la lista y editar en el detalle no se vería al volver.
 * Aquí la lista vive en UNA variable de módulo; cada componente se suscribe con
 * useSyncExternalStore y React lo vuelve a pintar cuando esa lista cambia.
 *
 * Flujo de una escritura: acción (p. ej. toggleStatus) → write() → localStorage + aviso
 * a los suscriptores → React pinta de nuevo Home y Detalle con la misma lista.
 */

const STORAGE_KEY = 'smartlab.incidents.v1';

type Listener = () => void;
const listeners = new Set<Listener>();

/** Comprobación mínima del formato: localStorage puede contener datos viejos o editados a mano. */
const isIncident = (value: unknown): value is Incident => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.location === 'string' &&
    typeof v.description === 'string' &&
    (v.priority === 'alta' || v.priority === 'media' || v.priority === 'baja') &&
    (v.status === 'pendiente' || v.status === 'resuelta') &&
    typeof v.createdAt === 'string'
  );
};

/** Lee la lista guardada; si no hay nada o está corrupta, usa los datos semilla. */
const load = (): Incident[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return INITIAL_INCIDENTS;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isIncident) ? parsed : INITIAL_INCIDENTS;
  } catch {
    // JSON inválido o localStorage bloqueado (modo privado): la app sigue funcionando en memoria
    return INITIAL_INCIDENTS;
  }
};

// Instantánea actual: useSyncExternalStore exige devolver la MISMA referencia mientras no cambie
let snapshot: Incident[] = load();

const write = (next: Incident[]) => {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Cuota llena o almacenamiento no disponible: se mantiene el estado en memoria
  }
  listeners.forEach((notify) => notify());
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  // Sincronización entre pestañas: el evento 'storage' solo llega a las OTRAS pestañas
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = load();
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

const getSnapshot = () => snapshot;

/** Genera un id INC-NNN que no choque con los existentes. */
const nextId = (list: Incident[]): string => {
  const max = list.reduce((acc, i) => {
    const n = Number.parseInt(i.id.replace('INC-', ''), 10);
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 100);
  return `INC-${max + 1}`;
};

export interface IncidentsStore {
  incidents: Incident[];
  /** Crea la incidencia y la devuelve (para mostrar su id en el toast). */
  addIncident: (data: NewIncidentData) => Incident;
  toggleStatus: (id: string) => void;
  deleteIncident: (id: string) => void;
  updateDescription: (id: string, description: string) => void;
  /** Vuelve a los datos semilla (útil en la demo). */
  resetIncidents: () => void;
}

export const useIncidentsStorage = (): IncidentsStore => {
  const incidents = useSyncExternalStore(subscribe, getSnapshot);

  const addIncident = useCallback((data: NewIncidentData): Incident => {
    const created: Incident = {
      ...data,
      id: nextId(snapshot),
      status: 'pendiente',
      createdAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
    write([created, ...snapshot]);
    return created;
  }, []);

  const toggleStatus = useCallback((id: string) => {
    write(
      snapshot.map((i) =>
        i.id === id ? { ...i, status: i.status === 'pendiente' ? 'resuelta' : 'pendiente' } : i
      )
    );
  }, []);

  const deleteIncident = useCallback((id: string) => {
    write(snapshot.filter((i) => i.id !== id));
  }, []);

  const updateDescription = useCallback((id: string, description: string) => {
    write(snapshot.map((i) => (i.id === id ? { ...i, description } : i)));
  }, []);

  const resetIncidents = useCallback(() => write(INITIAL_INCIDENTS), []);

  return { incidents, addIncident, toggleStatus, deleteIncident, updateDescription, resetIncidents };
};
