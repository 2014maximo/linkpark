# LinkPark - Start Page Personal

Una aplicación web para gestionar tus links favoritos organizados por categorías, similar a start.me. Los datos se almacenan localmente en el navegador usando IndexedDB.

## Características

- ✅ Organización de links por categorías
- ✅ Importación/Exportación de links desde archivos `.txt`
- ✅ Búsqueda y filtrado de links
- ✅ Drag & drop para reordenar links y categorías
- ✅ Edición y eliminación de links y categorías
- ✅ Favicons automáticos usando Google Favicon API
- ✅ Estilo dark mode
- ✅ Links abren en nueva pestaña (`target="_blank"`)
- ✅ Almacenamiento local en IndexedDB
- ✅ Despliegue en GitLab Pages

## Formato de archivo .txt

El formato para importar/exportar links es:

```
URL | Nombre | Categoría
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

# Aprobar scripts de build (solo la primera vez)
pnpm approve-builds esbuild

# Iniciar servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Vista previa de la build
pnpm preview
```

## Despliegue en GitLab Pages

El proyecto está configurado para despliegue automático en GitLab Pages mediante CI/CD.

### Pasos:

1. Crea un repositorio en GitLab
2. Sube el código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://gitlab.com/usuario/linkpark.git
   git push -u origin main
   ```
3. GitLab CI/CD construirá y desplegará automáticamente el sitio
4. Accede a tu sitio en: `https://usuario.gitlab.io/linkpark/`

### Configuración opcional:

Si quieres usar un dominio personalizado:
1. Ve a Settings > Pages en GitLab
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## Estructura del proyecto

```
linkpark/
├── src/
│   ├── components/       # Componentes React
│   │   ├── LinkManager.tsx
│   │   ├── LinkCard.tsx
│   │   ├── AddLinkModal.tsx
│   │   └── CategoryManager.tsx
│   ├── layouts/          # Layouts de Astro
│   │   └── Layout.astro
│   ├── lib/              # Utilidades
│   │   └── db.ts         # IndexedDB
│   ├── pages/            # Páginas de Astro
│   │   └── index.astro
│   ├── styles/           # Estilos globales
│   │   └── global.css
│   └── types/            # Tipos TypeScript
│       └── index.ts
├── public/               # Archivos estáticos
│   └── favicon.svg
├── .gitlab-ci.yml        # Configuración CI/CD
└── astro.config.mjs      # Configuración de Astro
```

## Tecnologías

- **Astro** - Framework web
- **React** - Componentes interactivos
- **Tailwind CSS** - Estilos
- **IndexedDB** - Almacenamiento local (vía `idb`)
- **@dnd-kit** - Drag & drop
- **Lucide React** - Íconos

## Notas

- Los datos se almacenan localmente en el navegador de cada usuario
- Cada visitante puede gestionar sus propios links
- No hay backend ni sincronización entre dispositivos
- Para sincronizar, exporta/importa el archivo `.txt`
