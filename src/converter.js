// Image Converter Functionality
async function convertAllImages() {
    const input = document.getElementById('imageInput');
    const format = document.getElementById('formatSelect').value;
    const files = input.files;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const downloadContainer = document.getElementById('downloads');

    if (!files.length) {
        alert("Please select one or more image files.");
        return;
    }

    downloadContainer.innerHTML = '';
    progressBar.value = 0;
    progressContainer.style.display = 'block';

    const total = files.length;

    try {
        if (format === 'pdf') {
            await convertToPDF(files, canvas, ctx, progressBar, total);
        } else {
            await convertToImageFormat(files, canvas, ctx, progressBar, total, format, downloadContainer);
        }
    } catch (error) {
        console.error('Conversion error:', error);
        alert('An error occurred during conversion: ' + error.message);
    } finally {
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 500);
    }
}

async function convertToPDF(files, canvas, ctx, progressBar, total) {
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) {
        throw new Error("jsPDF library failed to load.");
    }

    const pdf = new jsPDF();
    let isFirstPage = true;

    for (let i = 0; i < total; i++) {
        const file = files[i];
        
        try {
            const result = await readFileAsDataURL(file);
            const img = await loadImage(result);

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgAspect = canvas.width / canvas.height;
            const pageAspect = pageWidth / pageHeight;

            let pdfWidth, pdfHeight;
            if (imgAspect > pageAspect) {
                pdfWidth = pageWidth;
                pdfHeight = pageWidth / imgAspect;
            } else {
                pdfHeight = pageHeight;
                pdfWidth = pageHeight * imgAspect;
            }

            const x = (pageWidth - pdfWidth) / 2;
            const y = (pageHeight - pdfHeight) / 2;

            if (!isFirstPage) {
                pdf.addPage();
            }
            isFirstPage = false;

            pdf.addImage(imgData, 'JPEG', x, y, pdfWidth, pdfHeight);
            progressBar.value = ((i + 1) / total) * 100;
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            throw error;
        }
    }

    pdf.save(`AllImages.AsConverter.pdf`);
}

async function convertToImageFormat(files, canvas, ctx, progressBar, total, format, downloadContainer) {
    for (let i = 0; i < total; i++) {
        const file = files[i];
        const fileName = file.name.split('.').slice(0, -1).join('.');

        try {
            const result = await readFileAsDataURL(file);
            const img = await loadImage(result);

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const mime = format === 'ico' ? 'image/x-icon' : `image/${format}`;
            const imageData = canvas.toDataURL(mime);

            const a = document.createElement('a');
            a.href = imageData;
            a.download = `${fileName}.spiraltool.${format}`;
            a.innerText = `Download ${a.download}`;
            a.style.display = 'block';
            a.className = 'download-link';
            downloadContainer.appendChild(a);

            progressBar.value = ((i + 1) / total) * 100;
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            throw error;
        }
    }
}

// Helper functions
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = src;
    });
}

// Initialize converter when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Image converter initialized successfully');
    
    // Add drag and drop functionality
    const imageInput = document.getElementById('imageInput');
    const toolContainer = document.querySelector('.tool-container');
    
    if (imageInput && toolContainer) {
        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            toolContainer.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            toolContainer.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            toolContainer.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            toolContainer.style.borderColor = '#00f2fe';
            toolContainer.style.backgroundColor = 'rgba(0, 242, 254, 0.1)';
        }

        function unhighlight() {
            toolContainer.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            toolContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }

        toolContainer.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            imageInput.files = files;
            
            // Show file count
            if (files.length > 0) {
                console.log(`${files.length} file(s) dropped`);
            }
        }
    }
});
