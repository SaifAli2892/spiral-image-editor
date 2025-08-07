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

    if (format === 'pdf') {
        const jsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDF) {
            alert("jsPDF library failed to load.");
            return;
        }

        const pdf = new jsPDF();
        let isFirstPage = true;

        for (let i = 0; i < total; i++) {
            const file = files[i];
            const reader = new FileReader();

            const result = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            const img = await new Promise((resolve) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.src = result;
            });

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
        }

        pdf.save(`AllImages.AsConverter.pdf`);
        progressContainer.style.display = 'none';
    } else {
        for (let i = 0; i < total; i++) {
            const file = files[i];
            const fileName = file.name.split('.').slice(0, -1).join('.');
            const reader = new FileReader();

            const result = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            const img = await new Promise((resolve) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.src = result;
            });

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
            downloadContainer.appendChild(a);

            progressBar.value = ((i + 1) / total) * 100;
        }

        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 500);
    }
}
document.getElementById('navToggle').addEventListener('click', function () {
  document.querySelector('nav').classList.toggle('active');
});
