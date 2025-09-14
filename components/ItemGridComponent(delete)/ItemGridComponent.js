// ===============================================================
// FILE: /components/ItemGridComponent/ItemGridComponent.js
// VERSION: 1.2.0 (Simplified Rendering Logic)
// ===============================================================

export default class ItemGridComponent {
    /**
     * @param {string|HTMLElement} container - The element to which the grid will be appended.
     * @param {object} options - Configuration options for the grid.
     * @param {number} [options.itemSize=150] - The minimum size of a grid item in pixels.
     * @param {number} [options.gap=1.5] - The gap between grid items in 'rem' units.
     * @param {string} [options.aspectRatio='1:1'] - The aspect ratio of items (e.g., '16:9', '4:3', '1:1').
     */
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            throw new Error(`ItemGridComponent: Container element "${container}" not found.`);
        }

        this._loadStyles();
        this._createDOMElements();
        this.setOptions(options, true);
        this._attachEventListeners();
    }

    // --- Private Methods ---

    _loadStyles() {
        const styleId = 'item-grid-component-styles';
        if (document.getElementById(styleId)) return;

        const moduleUrl = new URL(import.meta.url);
        const cssUrl = new URL('./ItemGridComponent.css', moduleUrl).href;

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    _createDOMElements() {
        this.elements = {};
        this.elements.grid = document.createElement('div');
        this.elements.grid.className = 'item-grid-container';
        this.container.appendChild(this.elements.grid);
    }

    _attachEventListeners() {
        this.elements.grid.addEventListener('click', (e) => {
            const itemElement = e.target.closest('.grid-item');
            if (!itemElement) return;

            const actionButton = e.target.closest('[data-action]');
            const itemId = itemElement.dataset.itemId;

            if (actionButton) {
                e.stopPropagation();
                this._dispatchEvent('actionClick', {
                    itemId: itemId,
                    action: actionButton.dataset.action,
                    originalEvent: e
                });
            } else {
                this._dispatchEvent('itemClick', {
                    itemId: itemId,
                    originalEvent: e
                });
            }
        });

        this.elements.grid.addEventListener('dblclick', (e) => {
            const itemElement = e.target.closest('.grid-item');
            if (itemElement) {
                this._dispatchEvent('itemDblClick', {
                    itemId: itemElement.dataset.itemId,
                    originalEvent: e
                });
            }
        });
    }

    _applyOptions() {
        this.elements.grid.style.setProperty('--grid-item-min-size', `${this.options.itemSize}px`);
        this.elements.grid.style.setProperty('--grid-gap', `${this.options.gap}rem`);

        const [width, height] = this.options.aspectRatio.split(':').map(Number);
        const paddingBottom = (height / width) * 100;
        this.elements.grid.style.setProperty('--grid-item-aspect-ratio-padding', `${paddingBottom}%`);
    }

    _buildItemElement(item) {
        const actionsHtml = (item.actions || []).map(action =>
            `<button class="grid-item-btn-icon" data-action="${action.id}" title="${action.label}">${action.icon}</button>`
        ).join('');

        const typeIcon = { image: '🖼️', video: '🎬', audio: '🎵' }[item.type] || '📄';

        const html = `
            <div class="grid-item ${item.isSelected ? 'selected' : ''}" data-item-id="${item.id}">
                <img src="${item.thumbUrl}" alt="${item.name}" class="grid-item-thumb" onerror="this.src='https://placehold.co/300x300/222/555?text=Error';">
                <div class="grid-item-overlay">
                    <span class="grid-item-name">${item.name}</span>
                    <div class="grid-item-actions">${actionsHtml}</div>
                </div>
                <div class="grid-item-type-icon">${typeIcon}</div>
            </div>`;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        return tempDiv.firstChild;
    }

    _dispatchEvent(eventName, detail) {
        this.container.dispatchEvent(new CustomEvent(eventName, { bubbles: true, composed: true, detail }));
    }

    // --- Public API ---

    /**
     * Renders a list of items in the grid.
     * @param {Array<object>} items - Array of item objects to display.
     * Each item should have: id, name, thumbUrl, type. Optional: isSelected, actions.
     */
    setItems(items = []) {
        if (!items || items.length === 0) {
            this.elements.grid.innerHTML = `<p class="grid-placeholder">No items to display.</p>`;
            return;
        }

        // Simple and predictable: build the HTML and set it.
        this.elements.grid.innerHTML = items.map(item => this._buildItemElement(item)).join('');
    }

    /**
     * Updates the component's options and re-applies them.
     * @param {object} newOptions - The new options to apply.
     * @param {boolean} [isInitial=false] - Flag to skip re-rendering during construction.
     */
    setOptions(newOptions, isInitial = false) {
        const defaults = {
            itemSize: 150,
            gap: 1.5,
            aspectRatio: '1:1',
        };
        this.options = { ...(isInitial ? defaults : this.options), ...newOptions };
        this._applyOptions();
    }

    /**
     * Overwrites the _buildItemElement to return a string instead of an element.
     * This is more efficient for building the entire grid HTML at once.
     * @param {object} item - The item data.
     * @returns {string} The HTML string for the item.
     */
    _buildItemElement(item) {
        const actionsHtml = (item.actions || []).map(action =>
            `<button class="grid-item-btn-icon" data-action="${action.id}" title="${action.label}">${action.icon}</button>`
        ).join('');

        const typeIcon = { image: '🖼️', video: '🎬', audio: '🎵' }[item.type] || '📄';

        return `<div class="grid-item ${item.isSelected ? 'selected' : ''}" data-item-id="${item.id}"><img src="${item.thumbUrl}" alt="${item.name}" class="grid-item-thumb" onerror="this.src='https://placehold.co/300x300/222/555?text=Error';"><div class="grid-item-overlay"><span class="grid-item-name">${item.name}</span><div class="grid-item-actions">${actionsHtml}</div></div><div class="grid-item-type-icon">${typeIcon}</div></div>`;
    }
}