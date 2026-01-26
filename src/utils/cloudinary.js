import { Cloudinary } from "@cloudinary/url-gen";

/**
 * Configure your Cloudinary instance here.
 * You can get your cloud name from the Cloudinary Console.
 * It is recommended to use an environment variable for the cloud name.
 */
export const cld = new Cloudinary({
    cloud: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
    }
});

/**
 * Helper to check if a string is a external URL or a Cloudinary public ID.
 */
export const isCloudinaryId = (path) => {
    if (!path) return false;
    // If it starts with http or /, it's a URL or local path
    return !path.startsWith('http') && !path.startsWith('/');
};
