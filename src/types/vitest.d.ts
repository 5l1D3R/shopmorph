declare module "vitest" {
  export const describe: (name: string, fn: () => void) => void;
  export const test: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: (actual: unknown) => {
    toBe(expected: unknown): void;
    toContain(expected: unknown): void;
    toHaveBeenCalledOnce(): void;
  };
  export const vi: {
    fn<T extends (...args: never[]) => unknown>(implementation: T): T;
  };
}
