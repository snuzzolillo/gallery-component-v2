// ===============================================================
// FILE: /components/GalleryComponent/plugins/GenerationPlugin.js
// VERSION: 1.0.0 (New Contract)
// ===============================================================

export default class GenerationPlugin {
    /**
     * @param {object} options - Configuration for the generation plugin.
     * @param {Array<object>} options.modes - Array of generation modes.
     */
    constructor(options = {}) {
        this.modes = options.modes || [];
        this.gallery = null;
    }

    /**
     * Called by GalleryComponent when it initializes.
     * @param {object} galleryInstance - The instance of the gallery.
     */
    onInit(galleryInstance) {
        this.gallery = galleryInstance;
    }

    /**
     * Called by GalleryComponent to get the plugin's toolbar buttons.
     * @param {Array<object>} selectedItems - The currently selected items.
     * @returns {Array<object>} - An array of button configurations for the toolbar.
     */
    getToolbarButtons(selectedItems) {
        const buttons = [];
        this.modes.forEach(mode => {
            const isEnabled = this._checkSelectionRule(mode.selectionRule, selectedItems);
            if (isEnabled) {
                buttons.push({
                    type: 'button',
                    id: mode.name,
                    label: mode.buttonText,
                    icon: '✨' // Default icon for generation
                });
            }
        });
        return buttons;
    }

    /**
     * Called by GalleryComponent when a plugin's toolbar button is clicked.
     * @param {string} actionId - The ID of the action/button that was clicked.
     */
    handleToolbarAction(actionId) {
        const mode = this.modes.find(m => m.name === actionId);
        if (mode && this.gallery) {
            this.gallery._displayPluginModal(mode);
        }
    }

    _checkSelectionRule(rule, selectedItems) {
        if (!rule || rule === 'any') return true;
        if (rule === 'none') return selectedItems.length === 0;
        if (rule === 'single') return selectedItems.length === 1;
        if (rule === 'multiple') return selectedItems.length > 1;
        if (rule === 'single-image') return selectedItems.length === 1 && selectedItems[0].type === 'image';
        if (rule === 'single-video') return selectedItems.length === 1 && selectedItems[0].type === 'video';
        return false;
    }
}