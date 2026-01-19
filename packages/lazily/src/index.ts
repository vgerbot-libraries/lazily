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
