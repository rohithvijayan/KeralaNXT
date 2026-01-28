import html2canvas from 'html2canvas';

/**
 * Captures a DOM element as an image and shares it via Web Share API
 * or downloads it as a fallback.
 * 
 * @param {string} elementId - The ID of the element to capture
 * @param {Object} options - Customization options
 */
export const shareElementAsImage = async (elementId, options = {}) => {
    const {
        fileName = 'kerala-nxt-snapshot.png',
        title = 'KeralaNXT Development Tracker',
        text = 'Check out these development stats from KeralaNXT!',
        backgroundColor = '#0f172a'
    } = options;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID ${elementId} not found`);
        return;
    }

    try {
        // 1. Capture the element
        const canvas = await html2canvas(element, {
            useCORS: true,
            backgroundColor: backgroundColor,
            scale: 2, // Higher quality
            logging: false,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.borderRadius = '24px';
                    clonedElement.style.padding = '32px';
                    clonedElement.style.boxShadow = 'none';

                    // Hide buttons that shouldn't be in the share image
                    const buttonsToHide = clonedElement.querySelectorAll('button, .compare-btn-mobile, .card-share-btn, .hero-share-btn');
                    buttonsToHide.forEach(btn => btn.style.display = 'none');

                    // Add a watermark if desired
                    const watermark = clonedDoc.createElement('div');
                    watermark.innerText = 'KeralaNXT Development Tracker';
                    watermark.style.position = 'absolute';
                    watermark.style.bottom = '12px';
                    watermark.style.right = '20px';
                    watermark.style.opacity = '0.3';
                    watermark.style.fontSize = '12px';
                    watermark.style.color = 'inherit';
                    clonedElement.style.position = 'relative';
                    clonedElement.appendChild(watermark);
                }
            }
        });

        // 2. Convert to Blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        const file = new File([blob], fileName, { type: 'image/png' });

        // 3. Share or Download
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: title,
                text: text,
            });
        } else {
            // Fallback: Download for Desktop
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = fileName;
            link.click();
        }
    } catch (error) {
        console.error('Error sharing image:', error);
    }
};
