import { Device } from "./device.type";

export interface BannerOptions {
  id: string;
  format: string;
  targetSelector: string;
  insertPosition: InsertPosition;
  autoReloadInterval?: number;
  autoReloadMethod?: "default" | "force";
  devices?: Device[];
  logo?: boolean;
  params: Record<string, unknown>;
  onClose?: () => void;
  onError?: (error: unknown) => void;
  onLoad?: (load: unknown) => void;
  onRender?: () => void;
  onStub?: () => void;
}
