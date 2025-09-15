# ✨ Gallery Component v2 ✨

Un componente de galería moderno, modular y altamente extensible construido con JavaScript puro.

Bienvenido a `GalleryComponent`, una potente solución para gestionar y mostrar colecciones de medios en tus aplicaciones web. Olvídate de los scripts de galería monolíticos y difíciles de personalizar. Hemos construido esto desde cero con una **arquitectura basada en componentes**, dándote la máxima flexibilidad y control.

## 🚀 Características Clave

*   **🧩 Verdaderamente Modular:** El `GalleryComponent` es el orquestador, pero el verdadero poder proviene de sus bloques de construcción. Cada parte de la UI es su propio componente independiente:
    *   `ToolbarComponent`: Una barra de herramientas inteligente y responsiva con un menú de desbordamiento automático "Más...".
    *   `ItemsGridComponent`: Una cuadrícula flexible para mostrar tus medios, configurable para diferentes layouts y relaciones de aspecto.
    *   `NavigationListComponent`: Un componente limpio para la navegación por carpetas o categorías.
    *   `ModalComponent`: Un sistema de modales genérico y potente para previsualizaciones, diálogos y formularios.
*   **🔌 Agnóstico al Backend:** Conéctalo a cualquier backend o fuente de datos que desees. El componente opera sobre un simple contrato `dataSource`. Solo tienes que implementar los métodos requeridos (`onLoadItems`, `onDeleteItem`, etc.) y listo.
*   **🎨 Personalizable con Temas:** Adapta fácilmente la apariencia usando variables CSS. Se proporciona un tema oscuro por defecto, pero puedes crear el tuyo para que coincida con el diseño de tu aplicación.
*   **⚙️ Extensible con Plugins:** Añade nueva funcionalidad sin tocar el código principal. El sistema de plugins te permite agregar botones personalizados a la barra de herramientas e implementar flujos de trabajo complejos.
*   **Vanilla JS, Sin Dependencias:** Construido con módulos de JavaScript puros. Sin frameworks, sin pasos de compilación complejos. Solo código moderno y limpio.

## 💡 La Visión

Este proyecto nació de la necesidad de una galería que fuera a la vez potente y fácil de adaptar. La filosofía central es la **separación de responsabilidades**. El `GalleryComponent` se encarga del "qué" (la lógica y el estado), mientras que los sub-componentes se encargan del "cómo" (la presentación).

Esta arquitectura no solo hace que el código sea más limpio y fácil de mantener, sino que también significa que puedes **reutilizar los componentes individuales** (`ToolbarComponent`, `ModalComponent`, etc.) en otras partes de tu aplicación.

## 🏁 Cómo Empezar

1.  Incluye los archivos de los componentes en tu proyecto.
2.  Crea un elemento contenedor en tu HTML.
3.  Instancia el componente con un `dataSource`.

```html
<!-- index.html -->
<div id="my-gallery"></div>

<script type="module">
    import GalleryComponent from './components/GalleryComponent/GalleryComponent.js';

    const myDataSource = {
        // Implementa tu lógica de obtención de datos aquí
        onLoadItems: async (folderId) => {
            // ej., fetch('/api/items', { body: JSON.stringify({ folderId }) })
            return [
                { id: 1, name: 'Mi Primera Imagen', thumbSrc: '...', mediaUrl: '...' },
                { id: 2, name: 'Otra Imagen', thumbSrc: '...', mediaUrl: '...' }
            ];
        },
        // ... otros métodos como onDeleteItem, onRenameItem, etc.
    };

    const gallery = new GalleryComponent('#my-gallery', {
        dataSource: myDataSource
    });
</script>
```

## 🔮 ¿Qué Sigue? (Visión para v3)

El viaje no termina aquí. La versión 3 se centrará en llevar el sistema `notify` a su máximo potencial, permitiendo actualizaciones en tiempo real para tareas de fondo de larga duración como la transcodificación de video o la generación de imágenes por IA, con retroalimentación visual directamente en la interfaz de usuario.