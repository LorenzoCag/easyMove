import { PlayCircle, X } from "lucide-react";
import type { MediaFile } from "./types";

export function MediaThumbs({
  media,
  onRemove,
}: {
  media: MediaFile[];
  onRemove: (id: string) => void;
}) {
  if (media.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {media.map((m) => (
        <li key={m.id} className="group relative size-16 overflow-hidden rounded-lg border bg-muted">
          {m.kind === "image" ? (
            <img src={m.url} alt={m.name} className="size-full object-cover" />
          ) : (
            <>
              <video src={m.url} className="size-full object-cover" muted playsInline />
              <PlayCircle className="absolute inset-0 m-auto size-6 text-navy-foreground drop-shadow" />
            </>
          )}
          <button
            type="button"
            onClick={() => onRemove(m.id)}
            aria-label={`Remove ${m.name}`}
            className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-navy/80 text-navy-foreground opacity-90 transition hover:bg-destructive"
          >
            <X className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
