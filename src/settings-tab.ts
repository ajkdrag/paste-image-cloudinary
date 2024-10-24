import { App, PluginSettingTab, Setting } from 'obsidian';
import { CloudinarySettings } from './types';
import CloudinaryUploader from './main';

interface SettingField {
  name: string;
  description: string;
  placeholder: string;
  key: keyof CloudinarySettings;
}

export class SettingsTab extends PluginSettingTab {
  private readonly settingFields: SettingField[] = [
    {
      name: "Cloud Name",
      description: "Your Cloudinary cloud name",
      placeholder: "your-cloud-name",
      key: "cloudName"
    },
    {
      name: "Upload Preset",
      description: "Your Cloudinary upload preset",
      placeholder: "your-upload-preset",
      key: "uploadPreset"
    },
    {
      name: "Folder",
      description: "Optional: Cloudinary folder to upload to",
      placeholder: "my-folder",
      key: "folder"
    }
  ];

  constructor(
    app: App,
    private plugin: CloudinaryUploader
  ) {
    super(app, plugin);
  }

  display(): void {
    this.containerEl.empty();
    this.addTitle();
    this.addDescription();
    this.addSettings();
  }

  private addTitle(): void {
    this.containerEl.createEl("h2", {
      text: "Cloudinary Image Uploader Settings",
      cls: "settings-title"
    });
  }

  private addDescription(): void {
    const description = this.containerEl.createEl("p", {
      text: "Configure your Cloudinary credentials below. You can find these in your Cloudinary dashboard.",
      cls: "settings-description"
    });

    const dashboardLink = description.createEl("a", {
      text: "Open Cloudinary Dashboard",
      href: "https://cloudinary.com/console"
    });
    dashboardLink.setAttr("target", "_blank");
  }

  private addSettings(): void {
    this.settingFields.forEach(field => {
      this.createSetting(field);
    });
  }

  private createSetting(field: SettingField): void {
    new Setting(this.containerEl)
      .setName(field.name)
      .setDesc(field.description)
      .addText(text => {
        text.setPlaceholder(field.placeholder)
          .setValue(this.plugin.settings[field.key])
          .onChange(async (value) => {
            await this.updateSetting(field.key, value);
          });
      });
  }

  private async updateSetting(key: keyof CloudinarySettings, value: string): Promise<void> {
    try {
      await this.plugin.updateSettings({ [key]: value.trim() });
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
    }
  }
}
