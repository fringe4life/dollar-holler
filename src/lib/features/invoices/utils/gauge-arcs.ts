import type { ClientInvoiceSummaryFinal } from "#features/invoices/utils/client-invoice-summary.ts";

/**
 * Bucket reading order, clockwise from the mouth's left edge. Also the source of
 * the `data-bucket` attributes the CSS `:has()` highlight keys off.
 */
export const SUMMARY_BUCKETS = [
  "overdue",
  "outstanding",
  "draft",
  "paid",
] as const;

export type SummaryBucket = (typeof SUMMARY_BUCKETS)[number];

/** The horseshoe is a conic gradient drawn `from 135deg`, so it lives in 90..360deg. */
export const ARC_START_DEG = 90;
export const ARC_SWEEP_DEG = 270;
/** Whitespace between two neighbouring arcs; the mouth (bottom 90deg) is the rest. */
export const ARC_GAP_DEG = 3;
/** Below this a share is invisible, so tiny buckets keep a readable sliver. */
const ARC_MIN_DEG = 1.5;

export type GaugeArc = {
  bucket: SummaryBucket;
  /** Conic offset in degrees, already shifted for `from 135deg`. */
  from: number;
  to: number;
};

/** Per-bucket cents, in bucket order. */
export type GaugeWeights = Record<SummaryBucket, number>;

export const gaugeWeights = (
  summary: ClientInvoiceSummaryFinal
): GaugeWeights => ({
  draft: summary.draft,
  outstanding: summary.outstanding,
  overdue: summary.overdue,
  paid: summary.paid,
});

/**
 * @abstract splits the horseshoe into one arc per non-empty bucket, weighted by money
 * @param {GaugeWeights} weights per-bucket cents
 * @returns {GaugeArc[]} arcs in reading order; empty when every bucket is zero
 */
export const buildGaugeArcs = (weights: GaugeWeights): GaugeArc[] => {
  const filled = SUMMARY_BUCKETS.filter((bucket) => weights[bucket] > 0);
  const total = filled.reduce((sum, bucket) => sum + weights[bucket], 0);
  if (total <= 0) {
    return [];
  }

  const usable = ARC_SWEEP_DEG - ARC_GAP_DEG * Math.max(0, filled.length - 1);
  const raw = filled.map((bucket) =>
    Math.max((usable * weights[bucket]) / total, ARC_MIN_DEG)
  );
  // Minimums can over-subscribe the sweep; scale the set back to fit exactly.
  const scale = Math.min(1, usable / raw.reduce((sum, span) => sum + span, 0));

  let cursor = ARC_START_DEG;
  return filled.map((bucket, index) => {
    const span = raw[index] * scale;
    const arc: GaugeArc = { bucket, from: cursor, to: cursor + span };
    cursor += span + ARC_GAP_DEG;
    return arc;
  });
};
