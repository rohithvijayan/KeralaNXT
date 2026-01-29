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
                    const elementsToHide = clonedElement.querySelectorAll('button, select, label, .compare-btn-mobile, .card-share-btn, .hero-share-btn, .share-comparison-btn, .nav-actions, .primary-actions, .budget-breadcrumb');
                    elementsToHide.forEach(el => el.style.display = 'none');

                    // Special handling for Budget Landing Share (9:16 Optimization)
                    if (elementId === 'budget-share-card') {
                        clonedElement.style.padding = '60px 40px';
                        clonedElement.style.minHeight = '1600px'; // Force vertical Story ratio
                        clonedElement.style.display = 'flex';
                        clonedElement.style.flexDirection = 'column';
                        clonedElement.style.justifyContent = 'center';
                        clonedElement.style.background = 'linear-gradient(180deg, #06120f 0%, #0c1a16 100%)';
                        clonedElement.style.color = '#ffffff';

                        // Ensure stats are horizontally stacked in the share image
                        const statsGrid = clonedElement.querySelector('.stats-grid');
                        if (statsGrid) {
                            statsGrid.style.display = 'grid';
                            statsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                            statsGrid.style.gap = '15px';
                            statsGrid.style.marginTop = '40px';

                            const statCards = statsGrid.querySelectorAll('.stat-card');
                            statCards.forEach(card => {
                                card.style.background = 'rgba(255, 255, 255, 0.05)';
                                card.style.padding = '15px';
                                card.style.borderRadius = '16px';
                                card.style.textAlign = 'center';
                                card.style.display = 'flex';
                                card.style.flexDirection = 'column';
                                card.style.alignItems = 'center';

                                const iconBox = card.querySelector('.icon-box');
                                if (iconBox) iconBox.style.width = '40px'; // Smaller icons for grid

                                const cardValue = card.querySelector('.card-value');
                                if (cardValue) cardValue.style.fontSize = '1.2rem';

                                const cardLabel = card.querySelector('.card-label');
                                if (cardLabel) cardLabel.style.fontSize = '0.7rem';

                                const progress = card.querySelector('.progress-bar-container');
                                if (progress) progress.style.display = 'none';

                                const hint = card.querySelector('.card-hint');
                                if (hint) hint.style.display = 'none';

                                const delta = card.querySelector('.delta-badge');
                                if (delta) delta.style.fontSize = '0.6rem';
                            });
                        }

                        const heroTitle = clonedElement.querySelector('.hero-title');
                        if (heroTitle) heroTitle.style.color = 'rgba(255,255,255,0.6)';

                        const heroAmount = clonedElement.querySelector('.hero-amount');
                        if (heroAmount) {
                            heroAmount.style.fontSize = '5rem';
                            heroAmount.style.background = 'none';
                            heroAmount.style.webkitTextFillColor = '#ffffff';
                        }
                    }

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
