import { describe, expect, it } from "vitest";
import { calculateEstimate, estimateWeight, type EstimateInput } from "./estimate";
import { parseLocation } from "./geo";

// A Tuesday in March: no peak-season or weekend surcharge.
const offPeakWeekday = new Date(2027, 2, 9);

const base: EstimateInput = {
  homeSize: "2br",
  originAccess: "ground",
  destinationAccess: "ground",
  miles: 10,
  moveDate: offPeakWeekday,
  specialItems: [],
  roomsTotal: 7,
  roomsWithMedia: 0,
};

describe("moving estimate", () => {
  it("uses 6 lbs per square foot when square footage is given", () => {
    expect(estimateWeight("sqft", 1500)).toBe(9000);
  });

  it("prices a local 2BR ground-floor move by the hour", () => {
    const e = calculateEstimate(base);
    expect(e.moveType).toBe("local");
    expect(e.crew).toBe(3);
    expect(e.hours).toBe(5);
    expect(e.mid).toBe(5 * 3 * 60 + 150);
  });

  it("adds $350 for a piano", () => {
    const without = calculateEstimate(base).mid;
    const withPiano = calculateEstimate({ ...base, specialItems: ["piano"] }).mid;
    expect(withPiano - without).toBe(350);
  });

  it("adds 15% in peak season", () => {
    const july = calculateEstimate({ ...base, moveDate: new Date(2027, 6, 13) }); // Tuesday
    expect(july.lines.find((l) => l.label.startsWith("Peak"))?.amount).toBe(Math.round(1050 * 0.15));
  });

  it("treats moves over 100 miles as long distance", () => {
    expect(calculateEstimate({ ...base, miles: 101 }).moveType).toBe("long-distance");
  });

  it("narrows the range from ±25% to ±10% when every room has a walkthrough", () => {
    expect(calculateEstimate(base).spreadPct).toBe(25);
    expect(calculateEstimate({ ...base, roomsWithMedia: 7 }).spreadPct).toBe(10);
  });

  it("reads City, ST and full state names", () => {
    expect(parseLocation("Austin, TX")?.state.abbr).toBe("TX");
    expect(parseLocation("Portland, Oregon")?.state.abbr).toBe("OR");
    expect(parseLocation("Austin")).toBeNull();
  });
});
