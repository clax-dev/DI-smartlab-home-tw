# SmartLab Monitor: Home responsive con React + Tailwind CSS

Práctica de **Desarrollo de Interfaces (0488)**, 2.º DAM.
Enunciado: *crear un proyecto nuevo en React con un componente Home, aplicarle Tailwind CSS, hacerlo responsive (desktop, tablet y mobile) y desplegarlo en Vercel.*

- **Stack:** React 18 + TypeScript, Ionic React 8 (componentes móviles), Tailwind CSS 3.4, y Vite 5 como bundler.
- **Base:** la guía técnica del profesor (`Guia_React_TailWind.pdf`, proyecto *SmartLab Incident Manager*), ampliada con un layout RWD de tres niveles y con el Home dividido en componentes.
- **Producción:** `URL_VERCEL` *(se rellena tras el despliegue)*.

---

## 1. Arquitectura

```
index.html ─► main.tsx ─► App.tsx (IonApp + IonReactRouter: "/" → "/home")
                                └─► pages/Home.tsx            ← contenedor: dueño del estado
                                      ├─ components/KpiCard.tsx         (presentación)
                                      ├─ components/IncidentItem.tsx    (presentación + gestos)
                                      └─ components/NewIncidentModal.tsx (formulario con estado local)
                                    data/initialIncidents.ts  (datos semilla)
                                    types/incident.ts         (modelo de dominio tipado)
                                    theme/variables.css       (@tailwind + tokens Ionic + Shadow DOM)
```

| Pieza | Responsabilidad | Por qué está separada |
|---|---|---|
| `Home.tsx` | Guarda el estado (lista, búsqueda, filtro, modal, toast), calcula los datos derivados (`useMemo`) y define el layout | Es el único punto donde cambian los datos |
| `KpiCard.tsx` | Pinta una métrica | Se reutiliza 4 veces con distintas props |
| `IncidentItem.tsx` | Pinta una incidencia, con sus acciones de deslizar (móvil) o botones (escritorio) | Aísla la parte visual de la lógica |
| `NewIncidentModal.tsx` | Gestiona los campos del formulario y su validación | El tecleo no provoca que Home se vuelva a pintar; Home solo recibe el resultado |
| `types/incident.ts` | Tipos `Incident`, `NewIncidentData`, `FilterOption` | Si una prop está mal, el error aparece al compilar y no en el navegador |

**Flujo de datos unidireccional:** el estado vive en `Home`. Los datos bajan a los hijos como *props* y los eventos suben como *callbacks* (`onToggleStatus`, `onDelete`, `onCreate`). Ningún hijo modifica la lista directamente.

## 2. Estrategia responsive (mobile-first)

Las clases de Tailwind sin prefijo se aplican a móvil. Los prefijos `md:` y `lg:` añaden cambios a partir de cada ancho mínimo.

| Vista | Ancho | Layout |
|---|---|---|
| **Mobile** | < 768 px | 1 columna, KPIs en rejilla 2×2, tarjetas apiladas, botón flotante (`IonFab`) para crear, acciones con el gesto de deslizar |
| **Tablet** | `md:` ≥ 768 px | KPIs en una fila de 4 (`md:grid-cols-4`), tarjetas en 2 columnas (`md:grid-cols-2`), subtítulo visible en la cabecera, modal centrado de 640 px |
| **Desktop** | `lg:` ≥ 1024 px | Dos columnas: un panel lateral fijo de 360 px (`lg:grid-cols-[360px_1fr]` + `lg:sticky`) con KPIs, filtros y botón, y a la derecha la rejilla de tarjetas. Se oculta el FAB (`lg:hidden`) y aparece un botón de borrar visible, porque con ratón no hay gesto de deslizar |

El contenido se limita a `max-w-7xl` y se centra, para que las líneas no se estiren en monitores grandes. La etiqueta *"Vista Mobile / Tablet / Desktop"* de la cabecera muestra qué layout está activo.

**Verificado** con emulación de dispositivo (Playwright + Chrome) a 360×800, 820×1180 y 1280×800. En los tres casos `scrollWidth === clientWidth`, es decir, no hay scroll horizontal. Las capturas están en `docs/capturas/`.

## 3. Tailwind dentro de Ionic: la frontera del Shadow DOM

Los componentes de Ionic (`ion-item`, `ion-button`, `ion-segment-button`…) encapsulan su interior en un Shadow DOM, y las clases de Tailwind no llegan dentro:

- **Light DOM** (`div`, `section`, el contenido de `IonItem` o `IonLabel`): aquí se usa Tailwind con normalidad.
- **Shadow DOM**: se personaliza con las CSS Custom Properties que expone Ionic (`--padding-start`, `--background`, `--width`, `--height`…), definidas en `src/theme/variables.css`.

Corrección respecto a la guía: la guía escribe `className="--padding-start: 16px"` sobre `IonItem`, pero eso no es una clase válida y el navegador lo ignora. Aquí esas variables se declaran en la clase `.incident-item` del CSS.

## 4. Accesibilidad

- Áreas táctiles de al menos 44 px (`min-h-11`) en los botones de estado y borrar.
- `aria-label` en todos los botones que solo tienen icono, y `aria-labelledby` en las secciones.
- Textos secundarios en `slate-500/600` sobre fondo blanco, con contraste AA (≥ 4,5:1).
- El contador de pendientes de la cabecera usa `aria-live="polite"`, así que los lectores de pantalla anuncian sus cambios.

## 5. Uso

Requiere Node.js 20 o superior.

```powershell
npm install
npm run dev        # desarrollo en http://localhost:5173
npm run build      # compilación de producción en dist/ (lo mismo que ejecuta Vercel)
npm run preview    # sirve dist/ en http://localhost:4173
```

## 6. Despliegue en Vercel

`vercel.json` declara el framework (Vite), el comando de build y la carpeta de salida (`dist`). También incluye una regla *rewrite* que redirige cualquier ruta a `index.html`. Sin esa regla, recargar `/home` daría un 404, porque esa ruta la gestiona React en el navegador y no existe como fichero en el servidor.

Hay dos formas de desplegar:
1. **Desde GitHub (recomendada):** subir el repo, y en vercel.com elegir *Add New → Project → Import* y pulsar *Deploy*. Después, cada `git push` a `main` vuelve a desplegar.
2. **Desde la CLI:** `npx vercel` (primera vez, enlaza el proyecto) y luego `npx vercel --prod`.

Alternativa con contenedor: `Dockerfile` + `nginx.conf` (ver la guía, paso 6).
