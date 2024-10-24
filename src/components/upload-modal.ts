import { App, Modal, Setting, Notice } from "obsidian";
import { ImageUploadOptions, CompressionLevel } from "../types";
import { ImageProcessor } from "../services/image-processor";

export class UploadModal extends Modal {
  private options: ImageUploadOptions;
  private readonly onSubmit: (options: ImageUploadOptions) => void;
  private originalSize: string = '';
  private previewSize: string = '';
  private processingPreview = false;

  constructor(
    app: App,
    defaultFileName: string,
    private originalFile: File,
    onSubmit: (options: ImageUploadOptions) => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    this.options = {
      fileName: defaultFileName,
      downsample: true,
      compressionLevel: CompressionLevel.None
    };
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Create header
    contentEl.createEl("h2", { text: "Image Upload Options" });

    // Initialize size information
    this.originalSize = await ImageProcessor.getFileSize(this.originalFile);

    // Create original size info
    contentEl.createEl("p", {
      text: `Original size: ${this.originalSize}`,
      cls: "size-info"
    });

    // Create preview size element (will be updated dynamically)
    const previewSizeEl = contentEl.createEl("p", { cls: "preview-size" });

    // Create settings
    this.createSettings(contentEl, previewSizeEl);
  }

  private createSettings(contentEl: HTMLElement, previewSizeEl: HTMLElement) {
    // File name setting
    new Setting(contentEl)
      .setName("Image name")
      .setDesc("Enter a name for your image")
      .addText((text) =>
        text
          .setValue(this.options.fileName)
          .onChange((value) => {
            this.options.fileName = value;
          }));

    // Format info
    const isLossyFormat = this.originalFile.type.toLowerCase().match(/jpe?g|webp/);
    contentEl.createEl("p", {
      cls: "format-info",
      text: isLossyFormat
        ? `Image format: ${this.originalFile.type} (supports compression)`
        : `Image format: ${this.originalFile.type} (will be converted to WebP for compression)`
    });

    // Downsample setting
    new Setting(contentEl)
      .setName("Downsample image")
      .setDesc("Reduce image resolution by 50%")
      .addToggle((toggle) =>
        toggle
          .setValue(this.options.downsample)
          .onChange((value) => {
            this.options.downsample = value;
            this.updatePreview(previewSizeEl);
          }));

    // Compression level setting
    new Setting(contentEl)
      .setName("Compression level")
      .setDesc("Choose image compression level")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            [CompressionLevel.None]: "No compression",
            [CompressionLevel.Low]: "Low compression",
            [CompressionLevel.Medium]: "Medium compression",
            [CompressionLevel.High]: "High compression"
          })
          .setValue(this.options.compressionLevel)
          .onChange((value: CompressionLevel) => {
            this.options.compressionLevel = value;
            this.updatePreview(previewSizeEl);
          }));

    // Upload button
    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Upload")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.options);
          }));

    // Trigger initial preview
    this.updatePreview(previewSizeEl);
  }

  private async updatePreview(previewSizeEl: HTMLElement) {
    if (this.processingPreview) {
      return;
    }

    this.processingPreview = true;
    previewSizeEl.setText("Calculating preview size...");

    try {
      const processedFile = await ImageProcessor.processImage(
        this.originalFile,
        {
          downsample: this.options.downsample,
          compressionLevel: this.options.compressionLevel
        }
      );

      this.previewSize = await ImageProcessor.getFileSize(processedFile);
      const reduction = Math.round((1 - processedFile.size / this.originalFile.size) * 100);

      if (this.options.downsample || this.options.compressionLevel !== CompressionLevel.None) {
        previewSizeEl.setText(
          `Estimated size after processing: ${this.previewSize} (${reduction}% smaller)`
        );
      } else {
        previewSizeEl.setText("");
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      previewSizeEl.setText("Failed to calculate preview size");
      new Notice("Failed to generate size preview");
    } finally {
      this.processingPreview = false;
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
