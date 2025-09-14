// FILE: /tester/main.js
// VERSION: 3.0 (Real-world "ve-services" simulation)

import { GalleryComponent } from '../src/GalleryComponent.js';
import { BaseBehavior } from '../src/behaviors/BaseBehavior.js';

// Import all necessary stylesheets
import '../src/style.css';
import './themes.css';
import './tester-style.css';

// --- 1. API Layer & DataAdapter for "ve-services" ---
// In a real app, this would be in its own file (e.g., /api/veServices.js)
const veServicesApi = {
    /**
     * Fetches raw data from the ve-services backend.
     */
    fetchRawItems: async (folderId = 'default') => {
        console.log(`[API] Fetching items for folder: ${folderId}`);
        // Simulate a network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // Simulate a raw response from your complex source
        return [
            { id: "vid-1138", name: "Toma Aerea del Rio.mp4", type: "video", thumbUrl: "https://placehold.co/400x400/3498db/ffffff?text=Video", mediaPath: "/media/vid-1138.mp4", frameSize: "3840x2160", duration: 32500 },
            { id: "img-42", name: "Concepto de Bosque.jpg", type: "image", thumbUrl: "https://placehold.co/400x400/2ecc71/ffffff?text=Image", mediaPath: "/media/img-42.jpg", frameSize: "1920x1080" }
        ];
    },
    /**
     * Deletes an item from the ve-services backend.
     */
    deleteItem: async (itemId) => {
        console.log(`[API] Sending DELETE request for item: ${itemId}`);
        await new Promise(resolve => setTimeout(resolve, 1200));
        console.log(`[API] Item ${itemId} deleted successfully.`);
        return { success: true };
    }
};

// --- 2. Application-level Services ---
function showCustomNotification({ type, message }) {
    // This could be a sophisticated toast notification library in a real app
    console.log(`[Notification] Type: ${type}, Message: ${message}`);
}

// --- 3. Custom Behavior (Extending the Default) ---
// This is our "Escarabajo Repotenciado". It inherits from the default
// and adds a new, specific action.
class VeGalleryBehavior extends BaseBehavior {
    getActions() {
        // Get the default actions (like preview, delete, etc.)
        const defaultActions = super.getActions();
        // Add our custom action
        const customAction = { id: 'generate-video', label: '🎬', title: 'Generate Video from this Image' };
        return [...defaultActions, customAction];
    }

    // We can also override the default click behavior
    handleItemClick(itemId) {
        console.log(`Custom click behavior: Item ${itemId} was clicked, but we won't select it.`);
        // To keep the default selection, we would call: super.handleItemClick(itemId);
    }
}


// --- 4. GalleryComponent Instantiation & Configuration ---
async function initializeApp() {
    const galleryContainer = document.getElementById('my-gallery-container');
    if (!galleryContainer) return;

    // The Orchestrator creates the DataAdapter
    const veServicesSourceAdapter = {
        getItems: async (folderId = null) => {
            const rawData = await veServicesApi.fetchRawItems(folderId);
            // The adapter translates the complex source format to the component's contract
            return rawData.map(item => ({
                id: item.id,
                name: item.name,
                thumbSrc: item.thumbUrl,
                dataType: 'url',
                source: item.mediaPath,
                metadata: {
                    type: item.type,
                    frameSize: item.frameSize,
                    duration: item.duration
                }
            }));
        }
    };
    
    // Here is the complete, explicit configuration
    const myVeGallery = new GalleryComponent(galleryContainer, {
        // --- CORE REQUIREMENT ---
        // We provide the DataAdapter that connects to our "ve-services" source.
        source: veServicesSourceAdapter,

        // --- CUSTOMIZATION: Behavior ---
        // We are replacing the default BaseBehavior with our extended version.
        behavior: new VeGalleryBehavior(),

        // --- CUSTOMIZATION: Services ---
        // We are providing our custom notification function.
        showNotification: showCustomNotification,

        // --- CUSTOMIZATION: Action Handlers ---
        // We provide the implementation for the 'delete' action.
        onDelete: async (itemId) => {
            try {
                await veServicesApi.deleteItem(itemId);
                showCustomNotification({ type: 'success', message: `Item ${itemId} was deleted.` });
                return true; // Return true on success
            } catch (error) {
                return false; // Return false on failure
            }
        }
        // NOTE: We are NOT providing an 'onRename' handler. Because of the "smart"
        // getActions() method in BaseBehavior, the 'rename' (✏️) icon will not be rendered.
    });

    // --- 5. Initialization ---
    // Trigger the initial data load.
    await myVeGallery.initialize();

    // Now we can listen for our new custom action
    myVeGallery.container.addEventListener('itemAction', (event) => {
        const { itemId, actionId } = event.detail;
        if (actionId === 'generate-video') {
            alert(`Triggering "Generate Video" process for item: ${itemId}`);
        }
    });
}

initializeApp();