import { useRef } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SPECIAL_ITEMS, type SpecialItem } from "@/lib/estimate";
import { MediaThumbs } from "./MediaThumbs";
import { SectionCard } from "./SectionCard";
import { filesToMedia, type FieldErrors, type MediaFile, type SpecialSelection } from "./types";

export function SpecialItemsSection({
  selection,
  onToggle,
  onAddPhotos,
  onRemovePhoto,
  errors,
}: {
  selection: SpecialSelection;
  onToggle: (item: SpecialItem, checked: boolean) => void;
  onAddPhotos: (item: SpecialItem, media: MediaFile[]) => void;
  onRemovePhoto: (item: SpecialItem, id: string) => void;
  errors: FieldErrors;
}) {
  return (
    <SectionCard
      id="special-items"
      step={3}
      title="Special items"
      subtitle="Heavy or fragile pieces need extra care. Photos are required for anything you check."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {SPECIAL_ITEMS.map((item) => {
          const photos = selection[item.value];
          const checked = photos !== undefined;
          const error = errors[`special-${item.value}`];
          return (
            <div
              key={item.value}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                checked ? "border-cta/50 bg-cta-soft" : "bg-card",
                error && "border-destructive",
              )}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => onToggle(item.value, c === true)}
                  className="size-5 border-navy/40 data-[state=checked]:border-cta data-[state=checked]:bg-cta data-[state=checked]:text-cta-foreground"
                />
                <span className="flex-1 font-semibold text-navy">{item.label}</span>
                <span className="text-xs font-medium text-muted-foreground">+${item.fee}</span>
              </label>
              {checked && (
                <SpecialPhotos
                  label={item.label}
                  photos={photos}
                  error={error}
                  onAdd={(m) => onAddPhotos(item.value, m)}
                  onRemove={(id) => onRemovePhoto(item.value, id)}
                />
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function SpecialPhotos({
  label,
  photos,
  error,
  onAdd,
  onRemove,
}: {
  label: string;
  photos: MediaFile[];
  error?: string | undefined;
  onAdd: (m: MediaFile[]) => void;
  onRemove: (id: string) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mt-3 border-t border-cta/20 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
        Photos required
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="navyOutline"
          className="flex-1"
          onClick={() => cameraRef.current?.click()}
        >
          <Camera /> Take photo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="navyOutline"
          className="flex-1"
          onClick={() => uploadRef.current?.click()}
        >
          <ImagePlus /> Upload
        </Button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-label={`Take photo of ${label}`}
        onChange={(e) => {
          onAdd(filesToMedia(e.target.files));
          e.target.value = "";
        }}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-label={`Upload photos of ${label}`}
        onChange={(e) => {
          onAdd(filesToMedia(e.target.files));
          e.target.value = "";
        }}
      />
      <MediaThumbs media={photos} onRemove={onRemove} />
      {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
