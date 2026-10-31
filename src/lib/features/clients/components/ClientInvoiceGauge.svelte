<script lang="ts">
  import {
    clientSummaryArc,
    clientSummaryArcSweep,
    clientSummaryGhostRing,
    clientSummarySkeletonRing,
  } from "#features/invoices/styles/invoice-summary-styles.ts";
  import {
    ARC_START_DEG,
    ARC_SWEEP_DEG,
    type GaugeArc,
  } from "#features/invoices/utils/gauge-arcs.ts";

  interface Props {
    arcs: GaugeArc[];
    showGhostRing: boolean;
    /** `false` while the summary query is pending. */
    summaryLoaded: boolean;
  }

  let { arcs, showGhostRing, summaryLoaded }: Props = $props();
</script>

{#if showGhostRing}
  <!-- Same 270deg sweep as the arcs, drawn as a dashed ghost. -->
  <svg
    aria-hidden="true"
    class={clientSummaryGhostRing}
    focusable="false"
    viewBox="0 0 100 100"
  >
    <path d="M18.9 81.1A44 44 0 1 1 81.1 81.1"></path>
  </svg>
{:else if !summaryLoaded}
  <div aria-hidden="true" class={clientSummarySkeletonRing}></div>
{:else}
  <!-- One sweep cursor for all arcs: the mask travels the same 270deg the
       arcs occupy, so buckets light up in reading order on first paint. -->
  <div
    class={clientSummaryArcSweep}
    style="--arc-start: {ARC_START_DEG}deg; --arc-end: {ARC_START_DEG +
      ARC_SWEEP_DEG}deg; --arc-sweep: {ARC_START_DEG + ARC_SWEEP_DEG}deg"
  >
    {#each arcs as arc (arc.bucket)}
      <div
        aria-hidden="true"
        class={clientSummaryArc({
          bucket: arc.bucket,
          lead: arc.bucket === "overdue",
        })}
        data-arc={arc.bucket}
        style="--arc-from: {arc.from}deg; --arc-to: {arc.to}deg; background: conic-gradient(from 135deg, transparent 0deg var(--arc-from), currentColor var(--arc-from) var(--arc-to), transparent var(--arc-to) 360deg)"
      ></div>
    {/each}
  </div>
{/if}
