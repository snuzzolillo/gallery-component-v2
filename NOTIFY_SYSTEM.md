# 📢 The `notify` System: A PUSH Communication Channel

This document describes the architecture, purpose, and contract of the `notify()` method in the `GalleryComponent`.

---

## 1. Purpose and Conceptualization

While the `dataSource` acts as a **PULL** mechanism (the component *requests* data when it needs it), the `notify` system is a **PUSH** mechanism. Its purpose is to allow external systems (like a WebSocket handler, a background worker, or any asynchronous logic) to "push" state updates to the `GalleryComponent` in real-time.

The main motivation for its creation was the need to handle **"unfinished" items** or long-running tasks, such as image or video generation. The `GalleryComponent`, being data-source agnostic, needs an external entity to inform it about the progress and completion of these tasks.

## 2. Contract in Version 2 (Current State)

In version 2, the `notify` system exists and is functional, but its UI implementation is partial. It supports the following events, primarily designed for task tracking:

- **`notify('taskStart', payload)`**: Starts tracking a batch generation task.
- **`notify('taskProgress', payload)`**: Reports that a new item has been generated and should be added to the gallery.
- **`notify('taskEnd', payload)`**: Marks the end of a generation task.
- **`notify('taskUpdate', payload)`**: Provides a status update for an existing item.

**Limitation in v2:** Although the logic to receive these events is present, the visual implementation (like rendering "placeholders" for items in progress or detailed progress bars) is not complete and is considered a feature to be developed in future versions.

## 3. Vision for Version 3 (Future)

Version 3 will focus on formalizing and expanding the `notify` system to be a robust, first-class communication channel.

### Proposed Contract for v3

#### A. Batch Generation Tasks (Creating new items)
- **`notify('batch:start', { batchId, total, label, targetFolderId })`**: Starts a batch task. The UI could show placeholders.
- **`notify('batch:progress', { batchId, item })`**: Adds a new item to the batch.
- **`notify('batch:end', { batchId, status, message })`**: Ends the batch task.

#### B. Item Transformation Tasks (Updating an existing item)
- **`notify('item:update', { itemId, status, progress, message })`**: Updates the state of an existing item.
    - `itemId`: The ID of the item to update.
    - `status`: `'processing'`, `'complete'`, `'error'`.
    - `progress`: A number from 0 to 100.
    - `message`: An optional text.

The `isPending: true` attribute in an item's data will be the key that tells the `GalleryComponent` to expect updates through this channel.

### Expansion Potential

The long-term vision is for `notify` to be used for richer two-way communication, including:
- **`notify('item:lock', { itemId })`**: To visually lock an item being edited by another user.
- **`notify('system:message', { text, level })`**: To display administrative or system messages.