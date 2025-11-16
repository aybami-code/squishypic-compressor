/**
 * Image Compressor Module
 * Exports a function to compress images using Canvas API
 */

/**
 * Compresses an image file with specified quality
 * @param {File} file - The image file to compress
 * @param {number} quality - Compression quality (0.1 to 1.0)
 * @returns {Promise<{blob: Blob, width: number, height: number}>} - Resolves with compressed image blob and dimensions
 */
function compressImageFile(file, quality) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.match('image.*')) {
            reject(new Error('Invalid file type. Please select an image file.'));
            return;
        }

        if (quality < 0.01 || quality > 1) {
            reject(new Error('Quality must be between 1% and 100%'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Determine output type
                let mimeType = 'image/jpeg';
                if (file.type === 'image/png') {
                    mimeType = 'image/png';
                } else if (file.type === 'image/webp') {
                    mimeType = 'image/webp';
                }
                
                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Compression failed'));
                            return;
                        }
                        resolve({
                            blob: blob,
                            width: img.width,
                            height: img.height
                        });
                    },
                    mimeType,
                    quality
                );
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// Export the function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { compressImageFile };
}