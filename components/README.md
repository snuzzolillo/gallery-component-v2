# 🏛️ Arquitectura de Componentes

Este documento explica el "porqué" y el "cómo" de la arquitectura basada en componentes utilizada en este proyecto.

## La Filosofía: Separación de Responsabilidades

El objetivo principal de esta arquitectura es alejarse de un único y monolítico `GalleryComponent` que lo hace todo. En su lugar, hemos desglosado la interfaz de usuario y la lógica en componentes más pequeños, independientes y reutilizables.

Este enfoque proporciona varias ventajas clave:
*   **Mantenibilidad:** Es mucho más fácil corregir un error o añadir una característica a un componente pequeño y enfocado que a uno gigante y complejo.
*   **Reutilización:** Componentes como `ToolbarComponent` o `ModalComponent` son genéricos por diseño. Puedes tomarlos y usarlos en partes completamente diferentes de tu aplicación, no solo dentro de la galería.
*   **Testabilidad:** Cada componente puede ser probado de forma aislada, asegurando que su API y eventos funcionen como se espera antes de integrarlo en el sistema más grande.

## Los Actores: Roles y Responsabilidades

La arquitectura se construye en torno a un orquestador central y varios componentes "trabajadores" especializados.

### 👑 El Orquestador: `GalleryComponent`

El `GalleryComponent` es el cerebro de la operación. Es el **único componente que mantiene el estado de la aplicación** y se comunica con el `dataSource`. Sus principales responsabilidades son:
1.  **Gestión de Estado:** Sabe qué carpeta está activa, qué ítems están seleccionados y qué datos están cargados actualmente.
2.  **Ejecución de Lógica:** Cuando un usuario hace clic en "Borrar" en el `ToolbarComponent`, el `GalleryComponent` recibe el evento, muestra una confirmación usando el `ModalComponent` y, si se confirma, llama al método `onDeleteItem` en el `dataSource`.
3.  **Flujo de Datos:** Obtiene datos del `dataSource` y pasa las piezas necesarias a los componentes de presentación.

### 👷 Los Trabajadores: Componentes de Presentación

Estos componentes son "tontos" por diseño. No saben nada sobre la lógica de la aplicación. Reciben datos, los renderizan y emiten eventos cuando el usuario interactúa con ellos.

*   **`ItemsGridComponent`**:
    *   **Recibe:** Un array de objetos de ítems.
    *   **Hace:** Los renderiza en una cuadrícula CSS.
    *   **Emite:** `itemClick`, `actionClick` cuando un usuario interactúa con un ítem.

*   **`ToolbarComponent`**:
    *   **Recibe:** Un array de configuraciones de botones/controles.
    *   **Hace:** Renderiza una barra de herramientas, manejando el desbordamiento responsivo automáticamente.
    *   **Emite:** `buttonClick` cuando un usuario hace clic en un botón.

*   **`NavigationListComponent`**:
    *   **Recibe:** Un array de objetos de carpetas/categorías.
    *   **Hace:** Renderiza una lista de navegación simple.
    *   **Emite:** `item:select` cuando un usuario hace clic en un ítem.

*   **`ModalComponent`**:
    *   **Recibe:** Contenido HTML y una configuración de botones.
    *   **Hace:** Muestra un diálogo modal.
    *   **Emite:** `buttonClick` cuando se hace clic en un botón de acción.

Este patrón de comunicación (eventos hacia arriba, datos y llamadas a la API hacia abajo) mantiene el sistema desacoplado, robusto y fácil de entender.