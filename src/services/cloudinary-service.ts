import axios from 'axios';
import { CloudinarySettings, UploadResponse } from '../types';

export class CloudinaryService {
  constructor(private settings: CloudinarySettings) { }

  async uploadImage(file: File, fileName?: string): Promise<UploadResponse> {
    if (!this.settings.cloudName || !this.settings.uploadPreset) {
      throw new Error('Cloudinary settings not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.settings.uploadPreset);

    if (this.settings.folder) {
      formData.append('folder', this.settings.folder);
    }
    if (fileName) {
      formData.append('public_id', fileName);
    }

    try {
      const response = await axios({
        url: `https://api.cloudinary.com/v1_1/${this.settings.cloudName}/auto/upload`,
        method: 'POST',
        data: formData
      });
      return { secure_url: response.data.secure_url };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}
