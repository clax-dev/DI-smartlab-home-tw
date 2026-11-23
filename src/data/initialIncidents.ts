import { Incident } from '../types/incident';

/**
 * Datos semilla de la vista Home.
 * Viven fuera del componente para que Home solo se ocupe de pintar y coordinar estado.
 */
export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    title: 'Fallo de enlace en Switch Rack B',
    location: 'Aula 204 - Redes',
    description: 'Pérdida intermitente de paquetes en puertos Gigabit 12 al 16.',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '09:15',
  },
  {
    id: 'INC-102',
    title: 'Actualización de imágenes Docker',
    location: 'Laboratorio DAM 2',
    description: 'Desplegar imagen base Node 22 Alpine en estaciones de trabajo.',
    priority: 'media',
    status: 'pendiente',
    createdAt: '10:30',
  },
  {
    id: 'INC-103',
    title: 'Calibración de proyector láser',
    location: 'Aula Magna',
    description: 'Ajuste trapezoidal y verificación de entrada HDMI.',
    priority: 'baja',
    status: 'resuelta',
    createdAt: 'Ayer',
  },
  {
    id: 'INC-104',
    title: 'Certificado SSL caducado en intranet',
    location: 'Servidor CPD',
    description: 'El navegador muestra aviso de seguridad al acceder al portal del alumnado.',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '11:05',
  },
  {
    id: 'INC-105',
    title: 'Teclados sin respuesta en puestos 7 y 8',
    location: 'Aula 102',
    description: 'Revisar puertos USB frontales y sustituir periféricos si procede.',
    priority: 'baja',
    status: 'pendiente',
    createdAt: '12:40',
  },
];
