export type Action<T> = (onUpdate?: (text: string) => void) => Promise<T>;
