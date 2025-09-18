# ToolbarComponent

**Version:** 2.1.0

## Purpose

The `ToolbarComponent` renders a configurable toolbar. It is a generic UI component designed to display a collection of actions and controls.

### Key Responsibilities

- **Item Rendering:** Displays a variety of item types, such as buttons, separators, spacers, and search fields.
- **Overflow Handling:** Implements "smart" logic that detects when buttons do not fit in the available space. Buttons that overflow are automatically moved to a "More..." (`...`) dropdown menu.
- **Event Emission:** Captures clicks on buttons and search inputs, and emits them as events for the parent component to handle.

## Public API

- `constructor(container, options)`: Initializes the toolbar.
- `setItems(itemConfigs)`: Receives an array of object configurations and renders or updates the toolbar.

## Emitted Events

- `buttonClick`: Fired when a button is clicked. `detail: { actionId }`.
- `searchInput`: Fired when a search is performed (currently on `Enter`). `detail: { id, value }`.