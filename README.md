# LinkPark - Start Page Personal

Una aplicación web para gestionar tus links favoritos organizados por categorías, similar a start.me. Los datos se almacenan localmente en el navegador usando IndexedDB.

## Características

- Organización de links por categorías con orden personalizado
- Drag & drop de links (entre categorías y reordenar dentro)
- Drag & drop de categorías (reordenar)
- Búsqueda por nombre y URL de links
- Filtrado por categoría
- Favicons automáticos usando DuckDuckGo Favicon API
- Importación/Exportación de links desde archivos `.txt`
- Resolución de duplicados al importar (skip / reemplazar / agregar)
- Compartir links vía Web Share API (mobile)
- Personalización de fondo (presets desktop/mobile + imagen custom)
- Templates/temas: LinkPark (Six Caps) y Visual Text (Open Sans)
- Borrar selectivo: todo / solo links / categorías+links / solo fondo
- Estilo glassmorphism con dark mode
- Links abren en nueva pestaña (`target="_blank"`)
- Almacenamiento local en IndexedDB (sin backend)
- Responsive con controles adaptados a mobile
- Despliegue en GitLab Pages y GitHub Pages

## Formato de archivo .txt

El formato para importar/exportar links es:

```
URL | Nombre | Categoría
URL | Nombre | Categoría | FaviconUrl (opcional)
```

Ejemplo:
```
https://google.com | Google | Búsqueda
https://github.com | GitHub | Desarrollo
https://youtube.com | YouTube | Entretenimiento
```

Si no se especifica categoría, se asigna "General" por defecto.

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Vista previa de la build
pnpm preview
```

## Despliegue

El proyecto incluye configuración para despliegue automático:

- **GitLab Pages**: `.gitlab-ci.yml`
- **GitHub Pages**: `.github/workflows/static.yml`

Ambos se ejecutan automáticamente al hacer push a la rama `main`.

## Estructura del proyecto

```
linkpark/
├── src/
│   ├── components/
│   │   ├── LinkManager.tsx              # Componente raíz (estado, import/export, DnD)
│   │   ├── LinkCard.tsx                 # Card de link con favicon y drag
│   │   ├── LinksManager.tsx             # Modal gestionar links de categoría
│   │   ├── CategoryManager.tsx          # Modal gestionar categorías
│   │   ├── SortableCategoryContainer.tsx # Contenedor de categoría draggable
│   │   ├── BackgroundPicker.tsx         # Modal seleccionar fondo
│   │   ├── TemplateModal.tsx            # Modal seleccionar tema
│   │   ├── ExportModal.tsx              # Modal nombrar archivo export
│   │   ├── DuplicateModal.tsx           # Modal resolver duplicados
│   │   └── AuthorBadge.tsx              # Firma del autor
│   ├── layouts/
│   │   └── Layout.astro                 # Layout base HTML
│   ├── lib/
│   │   ├── db.ts                        # Operaciones IndexedDB
│   │   ├── importExport.ts              # Parseo y exportación de texto
│   │   ├── favicon.ts                   # Generación de URLs de favicons
│   │   └── useIsMobile.ts              # Hook detección mobile
│   ├── pages/
│   │   └── index.astro                  # Página única
│   ├── styles/
│   │   └── global.css                   # Tailwind + estilos custom
│   └── types/
│       └── index.ts                     # Tipos TypeScript
├── public/                              # Archivos estáticos (fondos, favicons)
├── .gitlab-ci.yml                       # CI/CD GitLab
├── .github/workflows/static.yml         # CI/CD GitHub
└── astro.config.mjs                     # Configuración Astro
```

## Tecnologías

- **Astro 7** - Framework web (SSG estático)
- **React 19** - Componentes interactivos
- **Tailwind CSS 4** - Estilos
- **IndexedDB** - Almacenamiento local (vía `idb`)
- **@dnd-kit** - Drag & drop
- **Lucide React** - Íconos

## Notas

- Los datos se almacenan localmente en el navegador de cada usuario
- Cada visitante puede gestionar sus propios links
- No hay backend ni sincronización entre dispositivos
- Para sincronizar, exporta/importa el archivo `.txt`
