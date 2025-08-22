// Simple Background Remover with Clipdrop API
class BackgroundRemover {
    constructor() {
        this.uploadArea = null;
        this.fileInput = null;
        this.selectedFile = null;
        this.resultImage = null;
        
        // You'll need to add your Clipdrop API key here
        this.apiKey = '38d4c5f9dd9d3f24452455d81759dd806dc0c0f939ddc1cd4b9befcf11ff57d6e7e555c54284ad1e18dd8776736f926f';
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.actionSection = document.getElementById('actionSection');
        this.previewSection = document.getElementById('previewSection');
        this.removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
        this.processingStatus = document.getElementById('processingStatus');
        this.resultImage = document.getElementById('resultImage');
        this.downloadPNG = document.getElementById('downloadPNG');
        this.downloadJPG = document.getElementById('downloadJPG');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.closeError = document.getElementById('closeError');
    }

    setupEventListeners() {
        // File input
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // Remove background button
        this.removeBackgroundBtn.addEventListener('click', this.removeBackground.bind(this));

        // Download buttons
        this.downloadPNG.addEventListener('click', () => this.downloadImage('png'));
        this.downloadJPG.addEventListener('click', () => this.downloadImage('jpg'));

        // Error handling
        this.closeError.addEventListener('click', this.hideError.bind(this));
        this.errorMessage.addEventListener('click', (e) => {
            if (e.target === this.errorMessage) {
                this.hideError();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');

        const file = event.dataTransfer.files[0];
        if (file) {
            this.processFile(file);
        }
    }

processFile(file) {
    // Validate file
    if (!this.validateFile(file)) {
        return;
    }

    this.selectedFile = file;

    // Create preview inside upload area
    const reader = new FileReader();
    reader.onload = (e) => {
        // Remove existing preview if any
        const existingPreview = this.uploadArea.querySelector('img.preview-img');
        if (existingPreview) existingPreview.remove();

        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('preview-img');
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';

        this.uploadArea.appendChild(img);
    };
    reader.readAsDataURL(file);

    this.showActionSection();
    this.hidePreviewSection();
}

    validateFile(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            this.showError('Please select a valid image file (PNG, JPG, JPEG, or WebP).');
            return false;
        }

        if (file.size > maxSize) {
            this.showError('File size must be less than 10MB.');
            return false;
        }

        return true;
    }

    showActionSection() {
        this.actionSection.style.display = 'block';
    }

    hideActionSection() {
        this.actionSection.style.display = 'none';
    }

    showPreviewSection() {
        this.previewSection.style.display = 'block';
    }

    hidePreviewSection() {
        this.previewSection.style.display = 'none';
    }

    async removeBackground() {
        if (!this.selectedFile) {
            this.showError('Please select an image first.');
            return;
        }

        // Check if API key is configured
        if (!this.apiKey || this.apiKey === 'YOUR_CLIPDROP_API_KEY') {
            this.showError('API key not configured. Please add your Clipdrop API key to use this feature.');
            return;
        }

        this.showProcessing();

        try {
            const result = await this.callClipdropAPI(this.selectedFile);
            this.displayResult(result);
            this.showPreviewSection();
        } catch (error) {
            console.error('Background removal failed:', error);
            this.showError('Failed to remove background. Please try again.');
        } finally {
            this.hideProcessing();
        }
    }

    async callClipdropAPI(file) {
        const formData = new FormData();
        formData.append('image_file', file);

        const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.blob();
    }

    displayResult(blob) {
        const url = URL.createObjectURL(blob);
        this.resultImage.src = url;
        this.resultImage.onload = () => {
            URL.revokeObjectURL(url);
        };
        
        // Store the result for download
        this.resultBlob = blob;
    }

    showProcessing() {
        this.removeBackgroundBtn.disabled = true;
        this.processingStatus.style.display = 'flex';
    }

    hideProcessing() {
        this.removeBackgroundBtn.disabled = false;
        this.processingStatus.style.display = 'none';
    }

    downloadImage(format) {
        if (!this.resultBlob) {
            this.showError('No processed image available for download.');
            return;
        }

        if (format === 'png') {
            this.downloadBlob(this.resultBlob, 'background-removed.png');
        } else if (format === 'jpg') {
            this.convertToJPG(this.resultBlob);
        }
    }

    convertToJPG(blob) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // Fill with white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the image
            ctx.drawImage(img, 0, 0);

            // Convert to JPG and download
            canvas.toBlob((jpgBlob) => {
                this.downloadBlob(jpgBlob, 'background-removed.jpg');
            }, 'image/jpeg', 0.9);

            URL.revokeObjectURL(img.src);
        };

        img.src = URL.createObjectURL(blob);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    handleKeyDown(event) {
        // ESC key to close error
        if (event.key === 'Escape') {
            this.hideError();
        }

        // Enter key to trigger file selection when upload area is focused
        if (event.key === 'Enter' && document.activeElement === this.uploadArea) {
            this.fileInput.click();
        }
    }

    // Reset the tool to initial state
    reset() {
        this.selectedFile = null;
        this.resultBlob = null;
        this.hideActionSection();
        this.hidePreviewSection();
        this.hideError();
        this.fileInput.value = '';
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new BackgroundRemover();
    
    // Make app globally accessible for debugging
    window.backgroundRemover = app;
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});