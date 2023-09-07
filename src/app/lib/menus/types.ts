export interface MenuItem {
  name: string;
  description?: string;
  run: () => Promise<void>;
}
