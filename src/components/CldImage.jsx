import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { cld, isCloudinaryId } from '../utils/cloudinary';

/**
 * A reusable Image component that handles both Cloudinary IDs and standard URLs.
 * It provides automatic optimization and resizing for Cloudinary assets.
 */
const CldImage = ({ src, alt, className, style, width = 800, height = 450 }) => {
    if (!src) return null;

    // If it's a Cloudinary public ID, use AdvancedImage
    if (isCloudinaryId(src)) {
        const myImage = cld.image(src);

        // Apply shared transformations (optimization and intelligent cropping)
        myImage
            .resize(fill().width(width).height(height).gravity(autoGravity()))
            .format('auto')
            .quality('auto');

        return (
            <AdvancedImage
                cldImg={myImage}
                alt={alt}
                className={className}
                style={style}
            />
        );
    }

    // Fallback to standard <img> for external URLs or local paths
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            loading="lazy"
            crossOrigin="anonymous"
        />
    );
};

export default CldImage;
