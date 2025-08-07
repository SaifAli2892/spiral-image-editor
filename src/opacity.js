// Select elements
const uploadInput = document.getElementById('opacityUpload');
const previewImg = document.getElementById('opacityPreview');
const rangeInput = document.getElementById('opacityRange');
const opacityValue = document.getElementById('opacityValue');
const downloadBtn = document.getElementById('opacityDownload');
const canvas = document.getElementById('opacityCanvas');
const ctx = canvas.getContext('2d');

let uploadedImage = null;

// Preview image on upload
uploadInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewImg.style.display = 'block';
    uploadedImage = new Image();
    uploadedImage.onload = function () {
      applyOpacity(); // Set default opacity
    };
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Update opacity in real-time
rangeInput.addEventListener('input', function () {
  const value = this.value;
  opacityValue.textContent = value;
  if (uploadedImage) applyOpacity();
});

// Apply opacity using canvas
function applyOpacity() {
  const opacity = rangeInput.value / 100;

  // Set canvas size to image size
  canvas.width = uploadedImage.width;
  canvas.height = uploadedImage.height;

  // Clear canvas and apply new opacity
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = opacity;
  ctx.drawImage(uploadedImage, 0, 0);

  // Update preview image
  previewImg.src = canvas.toDataURL('image/png');
}

// Download adjusted image
downloadBtn.addEventListener('click', function () {
  if (!uploadedImage) {
    alert("Please upload an image first.");
    return;
  }

  const link = document.createElement('a');
  link.download = 'transparent-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
