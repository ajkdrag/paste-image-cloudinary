import { CompressionLevel } from '../types';

interface ProcessingOptions {
  downsample: boolean;
  compressionLevel: CompressionLevel;
}

export class ImageProcessor {
  private static readonly COMPRESSION_QUALITY = {
    [CompressionLevel.None]: 1.0,
    [CompressionLevel.Low]: 0.8,
    [CompressionLevel.Medium]: 0.6,
    [CompressionLevel.High]: 0.4
  };

  // List of image types that support lossy compression
  private static readonly LOSSY_FORMATS = [
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ];

  static async processImage(file: File, options: ProcessingOptions): Promise<File> {
    if (!options.downsample && options.compressionLevel === CompressionLevel.None) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const processedFile = this.processWithCanvas(img, file, options);
          resolve(processedFile);
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private static processWithCanvas(
    img: HTMLImageElement,
    originalFile: File,
    options: ProcessingOptions
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate dimensions
      const targetWidth = options.downsample
        ? Math.round(img.naturalWidth * 0.25)
        : img.naturalWidth;
      const targetHeight = options.downsample
        ? Math.round(img.naturalHeight * 0.25)
        : img.naturalHeight;

      // Set canvas size
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Apply image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Determine output format and quality
      const { outputFormat, quality } = this.getOutputSettings(
        originalFile.type,
        options.compressionLevel
      );

      // Convert to file with proper type
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const processedFile = new File([blob], originalFile.name, {
            type: outputFormat,
            lastModified: Date.now(),
          });

          resolve(processedFile);
        },
        outputFormat,
        quality
      );
    });
  }

  private static getOutputSettings(inputFormat: string, compressionLevel: CompressionLevel): {
    outputFormat: string;
    quality: number | undefined;
  } {
    // Default to input format
    let outputFormat = inputFormat;
    let quality: number | undefined = undefined;

    // If format supports lossy compression, apply quality
    if (this.LOSSY_FORMATS.includes(inputFormat.toLowerCase())) {
      quality = this.COMPRESSION_QUALITY[compressionLevel];
    } else if (compressionLevel !== CompressionLevel.None) {
      // For non-lossy formats (like PNG), convert to WebP if compression is requested
      outputFormat = 'image/webp';
      quality = this.COMPRESSION_QUALITY[compressionLevel];
    }

    return { outputFormat, quality };
  }

  static async getFileSize(file: File): Promise<string> {
    const sizeInKB = file.size / 1024;
    return sizeInKB < 1024
      ? `${Math.round(sizeInKB)} KB`
      : `${(sizeInKB / 1024).toFixed(1)} MB`;
  }
}
