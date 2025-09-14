// FILE: /tester/config/gallery.config.js
// VERSION: 1.0

import { deleteItemFromSource, renameItemInSource } from '../api/gallerySource.js';

/**
 * Handles the deletion of an item by calling the source API.
 * This function will be passed to the BaseBehavior via the component's options.
 * @param {string} itemId - The ID of the item to delete.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
async function handleDelete(itemId) {
    console.log(`[Config] Requesting to delete item ${itemId} from source...`);
    try {
        await deleteItemFromSource(itemId);
        return true;
    } catch (error) {
        console.error(`[Config] Failed to delete item ${itemId}:`, error);
        return false;
    }
}

/**
 * Handles the renaming of an item by calling the source API.
 * @param {string} itemId - The ID of the item to rename.
 * @param {string} newName - The new name for the item.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
async function handleRename(itemId, newName) {
    console.log(`[Config] Requesting to rename item ${itemId} to "${newName}".`);
    try {
        await renameItemInSource(itemId, { name: newName });
        return true;
    } catch (error) {
        console.error(`[Config] Failed to rename item ${itemId}:`, error);
        return false;
    }
}

/**
 * Defines the application's notification system.
 * This function is passed to the GalleryComponent.
 * @param {object} options
 * @param {'error'|'info'|'success'} options.type
 * @param {string} options.message
 */
function showAppNotification({ type, message }) {
    const prefix = type.toUpperCase();
    console.log(`[Notification] ${prefix}: ${message}`);
    // For this test, we only show a browser alert for critical errors.
    if (type === 'error') {
        alert(`${prefix}: ${message}`);
    }
}

// Export a single, comprehensive configuration object for our gallery instance.
export const galleryConfig = {
    // Event handlers that interact with the data source
    onDelete: handleDelete,
    onRename: handleRename,

    // Services provided by the application
    showNotification: showAppNotification,

    // Feature flags for the component/behavior
    allowMemoryOnlyDeletion: true
};