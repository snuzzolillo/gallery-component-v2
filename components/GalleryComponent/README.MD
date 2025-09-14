# GalleryComponent

**GalleryComponent** es un componente web moderno, flexible y de alto rendimiento para la gestión de galerías multimedia. Está diseñado desde cero para ser completamente agnóstico a la fuente de datos, permitiendo una integración sencilla con cualquier tipo de backend o API.

Su arquitectura se basa en una estricta separación de responsabilidades: el componente se encarga de la **interfaz de usuario**, mientras que el desarrollador provee la **lógica de negocio** a través de un adaptador de datos (`dataSource`).

## ✨ Características Principales

* **Arquitectura Desacoplada:** Conecta fácilmente a cualquier API (REST, GraphQL, etc.) o a un simple array de datos local implementando el contrato del `dataSource`.
* **Gestión de Carpetas (Opcional):** Soporta una estructura de múltiples carpetas con operaciones CRUD completas, pero puede funcionar en un modo de galería simple si no se necesita.
* **Operaciones CRUD de Ítems:** Funcionalidad completa para renombrar, borrar, mover y copiar ítems, tanto de forma individual como en lote.
* **Selección Múltiple y Acciones en Lote:** Una interfaz de usuario intuitiva para seleccionar múltiples ítems y aplicar acciones de forma masiva.
* **Previsualización de Medios:** Modal integrado para previsualizar imágenes, videos y audios.
* **Extensible a través de Plugins:** Añade funcionalidades complejas como subida de archivos o sistemas de generación sin modificar el código del núcleo.
* **Seguimiento de Tareas Asíncronas:**
    * **Estado `isPending`:** Renderiza automáticamente los ítems que están en proceso de creación o procesamiento.
    * **API `notify()`:** Permite a sistemas externos (como WebSockets) notificar al componente sobre el progreso de tareas de larga duración para actualizar la UI en tiempo real.

## 🚀 Inicio Rápido (Galería Visual Simple)

Puedes usar `GalleryComponent` como una simple galería de solo lectura con un array de datos local.

**1. HTML:**

<div id="my-gallery"></div>
<script type="module" src="main.js"></script>

**2. JavaScript (`main.js`):**

import GalleryComponent from './components/GalleryComponent/GalleryComponent.js';

// Tus datos pueden venir de cualquier lugar
const myImages = [
    { id: 1, name: 'Atardecer en la playa', thumbUrl: '...', mediaUrl: '...', type: 'image' },
    { id: 2, name: 'Montañas nevadas', thumbUrl: '...', mediaUrl: '...', type: 'image' }
];

// Inicializa el componente con un dataSource mínimo
new GalleryComponent('#my-gallery', {
    dataSource: {
        // Solo necesitas implementar el método onLoadItems
        async onLoadItems(folderId) {
            // folderId será null en este modo simple
            return myImages;
        }
    }
});

El componente detectará automáticamente que no hay métodos `onDeleteItem`, `onRenameItem`, etc., y ocultará los botones de acción, resultando en una galería de solo visualización.

## 🏛️ Arquitectura

El sistema se compone de tres piezas clave que trabajan en conjunto:

1.  **El Núcleo (`GalleryComponent.js`):** Es la "vista". Se encarga de renderizar toda la interfaz (panel de carpetas, cuadrícula, barra de herramientas, modales) y de gestionar el estado visual. Es genérico y no conoce la lógica de negocio.
2.  **El Adaptador de Datos (`dataSource`):** Es el "controlador de datos". Es un objeto que tú, como desarrollador, proporcionas al componente. Debe cumplir un "contrato", implementando los métodos que el componente necesita para leer y escribir datos (ej. `onLoadItems`, `onDeleteItem`). Actúa como el puente entre la UI genérica y tu backend específico.
3.  **Los Plugins (`plugins/`):** Son módulos aislados que añaden funcionalidades complejas (ej. `ImportPlugin`, `GenerationPlugin`). Se "enganchan" al ciclo de vida del componente a través de `hooks` para añadir botones y lógica sin alterar el núcleo.