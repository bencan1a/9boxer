import { describe, it, expect } from "vitest";
import {
  isDerivedFlag,
  toPersistableFlags,
  getAllFlags,
} from "../../../constants/flags";

describe("derived movement flags", () => {
  it("marks movement flags as derived and others as user-assignable", () => {
    expect(isDerivedFlag("big_mover")).toBe(true);
    expect(isDerivedFlag("medium_mover")).toBe(true);
    expect(isDerivedFlag("flight_risk")).toBe(false);
  });

  it("strips derived flags from an update payload", () => {
    // Regression: the API rejects derived flags with a 422, so adding any flag
    // to a big mover used to fail outright.
    expect(
      toPersistableFlags(["big_mover", "flight_risk", "medium_mover"])
    ).toEqual(["flight_risk"]);
  });

  it("leaves user-assigned flags untouched", () => {
    expect(toPersistableFlags(["flight_risk", "pip"])).toEqual([
      "flight_risk",
      "pip",
    ]);
  });

  it("registers medium_mover so it appears as a filter option", () => {
    expect(getAllFlags().map((f) => f.key)).toContain("medium_mover");
  });
});
