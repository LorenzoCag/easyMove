import type { Access, HomeSize, SpecialItem } from "@/lib/estimate";

export type MediaFile = { id: string; url: string; kind: "image" | "video"; name: string };
export type Room = { id: string; name: string; custom?: boolean; media: MediaFile[] };

export type MoveDetails = {
  from: string;
  to: string;
  date?: Date | undefined;
  homeSize?: HomeSize | undefined;
  sqft: string;
  originAccess?: Access | undefined;
  destinationAccess?: Access | undefined;
};

export type SpecialSelection = Partial<Record<SpecialItem, MediaFile[]>>;

export type FieldErrors = {
  from?: string | undefined;
  to?: string | undefined;
  date?: string | undefined;
  homeSize?: string | undefined;
  originAccess?: string | undefined;
  destinationAccess?: string | undefined;
  [key: `special-${string}`]: string | undefined;
};

let counter = 0;
export const uid = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function filesToMedia(files: FileList | null): MediaFile[] {
  if (!files) return [];
  return Array.from(files).map((f) => ({
    id: uid(),
    url: URL.createObjectURL(f),
    kind: f.type.startsWith("video") ? "video" : "image",
    name: f.name,
  }));
}
