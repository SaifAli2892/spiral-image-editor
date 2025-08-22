class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.currentImage = null;
        this.imageLoaded = false;
        this.scale = 1;
        this.rotation = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateToolStates();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('upload-area');
        this.imageInput = document.getElementById('image-input');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.canvasPlaceholder = document.getElementById('canvas-placeholder');
        this.saveBtn = document.getElementById('save-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.toolBtns = {
            crop: document.getElementById('crop-btn'),
            text: document.getElementById('text-btn'),
            filters: document.getElementById('filters-btn'),
            rotate: document.getElementById('rotate-btn'),
            zoom: document.getElementById('zoom-btn')
        };
    }

    bindEvents() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.loadImage(files[0]);
            }
        });

        // Header buttons
        this.saveBtn.addEventListener('click', () => this.saveImage());
        this.resetBtn.addEventListener('click', () => this.resetImage());
        
        // Home button
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.location.href = '../index.html';
            });
        }

        // Tool toggles
        Object.entries(this.toolBtns).forEach(([tool, btn]) => {
            btn.addEventListener('click', () => this.toggleTool(tool));
        });
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                this.setupCanvas(img);
                this.drawImage();
                this.imageLoaded = true;
                this.updateToolStates();
                this.showCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    setupCanvas(img) {
        // Get container dimensions for better scaling
        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        
        // Use container size with padding for max dimensions
        const maxWidth = Math.min(containerRect.width * 0.9, 1200);
        const maxHeight = Math.min(containerRect.height * 0.9, 800);
        
        let canvasWidth = img.width;
        let canvasHeight = img.height;
        
        // Scale image to fit container while maintaining aspect ratio
        if (canvasWidth > maxWidth || canvasHeight > maxHeight) {
            const widthRatio = maxWidth / canvasWidth;
            const heightRatio = maxHeight / canvasHeight;
            const ratio = Math.min(widthRatio, heightRatio);
            
            canvasWidth = canvasWidth * ratio;
            canvasHeight = canvasHeight * ratio;
        }
        
        // Ensure minimum size for very small images
        const minWidth = 300;
        const minHeight = 200;
        
        if (canvasWidth < minWidth || canvasHeight < minHeight) {
            const widthRatio = minWidth / canvasWidth;
            const heightRatio = minHeight / canvasHeight;
            const ratio = Math.max(widthRatio, heightRatio);
            
            canvasWidth = canvasWidth * ratio;
            canvasHeight = canvasHeight * ratio;
        }
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // Reset transformations
        this.scale = 1;
        this.rotation = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    drawImage() {
        if (!this.currentImage) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply transformations
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX, this.offsetY);
        
        // Draw image centered
        this.ctx.drawImage(
            this.currentImage,
            -this.currentImage.width / 2,
            -this.currentImage.height / 2,
            this.currentImage.width,
            this.currentImage.height
        );
        
        // Restore context state
        this.ctx.restore();
        
        // Notify other tools that canvas has been redrawn
        this.dispatchEvent('canvasUpdated');
    }

    showCanvas() {
        this.canvasPlaceholder.style.display = 'none';
        this.canvasWrapper.style.display = 'block';
    }

    hideCanvas() {
        this.canvasPlaceholder.style.display = 'block';
        this.canvasWrapper.style.display = 'none';
    }

    updateToolStates() {
        const isEnabled = this.imageLoaded;
        Object.values(this.toolBtns).forEach(btn => {
            btn.disabled = !isEnabled;
        });
        this.saveBtn.disabled = !isEnabled;
        this.resetBtn.disabled = !isEnabled;
    }

    toggleTool(toolName) {
        // Deactivate all tools first
        this.deactivateAllTools();
        
        // Activate the selected tool
        const toolBtn = this.toolBtns[toolName];
        const toolControls = document.getElementById(`${toolName}-controls`);
        
        toolBtn.classList.add('active');
        toolControls.style.display = 'block';
        
        // Trigger tool-specific activation
        this.dispatchEvent('toolActivated', { tool: toolName });
    }

    deactivateAllTools() {
        Object.entries(this.toolBtns).forEach(([tool, btn]) => {
            btn.classList.remove('active');
            document.getElementById(`${tool}-controls`).style.display = 'none';
        });
        
        this.dispatchEvent('toolDeactivated');
    }

    saveImage() {
        // Create a temporary canvas for rendering with filters
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set same dimensions as main canvas
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        
        // Apply current filters to the context
        if (window.filterTool && window.filterTool.getCurrentFilterString) {
            tempCtx.filter = window.filterTool.getCurrentFilterString();
        }
        
        // Draw the current canvas content with filters
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Render all text elements onto the canvas if available
        if (window.textTool && window.textTool.textElements) {
            window.textTool.renderTextToCanvas(tempCtx, tempCanvas);
        }
        
        // Download the canvas
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = tempCanvas.toDataURL();
        link.click();
    }

    resetImage() {
        if (this.originalImage) {
            this.currentImage = this.originalImage;
            this.setupCanvas(this.originalImage);
            this.drawImage();
            this.deactivateAllTools();
            
            // Reset canvas filters
            this.canvas.style.filter = '';
            
            // Reset all tool states
            this.dispatchEvent('imageReset');
        }
    }

    // Custom event system for tool communication
    dispatchEvent(eventName, data = null) {
        window.dispatchEvent(new CustomEvent(`imageEditor:${eventName}`, {
            detail: { editor: this, data: data }
        }));
    }

    // Utility methods for tools
    getCanvasRect() {
        return this.canvas.getBoundingClientRect();
    }

    getImageData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    putImageData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }

    // Create a new image from canvas
    canvasToImage() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = this.canvas.toDataURL();
        });
    }
}

// Initialize the editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
});