# ModalComponent

## Propósito

El `ModalComponent` es un componente de UI genérico y reutilizable para mostrar contenido en una ventana modal (o diálogo). Está diseñado para ser altamente configurable y desacoplado de cualquier lógica de negocio específica.

### Responsabilidades Clave

- **Presentación Modal:** Muestra un contenedor superpuesto que bloquea la interacción con el resto de la página.
- **Configuración Dinámica:** Permite establecer el título, el contenido (HTML), el tamaño y los botones de acción dinámicamente.
- **Manejo de Interacciones:** Captura los clics en los botones y en el botón de cierre, y los emite como eventos.

## API Pública

- `constructor(container)`: Inicializa el modal, añadiendo su esqueleto al DOM.
- `open()`: Muestra el modal.
- `close()`: Oculta el modal.
- `setContent(html)`: Establece el contenido HTML del cuerpo del modal.
- `setOptions(options)`: Configura el título, tamaño y los botones del modal.

## Eventos Emitidos

- `buttonClick`: Se dispara cuando se hace clic en un botón de acción del modal. `detail: { value }`.
- `close`: Se dispara cuando el modal se cierra (ya sea por el botón de cierre o mediante la API).