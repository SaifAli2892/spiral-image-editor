window.addEventListener("DOMContentLoaded", function () {
  const imageUpload = document.getElementById("imageUpload");
  const previewImg = document.getElementById("previewImg");
  const blurRange = document.getElementById("blurRange");
  const blurValue = document.getElementById("blurValue");
  const downloadBtn = document.getElementById("downloadBtn");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let imageDataUrl = "";

  // Image Upload Preview
  imageUpload.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        imageDataUrl = reader.result;
        previewImg.src = imageDataUrl;
        previewImg.style.filter = `blur(${blurRange.value}px)`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Blur Range Update
  blurRange.addEventListener("input", function () {
    const value = this.value;
    blurValue.textContent = value;
    previewImg.style.filter = `blur(${value}px)`;
  });

  // Download Button
  downloadBtn.addEventListener("click", function () {
    if (!imageDataUrl) {
      alert("Please upload an image first.");
      return;
    }

    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `blur(${blurRange.value}px)`;
      ctx.drawImage(img, 0, 0);
      const blurredImageUrl = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = blurredImageUrl;
      a.download = "blurred-image.png";
      a.click();
    };
    img.src = imageDataUrl;
  });
});
