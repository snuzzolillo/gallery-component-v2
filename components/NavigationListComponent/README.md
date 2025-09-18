# NavigationListComponent

**Version:** 1.0.0

## Purpose

The `NavigationListComponent` is a simple and generic component for rendering a list of navigable items. Its purpose is solely for presentation and notifying of user selection. It was originally `TabsComponent` but was renamed to better reflect its navigation function.

### Key Responsibilities

- **List Rendering:** Displays a list of items in either a vertical or horizontal direction.
- **Active State:** Visually highlights the currently active item.
- **Event Emission:** Emits an event when a user clicks on an item.

## Public API

- `constructor(container, options)`: Initializes the list, allowing configuration of the `direction` ('vertical' or 'horizontal').
- `setItems(items)`: Receives an array of objects and renders the list. Each object must have an `id` and `name`.
- `setActiveItem(itemId)`: Visually sets which item in the list is active.

## Emitted Events

- `item:select`: Fired when an item is clicked. `detail: { itemId }`.