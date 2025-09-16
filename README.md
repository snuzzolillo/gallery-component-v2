# ✨ Gallery Component v2 ✨

A modern, modular, and highly extensible gallery component built with pure JavaScript.

Welcome to `GalleryComponent`, a powerful solution for managing and displaying media collections in your web applications. Forget about monolithic and hard-to-customize gallery scripts. We've built this from the ground up with a **component-based architecture**, giving you maximum flexibility and control.

## 🚀 Key Features

*   **🧩 Truly Modular:** The `GalleryComponent` is the orchestrator, but the real power comes from its building blocks. Each part of the UI is its own independent component:
    *   `ToolbarComponent`: A smart and responsive toolbar with an automatic "More..." overflow menu.
    *   `ItemsGridComponent`: A flexible grid to display your media, configurable for different layouts and aspect ratios.
    *   `NavigationListComponent`: A clean component for navigating through folders or categories.
    *   `ModalComponent`: A generic and powerful modal system for previews, dialogs, and forms.
*   **🔌 Backend Agnostic:** Connect it to any backend or data source you want. The component operates on a simple `dataSource` contract. Just implement the required methods (`onLoadItems`, `onDeleteItem`, etc.), and you're good to go.
*   **🎨 Themable:** Easily adapt the look and feel using CSS variables. A default dark theme is provided, but you can create your own to match your application's design.
*   **⚙️ Extensible with Plugins:** Add new functionality without touching the core code. The plugin system allows you to add custom buttons to the toolbar and implement complex workflows.
*   **Vanilla JS, No Dependencies:** Built with pure JavaScript modules. No frameworks, no complex build steps. Just modern, clean code.

## 💡 The Vision

This project was born from the need for a gallery that was both powerful and easy to adapt. The core philosophy is the **separation of concerns**. The `GalleryComponent` handles the "what" (the logic and state), while the sub-components handle the "how" (the presentation).

This architecture not only makes the code cleaner and easier to maintain, but it also means you can **reuse the individual components** (`ToolbarComponent`, `ModalComponent`, etc.) in other parts of your application.

## 🏁 Getting Started

1.  Include the component files in your project.
2.  Create a container element in your HTML.
3.  Instantiate the component with a `dataSource`.

```html
<!-- index.html -->
<div id="my-gallery"></div>

<script type="module">
    import GalleryComponent from './components/GalleryComponent/GalleryComponent.js';

    const myDataSource = {
        // Implement your data fetching logic here
        onLoadItems: async (folderId) => {
            // ej., fetch('/api/items', { body: JSON.stringify({ folderId }) })
            return [
                { id: 1, name: 'My First Image', thumbSrc: '...', mediaUrl: '...' },
                { id: 2, name: 'Another Image', thumbSrc: '...', mediaUrl: '...' }
            ];
        },
        // ... other methods like onDeleteItem, onRenameItem, etc.
    };

    const gallery = new GalleryComponent('#my-gallery', {
        dataSource: myDataSource
    });
</script>
```

## 🔮 ¿Qué Sigue? (Visión para v3)

El viaje no termina aquí. La versión 3 se centrará en llevar el sistema `notify` a su máximo potencial, permitiendo actualizaciones en tiempo real para tareas de fondo de larga duración como la transcodificación de video o la generación de imágenes por IA, con retroalimentación visual directamente en la interfaz de usuario.