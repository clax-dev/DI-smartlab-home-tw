export type IncidentPriority = 'alta' | 'media' | 'baja';
export type IncidentStatus = 'pendiente' | 'resuelta';
/** 'critica' = pendiente y de prioridad alta. */
export type FilterOption = 'todas' | 'pendiente' | 'resuelta' | 'critica';

export interface Incident {
  id: string;
  title: string;
  location: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  createdAt: string;
}

/** Lo que aporta el usuario en el formulario: el resto de campos los genera la app. */
export type NewIncidentData = Pick<Incident, 'title' | 'location' | 'description' | 'priority'>;
