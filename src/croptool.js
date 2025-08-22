class CropTool {
    constructor() {
        this.isActive = false;
        this.isSelecting = false;
        this.isDragging = false;
        this.isResizing = false;
        this.startX = 0;
        this.startY = 0;
        this.selection = null;
        this.resizeHandle = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.overlay = document.getElementById('crop-overlay');
        this.applyBtn = document.getElementById('apply-crop');
        this.cancelBtn = document.getElementById('cancel-crop');
        this.cropBtn = document.getElementById('crop-btn');
    }

    bindEvents() {
        // Tool activation/deactivation
        window.addEventListener('imageEditor:toolActivated', (e) => {
            if (e.detail.data.tool === 'crop') {
                this.activate();
            }
        });

        window.addEventListener('imageEditor:toolDeactivated', () => {
            this.deactivate();
        });

        window.addEventListener('imageEditor:imageReset', () => {
            this.deactivate();
        });

        // Crop controls
        this.applyBtn.addEventListener('click', () => this.applyCrop());
        this.cancelBtn.addEventListener('click', () => this.cancelCrop());

        // Mouse events on overlay
        this.overlay.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
    }

    activate() {
        this.isActive = true;
        this.overlay.style.display = 'block';
        this.overlay.style.pointerEvents = 'all';
        
        // Clear any existing selection
        this.clearSelection();
    }

    deactivate() {
        this.isActive = false;
        this.overlay.style.display = 'none';
        this.overlay.style.pointerEvents = 'none';
        this.clearSelection();
    }

    onMouseDown(e) {
        if (!this.isActive) return;
        
        e.preventDefault();
        const rect = window.imageEditor.getCanvasRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a resize handle
        const handle = this.getResizeHandle(x, y);
        if (handle && this.selection) {
            this.isResizing = true;
            this.resizeHandle = handle;
            this.startX = x;
            this.startY = y;
            return;
        }

        // Check if clicking inside existing selection for dragging
        if (this.selection && this.isInsideSelection(x, y)) {
            this.isDragging = true;
            this.startX = x - this.selection.x;
            this.startY = y - this.selection.y;
            return;
        }

        // Start new selection
        this.isSelecting = true;
        this.startX = x;
        this.startY = y;
        
        this.clearSelection();
        this.createSelection(x, y, 0, 0);
    }

    onMouseMove(e) {
        if (!this.isActive || !this.selection) return;

        const rect = window.imageEditor.getCanvasRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isSelecting) {
            const width = x - this.startX;
            const height = y - this.startY;
            this.updateSelection(this.startX, this.startY, width, height);
        } else if (this.isDragging) {
            const newX = x - this.startX;
            const newY = y - this.startY;
            this.moveSelection(newX, newY);
        } else if (this.isResizing) {
            this.resizeSelection(x, y);
        } else {
            // Update cursor based on position
            this.updateCursor(x, y);
        }
    }

    onMouseUp() {
        this.isSelecting = false;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    createSelection(x, y, width, height) {
        this.clearSelection();

        const selectionDiv = document.createElement('div');
        selectionDiv.className = 'crop-selection';
        selectionDiv.style.left = x + 'px';
        selectionDiv.style.top = y + 'px';
        selectionDiv.style.width = Math.abs(width) + 'px';
        selectionDiv.style.height = Math.abs(height) + 'px';

        // Add resize handles
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
        handles.forEach(handle => {
            const handleDiv = document.createElement('div');
            handleDiv.className = `crop-handle ${handle}`;
            selectionDiv.appendChild(handleDiv);
        });

        this.overlay.appendChild(selectionDiv);
        this.selection = { x, y, width: Math.abs(width), height: Math.abs(height), element: selectionDiv };
    }

    updateSelection(x, y, width, height) {
        if (!this.selection) return;

        // Normalize coordinates for negative width/height
        const normalizedX = width < 0 ? x + width : x;
        const normalizedY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);

        this.selection.x = normalizedX;
        this.selection.y = normalizedY;
        this.selection.width = normalizedWidth;
        this.selection.height = normalizedHeight;

        this.selection.element.style.left = normalizedX + 'px';
        this.selection.element.style.top = normalizedY + 'px';
        this.selection.element.style.width = normalizedWidth + 'px';
        this.selection.element.style.height = normalizedHeight + 'px';
    }

    moveSelection(x, y) {
        if (!this.selection) return;

        const canvasRect = window.imageEditor.getCanvasRect();
        
        // Constrain to canvas bounds
        const maxX = canvasRect.width - this.selection.width;
        const maxY = canvasRect.height - this.selection.height;
        
        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));

        this.selection.x = constrainedX;
        this.selection.y = constrainedY;
        this.selection.element.style.left = constrainedX + 'px';
        this.selection.element.style.top = constrainedY + 'px';
    }

    resizeSelection(x, y) {
        if (!this.selection || !this.resizeHandle) return;

        const handle = this.resizeHandle;
        const selection = this.selection;
        let newX = selection.x;
        let newY = selection.y;
        let newWidth = selection.width;
        let newHeight = selection.height;

        const deltaX = x - this.startX;
        const deltaY = y - this.startY;

        switch (handle) {
            case 'nw':
                newX = selection.x + deltaX;
                newY = selection.y + deltaY;
                newWidth = selection.width - deltaX;
                newHeight = selection.height - deltaY;
                break;
            case 'ne':
                newY = selection.y + deltaY;
                newWidth = selection.width + deltaX;
                newHeight = selection.height - deltaY;
                break;
            case 'sw':
                newX = selection.x + deltaX;
                newWidth = selection.width - deltaX;
                newHeight = selection.height + deltaY;
                break;
            case 'se':
                newWidth = selection.width + deltaX;
                newHeight = selection.height + deltaY;
                break;
            case 'n':
                newY = selection.y + deltaY;
                newHeight = selection.height - deltaY;
                break;
            case 's':
                newHeight = selection.height + deltaY;
                break;
            case 'w':
                newX = selection.x + deltaX;
                newWidth = selection.width - deltaX;
                break;
            case 'e':
                newWidth = selection.width + deltaX;
                break;
        }

        // Ensure minimum size
        if (newWidth < 20) newWidth = 20;
        if (newHeight < 20) newHeight = 20;

        // Constrain to canvas
        const canvasRect = window.imageEditor.getCanvasRect();
        if (newX < 0) { newWidth += newX; newX = 0; }
        if (newY < 0) { newHeight += newY; newY = 0; }
        if (newX + newWidth > canvasRect.width) newWidth = canvasRect.width - newX;
        if (newY + newHeight > canvasRect.height) newHeight = canvasRect.height - newY;

        this.updateSelection(newX, newY, newWidth, newHeight);
        
        // Update start position for smooth resizing
        this.startX = x;
        this.startY = y;
    }

    getResizeHandle(x, y) {
        if (!this.selection) return null;

        const handles = this.selection.element.querySelectorAll('.crop-handle');
        for (let handle of handles) {
            const rect = handle.getBoundingClientRect();
            const parentRect = this.selection.element.getBoundingClientRect();
            const relativeRect = {
                left: rect.left - parentRect.left + this.selection.x,
                top: rect.top - parentRect.top + this.selection.y,
                right: rect.right - parentRect.left + this.selection.x,
                bottom: rect.bottom - parentRect.top + this.selection.y
            };

            if (x >= relativeRect.left && x <= relativeRect.right &&
                y >= relativeRect.top && y <= relativeRect.bottom) {
                return handle.className.split(' ')[1]; // Get handle type (nw, ne, etc.)
            }
        }
        return null;
    }

    isInsideSelection(x, y) {
        if (!this.selection) return false;
        
        return x >= this.selection.x && x <= this.selection.x + this.selection.width &&
               y >= this.selection.y && y <= this.selection.y + this.selection.height;
    }

    updateCursor(x, y) {
        const handle = this.getResizeHandle(x, y);
        if (handle) {
            this.overlay.style.cursor = window.getComputedStyle(
                this.selection.element.querySelector(`.crop-handle.${handle}`)
            ).cursor;
        } else if (this.selection && this.isInsideSelection(x, y)) {
            this.overlay.style.cursor = 'move';
        } else {
            this.overlay.style.cursor = 'crosshair';
        }
    }

    clearSelection() {
        if (this.selection) {
            this.selection.element.remove();
            this.selection = null;
        }
    }

    applyCrop() {
        if (!this.selection) return;

        const canvas = window.imageEditor.canvas;
        const ctx = window.imageEditor.ctx;
        
        // Get the selection coordinates relative to the canvas
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;
        
        const cropX = this.selection.x * scaleX;
        const cropY = this.selection.y * scaleY;
        const cropWidth = this.selection.width * scaleX;
        const cropHeight = this.selection.height * scaleY;

        // Get the cropped image data
        const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        
        // Resize canvas to cropped dimensions
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        // Draw the cropped image data
        ctx.putImageData(imageData, 0, 0);
        
        // Update the current image reference
        window.imageEditor.canvasToImage().then(img => {
            window.imageEditor.currentImage = img;
        });

        this.deactivate();
        window.imageEditor.deactivateAllTools();
    }

    cancelCrop() {
        this.clearSelection();
        this.deactivate();
        window.imageEditor.deactivateAllTools();
    }
}

// Initialize crop tool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cropTool = new CropTool();
});