# 🏛️ Component Architecture

This document explains the "why" and "how" of the component-based architecture used in this project.

## The Philosophy: Separation of Concerns

The main goal of this architecture is to move away from a single, monolithic `GalleryComponent` that does everything. Instead, we have broken down the user interface and logic into smaller, independent, and reusable components.

This approach provides several key advantages:
*   **Maintainability:** It's much easier to fix a bug or add a feature to a small, focused component than to a giant, complex one.
*   **Reusability:** Components like `ToolbarComponent` or `ModalComponent` are generic by design. You can take them and use them in completely different parts of your application, not just within the gallery.
*   **Testability:** Each component can be tested in isolation, ensuring its API and events work as expected before integrating it into the larger system.

## The Actors: Roles and Responsibilities

The architecture is built around a central orchestrator and several specialized "worker" components.

### 👑 The Orchestrator: `GalleryComponent`

The `GalleryComponent` is the brain of the operation. It is the **only component that maintains the application state** and communicates with the `dataSource`. Its main responsibilities are:
1.  **State Management:** It knows which folder is active, which items are selected, and what data is currently loaded.
2.  **Logic Execution:** When a user clicks "Delete" in the `ToolbarComponent`, the `GalleryComponent` receives the event, shows a confirmation using the `ModalComponent`, and, if confirmed, calls the `onDeleteItem` method on the `dataSource`.
3.  **Data Flow:** It fetches data from the `dataSource` and passes the necessary pieces to the presentational components.

### 👷 The Workers: Presentational Components

These components are "dumb" by design. They know nothing about the application's logic. They receive data, render it, and emit events when the user interacts with them.

*   **`ItemsGridComponent`**:
    *   **Receives:** An array of item objects.
    *   **Does:** Renders them in a CSS grid.
    *   **Emits:** `itemClick`, `actionClick` when a user interacts with an item.

*   **`ToolbarComponent`**:
    *   **Receives:** An array of button/control configurations.
    *   **Does:** Renders a toolbar, automatically handling responsive overflow.
    *   **Emits:** `buttonClick` when a user clicks a button.

*   **`NavigationListComponent`**:
    *   **Receives:** An array of folder/category objects.
    *   **Does:** Renders a simple navigation list.
    *   **Emits:** `item:select` when a user clicks an item.

*   **`ModalComponent`**:
    *   **Receives:** HTML content and a button configuration.
    *   **Does:** Displays a modal dialog.
    *   **Emits:** `buttonClick` when an action button is clicked.

This communication pattern (events up, data and API calls down) keeps the system decoupled, robust, and easy to understand.