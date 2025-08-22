class RotateTool {
    constructor() {
        this.isActive = false;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.rotateLeftBtn = document.getElementById('rotate-left');
        this.rotateRightBtn = document.getElementById('rotate-right');
    }

    bindEvents() {
        // Tool activation/deactivation
        window.addEventListener('imageEditor:toolActivated', (e) => {
            if (e.detail.data.tool === 'rotate') {
                this.activate();
            }
        });

        window.addEventListener('imageEditor:toolDeactivated', () => {
            this.deactivate();
        });

        // Rotation controls
        this.rotateLeftBtn.addEventListener('click', () => this.rotateLeft());
        this.rotateRightBtn.addEventListener('click', () => this.rotateRight());
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    rotateLeft() {
        this.rotate(-90);
    }

    rotateRight() {
        this.rotate(90);
    }

    rotate(degrees) {
        if (!window.imageEditor?.currentImage) return;

        const editor = window.imageEditor;
        const canvas = editor.canvas;
        const ctx = editor.ctx;
        const currentImage = editor.currentImage;

        // Update rotation value
        editor.rotation = (editor.rotation + degrees) % 360;

        // For 90-degree rotations, we need to swap canvas dimensions
        if (degrees % 90 === 0) {
            this.rotateImage90Degrees(degrees > 0);
        } else {
            // For arbitrary rotations, use the existing rotation system
            editor.drawImage();
        }
    }

    rotateImage90Degrees(clockwise) {
        const editor = window.imageEditor;
        const canvas = editor.canvas;
        const ctx = editor.ctx;
        const currentImage = editor.currentImage;

        // Create a temporary canvas to hold the rotated image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set up temporary canvas with swapped dimensions
        if (clockwise) {
            tempCanvas.width = canvas.height;
            tempCanvas.height = canvas.width;
        } else {
            tempCanvas.width = canvas.height;
            tempCanvas.height = canvas.width;
        }

        // Clear temp canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Set up rotation transformation
        tempCtx.save();
        
        if (clockwise) {
            // Rotate 90 degrees clockwise
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.rotate(Math.PI / 2);
        } else {
            // Rotate 90 degrees counter-clockwise
            tempCtx.translate(0, tempCanvas.height);
            tempCtx.rotate(-Math.PI / 2);
        }

        // Draw current canvas content to temp canvas with rotation
        tempCtx.drawImage(canvas, 0, 0);
        tempCtx.restore();

        // Update main canvas dimensions
        canvas.width = tempCanvas.width;
        canvas.height = tempCanvas.height;

        // Draw rotated image back to main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);

        // Create new image from rotated canvas for future operations
        editor.canvasToImage().then(img => {
            editor.currentImage = img;
            
            // Reset scale and offset for the new dimensions
            editor.scale = 1;
            editor.offsetX = 0;
            editor.offsetY = 0;
            
            // Dispatch update event
            editor.dispatchEvent('canvasUpdated');
        });

        // Update canvas wrapper to handle new dimensions
        this.updateCanvasWrapper();
    }

    updateCanvasWrapper() {
        // This method ensures the canvas wrapper properly displays the rotated canvas
        const canvas = window.imageEditor.canvas;
        const wrapper = document.getElementById('canvas-wrapper');
        
        // Force a reflow to update the wrapper's display
        wrapper.style.display = 'none';
        wrapper.offsetHeight; // Trigger reflow
        wrapper.style.display = 'block';
    }

    // Utility method for arbitrary angle rotation (not used in this 90-degree implementation)
    rotateImageArbitrary(angle) {
        const editor = window.imageEditor;
        const canvas = editor.canvas;
        const ctx = editor.ctx;
        const currentImage = editor.currentImage;

        // Calculate new canvas size to fit rotated image
        const radians = (angle * Math.PI) / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));
        
        const newWidth = currentImage.width * cos + currentImage.height * sin;
        const newHeight = currentImage.width * sin + currentImage.height * cos;

        // Create temporary canvas with new dimensions
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        // Set up rotation transformation
        tempCtx.save();
        tempCtx.translate(newWidth / 2, newHeight / 2);
        tempCtx.rotate(radians);
        tempCtx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);
        tempCtx.restore();

        // Update main canvas
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);

        // Update current image
        editor.canvasToImage().then(img => {
            editor.currentImage = img;
            editor.dispatchEvent('canvasUpdated');
        });
    }
}

// Initialize rotate tool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rotateTool = new RotateTool();
});