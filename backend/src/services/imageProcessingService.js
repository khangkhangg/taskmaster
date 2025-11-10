const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Optimize and resize image
const processImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width = 1200,
      height = null,
      quality = 80,
      format = 'jpeg',
      fit = 'inside'
    } = options;

    let image = sharp(inputPath);

    // Resize image
    if (width || height) {
      image = image.resize(width, height, {
        fit: fit,
        withoutEnlargement: true
      });
    }

    // Set format and quality
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality, progressive: true });
        break;
      case 'png':
        image = image.png({ quality, progressive: true });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
      default:
        image = image.jpeg({ quality, progressive: true });
    }

    // Save processed image
    await image.toFile(outputPath);

    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Image processing error:', error);
    return { success: false, error: error.message };
  }
};

// Create multiple thumbnails
const createThumbnails = async (inputPath, outputDir, sizes = []) => {
  try {
    const defaultSizes = [
      { name: 'small', width: 150, height: 150 },
      { name: 'medium', width: 400, height: 400 },
      { name: 'large', width: 800, height: 800 }
    ];

    const sizesToProcess = sizes.length > 0 ? sizes : defaultSizes;
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const thumbnails = [];

    for (const size of sizesToProcess) {
      const outputPath = path.join(outputDir, `${basename}_${size.name}${ext}`);

      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80, progressive: true })
        .toFile(outputPath);

      thumbnails.push({
        size: size.name,
        path: outputPath,
        width: size.width,
        height: size.height
      });
    }

    return { success: true, thumbnails };
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    return { success: false, error: error.message };
  }
};

// Compress image
const compressImage = async (inputPath, outputPath, quality = 70) => {
  try {
    const metadata = await sharp(inputPath).metadata();

    let image = sharp(inputPath);

    // Compress based on format
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      image = image.jpeg({ quality, progressive: true });
    } else if (metadata.format === 'png') {
      image = image.png({ quality, progressive: true });
    } else if (metadata.format === 'webp') {
      image = image.webp({ quality });
    }

    await image.toFile(outputPath);

    // Get file sizes
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    return {
      success: true,
      path: outputPath,
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`
    };
  } catch (error) {
    console.error('Image compression error:', error);
    return { success: false, error: error.message };
  }
};

// Convert image format
const convertImageFormat = async (inputPath, outputPath, targetFormat = 'jpeg') => {
  try {
    let image = sharp(inputPath);

    switch (targetFormat.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality: 85, progressive: true });
        break;
      case 'png':
        image = image.png({ progressive: true });
        break;
      case 'webp':
        image = image.webp({ quality: 85 });
        break;
      default:
        throw new Error(`Unsupported format: ${targetFormat}`);
    }

    await image.toFile(outputPath);

    return { success: true, path: outputPath, format: targetFormat };
  } catch (error) {
    console.error('Image format conversion error:', error);
    return { success: false, error: error.message };
  }
};

// Get image metadata
const getImageMetadata = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();

    return {
      success: true,
      metadata: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        size: fs.statSync(imagePath).size
      }
    };
  } catch (error) {
    console.error('Get metadata error:', error);
    return { success: false, error: error.message };
  }
};

// Add watermark to image
const addWatermark = async (inputPath, outputPath, watermarkText, options = {}) => {
  try {
    const {
      fontSize = 32,
      fontColor = 'rgba(255, 255, 255, 0.7)',
      position = 'southeast'
    } = options;

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Create SVG text as watermark
    const svg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <style>
          .watermark { fill: ${fontColor}; font-size: ${fontSize}px; font-family: Arial, sans-serif; }
        </style>
        <text x="${metadata.width - 20}" y="${metadata.height - 20}" text-anchor="end" class="watermark">${watermarkText}</text>
      </svg>
    `;

    await image
      .composite([{
        input: Buffer.from(svg),
        gravity: position
      }])
      .toFile(outputPath);

    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Watermark error:', error);
    return { success: false, error: error.message };
  }
};

// Crop image
const cropImage = async (inputPath, outputPath, cropOptions) => {
  try {
    const { left, top, width, height } = cropOptions;

    await sharp(inputPath)
      .extract({ left, top, width, height })
      .toFile(outputPath);

    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Crop error:', error);
    return { success: false, error: error.message };
  }
};

// Rotate image
const rotateImage = async (inputPath, outputPath, angle = 90) => {
  try {
    await sharp(inputPath)
      .rotate(angle)
      .toFile(outputPath);

    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Rotate error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  processImage,
  createThumbnails,
  compressImage,
  convertImageFormat,
  getImageMetadata,
  addWatermark,
  cropImage,
  rotateImage
};
