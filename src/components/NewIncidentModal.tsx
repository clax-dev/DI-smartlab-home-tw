import React, { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { IncidentPriority, NewIncidentData } from '../types/incident';

export interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Devuelve los datos validados; el padre decide id, estado y fecha. */
  onCreate: (data: NewIncidentData) => void;
  /** Para avisar de errores de validación con el toast del padre. */
  onInvalid: (message: string) => void;
}

/**
 * Formulario de alta. Guarda su propio estado de campos (estado local)
 * y solo entrega al padre el resultado final: Home no necesita saber qué se teclea.
 */
const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ isOpen, onClose, onCreate, onInvalid }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('media');

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setPriority('media');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      onInvalid('El título y la ubicación son obligatorios');
      return;
    }
    onCreate({
      title: title.trim(),
      location: location.trim(),
      description: description.trim() || 'Sin observaciones adicionales.',
      priority,
    });
    resetForm();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="incident-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nueva incidencia</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} aria-label="Cerrar formulario">
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
          <IonItem className="rounded-lg border border-slate-200" lines="none">
            <IonInput
              label="Título de la incidencia *"
              labelPlacement="stacked"
              placeholder="Ej. Error de compilación en SDK"
              value={title}
              onIonInput={(e) => setTitle(e.detail.value ?? '')}
              required
            />
          </IonItem>

          {/* En tablet/escritorio ubicación y prioridad van en dos columnas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <IonItem className="rounded-lg border border-slate-200" lines="none">
              <IonInput
                label="Aula o ubicación *"
                labelPlacement="stacked"
                placeholder="Ej. Laboratorio 102"
                value={location}
                onIonInput={(e) => setLocation(e.detail.value ?? '')}
                required
              />
            </IonItem>
            <IonItem className="rounded-lg border border-slate-200" lines="none">
              <IonSelect
                label="Prioridad"
                labelPlacement="stacked"
                value={priority}
                onIonChange={(e) => setPriority(e.detail.value as IncidentPriority)}
              >
                <IonSelectOption value="alta">Alta (crítica)</IonSelectOption>
                <IonSelectOption value="media">Media (operativa)</IonSelectOption>
                <IonSelectOption value="baja">Baja (mantenimiento)</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>

          <IonItem className="rounded-lg border border-slate-200" lines="none">
            <IonTextarea
              label="Descripción técnica"
              labelPlacement="stacked"
              rows={4}
              placeholder="Detalla los síntomas observados..."
              value={description}
              onIonInput={(e) => setDescription(e.detail.value ?? '')}
            />
          </IonItem>

          <IonButton expand="block" type="submit" className="pt-2 font-semibold">
            Guardar incidencia
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  );
};

export default NewIncidentModal;
