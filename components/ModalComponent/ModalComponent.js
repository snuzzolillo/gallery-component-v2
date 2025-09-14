// ===============================================================
// FILE: /components/ModalComponent/ModalComponent.js
// VERSION: 1.1.0
// ===============================================================

export default class ModalComponent {
    /**
     * @param {string|HTMLElement} container - The element to which the modal will be appended.
     * @param {object} options - Configuration options for the modal.
     * @param {string} [options.title=''] - The title of the modal.
     * @param {boolean} [options.showCloseButton=true] - Whether to show the 'x' close button.
     * @param {boolean} [options.closeOnOverlayClick=true] - Close the modal when clicking the background overlay.
     * @param {string} [options.size='medium'] - 'small', 'medium', 'large', 'fullscreen'.
     * @param {Array<object>} [options.buttons] - Footer buttons, e.g., [{ label: 'OK', value: 'ok', class: 'primary' }]
     */
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            throw new Error(`ModalComponent: Container element "${container}" not found.`);
        }

        this._loadStyles();

        this.options = {};
        this.setOptions(options, true); // Initial setup, no re-render

        this._createDOMElements();
        this._attachEventListeners();
    }

    // --- Private Methods ---

    _loadStyles() {
        const styleId = 'modal-component-styles';
        if (document.getElementById(styleId)) {
            return; // Styles already loaded, do nothing.
        }

        // Get the full URL of the current JS module.
        const moduleUrl = new URL(import.meta.url);
        // Construct the URL to the CSS file, assuming it's in the same directory.
        // This makes the component truly portable.
        const cssUrl = new URL('./ModalComponent.css', moduleUrl).href;

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    _createDOMElements() {
        this.elements = {};

        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = 'modal-overlay';

        this.elements.modal = document.createElement('div');
        this.elements.modal.className = `modal-container modal-size-${this.options.size}`;

        this.elements.header = document.createElement('div');
        this.elements.header.className = 'modal-header';

        this.elements.title = document.createElement('h2');
        this.elements.title.className = 'modal-title';
        this.elements.title.textContent = this.options.title;

        this.elements.closeButton = document.createElement('button');
        this.elements.closeButton.className = 'modal-close-btn';
        this.elements.closeButton.innerHTML = '&times;';
        this.elements.closeButton.style.display = this.options.showCloseButton ? 'block' : 'none';

        this.elements.content = document.createElement('div');
        this.elements.content.className = 'modal-content';

        this.elements.footer = document.createElement('div');
        this.elements.footer.className = 'modal-footer';
        this._renderFooterButtons();

        this.elements.header.appendChild(this.elements.title);
        this.elements.header.appendChild(this.elements.closeButton);
        this.elements.modal.appendChild(this.elements.header);
        this.elements.modal.appendChild(this.elements.content);
        this.elements.modal.appendChild(this.elements.footer);
        this.elements.overlay.appendChild(this.elements.modal);
    }

    _attachEventListeners() {
        this.elements.closeButton.addEventListener('click', () => this.close());
        
        if (this.options.closeOnOverlayClick) {
            this.elements.overlay.addEventListener('click', (e) => {
                if (e.target === this.elements.overlay) {
                    this.close();
                }
            });
        }

        this.elements.footer.addEventListener('click', (e) => {
            const button = e.target.closest('.modal-footer-btn');
            if (button) {
                const value = button.dataset.value;
                this._dispatchEvent('buttonClick', { value });
                // Common button behaviors
                if (value === 'cancel' || value === 'close') {
                    this.close();
                }
            }
        });
    }

    _renderFooterButtons() {
        this.elements.footer.innerHTML = '';
        if (this.options.buttons && this.options.buttons.length > 0) {
            this.options.buttons.forEach(btnConfig => {
                const button = document.createElement('button');
                button.className = `modal-footer-btn ${btnConfig.class || ''}`;
                button.textContent = btnConfig.label;
                button.dataset.value = btnConfig.value;
                this.elements.footer.appendChild(button);
            });
            this.elements.footer.style.display = 'flex';
        } else {
            this.elements.footer.style.display = 'none';
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

    // --- Public API ---

    /**
     * Opens the modal.
     */
    open() {
        this.container.appendChild(this.elements.overlay);
        // Add class after a tick to allow for CSS transitions
        requestAnimationFrame(() => {
            this.elements.overlay.classList.add('visible');
        });
        this._dispatchEvent('open');
    }

    /**
     * Closes the modal.
     */
    close() {
        this.elements.overlay.classList.remove('visible');
        
        // Wait for transition to finish before removing from DOM
        const handleTransitionEnd = () => {
            if (this.elements.overlay.parentNode === this.container) {
                this.container.removeChild(this.elements.overlay);
            }
            this.elements.overlay.removeEventListener('transitionend', handleTransitionEnd);
            this._dispatchEvent('close');
        };
        
        this.elements.overlay.addEventListener('transitionend', handleTransitionEnd);
    }

    /**
     * Sets the content of the modal.
     * @param {string|HTMLElement} content - HTML string or a DOM element.
     */
    setContent(content) {
        this.elements.content.innerHTML = ''; // Clear previous content
        if (typeof content === 'string') {
            this.elements.content.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.elements.content.appendChild(content);
        }
    }

    /**
     * Sets the title of the modal.
     * @param {string} title - The new title text.
     */
    setTitle(title) {
        this.elements.title.textContent = title;
    }

    /**
     * Updates the modal's options and re-renders the affected parts.
     * @param {object} newOptions - The new options to apply.
     * @param {boolean} [isInitial=false] - Flag to skip re-rendering during construction.
     */
    setOptions(newOptions, isInitial = false) {
        const defaults = {
            title: '',
            showCloseButton: true,
            closeOnOverlayClick: true,
            size: 'medium',
            buttons: [],
        };

        this.options = { ...(isInitial ? defaults : this.options), ...newOptions };

        // Avoid re-rendering during initial construction
        if (!isInitial) {
            this.setTitle(this.options.title);
            this.elements.closeButton.style.display = this.options.showCloseButton ? 'block' : 'none';
            this.elements.modal.className = `modal-container modal-size-${this.options.size}`;
            this._renderFooterButtons();
        }
    }
}