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

                    // Hide buttons, selectors, and labels that shouldn't be in the share image
                    const elementsToHide = clonedElement.querySelectorAll('button, select, label, .compare-btn-mobile, .card-share-btn, .hero-share-btn, .share-comparison-btn');
                    elementsToHide.forEach(el => el.style.display = 'none');

                    // Force vertical stacking for comparison cards in the share image
                    const splitView = clonedElement.querySelector('.comparison-split');
                    if (splitView) {
                        splitView.style.display = 'grid';
                        splitView.style.gridTemplateColumns = '1fr';
                        splitView.style.gap = '0';

                        // Fix borders for vertical stacking
                        const panelA = splitView.querySelector('.panel-a');
                        if (panelA) {
                            panelA.style.borderRight = 'none';
                            panelA.style.borderBottom = '1px solid #e2e8f0';
                        }
                    }

                    // Force profile cards to stack vertically for a cleaner share look
                    const profileCards = clonedElement.querySelectorAll('.profile-card');
                    profileCards.forEach(card => {
                        card.style.flexDirection = 'column';
                        card.style.textAlign = 'center';
                        const info = card.querySelector('.profile-info');
                        if (info) {
                            info.style.alignItems = 'center';
                            const badges = info.querySelector('.badges');
                            if (badges) badges.style.justifyContent = 'center';
                        }
                    });

                    // Add a watermark
                    const watermark = clonedDoc.createElement('div');
                    watermark.innerText = 'KeralaNXT Development Tracker';
                    watermark.style.position = 'absolute';
                    watermark.style.bottom = '12px';
                    watermark.style.right = '20px';
                    watermark.style.opacity = '0.3';
                    watermark.style.fontSize = '12px';
                    watermark.style.color = '#ffffff';
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
