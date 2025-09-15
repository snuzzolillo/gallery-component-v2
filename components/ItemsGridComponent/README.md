# ItemsGridComponent

## Propósito

El `ItemsGridComponent` es un componente especializado en renderizar una cuadrícula de ítems (como imágenes, videos, etc.). Su única responsabilidad es la presentación visual de los datos que recibe. Es agnóstico a la lógica de negocio y se controla completamente a través de su API pública.

### Responsabilidades Clave

- **Renderizado de Cuadrícula:** Muestra una colección de ítems en un layout de CSS Grid.
- **Flexibilidad de Layout:** Permite configurar la dirección del scroll (vertical/horizontal) y forzar un número fijo de columnas o filas.
- **Gestión de Estado Visual:** Muestra el estado de selección de cada ítem y los menús de acciones contextuales.
- **Emisión de Eventos:** Captura las interacciones del usuario sobre los ítems (clic, doble clic, clic en acción) y las emite como eventos semánticos para que el componente padre los maneje.

## API Pública

- `constructor(container, options)`: Inicializa el componente con opciones de layout (ej. `itemSize`, `aspectRatio`, `layout`).
- `setItems(items)`: Recibe un array de objetos de ítems y re-renderiza completamente la cuadrícula. Cada ítem puede tener propiedades como `isSelected` y `actions`.

## Eventos Emitidos

- `itemClick`: Se dispara con un clic normal sobre un ítem. `detail: { itemId, originalEvent }`.
- `itemDblClick`: Se dispara con un doble clic sobre un ítem. `detail: { itemId }`.
- `actionClick`: Se dispara cuando se hace clic en un botón de acción de un ítem. `detail: { itemId, action }`.