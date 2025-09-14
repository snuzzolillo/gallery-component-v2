// ===============================================================
// FILE: /components/GalleryComponent/GalleryComponent.js
// VERSION: 16.0.0 (NavigationListComponent & Context Menu)
// ===============================================================
import ModalComponent from '../ModalComponent/ModalComponent.js'; 
import ToolbarComponent from '../ToolbarComponent/ToolbarComponent.js';
import ItemsGridComponent from '../ItemsGridComponent/ItemsGridComponent.js';
import NavigationListComponent from '../NavigationListComponent/NavigationListComponent.js';

export default class GalleryComponent {
    /**
     * Initializes the gallery component.
     * @param {string} containerSelector - The CSS selector for the container element.
     * @param {object} options - Configuration options for the gallery.
     * @param {boolean} [options.foldersAllowed=true] - If true, enables the folder management UI.
     * @param {boolean} [options.previewAllowed=true] - If true, enables double-click to preview.
     * @param {object} options.dataSource - The data source object to fetch and manipulate data.
     * @param {object} [options.gridOptions] - Options to pass to the ItemsGridComponent (e.g., { layout: { direction: 'horizontal' } }).
     * @param {Array<object>} [options.plugins=[]] - An array of plugin instances to extend functionality.
     * @param {object} [options.gridOptions] - Options to pass directly to the ItemGridComponent (e.g., { itemSize: 150, aspectRatio: '1:1' }).
     * @param {object} [options.toolbarOptions] - Options to pass directly to the ToolbarComponent.
     */
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) throw new Error(`GalleryComponent Error: Container "${containerSelector}" not found.`);
        if (!options.dataSource) throw new Error('GalleryComponent Error: A dataSource object is required.');

        this.dataSource = options.dataSource;
        this.plugins = options.plugins || [];

        // Gallery-specific options
        this.options = {
            foldersAllowed: options.foldersAllowed === true,
            previewAllowed: options.previewAllowed !== false,
        };

        // Pass-through options for sub-components
        this.gridOptions = options.gridOptions || {};
        this.toolbarOptions = options.toolbarOptions || {};

        // --- Component State ---
        this._items = [];
        this._folders = [];
        this._selectedIds = new Set();
        this._isRefreshing = false;
        this._currentFolder = null;
        this._activeGenerations = new Map(); // Tracks placeholder-based generations
        
        // --- Capabilities Check ---
        this._capabilities = this._checkCapabilities();

        // --- Initialization ---
        this._loadStyles();
        this._buildSkeleton();
        this._cacheElements();
        
        // --- Instantiate Modular Components ---
        this.toolbar = new ToolbarComponent(this.elements.toolbarContainer, this.toolbarOptions);
        this.modal = new ModalComponent(this.container);
        this.grid = new ItemsGridComponent(this.elements.gridContainer, this.gridOptions);

        if (this.options.foldersAllowed) {
            this.navigationList = new NavigationListComponent(this.elements.navigationListContainer, {
                direction: 'vertical',
            });
        }

        // Set scroll direction based on grid layout options
        const scrollDirection = this.gridOptions?.layout?.direction === 'horizontal' ? 'overflowX' : 'overflowY';
        this.elements.gridContainer.style[scrollDirection] = 'auto';


        this._activeModalContext = null;

        this._updateSelectionToolbar(); // Set initial toolbar state
        this._initializePlugins();
        this._attachEventListeners();
        this.initialize();
    }

    async initialize() {
        if (this.options.foldersAllowed) {
            await this._loadAndRenderFolders();
            if (this._folders.length > 0) {
                this._selectFolder(this._folders[0]);
            } else {
                 this.setTitle("No Folders");
                 this.grid.setItems([]);
            }
        } else {
            this.setTitle("Gallery");
            this.load(null);
        }
    }

    // ===============================================================
    // PUBLIC API
    // ===============================================================

    notify(type, payload) {
        console.log(`[GalleryComponent] Received notification: ${type}`, payload);
        switch (type) {
            case 'taskStart':
                this._handleTaskStart(payload);
                break;
            case 'taskProgress':
                this._handleTaskProgress(payload);
                break;
            case 'taskEnd':
            case 'taskError':
                this._handleTaskEnd(payload, type === 'taskError');
                break;
            case 'taskUpdate': // Legacy support for video-express style updates
                const { id, status, progress, message } = payload;
                const itemEl = this.elements.grid.querySelector(`[data-item-id="${id}"]`);
                if (itemEl) {
                    this._updateItemProgress(itemEl, { status, progress, message });
                    if (status === 'complete') {
                        setTimeout(() => this.load(this._currentFolder?.id), 1000);
                    }
                }
                break;
        }
    }

    addItem(itemData) {
        this._items.unshift(itemData);
        const itemElement = this._buildItemElement(itemData);
        this.elements.grid.insertAdjacentHTML('afterbegin', itemElement);
    }

    async load(folderId) {
        if (this._isRefreshing) return;
        this._isRefreshing = true;
        if (this.elements.refreshBtn) this.elements.refreshBtn.classList.add('loading');
        this._setLoading(true, 'Loading items...');
        this.clearSelection();
        try {
            this._items = await this.dataSource.onLoadItems(folderId);
            this._renderGrid();
        } catch (error) {
            this._renderError(error.message || 'Failed to load items.');
        } finally {
            this._isRefreshing = false;
            if (this.elements.refreshBtn) this.elements.refreshBtn.classList.remove('loading');
        }
    }
    
    setTitle(title) {
        if (this.elements.title) this.elements.title.textContent = title;
    }

    getSelectedItems() {
        return this._items.filter(item => this._selectedIds.has(item.id));
    }

    clearSelection() {
        this._selectedIds.clear();
        this._renderGrid(); // Re-render to show deselection
        this._updateSelectionToolbar();
        this._dispatchEvent('selectionChanged', { selectedItems: [] });
    }

    selectAll() {
        if (this._items.length === 0) return;
        this._items.forEach(item => this._selectedIds.add(item.id));
        this._renderGrid(); // Re-render to show selection
        this._updateSelectionToolbar();
        this._dispatchEvent('selectionChanged', { selectedItems: this.getSelectedItems() });
    }

    toggleFolderPanel(forceState) {
        if (!this.options.foldersAllowed) return;
        const shouldBeCollapsed = forceState !== undefined ? forceState : !this.container.classList.contains('gc-panel-collapsed');
        this.container.classList.toggle('gc-panel-collapsed', shouldBeCollapsed);
    }

    // ===============================================================
    // INTERNAL: ARCHITECTURE & SKELETON
    // ===============================================================

    _loadStyles() {
        const styleId = 'gallery-component-styles';
        if (document.getElementById(styleId)) {
            return; // Styles already loaded
        }

        // Get the full URL of the current JS module.
        const moduleUrl = new URL(import.meta.url);
        // Construct the URL to the CSS file, assuming it's in the same directory.
        const cssUrl = new URL('./GalleryComponent.css', moduleUrl).href;

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    _checkCapabilities() {
        const ds = this.dataSource;
        return {
            renameItem: typeof ds.onRenameItem === 'function',
            deleteItem: typeof ds.onDeleteItem === 'function',
            moveItem: typeof ds.onMoveItem === 'function',
            copyItem: typeof ds.onCopyItem === 'function',
            preview: this.options.previewAllowed,
            createFolder: typeof ds.onCreateFolder === 'function',
            renameFolder: typeof ds.onRenameFolder === 'function',
            deleteFolder: typeof ds.onDeleteFolder === 'function',
        };
    }

    _buildSkeleton() {
        this.container.classList.add('gallery-component-wrapper');
        const folderPanelHtml = this.options.foldersAllowed ? `
            <div class="side-panel" data-panel-container>
                <div class="panel-header">
                    <h2>Folders</h2>
                    <div class="panel-actions-menu-container">
                        <button class="panel-actions-btn" data-action="toggle-panel-menu" title="Folder Actions">⚙️</button>
                        <div class="panel-actions-menu" data-panel-menu style="display: none;"></div>
                    </div>
                </div>
                <div class="panel-content" data-nav-list-container></div>
            </div>` : '';

        const mainContentHtml = `
            <div class="gallery-main-content">
                <div class="gallery-toolbar-container"></div>
                <div class="gallery-grid-container">
                    <div class="gallery-loading-overlay" style="display: none;">
                        <div class="spinner"></div><p class="loading-message"></p></div>
                </div>
            </div>`;

        this.container.innerHTML = `
            ${folderPanelHtml}
            ${mainContentHtml}
            <div class="gallery-notification-container"></div>
        `;
    }

    _cacheElements() {
        this.elements = {};
        if (this.options.foldersAllowed) {
            this.elements.sidePanel = this.container.querySelector('[data-panel-container]');
            this.elements.navigationListContainer = this.container.querySelector('[data-nav-list-container]');
            this.elements.panelMenuBtn = this.container.querySelector('[data-action="toggle-panel-menu"]');
            this.elements.panelMenu = this.container.querySelector('[data-panel-menu]');
        }
        this.elements.toolbarContainer = this.container.querySelector('.gallery-toolbar-container');
        this.elements.mainContent = this.container.querySelector('.gallery-main-content');
        this.elements.gridContainer = this.container.querySelector('.gallery-grid-container');
        this.elements.loadingOverlay = this.container.querySelector('.gallery-loading-overlay');
        this.elements.loadingMessage = this.container.querySelector('.loading-message');
        this.elements.notificationContainer = this.container.querySelector('.gallery-notification-container');
    }

    _attachEventListeners() {
        if (this.options.foldersAllowed) {
            // Listen for events from the new NavigationListComponent
            this.elements.navigationListContainer.addEventListener('item:select', e => this._handleFolderSelect(e.detail.itemId));

            // Handle the contextual actions menu for folders
            this.elements.panelMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._togglePanelMenu();
            });
            this.elements.panelMenu.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action) this._handlePanelMenuAction(action);
            });
        }
        // The toolbar component now handles its own clicks and emits events.
        this.toolbar.container.addEventListener('buttonClick', (event) => {
            // Stop the event from bubbling up to the main container, which also listens for 'buttonClick' from the modal.
            event.stopPropagation(); 
            this._handleToolbarAction(event.detail);
        });

        // Listen for events from our new ItemGridComponent
        this.elements.gridContainer.addEventListener('itemClick', this._handleGridItemClick.bind(this));
        this.elements.gridContainer.addEventListener('itemDblClick', this._handleGridItemDblClick.bind(this));
        this.elements.gridContainer.addEventListener('actionClick', this._handleGridActionClick.bind(this));

        // --- Listen for events from our ModalComponent ---
        // Best Practice: The listener extracts the detail and passes only that
        // to the handler, keeping the handler clean and decoupled from the event structure.
        this.modal.container.addEventListener('buttonClick', (event) => this._handleModalButtonClick(event.detail));
        
        this.modal.container.addEventListener('close', () => {
            this._activeModalContext = null;
        });
    }

    // ===============================================================
    // INTERNAL: PLUGIN & MODAL HANDLING
    // ===============================================================

    _initializePlugins() {
        this.plugins.forEach(plugin => {
            if (typeof plugin.onInit === 'function') {
                plugin.onInit(this);
            }
            // The onToolbarReady hook is now deprecated. Plugins will provide button configurations.
        });
    }

    _handleModalButtonClick(detail) {
        // Immediately capture the context and then clear it.
        // This prevents race conditions or re-entrancy issues.
        const context = this._activeModalContext;
        this._activeModalContext = null;

        if (!context) return;
        
        const { type, resolver, mode, items } = context;

        // Resolve the promise based on the modal type and button clicked.
        if (type === 'confirm') {
            resolver(detail.value === 'confirm');
        } 
        else if (type === 'prompt') {
            if (detail.value === 'confirm') {
                const input = this.modal.elements.content.querySelector('.modal-input');
                resolver(input ? input.value : null);
            } else {
                resolver(null); // Resolve with null on cancel
            }
        }
        else if (type === 'select') {
            if (detail.value === 'confirm') {
                const select = this.modal.elements.content.querySelector('.modal-select');
                resolver(select ? select.value : null);
            } else {
                resolver(null); // Resolve with null on cancel
            }
        }
        else if (type === 'pluginAction') {
            if (detail.value === 'confirm') {
                const formElement = this.modal.elements.content.querySelector('form');
                const formData = this._getFormData(formElement);
                if (this.dataSource && typeof this.dataSource[mode.dataSourceMethod] === 'function') {
                    this.dataSource[mode.dataSourceMethod](items, formData, this._getContext());
                }
            }
        }

        // Close the modal unless it's a persistent preview.
        if (type !== 'preview') {
            this.modal.close();
        }
    }

    _showConfirmModal({ title, prompt }) {
        return new Promise(resolve => {
            this._activeModalContext = { type: 'confirm', resolver: resolve };
            this.modal.setContent(`<p>${prompt}</p>`);
            this.modal.setOptions({
                title: title,
                size: 'small',
                buttons: [
                    { label: 'Cancel', value: 'cancel' },
                    { label: 'Confirm', value: 'confirm', class: 'primary' }
                ]
            });
            this.modal.open();
        });
    }

    _showPromptModal({ title, prompt, initialValue = '' }) {
        return new Promise(resolve => {
            this._activeModalContext = { type: 'prompt', resolver: resolve };
            const content = `
                <p>${prompt}</p>
                <div class="modal-input-container">
                    <input type="text" class="modal-input" value="${this._escapeHtml(initialValue)}">
                </div>
            `;
            this.modal.setContent(content);
            this.modal.setOptions({
                title: title,
                size: 'small',
                buttons: [
                    { label: 'Cancel', value: 'cancel' },
                    { label: 'Confirm', value: 'confirm', class: 'primary' }
                ]
            });
            this.modal.open();
            setTimeout(() => this.modal.elements.content.querySelector('input')?.focus(), 50);
        });
    }

    _showSelectModal({ title, prompt, options = [] }) {
        return new Promise(resolve => {
            this._activeModalContext = { type: 'select', resolver: resolve };
            const optionsHtml = options.map(opt => `<option value="${this._escapeHtml(opt.id)}">${this._escapeHtml(opt.name)}</option>`).join('');
            const content = `
                <p>${prompt}</p>
                <div class="modal-input-container">
                    <select class="modal-select">${optionsHtml}</select>
                </div>
            `;
            this.modal.setContent(content);
            this.modal.setOptions({
                title: title,
                size: 'small',
                buttons: [
                    { label: 'Cancel', value: 'cancel' },
                    { label: 'Confirm', value: 'confirm', class: 'primary' }
                ]
            });
            this.modal.open();
        });
    }

    _showPreviewModal(item) {
        if (!item) return;
        
        this._dispatchEvent('itemPreview', { item });
        const contentContainer = document.createElement('div');
        contentContainer.className = 'preview-media-container';
        let mediaElement;

        switch(item.type) {
            case 'image': 
                mediaElement = document.createElement('img');
                break;
            case 'video': 
                mediaElement = document.createElement('video');
                mediaElement.controls = true;
                mediaElement.autoplay = true;
                break;
            case 'audio': 
                mediaElement = document.createElement('audio');
                mediaElement.controls = true;
                mediaElement.autoplay = true;
                break;
        }

        if (mediaElement) {
            mediaElement.src = item.mediaUrl;
            contentContainer.appendChild(mediaElement);
        } else {
            contentContainer.textContent = 'Unsupported media type for preview.';
        }

        this._activeModalContext = { type: 'preview' };
        this.modal.setContent(contentContainer);
        this.modal.setOptions({
            title: item.name,
            size: 'large',
            buttons: []
        });
        this.modal.open();
    }

    // --- This method is called by plugins ---
    _displayPluginModal(mode) {
        this._activeModalContext = {
            type: 'pluginAction',
            mode: mode,
            items: this.getSelectedItems() // Pass selected items to the plugin modal context
        };

        const formElement = this._buildFormFromFields(mode.modalFields);
        
        this.modal.setContent(formElement);
        this.modal.setOptions({
            title: mode.buttonText || 'Configuration',
            size: 'medium',
            buttons: [
                { label: 'Cancel', value: 'cancel' },
                { label: mode.confirmText || 'Confirm', value: 'confirm', class: 'primary' }
            ]
        });
        this.modal.open();
    }

    _buildFormFromFields(fields = []) {
        const form = document.createElement('form');
        form.className = 'plugin-form';
        form.onsubmit = (e) => e.preventDefault();

        fields.forEach(field => {
            const group = document.createElement('div');
            group.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = `plugin-field-${field.name}`;
            label.textContent = field.label;
            group.appendChild(label);

            let input;
            switch (field.type) {
                case 'textarea':
                    input = document.createElement('textarea');
                    input.rows = field.rows || 4;
                    break;
                case 'select':
                    input = document.createElement('select');
                    (field.options || []).forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt.value;
                        option.textContent = opt.text;
                        input.appendChild(option);
                    });
                    break;
                default:
                    input = document.createElement('input');
                    input.type = field.type || 'text';
                    input.value = field.defaultValue || '';
                    if (field.min) input.min = field.min;
                    if (field.max) input.max = field.max;
            }
            input.id = `plugin-field-${field.name}`;
            input.name = field.name;
            group.appendChild(input);
            form.appendChild(group);
        });
        return form;
    }

    _getFormData(formElement) {
        if (!formElement) return {};
        const data = {};
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            data[input.name] = input.type === 'number' ? parseInt(input.value, 10) : input.value;
        });
        return data;
    }

    _escapeHtml(str) {
        const s = String(str); // Ensure input is a string to handle numbers from IDs
        if (!s) return '';
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    _getContext() {
        return { currentFolder: this._currentFolder };
    }

    async _loadAndRenderFolders() {
        if (typeof this.dataSource.onLoadFolders !== 'function') {
            this.navigationList.setItems([]); // Or show an error
            return;
        }
        try {
            this._folders = await this.dataSource.onLoadFolders();
            this.navigationList.setItems(this._folders);
        } catch (error) {
            this.navigationList.setItems([]); // Or show an error
            console.error(error);
        }
    }

    _buildFolderElement(folder) {
        const { renameFolder, deleteFolder } = this._capabilities;
        const actionsHtml = `
            <div class="folder-actions">
                ${renameFolder ? `<button data-folder-action="rename" data-folder-id="${folder.id}" title="Rename">✏️</button>` : ''} ${deleteFolder ? `<button data-folder-action="delete" data-folder-id="${folder.id}" title="Delete">🗑️</button>` : ''}
            </div>`;
        return `<li class="folder-item" data-folder-id="${folder.id}"><span>${folder.name}</span>${actionsHtml}</li>`;
    }

    _selectFolder(folder) {
        this._currentFolder = folder;
        this.navigationList.setActiveItem(folder.id);
        this.setTitle(folder.name);
        this._renderPanelMenu(); // Update menu for the current context
        this.load(folder.id);
    }

    _handleFolderSelect(folderId) {
        if (folderId != this._currentFolder?.id) {
            const folder = this._folders.find(f => f.id == folderId);
            if (folder) this._selectFolder(folder);
        }
    }

    async _handleCreateFolder() {
        const name = await this._showPromptModal({ title: 'Create New Folder', prompt: 'Enter a name for the new folder:' });
        if (!name) return;
        try {
            await this.dataSource.onCreateFolder(name);
            this._showNotification(`Folder "${name}" created.`, 'success');
            await this._loadAndRenderFolders();
            // FIX: Find the newly created folder by name and select it.
            const newFolder = this._folders.find(f => f.name === name);
            if (newFolder) {
                this._selectFolder(newFolder);
            }
        } catch (error) {
            console.error("Failed to create folder", error);
        }
    }

    async _handleRenameFolder(folder) {
        if (!folder) return;
        const folderId = folder.id; // Keep the ID as it's constant
        const newName = await this._showPromptModal({ title: 'Rename Folder', prompt: `Enter a new name for "${folder.name}":`, initialValue: folder.name });
        if (!newName || newName === folder.name) return;
        try {
            await this.dataSource.onRenameFolder(folderId, newName, this._getContext());
            this._showNotification(`Folder renamed to "${newName}".`, 'success');
            await this._loadAndRenderFolders();
            // FIX: Find the updated folder by its constant ID and re-select it
            // to update the title and ensure it remains active.
            const updatedFolder = this._folders.find(f => f.id === folderId);
            if (updatedFolder) {
                this._selectFolder(updatedFolder);
            }
        } catch (error) {
            console.error("Failed to rename folder", error);
        }
    }

    async _handleDeleteFolder(folder) {
        if (!folder) return;
        const confirmed = await this._showConfirmModal({ title: 'Delete Folder', prompt: `Are you sure you want to delete "${folder.name}"? This may also delete its contents.` });
        if (!confirmed) return;
        try {
            await this.dataSource.onDeleteFolder(folder.id, this._getContext());
            this._showNotification(`Folder "${folder.name}" deleted.`, 'success');
            const wasCurrent = this._currentFolder?.id === folder.id;
            await this._loadAndRenderFolders();
            if (wasCurrent) {
                this._currentFolder = null;
                if (this._folders.length > 0) this._selectFolder(this._folders[0]);
            }
        } catch (error) {
            console.error("Failed to delete folder", error);
        }
    }

    // ===============================================================
    // INTERNAL: ITEM MANAGEMENT (GRID, TOOLBAR, ACTIONS)
    // ===============================================================
    
    _handleGridItemClick(event) {
        const { itemId, originalEvent } = event.detail;
        this._toggleSelection(parseInt(itemId, 10), originalEvent.ctrlKey || originalEvent.metaKey);
    }

    _handleGridItemDblClick(event) {
        const { itemId } = event.detail;
        const item = this._items.find(i => i.id === parseInt(itemId, 10));
        if (item && this._capabilities.preview) {
            this._showPreviewModal(item);
        }
    }

    _handleGridActionClick(event) {
        const { itemId, action } = event.detail;
        const item = this._items.find(i => i.id === parseInt(itemId, 10));
        if (item) this._executeItemAction(action, [item]);
    }

    _handleToolbarAction(detail) {
        const { actionId } = detail;
        const selectedItems = this.getSelectedItems();

        switch (actionId) {
            case 'toggle-panel': this.toggleFolderPanel(); break;
            case 'refresh': this.load(this._currentFolder?.id); break;
            case 'select-all': this.selectAll(); break;
            case 'clear-selection': this.clearSelection(); break;
            case 'delete-selected': this._executeItemAction('delete', selectedItems); break;
            case 'move-selected': this._executeItemAction('move', selectedItems); break;
            case 'copy-selected': this._executeItemAction('copy', selectedItems); break;
            default:
                // Assume it's a plugin action if not a core action
                for (const plugin of this.plugins) {
                    plugin.handleToolbarAction?.(actionId, selectedItems);
                }
                break;
        }
    }

    async _executeItemAction(action, items) {
        if (!items || items.length === 0) return;
        console.log(`[GalleryComponent] Executing action: "${action}" on`, items);
        const context = this._getContext();
        switch (action) {
            case 'preview': this._showPreviewModal(items[0]); break;
            case 'rename': if (this._capabilities.renameItem) await this._handleRenameItemAction(items[0], context); break;
            case 'delete': if (this._capabilities.deleteItem) await this._handleDeleteItemAction(items, context); break;
            case 'move': if (this._capabilities.moveItem) await this._handleMoveItemAction(items, context); break;
            case 'copy': if (this._capabilities.copyItem) await this._handleCopyItemAction(items, context); break;
        }
        this._dispatchEvent('onActionComplete', { action, items });
    }

    async _handleRenameItemAction(item, context) {
        console.log('[GalleryComponent] _handleRenameItemAction: Awaiting modal...');
        const newName = await this._showPromptModal({ title: 'Rename Item', prompt: `New name for "${item.name}":`, initialValue: item.name });
        if (!newName || newName === item.name) return;
        console.log('[GalleryComponent] _handleRenameItemAction: Modal confirmed. Proceeding...');
        const itemEl = this.grid.elements.grid.querySelector(`[data-item-id="${item.id}"]`);
        this._setItemState([itemEl], 'pending-action');
        try {
            await this.dataSource.onRenameItem(item.id, newName, context);
            this._showNotification(`Item renamed.`, 'success');
            await this.load(this._currentFolder?.id);
        } catch (error) {
            this._showNotification(error.message || 'Failed to rename item.', 'error');
            this._setItemState([itemEl], 'error');
        }
    }

    async _handleDeleteItemAction(items, context) {
        console.log('[GalleryComponent] _handleDeleteItemAction: Awaiting modal...');
        const confirmed = await this._showConfirmModal({ title: `Delete ${items.length} Item${items.length > 1 ? 's' : ''}`, prompt: `Are you sure you want to permanently delete ${items.length > 1 ? 'these items' : '"' + items[0].name + '"'}?` });
        if (!confirmed) return;
        console.log('[GalleryComponent] _handleDeleteItemAction: Modal confirmed. Proceeding...');
        const idsToDelete = items.map(item => item.id);
        const elements = items.map(item => this.grid.elements.grid.querySelector(`.grid-item[data-item-id="${item.id}"]`));
        this.clearSelection();
        try {
            await this.dataSource.onDeleteItem(idsToDelete, context);
            // UI is no longer optimistic. We wait for the dataSource to resolve (e.g., server confirmation)
            // and then reload the state from the source.
            this._showNotification(`${idsToDelete.length} item(s) deleted.`, 'success');
            await this.load(this._currentFolder?.id);
        } catch (error) {
            this._showNotification(error.message || 'Failed to delete items.', 'error');
            await this.load(this._currentFolder?.id); // On error, reload from source to ensure consistency.
        }
    }

    async _handleMoveItemAction(items, context) {
        console.log('[DEBUG] Entering _handleMoveItemAction');
        const destinations = await this._getDestinations();
        console.log('[DEBUG] Got destinations:', destinations);
        if (!destinations || destinations.length === 0) { this._showNotification('No other folders available to move to.', 'info'); return; }
        
        const destinationId = await this._showSelectModal({ title: `Move ${items.length} Item(s)`, prompt: 'Select a destination folder:', options: destinations });
        console.log('[DEBUG] Modal returned destinationId:', destinationId);
        if (!destinationId) return;

        const itemIds = items.map(item => item.id);
        this.clearSelection();
        try {
            console.log('[DEBUG] Calling dataSource.onMoveItem...');
            await this.dataSource.onMoveItem(itemIds, destinationId, context);
            console.log('[DEBUG] dataSource.onMoveItem completed.');
            this._showNotification(`${itemIds.length} item(s) moved.`, 'success');
            await this.load(this._currentFolder?.id);
        } catch (error) {
            console.error('[DEBUG] Error in onMoveItem:', error);
            this._showNotification(error.message || 'Failed to move items.', 'error');
            await this.load(this._currentFolder?.id); // On error, reload from source.
        }
    }

    async _handleCopyItemAction(items, context) {
        console.log('[DEBUG] Entering _handleCopyItemAction');
        const destinations = await this._getDestinations(true);
        console.log('[DEBUG] Got destinations:', destinations);
        if (!destinations || destinations.length === 0) { this._showNotification('No folders available to copy to.', 'info'); return; }

        const destinationId = await this._showSelectModal({ title: `Copy ${items.length} Item(s)`, prompt: 'Select a destination folder:', options: destinations });
        console.log('[DEBUG] Modal returned destinationId:', destinationId);
        if (!destinationId) return;

        const itemIds = items.map(item => item.id);
        this.clearSelection();
        try {
            await this.dataSource.onCopyItem(itemIds, destinationId, context);
            this._showNotification(`${itemIds.length} item(s) copied.`, 'success');
            // If copying to the current folder, we must reload to see the new items.
            if (destinationId == this._currentFolder?.id) {
                await this.load(this._currentFolder?.id);
            }
        } catch (error) {
            console.error('[DEBUG] Error in onCopyItem:', error);
            this._showNotification(error.message || 'Failed to copy items.', 'error');
        }
    }

    _animateAndRemove(elements, idsToRemove) {
        return new Promise(resolve => {
            const validElements = elements.filter(el => el);
            if (validElements.length === 0) {
                this._items = this._items.filter(item => !idsToRemove.includes(item.id));
                this._renderGrid();
                return resolve();
            }
            validElements.forEach(el => el.classList.add('item-fade-out'));
            validElements[0].addEventListener('animationend', () => {
                this._items = this._items.filter(item => !idsToRemove.includes(item.id));
                this._renderGrid();
                resolve();
            }, { once: true });
        });
    }

    async _getDestinations(allowCurrent = false) {
        if (!this.options.foldersAllowed) return [];
        const allFolders = this._folders;
        if (allowCurrent) return allFolders;
        return allFolders.filter(folder => folder.id !== this._currentFolder?.id);
    }

    // ===============================================================
    // INTERNAL: RENDERING & STATE
    // ===============================================================
    _renderGrid() {
        this._setLoading(false);

        const gridItems = this._items.map(item => {
            const { renameItem, deleteItem, moveItem, preview } = this._capabilities;
            const itemActions = [];
            if (preview) itemActions.push({ id: 'preview', label: 'Preview', icon: '🔍' });
            if (renameItem) itemActions.push({ id: 'rename', label: 'Rename', icon: '✏️' });
            if (moveItem) itemActions.push({ id: 'move', label: 'Move', icon: '➡️' });
            if (deleteItem) itemActions.push({ id: 'delete', label: 'Delete', icon: '🗑️' });

            return {
                ...item,
                isSelected: this._selectedIds.has(item.id),
                actions: itemActions,
            };
        });

        this.grid.setItems(gridItems);
    }

    _setLoading(isLoading, message = '') {
        // Non-destructive loading state management
        if (isLoading) {
            this.elements.loadingMessage.textContent = message;
            this.elements.loadingOverlay.style.display = 'flex';
            this.grid.setItems([]); // Clear the grid visually
        } else {
            this.elements.loadingOverlay.style.display = 'none';
        }
    }

    _toggleSelection(id, isMultiSelect) {
        if (!isMultiSelect) {
            const wasSelected = this._selectedIds.has(id) && this._selectedIds.size === 1;
            this.clearSelection();
            if (wasSelected) return;
        }
        if (this._selectedIds.has(id)) {
            this._selectedIds.delete(id);
        } else {
            this._selectedIds.add(id);
        }
        this._renderGrid(); // Re-render to show selection changes
        this._updateSelectionToolbar();
    }

    _updateSelectionToolbar() {
        const count = this._selectedIds.size;
        const selectedItems = this.getSelectedItems();
        let toolbarItems = [];

        if (this.options.foldersAllowed) {
            toolbarItems.push({ type: 'button', id: 'toggle-panel', icon: '☰', label: '' });
        }

        const titleText = this._currentFolder ? this._currentFolder.name : "Gallery";
        toolbarItems.push({ type: 'custom', html: `<span class="toolbar-title">${this._escapeHtml(titleText)}</span>` });

        if (count > 0) {
            toolbarItems.push({ type: 'custom', html: `<span class="selection-count">${count} selected</span>` });
            toolbarItems.push({ type: 'separator' });
            if (this._capabilities.copyItem) toolbarItems.push({ type: 'button', id: 'copy-selected', label: 'Copy', icon: '📄' });
            if (this._capabilities.moveItem) toolbarItems.push({ type: 'button', id: 'move-selected', label: 'Move', icon: '➡️' });
            if (this._capabilities.deleteItem) toolbarItems.push({ type: 'button', id: 'delete-selected', label: 'Delete', icon: '🗑️' });
            toolbarItems.push({ type: 'button', id: 'clear-selection', label: 'Clear', icon: '❌' });
        }

        toolbarItems.push({ type: 'spacer' });
        toolbarItems.push({ type: 'button', id: 'select-all', label: 'Select All' });
        toolbarItems.push({ type: 'button', id: 'refresh', icon: '🔄' });

        // New Plugin Contract: Ask plugins for their button configurations
        const pluginButtons = [];
        for (const plugin of this.plugins) {
            if (typeof plugin.getToolbarButtons === 'function') {
                pluginButtons.push(...plugin.getToolbarButtons(selectedItems));
            }
        }

        if (pluginButtons.length > 0) {
            toolbarItems.push({ type: 'separator' });
            toolbarItems.push(...pluginButtons);
        }

        this.toolbar.setItems(toolbarItems);

        // Legacy support for plugins that need to react to selection changes
        for (const plugin of this.plugins) {
            if (typeof plugin.onSelectionChanged === 'function') {
                plugin.onSelectionChanged(selectedItems);
            }
        }
        this._dispatchEvent('selectionChanged', { selectedItems });
    }

    _renderPanelMenu() {
        const menu = this.elements.panelMenu;
        if (!menu) return;

        const { createFolder, renameFolder, deleteFolder } = this._capabilities;
        let menuHtml = '';

        if (createFolder) menuHtml += `<button class="panel-menu-item" data-action="create-folder">New Folder</button>`;
        if (renameFolder) menuHtml += `<button class="panel-menu-item" data-action="rename-folder">Rename Current</button>`;
        if (deleteFolder) menuHtml += `<button class="panel-menu-item" data-action="delete-folder">Delete Current</button>`;

        menu.innerHTML = menuHtml;
    }

    _togglePanelMenu() {
        const menu = this.elements.panelMenu;
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
    }

    _handlePanelMenuAction(action) {
        this._togglePanelMenu(); // Close menu after action
        switch (action) {
            case 'create-folder': this._handleCreateFolder(); break;
            case 'rename-folder': this._handleRenameFolder(this._currentFolder); break;
            case 'delete-folder': this._handleDeleteFolder(this._currentFolder); break;
        }
    }

    _renderError(message) {
        this._setLoading(false);
        this.elements.gridContainer.innerHTML = `<p class="gallery-placeholder error">${message}</p>`;
    }

    _setItemState(elements, state) {
        elements.forEach(el => {
            if (el) {
                el.classList.remove('pending-action', 'error');
                if (state === 'pending-action' || state === 'error') {
                    el.classList.add(state);
                }
            }
        });
    }

    _dispatchEvent(name, detail) {
        this.container.dispatchEvent(new CustomEvent(name, { detail }));
    }
    
    _showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `gallery-toast ${type}`;
        toast.textContent = message;
        this.elements.notificationContainer.appendChild(toast);

        // After a delay, trigger the fade-out animation.
        setTimeout(() => {
            // Add a class to trigger the CSS animation.
            toast.classList.add('toast-fade-out');
            
            // Listen for the animation to end, then remove the element.
            // Now that the CSS syntax is fixed, this event-based approach is the
            // preferred, cleaner method and should work reliably.
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, 4000); // Time the toast is visible before it starts to fade out.
    }

    // ===============================================================
    // INTERNAL: ASYNC TASK NOTIFICATION HANDLING (from v8.0)
    // ===============================================================

    _handleTaskStart(payload) {
        const { generationId, totalItems, targetFolderId } = payload;
        if (!generationId || !totalItems) return;
        this._activeGenerations.set(generationId, { total: totalItems, completed: 0, placeholders: [] });
        const currentFolderId = this._currentFolder ? this._currentFolder.id : null;
        if (targetFolderId === currentFolderId) {
            // Placeholder logic would need to be adapted to the new grid component
            console.warn("Placeholder rendering for async tasks needs reimplementation with ItemsGridComponent.");
        }
    }

    _handleTaskProgress(payload) {
        const { generationId, itemData } = payload;
        if (!generationId || !itemData) return;
        const generation = this._activeGenerations.get(generationId);
        if (!generation) return;
        this._items.unshift(itemData);
        generation.completed++;
        // Re-render the grid to show the new item
        this._renderGrid();
    }

    _handleTaskEnd(payload, isError) {
        const { generationId } = payload;
        if (!generationId) return;
        const placeholders = this.grid.elements.grid.querySelectorAll(`.gallery-item.is-placeholder[data-generation-id="${generationId}"]`);
        placeholders.forEach(el => { el.classList.add('item-fade-out'); el.addEventListener('animationend', () => el.remove()); });
        this._activeGenerations.delete(generationId);
    }
}
