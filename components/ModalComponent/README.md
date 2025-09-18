# ModalComponent

## Purpose

The `ModalComponent` is a generic and reusable UI component for displaying content in a modal window (or dialog). It is designed to be highly configurable and decoupled from any specific business logic.

### Key Responsibilities

- **Modal Presentation:** Displays an overlay container that blocks interaction with the rest of the page.
- **Dynamic Configuration:** Allows setting the title, content (HTML), size, and action buttons dynamically.
- **Interaction Handling:** Captures clicks on buttons and the close button, and emits them as events.

## Public API

- `constructor(container)`: Initializes the modal, adding its skeleton to the DOM.
- `open()`: Shows the modal.
- `close()`: Hides the modal.
- `setContent(html)`: Sets the HTML content of the modal body.
- `setOptions(options)`: Configures the title, size, and buttons of the modal.

## Emitted Events

- `buttonClick`: Fired when an action button in the modal is clicked. `detail: { value }`.
- `close`: Fired when the modal is closed (either by the close button or via the API).