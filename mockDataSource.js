/**
 * MOCK DATA SOURCE (BASIC)
 * This object simulates a real backend API for a simple gallery without folders.
 * It uses setTimeout to mimic network latency.
 */
export const mockDataSource = {
    _latency: 300,
    _items: [
        { id: 1, name: 'Mountain.jpg', type: 'image', thumbUrl: 'https://placehold.co/300x300/6C8EBF/FFFFFF?text=Mountain', mediaUrl: 'https://placehold.co/1200x800/6C8EBF/FFFFFF?text=Mountain' },
        { id: 2, name: 'Ocean.png', type: 'image', thumbUrl: 'https://placehold.co/300x300/4F7CAC/FFFFFF?text=Ocean', mediaUrl: 'https://placehold.co/1200x800/4F7CAC/FFFFFF?text=Ocean' },
        { id: 3, name: 'Forest.gif', type: 'image', thumbUrl: 'https://placehold.co/300x300/5B8E7D/FFFFFF?text=Forest', mediaUrl: 'https://placehold.co/1200x800/5B8E7D/FFFFFF?text=Forest' },
        { id: 4, name: 'Skyscrapers.webp', type: 'image', thumbUrl: 'https://placehold.co/300x300/8E9EAB/FFFFFF?text=Sky', mediaUrl: 'https://placehold.co/1200x800/8E9EAB/FFFFFF?text=Sky' },
        { id: 5, name: 'Desert.jpg', type: 'image', thumbUrl: 'https://placehold.co/300x300/D9A66C/FFFFFF?text=Desert', mediaUrl: 'https://placehold.co/1200x800/D9A66C/FFFFFF?text=Desert' },
        { id: 6, name: 'City Night.png', type: 'image', thumbUrl: 'https://placehold.co/300x300/2C3E50/FFFFFF?text=Night', mediaUrl: 'https://placehold.co/1200x800/2C3E50/FFFFFF?text=Night' },
    ],

    /**
     * Called by the component to get the items.
     * Since folders are disabled, `folderId` will be null.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of item objects.
     */
    onLoadItems(folderId = null) {
        console.log(`[DataSource] onLoadItems called.`);
        return new Promise(resolve => {
            setTimeout(() => {
                // Return a deep copy to prevent mutations from affecting the original data
                resolve(JSON.parse(JSON.stringify(this._items)));
            }, this._latency);
        });
    },

    /**
     * In a real application, you would implement methods like onDeleteItem, onRenameItem, etc.
     * For this basic example, they are omitted. The component will gracefully
     * hide the corresponding UI actions if these methods are not found.
     */
};