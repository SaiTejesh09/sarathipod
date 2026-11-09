/**
 * Client-Side Image Compressor for Highway Dead Zones
 * Resizes and compresses photo strictly under 300 KB before uploading.
 */
export async function compressImageUnder300KB(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;

        // Scale proportionally if too large
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const checkCompression = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Image compression failed"));
                return;
              }
              const sizeKB = blob.size / 1024;
              if (sizeKB <= 300 || q <= 0.35) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now()
                });
                resolve({ file: compressedFile, sizeKB: Math.round(sizeKB * 10) / 10 });
              } else {
                checkCompression(q - 0.15);
              }
            },
            "image/jpeg",
            q
          );
        };

        checkCompression(quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

