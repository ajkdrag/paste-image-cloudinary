import { Notice, Plugin, Editor } from "obsidian";
import { CloudinarySettings } from './types';
import { CloudinaryService } from './services/cloudinary-service';
import { ImageProcessor } from './services/image-processor';
import { EditorService } from './services/editor-service';
import { UploadModal } from './components/upload-modal';
import { SettingsTab } from './settings-tab';

const DEFAULT_SETTINGS: CloudinarySettings = {
  cloudName: "",
  uploadPreset: "",
  folder: ""
};

export default class CloudinaryUploader extends Plugin {
  private _settings: CloudinarySettings;
  private cloudinaryService: CloudinaryService;

  // Getter for settings
  get settings(): CloudinarySettings {
    return this._settings;
  }

  // Method to update settings
  async updateSettings(settings: Partial<CloudinarySettings>): Promise<void> {
    this._settings = {
      ...this._settings,
      ...settings
    };
    await this.saveData(this._settings);
    this.cloudinaryService = new CloudinaryService(this._settings);
  }

  async onload() {
    await this.loadSettings();
    this.cloudinaryService = new CloudinaryService(this._settings);
    this.registerHandlers();
    this.addSettingTab(new SettingsTab(this.app, this));
  }

  onunload() {
    this.app.workspace.off('editor-paste', this.handlePaste);
  }

  private registerHandlers(): void {
    this.registerEvent(
      this.app.workspace.on('editor-paste', this.handlePaste)
    );
  }

  private handlePaste = async (event: ClipboardEvent, editor: Editor): Promise<void> => {
    const files = event.clipboardData?.files;
    if (!files?.length || !files[0].type.startsWith('image/')) {
      return;
    }

    event.preventDefault();
    await this.handleImageUpload(files[0], editor);
  }

  private async handleImageUpload(file: File, editor: Editor) {
    try {
      const editorService = new EditorService(editor);
      const placeholder = editorService.insertPlaceholder();
      const activeFile = this.app.workspace.getActiveFile();
      const defaultName = activeFile
        ? activeFile.basename + '-' + Math.random().toString(36).substring(2, 8)
        : file.name.replace(/\.[^/.]+$/, "");

      new UploadModal(
        this.app,
        defaultName,
        file,
        async (options) => {
          try {
            const processedFile = await ImageProcessor.processImage(
              file,
              {
                downsample: options.downsample,
                compressionLevel: options.compressionLevel
              }
            );

            const response = await this.cloudinaryService.uploadImage(
              processedFile,
              options.fileName
            );

            editorService.replacePlaceholder(placeholder, response.secure_url);
          } catch (error) {
            new Notice(`Upload failed: ${error.message}`);
            editorService.replacePlaceholder(placeholder, "");
          }
        }
      ).open();
    } catch (error) {
      new Notice(`Error: ${error.message}`);
    }
  }
  private async loadSettings() {
    this._settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.updateSettings(this._settings);
  }
}
