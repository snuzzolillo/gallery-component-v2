# GalleryComponent

**Versión:** 16.0.0

## Propósito

El `GalleryComponent` es el componente principal y orquestador de toda la aplicación de galería. Integra todos los demás sub-componentes (`ToolbarComponent`, `ItemsGridComponent`, `NavigationListComponent`, `ModalComponent`) para proporcionar una experiencia de gestión de medios completa y cohesiva.

### Responsabilidades Clave

- **Orquestación:** Inicializa y gestiona el ciclo de vida de todos los sub-componentes.
- **Gestión de Estado:** Mantiene el estado principal de la aplicación, como la carpeta actual, los ítems cargados y la selección actual.
- **Comunicación con `dataSource`:** Actúa como el único punto de contacto con el `dataSource` para realizar operaciones CRUD (Cargar, Crear, Renombrar, Borrar) tanto para ítems como para carpetas.
- **Manejo de Lógica de Negocio:** Implementa la lógica para acciones complejas que involucran múltiples componentes, como mover un ítem (requiere un modal de selección y una llamada al `dataSource`).
- **API Pública:** Expone una API para controlar la galería desde el exterior y un sistema `notify` para recibir actualizaciones en tiempo real.

## API Pública

- `constructor(containerSelector, options)`: Inicializa el componente.
- `initialize()`: Carga los datos iniciales (carpetas e ítems).
- `notify(type, payload)`: Permite que sistemas externos "empujen" actualizaciones de estado al componente.
- `load(folderId)`: Carga y renderiza los ítems de una carpeta específica.
- `setTitle(title)`: Establece el título principal visible en la barra de herramientas.
- `getSelectedItems()`: Devuelve un array con los objetos de los ítems seleccionados.
- `clearSelection()`: Deselecciona todos los ítems.
- `selectAll()`: Selecciona todos los ítems visibles.
- `toggleFolderPanel(forceState)`: Muestra u oculta el panel de carpetas.

## Eventos Emitidos

- `selectionChanged`: Se dispara cuando la selección de ítems cambia. `detail: { selectedItems }`.
- `itemPreview`: Se dispara cuando un usuario solicita una vista previa de un ítem. `detail: { item }`.
- `onActionComplete`: Se dispara después de que una acción sobre un ítem (como borrar o mover) se completa. `detail: { action, items }`.