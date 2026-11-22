import { useRef, useState } from "react";
import { CheckCircle2, Lightbulb, Plus, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MediaThumbs } from "./MediaThumbs";
import { SectionCard } from "./SectionCard";
import { filesToMedia, type MediaFile, type Room } from "./types";

const TIPS = ["Walk slowly", "Show furniture from all angles", "Open closets"];

export function RoomUploadsSection({
  rooms,
  onAddMedia,
  onRemoveMedia,
  onAddRoom,
  onRemoveRoom,
}: {
  rooms: Room[];
  onAddMedia: (roomId: string, media: MediaFile[]) => void;
  onRemoveMedia: (roomId: string, mediaId: string) => void;
  onAddRoom: (name: string) => void;
  onRemoveRoom: (roomId: string) => void;
}) {
  const [newRoom, setNewRoom] = useState("");
  const done = rooms.filter((r) => r.media.length > 0).length;

  const add = () => {
    const name = newRoom.trim();
    if (!name) return;
    onAddRoom(name);
    setNewRoom("");
  };

  return (
    <SectionCard
      id="rooms"
      step={2}
      title="Record or Upload Room Walkthrough"
      subtitle="A quick video of each room tightens your price range. Optional, but it helps a lot."
    >
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-cta/30 bg-cta-soft p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 font-semibold text-accent-foreground">
          <Lightbulb className="size-5" />
          Tips
        </div>
        <ul className="flex flex-wrap gap-2">
          {TIPS.map((t) => (
            <li
              key={t}
              className="rounded-full bg-card px-3 py-1 text-sm font-medium text-navy shadow-sm"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-navy">
          {done} of {rooms.length} rooms recorded
        </span>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-cta transition-all"
            style={{ width: `${rooms.length ? (done / rooms.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rooms.map((room) => (
          <RoomTile
            key={room.id}
            room={room}
            onAdd={(m) => onAddMedia(room.id, m)}
            onRemoveMedia={(id) => onRemoveMedia(room.id, id)}
            onRemoveRoom={room.custom ? () => onRemoveRoom(room.id) : undefined}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-xl border border-dashed border-navy/25 p-4 sm:flex-row">
        <Input
          placeholder="Room name (e.g. Office, Bedroom 3)"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="h-11 bg-card"
          aria-label="New room name"
        />
        <Button type="button" variant="navyOutline" className="h-11" onClick={add}>
          <Plus /> Add Another Room
        </Button>
      </div>
    </SectionCard>
  );
}

function RoomTile({
  room,
  onAdd,
  onRemoveMedia,
  onRemoveRoom,
}: {
  room: Room;
  onAdd: (m: MediaFile[]) => void;
  onRemoveMedia: (id: string) => void;
  onRemoveRoom?: (() => void) | undefined;
}) {
  const recordRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const has = room.media.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        has ? "border-success/40 bg-success-soft" : "bg-card",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-navy">
          {has && <CheckCircle2 className="size-4 text-success" />}
          {room.name}
        </h3>
        {onRemoveRoom && (
          <button
            type="button"
            onClick={onRemoveRoom}
            aria-label={`Remove ${room.name}`}
            className="text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="navyOutline"
          className="flex-1"
          onClick={() => recordRef.current?.click()}
        >
          <Video /> Record
        </Button>
        <Button
          type="button"
          size="sm"
          variant="navyOutline"
          className="flex-1"
          onClick={() => uploadRef.current?.click()}
        >
          <Upload /> Upload
        </Button>
      </div>
      <input
        ref={recordRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        aria-label={`Record ${room.name}`}
        onChange={(e) => {
          onAdd(filesToMedia(e.target.files));
          e.target.value = "";
        }}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        aria-label={`Upload ${room.name}`}
        onChange={(e) => {
          onAdd(filesToMedia(e.target.files));
          e.target.value = "";
        }}
      />
      <MediaThumbs media={room.media} onRemove={onRemoveMedia} />
    </div>
  );
}
