const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ensureCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured');
  }
};

const uploadBufferToCloudinary = (buffer, folder = 'wyw/products') => {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('/upload/')) return null;
  const [, afterUpload] = url.split('/upload/');
  const withoutVersion = afterUpload.replace(/^v\d+\//, '');
  return withoutVersion.replace(/\.[^/.]+$/, '');
};

const deleteCloudinaryAsset = async (url) => {
  ensureCloudinaryConfig();
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
  getPublicIdFromUrl,
};
