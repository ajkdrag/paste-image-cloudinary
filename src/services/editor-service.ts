import { Editor } from "obsidian";

export class EditorService {
  constructor(private editor: Editor) { }

  insertPlaceholder(): string {
    const placeholder = `![uploading...](${this.generateRandomString()})\n`;
    this.editor.replaceSelection(placeholder);
    return placeholder;
  }

  replacePlaceholder(placeholder: string, imageUrl: string): void {
    const markdownText = `![](${imageUrl})`;
    this.replaceText(placeholder, markdownText);
  }

  private replaceText(target: string, replacement: string): void {
    target = target.trim();
    for (let i = 0; i < this.editor.lineCount(); i++) {
      const line = this.editor.getLine(i);
      const ch = line.indexOf(target);
      if (ch !== -1) {
        this.editor.replaceRange(
          replacement,
          { line: i, ch },
          { line: i, ch: ch + target.length }
        );
        break;
      }
    }
  }

  private generateRandomString(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
