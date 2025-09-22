/**
 * MOCK DATA SOURCE (ADVANCED - WITH PLUGINS)
 * This object simulates a real backend API and includes a custom method
 * `onGenerateItems` that will be called by our GenerationPlugin.
 */

// --- In-memory "database" ---
let _db = {
    folders: [
        { id: 100, name: 'Nature 🌲' },
        { id: 101, name: 'Cities 🏙️' },
        { id: 102, name: 'Generated ✨' },
    ],
    items: {
        100: [
            { id: 1, folderId: 100, name: 'Mountain.jpg', type: 'image', thumbUrl: 'https://placehold.co/300x300/6C8EBF/FFFFFF?text=Mountain', mediaUrl: 'https://placehold.co/1200x800/6C8EBF/FFFFFF?text=Mountain' },
            { id: 2, folderId: 100, name: 'Ocean.png', type: 'image', thumbUrl: 'https://placehold.co/300x300/4F7CAC/FFFFFF?text=Ocean', mediaUrl: 'https://placehold.co/1200x800/4F7CAC/FFFFFF?text=Ocean' },
        ],
        101: [
            { id: 3, folderId: 101, name: 'Skyscrapers.webp', type: 'image', thumbUrl: 'https://placehold.co/300x300/8E9EAB/FFFFFF?text=Sky', mediaUrl: 'https://placehold.co/1200x800/8E9EAB/FFFFFF?text=Sky' },
        ],
        102: [] // Generated items will go here
    },
    _nextFolderId: 103,
    _nextItemId: 5,
};

export const mockDataSource = {
    _latency: 300,

    // ===============================================================
    // FOLDER METHODS
    // ===============================================================

    onLoadFolders() {
        console.log(`[DataSource] onLoadFolders called.`);
        return new Promise(resolve => {
            setTimeout(() => resolve(JSON.parse(JSON.stringify(_db.folders))), this._latency);
        });
    },

    onCreateFolder(name) {
        console.log(`[DataSource] onCreateFolder called with name: "${name}".`);
        return new Promise(resolve => {
            const newFolder = { id: _db._nextFolderId++, name: name };
            _db.folders.push(newFolder);
            _db.items[newFolder.id] = [];
            setTimeout(resolve, this._latency);
        });
    },

    onRenameFolder(folderId, newName) {
        console.log(`[DataSource] onRenameFolder called for ID ${folderId} to "${newName}".`);
        return new Promise(resolve => {
            const folder = _db.folders.find(f => f.id === folderId);
            if (folder) folder.name = newName;
            setTimeout(resolve, this._latency);
        });
    },

    onDeleteFolder(folderId) {
        console.log(`[DataSource] onDeleteFolder called for ID ${folderId}.`);
        return new Promise(resolve => {
            _db.folders = _db.folders.filter(f => f.id !== folderId);
            delete _db.items[folderId];
            setTimeout(resolve, this._latency);
        });
    },

    // ===============================================================
    // ITEM METHODS
    // ===============================================================

    onLoadItems(folderId) {
        console.log(`[DataSource] onLoadItems called for folder ID: ${folderId}.`);
        return new Promise(resolve => {
            const items = _db.items[folderId] || [];
            setTimeout(() => resolve(JSON.parse(JSON.stringify(items))), this._latency);
        });
    },

    onDeleteItem(itemIds, context) {
        console.log(`[DataSource] onDeleteItem called for IDs: ${itemIds.join(', ')} in folder ${context.currentFolder.id}.`);
        return new Promise(resolve => {
            const folderId = context.currentFolder.id;
            if (_db.items[folderId]) {
                _db.items[folderId] = _db.items[folderId].filter(item => !itemIds.includes(item.id));
            }
            setTimeout(resolve, this._latency);
        });
    },

    onRenameItem(itemId, newName, context) {
        console.log(`[DataSource] onRenameItem called for ID ${itemId} to "${newName}".`);
        return new Promise(resolve => {
            const folderId = context.currentFolder.id;
            const item = _db.items[folderId]?.find(i => i.id === itemId);
            if (item) item.name = newName;
            setTimeout(resolve, this._latency);
        });
    },

    onMoveItem(itemIds, destinationFolderId, context) {
        console.log(`[DataSource] onMoveItem: Moving IDs ${itemIds.join(', ')} to folder ${destinationFolderId}.`);
        return new Promise((resolve, reject) => {
            const sourceFolderId = context.currentFolder.id;
            if (!_db.items[sourceFolderId] || !_db.items[destinationFolderId]) {
                return reject(new Error("Invalid source or destination folder."));
            }
            const itemsToMove = _db.items[sourceFolderId].filter(item => itemIds.includes(item.id));
            _db.items[sourceFolderId] = _db.items[sourceFolderId].filter(item => !itemIds.includes(item.id));
            itemsToMove.forEach(item => {
                item.folderId = destinationFolderId;
                _db.items[destinationFolderId].push(item);
            });
            setTimeout(resolve, this._latency);
        });
    },

    onCopyItem(itemIds, destinationFolderId, context) {
        console.log(`[DataSource] onCopyItem: Copying IDs ${itemIds.join(', ')} to folder ${destinationFolderId}.`);
        return new Promise((resolve, reject) => {
            const sourceFolderId = context.currentFolder.id;
            if (!_db.items[sourceFolderId] || !_db.items[destinationFolderId]) {
                return reject(new Error("Invalid source or destination folder."));
            }
            const itemsToCopy = _db.items[sourceFolderId].filter(item => itemIds.includes(item.id));
            itemsToCopy.forEach(originalItem => {
                const newItem = {
                    ...originalItem,
                    id: _db._nextItemId++,
                    folderId: destinationFolderId,
                    name: `Copy of ${originalItem.name}`
                };
                _db.items[destinationFolderId].push(newItem);
            });
            setTimeout(resolve, this._latency);
        });
    },

    // ===============================================================
    // PLUGIN-SPECIFIC METHOD
    // ===============================================================

    /**
     * This is a custom method that our GenerationPlugin will call.
     * It simulates creating new items based on a prompt.
     * @param {Array} items - The currently selected items (not used in this action).
     * @param {object} formData - The data from the plugin's modal form.
     * @param {object} context - The current gallery context (e.g., current folder).
     */
    onGenerateItems(items, formData, context) {
        console.log(`[DataSource] onGenerateItems called with formData:`, formData, `in context:`, context);
        return new Promise(resolve => {
            const { prompt, count } = formData;
            const targetFolderId = context.currentFolder.id;

            if (!prompt || !count || !_db.items[targetFolderId]) {
                console.error("[DataSource] Missing prompt, count, or target folder.");
                return resolve(); // Resolve silently
            }

            for (let i = 0; i < count; i++) {
                const newItem = {
                    id: _db._nextItemId++,
                    folderId: targetFolderId,
                    name: `${prompt.substring(0, 15)}_${i + 1}.jpg`,
                    type: 'image',
                    thumbUrl: `https://placehold.co/300x300/A3BE8C/FFFFFF?text=${encodeURIComponent(prompt)}`,
                    mediaUrl: `https://placehold.co/1200x800/A3BE8C/FFFFFF?text=${encodeURIComponent(prompt)}`
                };
                _db.items[targetFolderId].push(newItem);
            }

            setTimeout(resolve, this._latency);
        });
    }
};