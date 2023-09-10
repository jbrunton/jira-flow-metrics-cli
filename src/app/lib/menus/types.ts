export interface MenuItem {
  name: string;
  value?: string;
  description?: string;
  run: () => Promise<void>;
}
