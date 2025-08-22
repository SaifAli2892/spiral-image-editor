class ZoomTool {
    constructor() {
        this.isActive = false;
        this.minZoom = 0.25;
        this.maxZoom = 3;
        this.zoomStep = 0.25;
        
        this.initializeElements();
        this.bindEvents();
        this.updateZoomDisplay();
    }

    initializeElements() {
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.zoomSlider = document.getElementById('zoom-slider');
        this.zoomValue = document.getElementById('zoom-value');
        this.zoomFitBtn = document.getElementById('zoom-fit');
    }

    bindEvents() {
        // Tool activation/deactivation
        window.addEventListener('imageEditor:toolActivated', (e) => {
            if (e.detail.data.tool === 'zoom') {
                this.activate();
            }
        });

        window.addEventListener('imageEditor:toolDeactivated', () => {
            this.deactivate();
        });

        window.addEventListener('imageEditor:canvasUpdated', () => {
            this.updateZoomDisplay();
        });

        window.addEventListener('imageEditor:imageReset', () => {
            this.resetZoom();
        });

        // Zoom controls
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.zoomSlider.addEventListener('input', () => this.setZoom(parseFloat(this.zoomSlider.value)));
        this.zoomFitBtn.addEventListener('click', () => this.fitToCanvas());

        // Mouse wheel zoom (when tool is active)
        window.imageEditor?.canvas?.addEventListener('wheel', (e) => {
            if (this.isActive) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
                this.adjustZoom(delta);
            }
        });
    }

    activate() {
        this.isActive = true;
        this.updateZoomDisplay();
    }

    deactivate() {
        this.isActive = false;
    }

    zoomIn() {
        this.adjustZoom(this.zoomStep);
    }

    zoomOut() {
        this.adjustZoom(-this.zoomStep);
    }

    adjustZoom(delta) {
        const editor = window.imageEditor;
        if (!editor || !editor.currentImage) return;

        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, editor.scale + delta));
        this.setZoom(newZoom);
    }

    setZoom(zoom) {
        const editor = window.imageEditor;
        if (!editor || !editor.currentImage) return;

        // Clamp zoom value
        zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
        
        editor.scale = zoom;
        this.updateZoomDisplay();
        this.applyZoom();
    }

    applyZoom() {
        const editor = window.imageEditor;
        if (!editor || !editor.currentImage) return;

        // Method 1: Scale the canvas directly (simpler approach)
        this.scaleCanvas();
        
        // Method 2: Alternative - modify canvas dimensions and redraw
        // this.resizeCanvasForZoom();
    }

    scaleCanvas() {
        const editor = window.imageEditor;
        const canvas = editor.canvas;
        const wrapper = document.getElementById('canvas-wrapper');
        
        // Apply CSS transform for zoom
        canvas.style.transform = `scale(${editor.scale})`;
        canvas.style.transformOrigin = 'center center';
        
        // Update wrapper to accommodate scaled canvas
        const scaledWidth = canvas.offsetWidth * editor.scale;
        const scaledHeight = canvas.offsetHeight * editor.scale;
        
        // Ensure wrapper can contain the scaled canvas
        wrapper.style.overflow = 'auto';
        wrapper.style.maxWidth = '100%';
        wrapper.style.maxHeight = '100%';
    }

    resizeCanvasForZoom() {
        // Alternative approach: actually resize canvas and redraw
        const editor = window.imageEditor;
        if (!editor || !editor.currentImage) return;

        const originalWidth = editor.currentImage.width;
        const originalHeight = editor.currentImage.height;
        
        const newWidth = originalWidth * editor.scale;
        const newHeight = originalHeight * editor.scale;

        // Limit canvas size for performance
        const maxCanvasSize = 2000;
        if (newWidth > maxCanvasSize || newHeight > maxCanvasSize) {
            const ratio = Math.min(maxCanvasSize / newWidth, maxCanvasSize / newHeight);
            editor.canvas.width = newWidth * ratio;
            editor.canvas.height = newHeight * ratio;
        } else {
            editor.canvas.width = newWidth;
            editor.canvas.height = newHeight;
        }

        // Redraw image at new size
        editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
        editor.ctx.drawImage(
            editor.currentImage,
            0, 0,
            editor.canvas.width,
            editor.canvas.height
        );
        
        editor.dispatchEvent('canvasUpdated');
    }

    fitToCanvas() {
        const editor = window.imageEditor;
        if (!editor || !editor.currentImage) return;

        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        
        // Calculate available space (with some padding)
        const availableWidth = containerRect.width - 40;
        const availableHeight = containerRect.height - 40;
        
        const imageWidth = editor.currentImage.width;
        const imageHeight = editor.currentImage.height;
        
        // Calculate scale to fit
        const scaleX = availableWidth / imageWidth;
        const scaleY = availableHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
        
        this.setZoom(scale);
    }

    resetZoom() {
        const editor = window.imageEditor;
        if (editor) {
            editor.scale = 1;
            editor.offsetX = 0;
            editor.offsetY = 0;
        }
        this.updateZoomDisplay();
        this.applyZoom();
    }

    updateZoomDisplay() {
        const editor = window.imageEditor;
        const currentZoom = editor ? editor.scale : 1;
        
        this.zoomSlider.value = currentZoom;
        this.zoomValue.textContent = `${Math.round(currentZoom * 100)}%`;
        
        // Update button states
        this.zoomInBtn.disabled = currentZoom >= this.maxZoom;
        this.zoomOutBtn.disabled = currentZoom <= this.minZoom;
    }

    // Utility methods for advanced zoom features

    zoomToPoint(x, y, zoomDelta) {
        // Zoom in/out centered on a specific point
        const editor = window.imageEditor;
        if (!editor || !editor.currentImage) return;

        const canvas = editor.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Convert screen coordinates to canvas coordinates
        const canvasX = (x - rect.left) * (canvas.width / rect.width);
        const canvasY = (y - rect.top) * (canvas.height / rect.height);
        
        // Calculate new zoom level
        const oldZoom = editor.scale;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, oldZoom + zoomDelta));
        
        if (newZoom === oldZoom) return;
        
        // Calculate offset to keep zoom centered on the point
        const zoomRatio = newZoom / oldZoom;
        editor.offsetX = canvasX - (canvasX - editor.offsetX) * zoomRatio;
        editor.offsetY = canvasY - (canvasY - editor.offsetY) * zoomRatio;
        
        this.setZoom(newZoom);
    }

    getZoomInfo() {
        const editor = window.imageEditor;
        return {
            currentZoom: editor ? editor.scale : 1,
            minZoom: this.minZoom,
            maxZoom: this.maxZoom,
            canZoomIn: editor ? editor.scale < this.maxZoom : false,
            canZoomOut: editor ? editor.scale > this.minZoom : false
        };
    }
}

// Initialize zoom tool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zoomTool = new ZoomTool();
});