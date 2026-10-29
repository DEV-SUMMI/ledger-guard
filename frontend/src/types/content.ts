export type DemoScreen = "signin" | "items" | "add" | "privacy" | "reveal" | "settings";

export interface DemoStep {
  label: string;
  desc: string;
  /** Accent color as hex; alpha suffixes ("20", "15", "30") are appended for tints */
  color: string;
  screen: DemoScreen;
}
