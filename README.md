# SmartLab Monitor: Home responsive con React + Tailwind CSS

Práctica de **Desarrollo de Interfaces (0488)**, 2.º DAM.
Enunciado: *crear un proyecto nuevo en React con un componente Home, aplicarle Tailwind CSS, hacerlo responsive (desktop, tablet y mobile) y desplegarlo en Vercel. Revisar que se ha aplicado **brutalismo, interacciones y layout con vh**.*

- **Stack:** React 18 + TypeScript, Ionic React 8 (componentes móviles), Tailwind CSS 3.4, y Vite 5 como bundler.
- **Base:** la guía técnica del profesor (`Guia_React_TailWind.pdf`, proyecto *SmartLab Incident Manager*), ampliada con un layout RWD de tres niveles y con el Home dividido en componentes.
- **Producción:** <https://smartlab-home-tw.vercel.app>.

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
| **Tablet** | `md:` ≥ 768 px | KPIs en una fila de 4 (`md:grid-cols-4`), tarjetas en 2 columnas (`md:grid-cols-2`), título del hero más grande, modal centrado de 640 px |
| **Desktop** | `lg:` ≥ 1024 px | Dos columnas: un panel lateral fijo de 360 px (`lg:grid-cols-[360px_1fr]` + `lg:sticky`) con KPIs-filtro, buscador y botón, y a la derecha la rejilla de tarjetas. Se oculta el FAB (`lg:hidden`) y aparece un botón de borrar visible, porque con ratón no hay gesto de deslizar |

El contenido se limita a `max-w-7xl` y se centra, para que las líneas no se estiren en monitores grandes. La pegatina *"Vista Mobile / Tablet / Desktop"* del hero muestra qué layout está activo.

**Verificado** con emulación de dispositivo (Playwright + Chrome) a 360×800, 820×1180 y 1280×800. En los tres casos `scrollWidth === clientWidth`, es decir, no hay scroll horizontal. Las capturas están en `docs/capturas/`.

## 3. Brutalismo, interacciones y layout con vh

### Brutalismo (estilo visual)
| Rasgo | Cómo se aplica (Tailwind) |
|---|---|
| Bordes negros gruesos | `border-[3px] border-brut-ink`, `border-b-4` |
| Sombras duras, sin desenfoque | `shadow-brut` = `6px 6px 0 0 #000` (definida en `tailwind.config.js`) |
| Colores planos y saturados | paleta `brut-*`: amarillo `#FFE14D`, rojo `#FF5C5C`, verde `#7CF29C`, azul `#6EC8FF`, papel `#F4F1EA` |
| Tipografía enorme y en mayúsculas | `font-display` (Archivo Black) en títulos, `font-mono` (Space Mono) en el resto, `uppercase`, `text-8xl` |
| Sin esquinas redondeadas | ningún `rounded-*`; en Ionic `--border-radius: 0` |
| Texturas crudas | fondo de puntos en `IonContent` y trama rayada en las incidencias resueltas |

### Interacciones
| Interacción | Implementación |
|---|---|
| Botón "físico": se levanta al pasar el ratón y se hunde al pulsar | clase `.brut-press` (`@apply hover:-translate-* hover:shadow-brut-lg active:translate-x-[6px] active:shadow-none`) |
| KPIs clicables que filtran el listado (Total, Pendientes, Críticas, Resueltas) | `KpiCard` es un `<button aria-pressed>`; el activo se ve invertido y hundido; pulsarlo otra vez quita el filtro |
| Tarjetas que se levantan con el ratón | `hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brut-lg` |
| Entrada animada al crear una incidencia | `animate-pop` (keyframes propios) |
| Marquesina con los contadores en vivo | `animate-marquee`; se pausa con `group-hover:[animation-play-state:paused]` |
| Buscador que se resalta al enfocar | `focus:bg-brut-yellow focus:shadow-brut` |
| Gesto de deslizar (móvil), FAB, modal y toast | componentes Ionic con sus variables CSS en estilo brutalista |

Accesibilidad de las interacciones: `future.hoverOnlyWhenSupported` evita el "hover pegado" en pantallas táctiles, todas las animaciones se desactivan con `motion-reduce:` y el foco de teclado se ve con un `outline` de 4px.

### Layout con vh
| Zona | Unidad | Por qué |
|---|---|---|
| Hero | `min-h-[38vh]` / `md:min-h-[32vh]` / `lg:min-h-[34vh]` | ocupa una parte fija de la pantalla en cualquier dispositivo |
| KPIs | `min-h-[12vh]` | crecen en pantallas altas |
| Panel lateral (desktop) | `lg:max-h-[calc(100vh-7rem)]` + `lg:sticky` | nunca supera la altura de la ventana; si no cabe, hace scroll propio |
| Listado (desktop) | `lg:min-h-[60vh]` | el layout no "salta" al filtrar y quedar pocas tarjetas |
| Estado vacío | `min-h-[30vh]` | el aviso mantiene presencia visual |
| Modal (tablet/desktop) | `--height: min(500px, 85vh)` | nunca se sale de la ventana en pantallas bajas |

## 4. Tailwind dentro de Ionic: la frontera del Shadow DOM

Los componentes de Ionic (`ion-item`, `ion-button`, `ion-segment-button`…) encapsulan su interior en un Shadow DOM, y las clases de Tailwind no llegan dentro:

- **Light DOM** (`div`, `section`, el contenido de `IonItem` o `IonLabel`): aquí se usa Tailwind con normalidad.
- **Shadow DOM**: se personaliza con las CSS Custom Properties que expone Ionic (`--padding-start`, `--background`, `--width`, `--height`…), definidas en `src/theme/variables.css`.

Corrección respecto a la guía: la guía escribe `className="--padding-start: 16px"` sobre `IonItem`, pero eso no es una clase válida y el navegador lo ignora. Aquí esas variables se declaran en la clase `.incident-item` del CSS.

## 5. Accesibilidad

- Áreas táctiles de al menos 44 px (`min-h-11`) en los botones de estado y borrar.
- `aria-label` en todos los botones que solo tienen icono, y `aria-labelledby` en las secciones.
- Texto negro sobre colores claros saturados: contraste AA (≥ 4,5:1) en todas las combinaciones.
- El contador de pendientes de la cabecera usa `aria-live="polite"`, así que los lectores de pantalla anuncian sus cambios.

## 6. Uso

Requiere Node.js 20 o superior.

```powershell
npm install
npm run dev        # desarrollo en http://localhost:5173
npm run build      # compilación de producción en dist/ (lo mismo que ejecuta Vercel)
npm run preview    # sirve dist/ en http://localhost:4173
```

## 7. Despliegue en Vercel

`vercel.json` declara el framework (Vite), el comando de build y la carpeta de salida (`dist`). También incluye una regla *rewrite* que redirige cualquier ruta a `index.html`. Sin esa regla, recargar `/home` daría un 404, porque esa ruta la gestiona React en el navegador y no existe como fichero en el servidor.

Hay dos formas de desplegar:
1. **Desde GitHub (recomendada):** subir el repo, y en vercel.com elegir *Add New → Project → Import* y pulsar *Deploy*. Después, cada `git push` a `main` vuelve a desplegar.
2. **Desde la CLI:** `npx vercel` (primera vez, enlaza el proyecto) y luego `npx vercel --prod`.

Alternativa con contenedor: `Dockerfile` + `nginx.conf` (ver la guía, paso 6).
