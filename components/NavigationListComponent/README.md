# NavigationListComponent

**Versión:** 1.0.0

## Propósito

El `NavigationListComponent` es un componente simple y genérico para renderizar una lista de ítems navegables. Su propósito es únicamente la presentación y la notificación de la selección del usuario. Originalmente fue `TabsComponent`, pero se renombró para reflejar mejor su función de navegación.

### Responsabilidades Clave

- **Renderizado de Lista:** Muestra una lista de ítems en dirección vertical u horizontal.
- **Estado Activo:** Resalta visualmente el ítem que está actualmente activo.
- **Emisión de Eventos:** Emite un evento cuando un usuario hace clic en un ítem.

## API Pública

- `constructor(container, options)`: Inicializa la lista, permitiendo configurar la `direction` ('vertical' u 'horizontal').
- `setItems(items)`: Recibe un array de objetos y renderiza la lista. Cada objeto debe tener `id` y `name`.
- `setActiveItem(itemId)`: Establece visualmente qué ítem de la lista está activo.

## Eventos Emitidos

- `item:select`: Se dispara cuando se hace clic en un ítem. `detail: { itemId }`.