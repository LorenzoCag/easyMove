import { describe, expect, it } from "vitest";
import { toCitySuggestions, type GeoResult } from "./geo";

const r = (name: string, admin1: string, country_code = "US"): GeoResult => ({
  name,
  admin1,
  country_code,
  latitude: 0,
  longitude: 0,
});

describe("toCitySuggestions", () => {
  const results = [
    r("Austin", "Texas"),
    r("Austin", "Minnesota"),
    r("Austin", "Texas"), // duplicate
    r("Austin", "Ontario", "CA"), // not US
  ];

  it("formats unique US results as City, ST", () => {
    expect(toCitySuggestions(results, "Aus").map((s) => s.label)).toEqual([
      "Austin, TX",
      "Austin, MN",
    ]);
  });

  it("filters by the state fragment typed after the comma", () => {
    expect(toCitySuggestions(results, "Austin, T").map((s) => s.label)).toEqual(["Austin, TX"]);
    expect(toCitySuggestions(results, "Austin, minn").map((s) => s.label)).toEqual([
      "Austin, MN",
    ]);
  });
});
