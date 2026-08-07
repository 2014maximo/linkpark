# LinkPark

Start page personal para gestionar links favoritos organizados por categorías. Similar a start.me, con almacenamiento 100% local en el navegador.

## Arquitectura

- **Framework**: Astro 7 (SSG estático, `output: 'static'`)
- **UI interactiva**: React 19 (islas con `client:load`)
- **Estilos**: Tailwind CSS 4 (vía plugin de Vite)
- **Almacenamiento**: IndexedDB (librería `idb`)
- **Drag & Drop**: @dnd-kit (core + sortable)
- **Iconos**: Lucide React
- **Favicons**: DuckDuckGo Favicon API (`icons.duckduckgo.com`)
- **Base URL**: `/linkpark` (configurable en `astro.config.mjs`)
- **Despliegue**: GitLab Pages y GitHub Pages (workflows incluidos)

## Modelo de datos (IndexedDB)

**DB**: `links-manager-db` (versión 2)

### Object Stores

- **links**: `{ id, url, name, categoryId, order, createdAt, faviconUrl? }`
- **categories**: `{ id, name, order, createdAt }`
- **settings**: `{ key, value }` — claves: `backgroundImage` (data URL), `template` (string)

## Estructura del proyecto

```
src/
├── components/
│   ├── LinkManager.tsx          # Componente raíz (estado global, import/export, DnD, settings)
│   ├── LinkCard.tsx             # Card individual de link con favicon y DnD
│   ├── LinksManager.tsx         # Modal para gestionar links de una categoría (mobile)
│   ├── CategoryManager.tsx      # Modal para crear/editar/eliminar categorías
│   ├── SortableCategoryContainer.tsx  # Contenedor de categoría draggable + droppable
│   ├── BackgroundPicker.tsx     # Modal para seleccionar fondo (presets o custom)
│   ├── TemplateModal.tsx        # Modal para seleccionar template/tema
│   ├── ExportModal.tsx          # Modal para nombrar archivo de exportación
│   ├── DuplicateModal.tsx       # Modal para resolver conflictos de duplicados al importar
│   └── AuthorBadge.tsx          # Firma del autor (esquina inferior derecha)
├── layouts/
│   └── Layout.astro             # Layout base (HTML shell, fuentes, bg-layer)
├── lib/
│   ├── db.ts                    # Operaciones IndexedDB (CRUD links, categories, settings)
│   ├── importExport.ts          # parseLinksFile() y exportLinksToText()
│   ├── favicon.ts               # getFaviconUrl() — genera URL de favicon desde dominio
│   └── useIsMobile.ts           # Hook: detecta mobile via `pointer: coarse`
├── pages/
│   └── index.astro              # Página única (carga LinkManager con client:load)
├── styles/
│   └── global.css               # Tailwind + tema glassmorphism + tema visualtext
└── types/
    └── index.ts                 # Tipos: Link, Category, LinkData
```

## Features

- Organización de links por categorías con orden personalizado
- Drag & drop de links (entre categorías y reordenar dentro)
- Drag & drop de categorías (reordenar)
- Búsqueda por nombre y URL
- Filtrado por categoría
- Favicons automáticos (DuckDuckGo) con fallback y persistencia
- Importar links desde archivo `.txt` (formato: `URL | Nombre | Categoría | FaviconUrl?`)
- Exportar links a archivo `.txt` (ordenado por categoría y orden)
- Resolución de duplicados al importar (skip / reemplazar / agregar de todos modos)
- Compartir links vía Web Share API (mobile)
- Personalización de fondo (presets desktop/mobile + imagen custom)
- Templates/temas: `linkpark` (Six Caps + Open Sans Condensed) y `visualtext` (Open Sans, mayor contraste)
- Borrar selectivo: todo / solo links / categorías+links / solo fondo
- Almacenamiento 100% local (IndexedDB), sin backend
- Responsive (mobile detection para mostrar controles de DnD)

## Formato de archivo .txt

```
URL | Nombre | Categoría
URL | Nombre | Categoría | FaviconUrl
```

Categoría por defecto: "General" si no se especifica.

## Convenciones

- Componentes React en `src/components/` (PascalCase)
- Utilidades/lib en `src/lib/` (camelCase)
- Tipos en `src/types/index.ts`
- CSS: clases utilitarias de Tailwind + clases custom en `@layer components` (`.btn-primary`, `.btn-secondary`, `.input-field`, `.glass-container`, `.title-shadow`, `.text-shadow`)
- Modales: patrón `fixed inset-0 bg-black/50` con overlay click-to-close
- Glassmorphism: `backdrop-filter: blur(10px)` + bordes semi-transparentes
- Temas: clases en `body` (`theme-linkpark`, `theme-visualtext`)

## Comandos

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build estático a dist/
pnpm preview      # Preview de la build
```

## Documentación de Astro

- https://docs.astro.build
