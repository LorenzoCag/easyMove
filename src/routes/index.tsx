import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Calculator, Loader2, ShieldCheck, Truck, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { calculateEstimate, type Estimate, type SpecialItem } from "@/lib/estimate";
import { estimateDrivingMiles, parseLocation } from "@/lib/geo";
import { MoveDetailsSection } from "@/components/estimator/MoveDetailsSection";
import { RoomUploadsSection } from "@/components/estimator/RoomUploadsSection";
import { SpecialItemsSection } from "@/components/estimator/SpecialItemsSection";
import { EstimateResult } from "@/components/estimator/EstimateResult";
import {
  uid,
  type FieldErrors,
  type MediaFile,
  type MoveDetails,
  type Room,
  type SpecialSelection,
} from "@/components/estimator/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EasyMove — Free Moving Cost Estimator" },
      {
        name: "description",
        content:
          "Estimate your moving cost in minutes. Enter your move details, add room walkthrough videos and special items, and get an instant price range.",
      },
      { property: "og:title", content: "EasyMove — Free Moving Cost Estimator" },
      {
        property: "og:description",
        content: "Get an instant, honest price range for your local or long-distance move.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DEFAULT_ROOMS = [
  "Living Room",
  "Kitchen",
  "Bedroom 1",
  "Bedroom 2",
  "Bathroom",
  "Garage",
  "Storage",
];

function Index() {
  const [details, setDetails] = useState<MoveDetails>({ from: "", to: "", sqft: "" });
  const [rooms, setRooms] = useState<Room[]>(() =>
    DEFAULT_ROOMS.map((name, i) => ({ id: `room-${i}`, name, media: [] })),
  );
  const [special, setSpecial] = useState<SpecialSelection>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    estimate: Estimate;
    from: string;
    to: string;
    approximate: boolean;
  } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const patchDetails = (patch: Partial<MoveDetails>) => {
    setDetails((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k as keyof FieldErrors];
      if ("sqft" in patch) delete next.homeSize;
      return next;
    });
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!details.from.trim()) e.from = "Enter where you're moving from.";
    else if (!parseLocation(details.from)) e.from = 'Use "City, State" — e.g. Austin, TX.';
    if (!details.to.trim()) e.to = "Enter where you're moving to.";
    else if (!parseLocation(details.to)) e.to = 'Use "City, State" — e.g. Denver, CO.';
    if (!details.date) e.date = "Pick your move date.";
    if (!details.homeSize) e.homeSize = "Select your home size.";
    else if (details.homeSize === "sqft" && !(Number(details.sqft) >= 100))
      e.homeSize = "Enter your square footage (100 or more).";
    if (!details.originAccess) e.originAccess = "Select access at your current place.";
    if (!details.destinationAccess) e.destinationAccess = "Select access at your new place.";
    for (const [item, photos] of Object.entries(special)) {
      if (photos && photos.length === 0) e[`special-${item}`] = "Add at least one photo.";
    }
    return e;
  };

  const calculate = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0] ?? "";
      const section = first.startsWith("special-") ? "special-items" : "move-details";
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.error("A few details are missing", {
        description: `Please fix ${Object.keys(e).length} highlighted field${Object.keys(e).length > 1 ? "s" : ""}.`,
      });
      return;
    }
    const from = parseLocation(details.from);
    const to = parseLocation(details.to);
    if (!from || !to || !details.date || !details.homeSize || !details.originAccess || !details.destinationAccess)
      return;

    setLoading(true);
    try {
      const { miles, approximate } = await estimateDrivingMiles(from, to);
      const estimate = calculateEstimate({
        homeSize: details.homeSize,
        sqft: Number(details.sqft),
        originAccess: details.originAccess,
        destinationAccess: details.destinationAccess,
        miles,
        moveDate: details.date,
        specialItems: Object.keys(special) as SpecialItem[],
        roomsTotal: rooms.length,
        roomsWithMedia: rooms.filter((r) => r.media.length > 0).length,
      });
      setResult({
        estimate,
        from: `${from.city}, ${from.state.abbr}`,
        to: `${to.city}, ${to.state.abbr}`,
        approximate,
      });
    } finally {
      setLoading(false);
    }
  };

  const revoke = (m: MediaFile[]) => m.forEach((f) => URL.revokeObjectURL(f.url));

  return (
    <div className="min-h-screen">
      <header className="bg-hero relative overflow-hidden text-navy-foreground">
        <div className="pattern-dots absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-5xl px-5 pb-28 pt-6 sm:px-8">
          <nav className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-cta text-cta-foreground">
              <Truck className="size-5" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">EasyMove</span>
          </nav>
          <div className="mt-14 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cta">
              Free moving estimator
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Know what your move will cost — before anyone knocks on your door.
            </h1>
            <p className="mt-4 text-lg opacity-85">
              Three quick steps. No phone calls, no sign-up, no pressure.
            </p>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium opacity-90">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-cta" /> Licensed & insured movers
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-cta" /> Transparent pricing
            </li>
            <li className="flex items-center gap-2">
              <Video className="size-4 text-cta" /> Video walkthroughs = tighter quotes
            </li>
          </ul>
        </div>
      </header>

      <main className="relative mx-auto -mt-20 max-w-5xl space-y-6 px-5 pb-20 sm:px-8">
        <MoveDetailsSection value={details} onChange={patchDetails} errors={errors} />

        <RoomUploadsSection
          rooms={rooms}
          onAddMedia={(roomId, media) =>
            setRooms((rs) =>
              rs.map((r) => (r.id === roomId ? { ...r, media: [...r.media, ...media] } : r)),
            )
          }
          onRemoveMedia={(roomId, mediaId) =>
            setRooms((rs) =>
              rs.map((r) => {
                if (r.id !== roomId) return r;
                revoke(r.media.filter((m) => m.id === mediaId));
                return { ...r, media: r.media.filter((m) => m.id !== mediaId) };
              }),
            )
          }
          onAddRoom={(name) => setRooms((rs) => [...rs, { id: uid(), name, custom: true, media: [] }])}
          onRemoveRoom={(roomId) =>
            setRooms((rs) => {
              const room = rs.find((r) => r.id === roomId);
              if (room) revoke(room.media);
              return rs.filter((r) => r.id !== roomId);
            })
          }
        />

        <SpecialItemsSection
          selection={special}
          errors={errors}
          onToggle={(item, checked) => {
            setSpecial((s) => {
              const next = { ...s };
              if (checked) next[item] = next[item] ?? [];
              else {
                revoke(next[item] ?? []);
                delete next[item];
              }
              return next;
            });
            setErrors((e) => {
              const next = { ...e };
              delete next[`special-${item}`];
              return next;
            });
          }}
          onAddPhotos={(item, media) => {
            setSpecial((s) => ({ ...s, [item]: [...(s[item] ?? []), ...media] }));
            setErrors((e) => {
              const next = { ...e };
              delete next[`special-${item}`];
              return next;
            });
          }}
          onRemovePhoto={(item, id) =>
            setSpecial((s) => {
              const photos = s[item] ?? [];
              revoke(photos.filter((p) => p.id === id));
              return { ...s, [item]: photos.filter((p) => p.id !== id) };
            })
          }
        />

        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <Button
            type="button"
            variant="cta"
            size="xl"
            onClick={calculate}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Calculator />}
            {loading ? "Calculating…" : "Calculate My Move"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Instant estimate · Nothing is sent or saved
          </p>
        </div>

        <div ref={resultRef} className="scroll-mt-6">
          {result && (
            <EstimateResult
              estimate={result.estimate}
              from={result.from}
              to={result.to}
              approximateDistance={result.approximate}
            />
          )}
        </div>
      </main>

      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EasyMove · Estimates are not binding quotes.
      </footer>
    </div>
  );
}
