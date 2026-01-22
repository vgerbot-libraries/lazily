import { create, isInitialized, onInitialized, release, reset } from '../index';

describe('integration tests', () => {
    it('should work with class instances', () => {
        class Editor {
            public content = '';

            setContent(content: string) {
                this.content = content;
            }

            getContent() {
                return this.content;
            }
        }

        class Doc {
            declare editor: Editor;

            constructor() {
                this.editor = create(() => new Editor());
            }
        }

        const doc = new Doc();

        expect(isInitialized(doc.editor)).toBe(false);

        doc.editor.setContent('Hello');

        expect(isInitialized(doc.editor)).toBe(true);
        expect(doc.editor.getContent()).toBe('Hello');
    });

    it('should handle nested lazy initialization', () => {
        class Inner {
            public value = 1;
        }

        class Outer {
            declare inner: Inner;

            constructor() {
                this.inner = create(() => new Inner());
            }
        }

        const outer = create(() => new Outer());

        expect(isInitialized(outer)).toBe(false);
        expect(isInitialized(outer.inner)).toBe(false);

        const value = outer.inner.value;

        expect(isInitialized(outer)).toBe(true);
        expect(isInitialized(outer.inner)).toBe(true);
        expect(value).toBe(1);
    });

    it('should handle release and re-initialization cycle', () => {
        let callCount = 0;
        const instance = create(() => {
            callCount++;
            return { value: callCount };
        });

        expect(callCount).toBe(0);

        const value1 = instance.value;
        expect(value1).toBe(1);
        expect(callCount).toBe(1);

        release(instance);
        reset(instance);

        const value2 = instance.value;
        expect(value2).toBe(2);
        expect(callCount).toBe(2);
    });

    it('should handle multiple listeners with unsubscribe', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const callback3 = jest.fn();

        const instance = create(() => ({ value: 42 }));

        const unsubscribe1 = onInitialized(instance, callback1);
        const unsubscribe2 = onInitialized(instance, callback2);
        const unsubscribe3 = onInitialized(instance, callback3);

        unsubscribe2();

        const _ = instance.value;

        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).not.toHaveBeenCalled();
        expect(callback3).toHaveBeenCalledTimes(1);
    });
});
