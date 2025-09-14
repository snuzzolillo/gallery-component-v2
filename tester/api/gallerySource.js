// FILE: /tester/api/gallerySource.js
// VERSION: 1.0

// The base URL for our json-server fake API.
// json-server typically runs on port 3000 by default.
const API_BASE_URL = 'http://localhost:3000';

/**
 * A helper function to handle common fetch responses and errors.
 * @param {Response} response - The raw response from a fetch call.
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }
    // Return null if the response has no content (e.g., for a successful DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    return response.json();
}

/**
 * Fetches all items from the data source.
 * @returns {Promise<Array<object>>} - An array of gallery items.
 */
export async function getItemsFromSource() {
    const response = await fetch(`${API_BASE_URL}/items`);
    return handleResponse(response);
}

/**
 * Deletes an item from the data source by its ID.
 * @param {string} itemId - The ID of the item to delete.
 * @returns {Promise<void>}
 */
export async function deleteItemFromSource(itemId) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE'
    });
    return handleResponse(response);
}

/**
 * Updates an item's data in the source using the PATCH method for partial updates.
 * @param {string} itemId - The ID of the item to update.
 * @param {object} data - An object containing the fields to update (e.g., { name: 'New Name' }).
 * @returns {Promise<object>} - The updated item object from the server.
 */
export async function renameItemInSource(itemId, data) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}