class FilterTool {
    constructor() {
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0,
            sepia: 0,
            hue: 0
        };
        
        this.initializeElements();
        this.bindEvents();
        this.bindEditorEvents();
    }

    initializeElements() {
        // Filter sliders
        this.brightnessSlider = document.getElementById('brightness-slider');
        this.contrastSlider = document.getElementById('contrast-slider');
        this.saturationSlider = document.getElementById('saturation-slider');
        this.blurSlider = document.getElementById('blur-slider');
        this.grayscaleSlider = document.getElementById('grayscale-slider');
        this.sepiaSlider = document.getElementById('sepia-slider');
        this.hueSlider = document.getElementById('hue-slider');

        // Value display elements
        this.brightnessValue = document.getElementById('brightness-value');
        this.contrastValue = document.getElementById('contrast-value');
        this.saturationValue = document.getElementById('saturation-value');
        this.blurValue = document.getElementById('blur-value');
        this.grayscaleValue = document.getElementById('grayscale-value');
        this.sepiaValue = document.getElementById('sepia-value');
        this.hueValue = document.getElementById('hue-value');

        // Reset button
        this.resetBtn = document.getElementById('reset-filters');
    }

    bindEvents() {
        // Brightness
        this.brightnessSlider.addEventListener('input', (e) => {
            this.filters.brightness = parseInt(e.target.value);
            this.brightnessValue.textContent = `${this.filters.brightness}%`;
            this.applyFilters();
        });

        // Contrast
        this.contrastSlider.addEventListener('input', (e) => {
            this.filters.contrast = parseInt(e.target.value);
            this.contrastValue.textContent = `${this.filters.contrast}%`;
            this.applyFilters();
        });

        // Saturation
        this.saturationSlider.addEventListener('input', (e) => {
            this.filters.saturation = parseInt(e.target.value);
            this.saturationValue.textContent = `${this.filters.saturation}%`;
            this.applyFilters();
        });

        // Blur
        this.blurSlider.addEventListener('input', (e) => {
            this.filters.blur = parseFloat(e.target.value);
            this.blurValue.textContent = `${this.filters.blur}px`;
            this.applyFilters();
        });

        // Grayscale
        this.grayscaleSlider.addEventListener('input', (e) => {
            this.filters.grayscale = parseInt(e.target.value);
            this.grayscaleValue.textContent = `${this.filters.grayscale}%`;
            this.applyFilters();
        });

        // Sepia
        this.sepiaSlider.addEventListener('input', (e) => {
            this.filters.sepia = parseInt(e.target.value);
            this.sepiaValue.textContent = `${this.filters.sepia}%`;
            this.applyFilters();
        });

        // Hue
        this.hueSlider.addEventListener('input', (e) => {
            this.filters.hue = parseInt(e.target.value);
            this.hueValue.textContent = `${this.filters.hue}°`;
            this.applyFilters();
        });

        // Reset filters
        this.resetBtn.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    bindEditorEvents() {
        // Listen for image editor events
        window.addEventListener('imageEditor:imageReset', () => {
            this.resetFilters();
        });

        window.addEventListener('imageEditor:toolActivated', (e) => {
            if (e.detail.data.tool === 'filters') {
                this.onToolActivated();
            }
        });

        window.addEventListener('imageEditor:toolDeactivated', () => {
            this.onToolDeactivated();
        });
    }

    onToolActivated() {
        // Apply current filters when tool is activated
        this.applyFilters();
    }

    onToolDeactivated() {
        // Keep filters applied even when tool is deactivated
        // This allows users to see the effect while using other tools
    }

    applyFilters() {
        if (!window.imageEditor || !window.imageEditor.imageLoaded) {
            return;
        }

        const canvas = window.imageEditor.canvas;
        const filterString = this.buildFilterString();
        
        // Apply CSS filters to the canvas
        canvas.style.filter = filterString;
    }

    buildFilterString() {
        const filters = [
            `brightness(${this.filters.brightness}%)`,
            `contrast(${this.filters.contrast}%)`,
            `saturate(${this.filters.saturation}%)`,
            `blur(${this.filters.blur}px)`,
            `grayscale(${this.filters.grayscale}%)`,
            `sepia(${this.filters.sepia}%)`,
            `hue-rotate(${this.filters.hue}deg)`
        ];

        return filters.join(' ');
    }

    getCurrentFilterString() {
        return this.buildFilterString();
    }

    resetFilters() {
        // Reset filter values to defaults
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0,
            sepia: 0,
            hue: 0
        };

        // Update sliders
        this.brightnessSlider.value = this.filters.brightness;
        this.contrastSlider.value = this.filters.contrast;
        this.saturationSlider.value = this.filters.saturation;
        this.blurSlider.value = this.filters.blur;
        this.grayscaleSlider.value = this.filters.grayscale;
        this.sepiaSlider.value = this.filters.sepia;
        this.hueSlider.value = this.filters.hue;

        // Update display values
        this.brightnessValue.textContent = `${this.filters.brightness}%`;
        this.contrastValue.textContent = `${this.filters.contrast}%`;
        this.saturationValue.textContent = `${this.filters.saturation}%`;
        this.blurValue.textContent = `${this.filters.blur}px`;
        this.grayscaleValue.textContent = `${this.filters.grayscale}%`;
        this.sepiaValue.textContent = `${this.filters.sepia}%`;
        this.hueValue.textContent = `${this.filters.hue}°`;

        // Apply reset filters
        this.applyFilters();
    }

    // Get current filter state (useful for saving)
    getFilterState() {
        return { ...this.filters };
    }

    // Set filter state (useful for loading saved filters)
    setFilterState(filterState) {
        this.filters = { ...filterState };
        
        // Update UI elements
        this.brightnessSlider.value = this.filters.brightness;
        this.contrastSlider.value = this.filters.contrast;
        this.saturationSlider.value = this.filters.saturation;
        this.blurSlider.value = this.filters.blur;
        this.grayscaleSlider.value = this.filters.grayscale;
        this.sepiaSlider.value = this.filters.sepia;
        this.hueSlider.value = this.filters.hue;

        this.brightnessValue.textContent = `${this.filters.brightness}%`;
        this.contrastValue.textContent = `${this.filters.contrast}%`;
        this.saturationValue.textContent = `${this.filters.saturation}%`;
        this.blurValue.textContent = `${this.filters.blur}px`;
        this.grayscaleValue.textContent = `${this.filters.grayscale}%`;
        this.sepiaValue.textContent = `${this.filters.sepia}%`;
        this.hueValue.textContent = `${this.filters.hue}°`;

        // Apply filters
        this.applyFilters();
    }
}

// Initialize the filter tool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.filterTool = new FilterTool();
});