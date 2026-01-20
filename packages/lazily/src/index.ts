import { create } from "./lib/create";
import { onInitialized } from "./lib/onInitialized";

/**
 * Hello World function
 * @param name - Optional name to greet
 * @returns A greeting message
 */
export function helloWorld(name?: string): string {
  if (name) {
    return `Hello, ${name}!`;
  }
  return 'Hello, World!';
}

class Editor {}

class Doc {
    declare editor:Editor;
    constructor() {
        this.editor = create(() => new Editor())
        onInitialized(this.editor, (editor: Editor) => {
            console.log('editor initialized', editor);
        });

    }
}
