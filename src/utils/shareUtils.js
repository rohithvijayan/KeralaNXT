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
        fileName = 'kerala-story-snapshot.png',
        title = 'KeralaStory',
        text = 'Check out these development stats from keralaStory!',
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

                    // Add KeralaStory Branding at the top
                    const brandHeader = clonedDoc.createElement('div');
                    brandHeader.className = 'share-brand-header';
                    brandHeader.style.display = 'flex';
                    brandHeader.style.flexDirection = 'column';
                    brandHeader.style.alignItems = 'center';
                    brandHeader.style.marginBottom = '32px';
                    brandHeader.style.width = '100%';
                    brandHeader.style.padding = '0 20px';

                    const brandName = clonedDoc.createElement('div');
                    brandName.innerText = 'KeralaStory';
                    brandName.style.fontSize = '2.5rem';
                    brandName.style.fontWeight = '900';
                    brandName.style.color = '#ffffff';
                    brandName.style.letterSpacing = '-0.02em';
                    brandName.style.marginBottom = '4px';
                    brandName.style.textAlign = 'center';

                    const brandTagline = clonedDoc.createElement('div');
                    brandTagline.innerText = 'Not The Propaganda, only facts & data';
                    brandTagline.style.fontSize = '1.125rem';
                    brandTagline.style.fontWeight = '600';
                    brandTagline.style.color = '#10b77f';
                    brandTagline.style.opacity = '0.9';
                    brandTagline.style.fontStyle = 'italic';
                    brandTagline.style.textAlign = 'center';
                    brandTagline.style.maxWidth = '80%';

                    brandHeader.appendChild(brandName);
                    brandHeader.appendChild(brandTagline);

                    // Insert at the very beginning of the shared element
                    clonedElement.insertBefore(brandHeader, clonedElement.firstChild);

                    // Special handling for Budget Landing & Details Share (9:16 Optimization)
                    if (elementId === 'budget-share-card' || elementId === 'budget-details-share' || elementId.includes('highlight-')) {
                        // For dark themed cards, make brand name white
                        brandName.style.color = '#ffffff';
                        clonedElement.style.padding = '60px 40px';
                        clonedElement.style.minHeight = '1600px'; // Force vertical Story ratio
                        clonedElement.style.display = 'flex';
                        clonedElement.style.flexDirection = 'column';
                        clonedElement.style.justifyContent = 'center';
                        clonedElement.style.background = 'linear-gradient(180deg, #06120f 0%, #0c1a16 100%)';
                        clonedElement.style.color = '#ffffff';

                        // Hide unnecessary sections for Budget Details share
                        const sectionsToHide = clonedElement.querySelectorAll('.compare-cta-section, .kpi-section');
                        sectionsToHide.forEach(el => el.style.display = 'none');

                        // Ensure chart title is visible and white in share image
                        const vizCard = clonedElement.querySelector('.viz-card');
                        if (vizCard) {
                            vizCard.style.background = 'transparent';
                            vizCard.style.border = 'none';
                            vizCard.style.boxShadow = 'none';

                            const chartHeader = clonedElement.querySelector('.revenue-viz-section .section-header h2');
                            if (chartHeader) {
                                chartHeader.style.color = '#ffffff';
                                chartHeader.style.textAlign = 'center';
                                chartHeader.style.marginBottom = '20px';
                            }
                        }

                        // Stack stats vertically for better visibility in the share image
                        const statsGrid = clonedElement.querySelector('.stats-grid');
                        if (statsGrid) {
                            statsGrid.style.display = 'grid';
                            statsGrid.style.gridTemplateColumns = '1fr';
                            statsGrid.style.gap = '20px';
                            statsGrid.style.marginTop = '40px';

                            const statCards = statsGrid.querySelectorAll('.stat-card');
                            statCards.forEach(card => {
                                card.style.background = 'rgba(255, 255, 255, 0.05)';
                                card.style.padding = '20px';
                                card.style.borderRadius = '24px';
                                card.style.textAlign = 'center';
                                card.style.display = 'flex';
                                card.style.flexDirection = 'column';
                                card.style.alignItems = 'center';

                                const iconBox = card.querySelector('.icon-box');
                                if (iconBox) iconBox.style.width = '50px';

                                const cardValue = card.querySelector('.card-value');
                                if (cardValue) cardValue.style.fontSize = '2rem';

                                const cardLabel = card.querySelector('.card-label');
                                if (cardLabel) cardLabel.style.fontSize = '1rem';

                                const progress = card.querySelector('.progress-bar-container');
                                if (progress) progress.style.display = 'none';

                                const hint = card.querySelector('.card-hint');
                                if (hint) hint.style.display = 'none';

                                const delta = card.querySelector('.delta-badge');
                                if (delta) delta.style.fontSize = '0.8rem';
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

                    // For MP Dashboard related cards, make brand name black for visibility
                    if (elementId === 'hero-summary-card' || elementId.startsWith('mp-card-')) {
                        brandName.style.color = '#000000';
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
                    watermark.innerText = 'KeralaStory';
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
