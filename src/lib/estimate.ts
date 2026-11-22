export type HomeSize = "studio" | "1br" | "2br" | "3br" | "4br" | "5br" | "sqft";
export type Access = "ground" | "stairs-low" | "stairs-high" | "elevator";
export type SpecialItem = "piano" | "pool-table" | "art" | "wine" | "gun-safe" | "hot-tub";

export const HOME_SIZE_OPTIONS: { value: HomeSize; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "1br", label: "1 Bedroom" },
  { value: "2br", label: "2 Bedrooms" },
  { value: "3br", label: "3 Bedrooms" },
  { value: "4br", label: "4 Bedrooms" },
  { value: "5br", label: "5+ Bedrooms" },
  { value: "sqft", label: "Enter square footage" },
];

export const ACCESS_OPTIONS: { value: Access; label: string }[] = [
  { value: "ground", label: "Ground Floor" },
  { value: "stairs-low", label: "Stairs (2nd–3rd floor)" },
  { value: "stairs-high", label: "Stairs (4th+ floor)" },
  { value: "elevator", label: "Elevator" },
];

export const SPECIAL_ITEMS: { value: SpecialItem; label: string; fee: number }[] = [
  { value: "piano", label: "Piano", fee: 350 },
  { value: "pool-table", label: "Pool Table", fee: 400 },
  { value: "art", label: "Art / Antiques", fee: 250 },
  { value: "wine", label: "Wine Collection", fee: 200 },
  { value: "gun-safe", label: "Gun Safe", fee: 300 },
  { value: "hot-tub", label: "Hot Tub", fee: 600 },
];

/** Typical household shipment weight in pounds. */
export const HOME_SIZE_WEIGHT_LBS: Record<Exclude<HomeSize, "sqft">, number> = {
  studio: 2000,
  "1br": 3500,
  "2br": 5500,
  "3br": 8500,
  "4br": 11500,
  "5br": 14500,
};
export const LBS_PER_SQFT = 6;

/** Extra handling time per end of the move. */
export const ACCESS_MULTIPLIER: Record<Access, number> = {
  ground: 1,
  "stairs-low": 1.15,
  "stairs-high": 1.3,
  elevator: 1.1,
};

export const HOURLY_RATE_PER_MOVER = 60;
export const LOCAL_TRUCK_FEE = 150;
export const LOCAL_MIN_HOURS = 3;
export const LBS_PER_MOVER_HOUR = 800;
export const LOCAL_MAX_MILES = 100;
export const LONG_BASE_PER_LB = 0.4;
export const LONG_PER_LB_PER_MILE = 0.0006;
export const LONG_ACCESS_PER_LB = 0.12;
export const PEAK_SEASON_SURCHARGE = 0.15; // May–September
export const WEEKEND_SURCHARGE = 0.05; // Friday–Sunday

export function estimateWeight(homeSize: HomeSize, sqft?: number): number {
  if (homeSize === "sqft") return Math.round((sqft ?? 0) * LBS_PER_SQFT);
  return HOME_SIZE_WEIGHT_LBS[homeSize];
}

export function crewFor(weight: number): number {
  if (weight <= 3500) return 2;
  if (weight <= 8500) return 3;
  return 4;
}

export function truckFor(weight: number): string {
  if (weight <= 3500) return "16 ft truck";
  if (weight <= 6000) return "20 ft truck";
  if (weight <= 12000) return "26 ft truck";
  return "26 ft truck + trailer";
}

export function isPeakSeason(date: Date): boolean {
  const m = date.getMonth(); // 0-based
  return m >= 4 && m <= 8;
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 5 || d === 6;
}

export type EstimateInput = {
  homeSize: HomeSize;
  sqft?: number | undefined;
  originAccess: Access;
  destinationAccess: Access;
  miles: number;
  moveDate: Date;
  specialItems: SpecialItem[];
  roomsTotal: number;
  roomsWithMedia: number;
};

export type EstimateLine = { label: string; amount: number };

export type Estimate = {
  low: number;
  high: number;
  mid: number;
  spreadPct: number;
  weightLbs: number;
  crew: number;
  truck: string;
  miles: number;
  moveType: "local" | "long-distance";
  hours?: number | undefined;
  lines: EstimateLine[];
};

const round10 = (n: number) => Math.round(n / 10) * 10;

export function calculateEstimate(input: EstimateInput): Estimate {
  const weight = estimateWeight(input.homeSize, input.sqft);
  const crew = crewFor(weight);
  const truck = truckFor(weight);
  const om = ACCESS_MULTIPLIER[input.originAccess];
  const dm = ACCESS_MULTIPLIER[input.destinationAccess];
  const lines: EstimateLine[] = [];
  let hours: number | undefined;
  let moveType: Estimate["moveType"];

  if (input.miles <= LOCAL_MAX_MILES) {
    moveType = "local";
    const loadHours = weight / (crew * LBS_PER_MOVER_HOUR);
    const driveHours = input.miles / 35;
    hours = Math.max(LOCAL_MIN_HOURS, loadHours * om + loadHours * dm + driveHours);
    hours = Math.round(hours * 2) / 2; // nearest half hour
    lines.push({
      label: `Labor · ${crew} movers × ${hours} hrs`,
      amount: hours * crew * HOURLY_RATE_PER_MOVER,
    });
    lines.push({ label: `Truck & equipment · ${truck}`, amount: LOCAL_TRUCK_FEE });
  } else {
    moveType = "long-distance";
    lines.push({
      label: `Transport · ${weight.toLocaleString("en-US")} lbs × ${input.miles.toLocaleString("en-US")} mi`,
      amount: Math.round(weight * (LONG_BASE_PER_LB + input.miles * LONG_PER_LB_PER_MILE)),
    });
    const accessExtra = om - 1 + (dm - 1);
    if (accessExtra > 0) {
      lines.push({
        label: "Stairs / elevator handling",
        amount: Math.round(accessExtra * weight * LONG_ACCESS_PER_LB),
      });
    }
  }

  const base = lines.reduce((s, l) => s + l.amount, 0);
  if (isPeakSeason(input.moveDate)) {
    lines.push({ label: "Peak season (May–Sep)", amount: Math.round(base * PEAK_SEASON_SURCHARGE) });
  }
  if (isWeekend(input.moveDate)) {
    lines.push({ label: "Weekend move", amount: Math.round(base * WEEKEND_SURCHARGE) });
  }

  for (const item of SPECIAL_ITEMS) {
    if (input.specialItems.includes(item.value)) {
      lines.push({ label: `Special handling · ${item.label}`, amount: item.fee });
    }
  }

  const mid = lines.reduce((s, l) => s + l.amount, 0);
  const coverage = input.roomsTotal > 0 ? Math.min(1, input.roomsWithMedia / input.roomsTotal) : 0;
  const spreadPct = Math.round((0.25 - 0.15 * coverage) * 100);

  return {
    low: round10(mid * (1 - spreadPct / 100)),
    high: round10(mid * (1 + spreadPct / 100)),
    mid: round10(mid),
    spreadPct,
    weightLbs: weight,
    crew,
    truck,
    miles: input.miles,
    moveType,
    hours,
    lines,
  };
}
