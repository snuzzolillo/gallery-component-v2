# ToolbarComponent

**Versión:** 2.1.0

## Propósito

El `ToolbarComponent` renderiza una barra de herramientas configurable. Es un componente de UI genérico diseñado para mostrar una colección de acciones y controles.

### Responsabilidades Clave

- **Renderizado de Ítems:** Muestra una variedad de tipos de ítems, como botones, separadores, espaciadores y campos de búsqueda.
- **Manejo de Desbordamiento:** Implementa una lógica "inteligente" que detecta cuándo los botones no caben en el espacio disponible. Los botones que se desbordan se mueven automáticamente a un menú desplegable "Más..." (`...`).
- **Emisión de Eventos:** Captura los clics en los botones y las entradas de búsqueda, y los emite como eventos para que el componente padre los maneje.

## API Pública

- `constructor(container, options)`: Inicializa la barra de herramientas.
- `setItems(itemConfigs)`: Recibe un array de configuraciones de objetos y renderiza o actualiza la barra de herramientas.

## Eventos Emitidos

- `buttonClick`: Se dispara cuando se hace clic en un botón. `detail: { actionId }`.
- `searchInput`: Se dispara cuando se realiza una búsqueda (actualmente en `Enter`). `detail: { id, value }`.