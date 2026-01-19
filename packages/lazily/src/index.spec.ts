import { helloWorld } from './index';

describe('helloWorld', () => {
  it('should return "Hello, World!" when no name is provided', () => {
    expect(helloWorld()).toBe('Hello, World!');
  });

  it('should return a personalized greeting when a name is provided', () => {
    expect(helloWorld('Alice')).toBe('Hello, Alice!');
    expect(helloWorld('Bob')).toBe('Hello, Bob!');
  });
});
