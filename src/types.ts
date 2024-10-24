export interface CloudinarySettings {
  cloudName: string;
  uploadPreset: string;
  folder: string;
}

export interface ImageUploadOptions {
  fileName: string;
  downsample: boolean;
  compressionLevel: CompressionLevel;
}

export enum CompressionLevel {
  None = "none",
  Low = "low",
  Medium = "medium",
  High = "high"
}

export interface UploadResponse {
  secure_url: string;
  error?: string;
}
