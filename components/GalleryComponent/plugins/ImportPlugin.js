// ===============================================================
// FILE: /components/GalleryComponent/plugins/ImportPlugin.js
// VERSION: 3.0.0 (Modal Integration)
// ===============================================================

class ImportPlugin {
    /**
     * Initializes the Import plugin.
     * @param {object} options - Configuration options for the plugin.
     * @param {string} [options.buttonText='Import'] - The text for the import button.
     * @param {Array<string>} [options.sources=['fileSystem']] - Allowed import sources.
     */
    constructor(options = {}) {
        this.options = {
            buttonText: options.buttonText || 'Import',
            sources: options.sources || ['fileSystem'],
        };
        this.gallery = null;
        this.dataSource = null;
    }

    // --- HOOKS ---

    onInit(galleryInstance) {
        this.gallery = galleryInstance;
        this.dataSource = this.gallery.dataSource;
        // Check for required dataSource method
        if (!this.dataSource || typeof this.dataSource.onUploadItem !== 'function') {
            console.warn('ImportPlugin: dataSource is missing the onUploadItem() method. The plugin will be disabled.');
            this.isDisabled = true;
        }
    }

    /**
     * Called by GalleryComponent to get the plugin's toolbar buttons.
     * This plugin's button is always visible, regardless of selection.
     * @param {Array<object>} selectedItems - The currently selected items (unused in this plugin).
     * @returns {Array<object>} - An array of button configurations for the toolbar.
     */
    getToolbarButtons(selectedItems) {
        if (this.isDisabled) {
            return [];
        }
        return [{
            type: 'button',
            id: 'import-files', // Unique action ID
            label: this.options.buttonText,
            icon: '⬆️'
        }];
    }

    /**
     * Called by GalleryComponent when a plugin's toolbar button is clicked.
     * @param {string} actionId - The ID of the action/button that was clicked.
     */
    handleToolbarAction(actionId) {
        if (actionId === 'import-files') {
            this.startImport();
        }
    }

    // --- PLUGIN LOGIC ---

    startImport() {
        // For now, we only support fileSystem. In the future, this could show a modal to choose the source.
        if (this.options.sources.includes('fileSystem')) {
            this.triggerFileInput();
        }
    }

    triggerFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,video/*,audio/*';
        input.style.display = 'none';
        input.addEventListener('change', (event) => this.handleFilesSelected(event.target.files));
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    async handleFilesSelected(files) {
        if (!files || files.length === 0) return;

        const fileList = Array.from(files).map(file => ({
            id: `file_${Date.now()}_${Math.random()}`,
            file,
            status: 'queued', // 'queued', 'uploading', 'success', 'error'
            progress: 0,
            errorMessage: ''
        }));

        this._showUploadModal(fileList);
        await this.processUploadQueue(fileList);
    }

    async processUploadQueue(fileList) {
        for (const fileItem of fileList) {
            try {
                fileItem.status = 'uploading';
                this._updateModalProgress(fileItem);
                
                const base64String = await this._fileToBase64(fileItem.file);
                
                // This is a simplified progress simulation. A real implementation would use XHR progress events.
                const simulateProgress = setInterval(() => {
                    fileItem.progress = Math.min(99, fileItem.progress + 10);
                    this._updateModalProgress(fileItem);
                }, 200);

                await this.dataSource.onUploadItem(
                    {
                        fileName: fileItem.file.name,
                        data: base64String,
                    },
                    this.gallery._currentFolder?.id,
                    { currentFolder: this.gallery._currentFolder }
                );

                clearInterval(simulateProgress);
                fileItem.progress = 100;
                fileItem.status = 'success';
                this._updateModalProgress(fileItem);

            } catch (error) {
                fileItem.status = 'error';
                fileItem.errorMessage = error.message || 'Upload failed.';
                this._updateModalProgress(fileItem);
            }
        }

        this._updateModalTitle('Import Complete');

        // Close the modal and refresh the gallery after a short delay
        setTimeout(() => {
            this.gallery.modal.close();
            this.gallery.load(this.gallery._currentFolder?.id);
        }, 1500); // Delay to show final status
    }

    _fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // --- UI (MODAL) ---

    _showUploadModal(fileList) {
        const listHtml = `
            <ul class="import-file-list">
                ${fileList.map(item => this._createFileListItemHtml(item)).join('')}
            </ul>
        `;
        
        this.gallery.modal.setContent(listHtml);
        this.gallery.modal.setOptions({
            title: `Importing ${fileList.length} file(s)`,
            size: 'medium',
            buttons: [], // No buttons, it will close automatically
            closeOnOverlayClick: false,
            showCloseButton: false
        });
        this.gallery.modal.open();
    }

    _createFileListItemHtml(fileItem) {
        return `
            <li data-file-id="${fileItem.id}">
                <span class="import-file-name">${fileItem.file.name}</span>
                <div class="import-progress-bar">
                    <div class="import-progress-fill" style="width: 0%;"></div>
                </div>
                <span class="import-status">Queued</span>
            </li>
        `;
    }

    _updateModalProgress(fileItem) {
        const modalContent = this.gallery.modal.elements.content;
        if (!modalContent) return;

        const itemEl = modalContent.querySelector(`[data-file-id="${fileItem.id}"]`);
        if (!itemEl) return;

        const fillEl = itemEl.querySelector('.import-progress-fill');
        const statusEl = itemEl.querySelector('.import-status');

        fillEl.style.width = `${fileItem.progress}%`;

        switch (fileItem.status) {
            case 'uploading':
                statusEl.textContent = `${fileItem.progress}%`;
                break;
            case 'success':
                statusEl.textContent = '✅';
                fillEl.style.backgroundColor = 'var(--color-button-success-bg)';
                break;
            case 'error':
                statusEl.textContent = '❌';
                fillEl.style.backgroundColor = 'var(--color-button-danger-bg)';
                itemEl.title = fileItem.errorMessage;
                break;
            case 'queued':
                statusEl.textContent = 'Queued';
                break;
        }
    }

    _updateModalTitle(newTitle) {
        if (this.gallery && this.gallery.modal) {
            this.gallery.modal.setTitle(newTitle);
        }
    }
}

export default ImportPlugin;
