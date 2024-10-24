# Paste Image Cloudinary for Obsidian


## License

Released under [MIT](/LICENSE) by [@ajkdrag](https://github.com/ajkdrag).

## What is it?
[Cloudinary](https://cloudinary.com/) is a cloud storage platform that allows you to upload various media files to a storage account.  The media files within this storage account can then be manipulated using Cloudinary's APIs to manipulate the data properties and metadata.

This plugin allows you to automatically upload images pasted to Obsidian directly into your Cloudinary account (instead of stored locally). One can downscale and compress images as well. Images can be compressed down by 90% and more to save up storage on Cloudinary. Supports only single image files pasted from clipboard (which is a very common usecase).

## Configuration
1. Disable Obsidian Safe Mode
2. Install the Plugin
    - Install from the Obsidian Community Plugins tab
    - Manual install
        - Clone this repo
        - Install dependencies with `yarn` or `npm`
        - `npm run dev` will start compilation
3. Enable the Plugin
4. Configure the settings and set your:
    - Cloud Name
    - Upload Preset Name ([Set that here](https://cloudinary.com/documentation/upload_presets))
    - Set a Folder Name
5. Optional configuration
    - Cloudinary default transformation parameters

## Unsigned vs. Signed Uploads to Cloudinary
The uploads to Cloudinary are unsigned.  [You can read more about that here](https://cloudinary.com/documentation/upload_images#unsigned_upload). A signed upload would require the use of an API key and secret, and I opted against asking for that in the plugin configuration, as a choice for security reasons.

## Thanks
Special thanks to:
- Bulk features of the [Obsidian Cloudinary Plugin](https://github.com/Creling/obsidian-image-uploader) weren't working for me and the option of not being able to rename and compress files was a necessity, so I built this plugin myself
- [Obsidian Paste Image Rename Plugin](https://github.com/reorx/obsidian-paste-image-rename/tree/master) for the feature idea 
