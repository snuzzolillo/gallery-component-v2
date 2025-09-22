/**
 * EXAMPLE PLUGIN: GenerationPlugin
 * This plugin adds custom "Generate" buttons to the toolbar to create new items.
 * It demonstrates how to:
 *  - Add custom buttons to the toolbar.
 *  - Show a custom modal with a form.
 *  - Call a custom method on the dataSource.
 */
export default class GenerationPlugin {
    /**
     * Called by GalleryComponent when the plugin is initialized.
     * The plugin should store a reference to the gallery instance.
     * @param {GalleryComponent} gallery - The instance of the gallery.
     */
    onInit(gallery) {
        this.gallery = gallery;
        console.log('[GenerationPlugin] Initialized.');
    }

    /**
     * Called by GalleryComponent when the toolbar is being rendered.
     * The plugin returns an array of button configurations to be added to the toolbar.
     * @param {Array<object>} selectedItems - The currently selected items.
     * @returns {Array<object>} An array of button configurations.
     */
    getToolbarButtons(selectedItems) {
        // This plugin's buttons are always active, regardless of selection.
        return [
            {
                type: 'button',
                id: 'generate-single', // Unique ID for the action
                label: 'Generate',
                icon: '✨'
            },
            {
                type: 'button',
                id: 'generate-batch',
                label: 'Generate Batch',
                icon: '🪄'
            }
        ];
    }

    /**
     * Called by GalleryComponent when a toolbar button is clicked.
     * The plugin checks if the actionId matches one of its buttons.
     * @param {string} actionId - The ID of the clicked button.
     */
    handleToolbarAction(actionId) {
        if (actionId === 'generate-single') {
            this.showGenerationModal({
                buttonText: 'Generate Image',
                confirmText: 'Generate',
                dataSourceMethod: 'onGenerateItems', // The method to call on the dataSource
                modalFields: [
                    { name: 'prompt', label: 'Prompt', type: 'textarea' },
                    { name: 'count', type: 'hidden', defaultValue: 1 } // Hidden field for the count
                ]
            });
        } else if (actionId === 'generate-batch') {
            this.showGenerationModal({
                buttonText: 'Generate Image Batch',
                confirmText: 'Generate',
                dataSourceMethod: 'onGenerateItems',
                modalFields: [
                    { name: 'prompt', label: 'Prompt', type: 'textarea' },
                    { name: 'count', label: 'Number of Images', type: 'number', defaultValue: 5, min: 1, max: 10 }
                ]
            });
        }
    }

    showGenerationModal(mode) {
        // The plugin asks the gallery to display a modal with its desired configuration.
        // This uses a "private" method on the gallery, which is the designated API for this purpose.
        this.gallery._displayPluginModal(mode);
    }
}