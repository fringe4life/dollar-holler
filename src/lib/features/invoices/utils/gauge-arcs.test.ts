import { describe, expect, test } from "bun:test";
import {
  ARC_GAP_DEG,
  ARC_START_DEG,
  ARC_SWEEP_DEG,
  buildGaugeArcs,
  type GaugeWeights,
} from "#features/invoices/utils/gauge-arcs.ts";

const weights = (partial: Partial<GaugeWeights>): GaugeWeights => ({
  draft: 0,
  outstanding: 0,
  overdue: 0,
  paid: 0,
  ...partial,
});

describe("buildGaugeArcs", () => {
  test("returns nothing when every bucket is empty", () => {
    expect(buildGaugeArcs(weights({}))).toEqual([]);
  });

  test("omits non-positive buckets from the chart", () => {
    expect(buildGaugeArcs(weights({ draft: -500, paid: 0 }))).toEqual([]);
    const arcs = buildGaugeArcs(weights({ draft: -500, paid: 100 }));
    expect(arcs.map((arc) => arc.bucket)).toEqual(["paid"]);
  });

  test("keeps reading order even when early buckets are empty", () => {
    const arcs = buildGaugeArcs(weights({ draft: 100, paid: 300 }));
    expect(arcs.map((arc) => arc.bucket)).toEqual(["draft", "paid"]);
    expect(arcs[0]?.from).toBe(ARC_START_DEG);
  });

  test("weights arcs by money and fills the sweep", () => {
    const arcs = buildGaugeArcs(
      weights({ draft: 2350, outstanding: 6940, overdue: 4180, paid: 18270 })
    );
    const spans = arcs.map((arc) => arc.to - arc.from);
    const last = arcs.at(-1);

    expect(arcs).toHaveLength(4);
    expect(last?.to).toBeCloseTo(ARC_START_DEG + ARC_SWEEP_DEG, 5);
    // paid is the heaviest bucket, overdue the lightest non-empty one
    expect(spans[3]).toBeGreaterThan(spans[1]!);
    expect(spans[1]).toBeGreaterThan(spans[0]!);
    expect(spans.reduce((sum, span) => sum + span, 0)).toBeCloseTo(
      ARC_SWEEP_DEG - ARC_GAP_DEG * 3,
      5
    );
  });

  test("leaves a gap between neighbours and none at the ends", () => {
    const arcs = buildGaugeArcs(weights({ overdue: 1, paid: 1 }));
    expect(arcs[1]!.from - arcs[0]!.to).toBeCloseTo(ARC_GAP_DEG, 5);
  });

  test("gives a negligible bucket a visible sliver without overrunning", () => {
    const arcs = buildGaugeArcs(
      weights({ draft: 1, outstanding: 1, overdue: 1, paid: 1_000_000 })
    );
    const last = arcs.at(-1);

    expect(arcs.every((arc) => arc.to > arc.from)).toBe(true);
    expect(last!.to).toBeLessThanOrEqual(ARC_START_DEG + ARC_SWEEP_DEG + 0.001);
  });
});
