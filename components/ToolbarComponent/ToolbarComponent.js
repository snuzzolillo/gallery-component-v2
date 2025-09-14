// ===============================================================
// FILE: /components/ToolbarComponent/ToolbarComponent.js
// VERSION: 2.1.0 (Overflow Layout Fix)
// ===============================================================
export default class ToolbarComponent {
    /**
     * @param {string|HTMLElement} container - The element to which the toolbar will be appended.
     * @param {object} options - Configuration options for the toolbar.
     * @param {Array<object>} [options.items] - Initial items for the toolbar.
     */
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            throw new Error(`ToolbarComponent: Container element "${container}" not found.`);
        }

        this.container.classList.add('toolbar-component-root');
        this._loadStyles();

        this.itemConfigs = options.items || [];
        this.resizeTimeout = null;

        this._createDOMElements();
        this._attachEventListeners();

        // Use a ResizeObserver to automatically handle overflow when the container size changes.
        this.resizeObserver = new ResizeObserver(() => this._handleResize());
        this.resizeObserver.observe(this.container);

        this.setItems(this.itemConfigs);
    }

    // --- Private Methods ---

    _loadStyles() {
        const styleId = 'toolbar-component-styles';
        if (document.getElementById(styleId)) return;

        const moduleUrl = new URL(import.meta.url);
        const cssUrl = new URL('./ToolbarComponent.css', moduleUrl).href;

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    _createDOMElements() {
        this.elements = {};
        this.elements.toolbar = document.createElement('div');
        this.elements.toolbar.className = 'toolbar-container';
        this.container.appendChild(this.elements.toolbar);

        // Create elements for the overflow menu
        this.elements.overflowContainer = document.createElement('div');
        this.elements.overflowContainer.className = 'toolbar-overflow-container';

        this.elements.overflowButton = document.createElement('button');
        this.elements.overflowButton.className = 'toolbar-btn toolbar-overflow-btn';
        this.elements.overflowButton.innerHTML = '...';
        this.elements.overflowButton.title = 'More actions';

        this.elements.overflowMenu = document.createElement('div');
        this.elements.overflowMenu.className = 'toolbar-overflow-menu';
        this.elements.overflowContainer.appendChild(this.elements.overflowButton);
        this.elements.overflowContainer.appendChild(this.elements.overflowMenu);
        this.container.appendChild(this.elements.overflowContainer);
    }

    _attachEventListeners() {
        this.elements.toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('.toolbar-btn');
            if (button && !button.disabled) {
                const actionId = button.dataset.actionId;
                this._dispatchEvent('buttonClick', { actionId });
            }

            const searchInput = e.target.closest('.toolbar-search-input');
            if (searchInput && e.key === 'Enter') {
                e.preventDefault();
                const value = searchInput.value;
                this._dispatchEvent('searchInput', { id: searchInput.dataset.actionId, value });
            }
        });

        // Handle clicks inside the overflow menu
        this.elements.overflowMenu.addEventListener('click', (e) => {
            const button = e.target.closest('.toolbar-menu-item');
            if (button && !button.disabled) {
                const actionId = button.dataset.actionId;
                this._dispatchEvent('buttonClick', { actionId });
                this.elements.overflowMenu.classList.remove('visible'); // Close menu on action
            }
        });

        this._boundCloseMenuHandler = this._closeMenuHandler.bind(this);

        this.elements.overflowButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = this.elements.overflowMenu.classList.toggle('visible');
            if (isVisible) {
                document.addEventListener('click', this._boundCloseMenuHandler);
            } else {
                document.removeEventListener('click', this._boundCloseMenuHandler);
            }
        });
    }

    _closeMenuHandler(e) {
        if (!this.elements.overflowContainer.contains(e.target)) {
            this.elements.overflowMenu.classList.remove('visible');
            document.removeEventListener('click', this._boundCloseMenuHandler);
        }
    }

    _dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            detail
        });
        this.container.dispatchEvent(event);
    }

    _handleResize() {
        // Debounce resize events to avoid rapid re-renders, which can cause layout thrashing.
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => this._renderItems(), 50);
    }

    _createItemElement(config) {
        let itemElement;
        switch (config.type) {
            case 'separator':
                itemElement = document.createElement('div');
                itemElement.className = 'toolbar-separator';
                break;
            case 'spacer':
                itemElement = document.createElement('div');
                itemElement.className = 'toolbar-spacer';
                break;
            case 'search':
                itemElement = document.createElement('input');
                itemElement.type = 'search';
                itemElement.className = 'toolbar-search-input';
                itemElement.placeholder = config.placeholder || 'Search...';
                itemElement.dataset.actionId = config.id;
                break;
            case 'custom':
                itemElement = document.createElement('div');
                itemElement.className = 'toolbar-custom-item';
                itemElement.innerHTML = config.html || '';
                break;
            case 'button':
            default:
                itemElement = document.createElement('button');
                itemElement.className = 'toolbar-btn';
                itemElement.dataset.actionId = config.id;
                itemElement.disabled = !!config.disabled;
                itemElement.title = config.label;
                itemElement.innerHTML = `${config.icon ? `<span class="toolbar-icon">${config.icon}</span>` : ''}${config.label ? `<span class="toolbar-label">${config.label}</span>` : ''}`;
                break;
        }
        return itemElement;
    }

    _renderItems() {
        this.elements.toolbar.innerHTML = '';
        this.elements.overflowMenu.innerHTML = '';

        const containerWidth = this.container.clientWidth;
        const overflowButtonWidth = 50; // Estimated width of the '...' button
        let currentWidth = 0;
        let isOverflowing = false;

        this.itemConfigs.forEach(config => {
            const element = this._createItemElement(config);
            if (!element) return;

            // Temporarily append to measure width
            this.elements.toolbar.appendChild(element);
            const itemWidth = element.offsetWidth + 10; // Include gap

            if (!isOverflowing && (currentWidth + itemWidth) > (containerWidth - overflowButtonWidth)) {
                isOverflowing = true;
            }

            if (isOverflowing) {
                // If it overflows, remove it from toolbar and add to menu
                this.elements.toolbar.removeChild(element);
                if (config.type === 'button') {
                    element.className = 'toolbar-menu-item'; // Use menu item styling
                    this.elements.overflowMenu.appendChild(element);
                } // Non-button items are just hidden
            } else {
                currentWidth += itemWidth;
            }
        });

        this.elements.overflowContainer.style.display = isOverflowing ? 'flex' : 'none';
    }

    // --- Public API ---

    /**
     * Sets or updates the items displayed in the toolbar.
     * @param {Array<object>} itemConfigs - Array of item configurations.
     */
    setItems(itemConfigs = []) {
        this.itemConfigs = itemConfigs || [];
        this._renderItems();
    }
}