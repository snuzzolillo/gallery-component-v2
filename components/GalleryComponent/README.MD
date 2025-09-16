# GalleryComponent

**Version:** 16.0.0

## Purpose

The `GalleryComponent` is the main component and orchestrator of the entire gallery application. It integrates all other sub-components (`ToolbarComponent`, `ItemsGridComponent`, `NavigationListComponent`, `ModalComponent`) to provide a complete and cohesive media management experience.

### Key Responsibilities

- **Orchestration:** Initializes and manages the lifecycle of all sub-components.
- **State Management:** Maintains the main application state, such as the current folder, loaded items, and the current selection.
- **Communication with `dataSource`:** Acts as the single point of contact with the `dataSource` to perform CRUD operations (Load, Create, Rename, Delete) for both items and folders.
- **Business Logic Handling:** Implements the logic for complex actions involving multiple components, such as moving an item (requires a selection modal and a call to the `dataSource`).
- **Public API:** Exposes an API to control the gallery from the outside and a `notify` system to receive real-time updates.

## Public API

- `constructor(containerSelector, options)`: Initializes the component.
- `initialize()`: Loads initial data (folders and items).
- `notify(type, payload)`: Allows external systems to "push" state updates to the component.
- `load(folderId)`: Loads and renders the items for a specific folder.
- `setTitle(title)`: Sets the main title visible in the toolbar.
- `getSelectedItems()`: Returns an array with the selected item objects.
- `clearSelection()`: Deselects all items.
- `selectAll()`: Selects all visible items.
- `toggleFolderPanel(forceState)`: Shows or hides the folder panel.

## Emitted Events

- `selectionChanged`: Fired when the item selection changes. `detail: { selectedItems }`.
- `itemPreview`: Fired when a user requests a preview of an item. `detail: { item }`.
- `onActionComplete`: Fired after an action on an item (like delete or move) is completed. `detail: { action, items }`.