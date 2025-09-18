# ItemsGridComponent

## Purpose

The `ItemsGridComponent` is a specialized component for rendering a grid of items (like images, videos, etc.). Its sole responsibility is the visual presentation of the data it receives. It is agnostic to business logic and is controlled entirely through its public API.

### Key Responsibilities

- **Grid Rendering:** Displays a collection of items in a CSS Grid layout.
- **Layout Flexibility:** Allows configuration of the scroll direction (vertical/horizontal) and forcing a fixed number of columns or rows.
- **Visual State Management:** Shows the selection state of each item and contextual action menus.
- **Event Emission:** Captures user interactions on items (click, double-click, action click) and emits them as semantic events for the parent component to handle.

## Public API

- `constructor(container, options)`: Initializes the component with layout options (e.g., `itemSize`, `aspectRatio`, `layout`).
- `setItems(items)`: Receives an array of item objects and completely re-renders the grid. Each item can have properties like `isSelected` and `actions`.

## Emitted Events

- `itemClick`: Fired on a normal click on an item. `detail: { itemId, originalEvent }`.
- `itemDblClick`: Fired on a double-click on an item. `detail: { itemId }`.
- `actionClick`: Fired when an action button on an item is clicked. `detail: { itemId, action }`.