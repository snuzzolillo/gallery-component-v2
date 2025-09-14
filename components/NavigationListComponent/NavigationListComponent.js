// ===============================================================
// FILE: /components/NavigationListComponent/NavigationListComponent.js
// VERSION: 1.0.0
// ===============================================================

export default class NavigationListComponent {
    /**
     * @param {string|HTMLElement} container - The element to render the list into.
     * @param {object} options - Configuration options.
     * @param {string} [options.direction='vertical'] - The orientation of the list: 'vertical' or 'horizontal'.
     */
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            throw new Error(`NavigationListComponent: Container element "${container}" not found.`);
        }
        this.options = {
            direction: options.direction || 'vertical',
        };
        this._loadStyles();
        this._createDOMElements();
        this._attachEventListeners();
    }

    _loadStyles() {
        const styleId = 'nav-list-component-styles';
        if (document.getElementById(styleId)) return;
        const moduleUrl = new URL(import.meta.url);
        const cssUrl = new URL('./NavigationListComponent.css', moduleUrl).href;
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    _createDOMElements() {
        this.elements = {};
        this.container.innerHTML = `<ul class="nav-list nav-${this.options.direction}"></ul>`;
        this.elements.list = this.container.querySelector('.nav-list');
    }

    _attachEventListeners() {
        this.container.addEventListener('click', (e) => {
            const itemElement = e.target.closest('.nav-item');
            if (itemElement) {
                const itemId = itemElement.dataset.itemId;
                this._dispatchEvent('select', { itemId });
            }
        });
    }

    _dispatchEvent(action, detail) {
        this.container.dispatchEvent(new CustomEvent(`item:${action}`, { bubbles: true, composed: true, detail }));
    }

    _buildItemHtml(item) {
        // Actions are now handled by a contextual menu in the parent component.
        return `<li class="nav-item" data-item-id="${item.id}"><span>${item.name}</span></li>`;
    }

    // --- Public API ---
    setItems(items = []) {
        this.elements.list.innerHTML = items.map(t => this._buildItemHtml(t)).join('');
    }

    setActiveItem(itemId) {
        this.elements.list.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
        if (itemId) {
            const itemEl = this.elements.list.querySelector(`[data-item-id="${itemId}"]`);
            if (itemEl) itemEl.classList.add('active');
        }
    }
}