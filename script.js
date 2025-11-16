document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const dropArea = document.getElementById('drop-area');
    const originalImg = document.getElementById('original-img');
    const compressedImg = document.getElementById('compressed-img');
    const originalSize = document.getElementById('original-size');
    const compressedSize = document.getElementById('compressed-size');
    const originalDimensions = document.getElementById('original-dimensions');
    const compressedDimensions = document.getElementById('compressed-dimensions');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const compressBtn = document.getElementById('compress-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const savings = document.getElementById('savings');
    const uploadSection = document.getElementById('upload-section');
    const previewSection = document.getElementById('preview-section');
    const controlsSection = document.getElementById('controls-section');
    const loadingSection = document.getElementById('loading-section');
    
    // State
    let currentFile = null;
    let compressedBlob = null;
    
    // Event Listeners
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    qualitySlider.addEventListener('input', updateQualityValue);
    compressBtn.addEventListener('click', compressImage);
    downloadBtn.addEventListener('click', downloadCompressedImage);
    resetBtn.addEventListener('click', resetTool);
    
    // Functions
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            processFile(file);
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('highlight', 'pulse');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('highlight', 'pulse');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('highlight', 'pulse');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            processFile(file);
        }
    }
    
    function processFile(file) {
        currentFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            
            // Show preview and controls
            uploadSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
            controlsSection.classList.remove('hidden');
            
            // Display original file info
            originalSize.textContent = formatFileSize(file.size);
            
            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                originalDimensions.textContent = `${img.width}×${img.height} px`;
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    function updateQualityValue() {
        qualityValue.textContent = qualitySlider.value;
    }
    
    function compressImage() {
        if (!currentFile) return;
        
        // Show loading state
        previewSection.classList.add('hidden');
        controlsSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        const quality = parseInt(qualitySlider.value) / 100;
        
        // Use our compressor module
        compressImageFile(currentFile, quality)
            .then(result => {
                compressedBlob = result.blob;
                const compressedUrl = URL.createObjectURL(compressedBlob);
                
                compressedImg.src = compressedUrl;
                compressedSize.textContent = formatFileSize(compressedBlob.size);
                
                // Calculate savings
                const originalSizeBytes = currentFile.size;
                const compressedSizeBytes = compressedBlob.size;
                const savingsPercentage = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes * 100).toFixed(1);
                
                savings.textContent = `(${savingsPercentage}% smaller)`;
                
                // Get compressed image dimensions
                const img = new Image();
                img.onload = () => {
                    compressedDimensions.textContent = `${img.width}×${img.height} px`;
                };
                img.src = compressedUrl;
                
                // Enable download button
                downloadBtn.disabled = false;
                
                // Hide loading, show results
                loadingSection.classList.add('hidden');
                previewSection.classList.remove('hidden');
                controlsSection.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Compression error:', error);
                loadingSection.classList.add('hidden');
                previewSection.classList.remove('hidden');
                controlsSection.classList.remove('hidden');
                alert('Error compressing image. Please try again.');
            });
    }
    
    function downloadCompressedImage() {
        if (!compressedBlob) return;
        
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        
        // Get file extension from original file
        const extension = currentFile.name.split('.').pop().toLowerCase();
        a.download = `compressed.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function resetTool() {
        // Reset UI
        fileInput.value = '';
        originalImg.src = '';
        compressedImg.src = '';
        originalSize.textContent = '0 KB';
        compressedSize.textContent = '0 KB';
        originalDimensions.textContent = '0×0 px';
        compressedDimensions.textContent = '0×0 px';
        savings.textContent = '(0% smaller)';
        qualitySlider.value = 80;
        qualityValue.textContent = '80';
        downloadBtn.disabled = true;
        
        // Reset state
        currentFile = null;
        compressedBlob = null;
        
        // Show upload section
        uploadSection.classList.remove('hidden');
        previewSection.classList.add('hidden');
        controlsSection.classList.add('hidden');
        loadingSection.classList.add('hidden');
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});