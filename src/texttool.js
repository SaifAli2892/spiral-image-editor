class TextTool {
    constructor() {
        this.isActive = false;
        this.textElements = [];
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.textCounter = 1;
        this.elementMap = new Map();
        this.processingClick = false;
        this.randomTexts = [
            'Sample Text',
            'Your Text Here',
            'Edit Me',
            'Click to Edit',
            'Add Your Message',
            'Custom Text',
            'Type Here',
            'Hello World',
            'Amazing Photo',
            'Beautiful Image'
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeControls();
    }

    initializeElements() {
        this.textInput = document.getElementById('text-input');
        this.fontFamilySelect = document.getElementById('font-family');
        this.fontSizeSlider = document.getElementById('font-size');
        this.fontSizeValue = document.getElementById('font-size-value');
        this.textColor = document.getElementById('text-color');
        this.textBold = document.getElementById('text-bold');
        this.textItalic = document.getElementById('text-italic');
        this.addTextBtn = document.getElementById('add-text');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
    }

    bindEvents() {
        // Tool activation/deactivation
        window.addEventListener('imageEditor:toolActivated', (e) => {
            if (e.detail.data.tool === 'text') {
                this.activate();
            }
        });

        window.addEventListener('imageEditor:toolDeactivated', () => {
            this.deactivate();
        });

        window.addEventListener('imageEditor:imageReset', () => {
            this.clearAllText();
        });

        window.addEventListener('imageEditor:canvasUpdated', () => {
            this.repositionTextElements();
        });

        // Control events
        this.fontFamilySelect.addEventListener('change', () => this.updateFontFamily());
        this.fontSizeSlider.addEventListener('input', () => this.updateFontSize());
        this.textBold.addEventListener('click', () => this.toggleBold());
        this.textItalic.addEventListener('click', () => this.toggleItalic());
        this.addTextBtn.addEventListener('click', () => this.addText());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addText();
        });
        this.textColor.addEventListener('change', () => this.updateSelectedTextStyle());

        // Global mouse events for text dragging
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: false });
        document.addEventListener('mouseup', () => this.onMouseUp());

        // Canvas click to deselect text
        if (window.imageEditor?.canvas) {
            window.imageEditor.canvas.addEventListener('click', (e) => {
                if (this.isActive && !this.isDragging && !this.processingClick) {
                    this.deselectText();
                }
            });
        }
    }

    initializeControls() {
        this.updateFontSize();
    }

    activate() {
        this.isActive = true;
        this.showTextElements();
        this.makeTextElementsInteractive();
    }

    deactivate() {
        this.isActive = false;
        this.deselectText();
        this.isDragging = false;
        this.processingClick = false;
        this.makeTextElementsNonInteractive();
    }

    updateFontFamily() {
        const fontFamily = this.fontFamilySelect.value;
        if (this.selectedElement) {
            this.selectedElement.style.fontFamily = fontFamily;
        }
    }

    updateFontSize() {
        const size = this.fontSizeSlider.value;
        this.fontSizeValue.textContent = `${size}px`;
        
        if (this.selectedElement) {
            this.selectedElement.style.fontSize = `${size}px`;
        }
    }

    toggleBold() {
        this.textBold.classList.toggle('active');
        if (this.selectedElement) {
            this.selectedElement.style.fontWeight = this.textBold.classList.contains('active') ? 'bold' : 'normal';
        }
    }

    toggleItalic() {
        this.textItalic.classList.toggle('active');
        if (this.selectedElement) {
            this.selectedElement.style.fontStyle = this.textItalic.classList.contains('active') ? 'italic' : 'normal';
        }
    }

    updateSelectedTextStyle() {
        if (this.selectedElement) {
            this.selectedElement.style.color = this.textColor.value;
        }
    }

    addText() {
        let text = this.textInput.value.trim();
        
        if (!text) {
            const randomIndex = Math.floor(Math.random() * this.randomTexts.length);
            text = this.randomTexts[randomIndex] + ' ' + this.textCounter;
            this.textCounter++;
        }

        const textElement = this.createTextElement(text);
        this.positionTextElement(textElement);
        
        const elementId = textElement.getAttribute('data-text-id');
        if (!this.elementMap.has(elementId)) {
            this.canvasWrapper.appendChild(textElement);
            this.textElements.push(textElement);
            this.elementMap.set(elementId, textElement);
            
            setTimeout(() => {
                this.selectText(textElement);
            }, 100);
        }
        
        this.textInput.value = '';
    }

    createTextElement(text) {
        const textElement = document.createElement('div');
        const uniqueId = 'text_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        textElement.className = 'text-element';
        textElement.textContent = text;
        textElement.contentEditable = true;
        textElement.setAttribute('data-text-id', uniqueId);
        
        // Apply current styles
        textElement.style.fontFamily = this.fontFamilySelect.value;
        textElement.style.fontSize = `${this.fontSizeSlider.value}px`;
        textElement.style.color = this.textColor.value;
        textElement.style.fontWeight = this.textBold.classList.contains('active') ? 'bold' : 'normal';
        textElement.style.fontStyle = this.textItalic.classList.contains('active') ? 'italic' : 'normal';
        
        textElement.addEventListener('mousedown', (e) => {
            this.handleTextMouseDown(e, textElement);
        });
        
        textElement.addEventListener('click', (e) => {
            this.handleTextClick(e, textElement);
        });
        
        textElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!this.isDragging) {
                this.enableEditing(textElement);
            }
        });
        
        textElement.addEventListener('blur', () => this.disableEditing(textElement));
        textElement.addEventListener('keydown', (e) => this.handleKeyDown(e, textElement));

        return textElement;
    }

    handleTextClick(e, textElement) {
        e.stopPropagation();
        e.preventDefault();
        
        if (this.processingClick || this.isDragging) return;
        
        this.processingClick = true;
        
        if (this.selectedElement !== textElement && document.activeElement !== textElement) {
            this.selectText(textElement);
        }
        
        setTimeout(() => {
            this.processingClick = false;
        }, 200);
    }

    handleTextMouseDown(e, textElement) {
        if (!this.isActive) return;
        
        if (document.activeElement === textElement) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        if (this.selectedElement !== textElement) {
            this.selectText(textElement);
        }
        
        this.isDragging = true;
        this.selectedElement = textElement;
        
        const rect = textElement.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        textElement.style.cursor = 'grabbing';
        textElement.style.zIndex = '1000';
        textElement.classList.add('dragging');
    }

    enableEditing(textElement) {
        textElement.style.userSelect = 'text';
        textElement.style.cursor = 'text';
        textElement.focus();
    }

    disableEditing(textElement) {
        textElement.style.userSelect = 'none';
        textElement.style.cursor = 'move';
        if (textElement.textContent.trim() === '') {
            textElement.textContent = 'Empty Text';
        }
    }

    handleKeyDown(e, textElement) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                this.deleteText(textElement);
            }
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            textElement.blur();
        }
        if (e.key === 'Escape') {
            textElement.blur();
        }
    }

    positionTextElement(textElement) {
        const canvasRect = window.imageEditor.getCanvasRect();
        const wrapperRect = this.canvasWrapper.getBoundingClientRect();
        
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;
        
        const padding = 50;
        const maxX = Math.max(padding, canvasWidth - 200);
        const maxY = Math.max(padding, canvasHeight - 80);
        
        const randomX = padding + Math.random() * (maxX - padding);
        const randomY = padding + Math.random() * (maxY - padding);
        
        const x = (canvasRect.left - wrapperRect.left) + randomX;
        const y = (canvasRect.top - wrapperRect.top) + randomY;
        
        textElement.style.left = `${x}px`;
        textElement.style.top = `${y}px`;
    }

    onMouseMove(e) {
        if (!this.isDragging || !this.selectedElement || !this.isActive) return;

        e.preventDefault();
        
        const wrapperRect = this.canvasWrapper.getBoundingClientRect();
        const canvasRect = window.imageEditor.getCanvasRect();
        
        let x = e.clientX - this.dragOffset.x - wrapperRect.left;
        let y = e.clientY - this.dragOffset.y - wrapperRect.top;
        
        const elementRect = this.selectedElement.getBoundingClientRect();
        const elementWidth = elementRect.width;
        const elementHeight = elementRect.height;
        
        const canvasLeft = canvasRect.left - wrapperRect.left;
        const canvasTop = canvasRect.top - wrapperRect.top;
        const canvasRight = canvasLeft + canvasRect.width;
        const canvasBottom = canvasTop + canvasRect.height;
        
        const margin = 5;
        x = Math.max(canvasLeft + margin, Math.min(x, canvasRight - elementWidth - margin));
        y = Math.max(canvasTop + margin, Math.min(y, canvasBottom - elementHeight - margin));
        
        this.selectedElement.style.left = `${x}px`;
        this.selectedElement.style.top = `${y}px`;
    }

    onMouseUp() {
        if (!this.isDragging || !this.selectedElement) return;
        
        this.selectedElement.style.cursor = 'move';
        this.selectedElement.style.zIndex = '';
        this.selectedElement.classList.remove('dragging');
        this.isDragging = false;
    }

    selectText(textElement) {
        this.deselectText();
        
        this.selectedElement = textElement;
        textElement.classList.add('selected');
        
        // Update controls to match selected text
        this.fontFamilySelect.value = textElement.style.fontFamily || 'Arial, sans-serif';
        this.fontSizeSlider.value = parseInt(textElement.style.fontSize) || 24;
        this.updateFontSize();
        
        this.textColor.value = this.rgbToHex(textElement.style.color) || '#000000';
        
        if (textElement.style.fontWeight === 'bold') {
            this.textBold.classList.add('active');
        } else {
            this.textBold.classList.remove('active');
        }
        
        if (textElement.style.fontStyle === 'italic') {
            this.textItalic.classList.add('active');
        } else {
            this.textItalic.classList.remove('active');
        }
    }

    deselectText() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
        }
    }

    deleteText(textElement) {
        const elementId = textElement.getAttribute('data-text-id');
        
        if (this.selectedElement === textElement) {
            this.selectedElement = null;
        }
        
        this.elementMap.delete(elementId);
        this.textElements = this.textElements.filter(el => el !== textElement);
        textElement.remove();
    }

    clearAllText() {
        this.textElements.forEach(element => element.remove());
        this.textElements = [];
        this.elementMap.clear();
        this.selectedElement = null;
    }

    showTextElements() {
        this.textElements.forEach(element => {
            element.style.display = 'block';
        });
    }

    hideTextElements() {
        this.textElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    makeTextElementsInteractive() {
        this.textElements.forEach(element => {
            element.style.pointerEvents = 'auto';
        });
    }

    makeTextElementsNonInteractive() {
        this.textElements.forEach(element => {
            element.style.pointerEvents = 'none';
        });
    }

    repositionTextElements() {
        // Called when canvas is updated, could be used to reposition elements
        // Currently, text elements maintain their position relative to the canvas wrapper
    }

    rgbToHex(rgb) {
        if (!rgb) return '#000000';
        
        const result = rgb.match(/\d+/g);
        if (!result) return '#000000';
        
        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);
        
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    renderTextToCanvas(ctx, canvas) {
        // Render all text elements to the canvas for saving
        this.textElements.forEach(textElement => {
            const rect = textElement.getBoundingClientRect();
            const canvasRect = window.imageEditor.getCanvasRect();
            
            // Calculate relative position on the actual canvas
            const x = rect.left - canvasRect.left;
            const y = rect.bottom - canvasRect.top;
            
            // Set font properties
            const fontSize = parseInt(textElement.style.fontSize) || 24;
            const fontFamily = textElement.style.fontFamily || 'Arial, sans-serif';
            const fontWeight = textElement.style.fontWeight || 'normal';
            const fontStyle = textElement.style.fontStyle || 'normal';
            
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = textElement.style.color || '#000000';
            ctx.textBaseline = 'bottom';
            
            // Draw the text
            ctx.fillText(textElement.textContent, x, y);
        });
    }
}

// Initialize text tool
document.addEventListener('DOMContentLoaded', () => {
    window.textTool = new TextTool();
});