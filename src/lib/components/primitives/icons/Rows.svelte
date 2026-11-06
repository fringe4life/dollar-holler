<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * Page-density marks, ported from van-life's `rows-icon` (same bar width,
   * radius and optical box) and re-authored filled.
   *
   * The count *is* the content, so the family is bars and nothing else: no outer
   * frame, because at 16px inside an option a frame eats the gaps and the glyph
   * reads as a window. Static by design — a native picker gives options no state
   * we control, so nothing here animates.
   *
   * Five bars is the "many" mark: a tighter pitch with a short last bar, which
   * says plenty rather than another equal stack.
   */
  const GRID = 24;
  const BAR_X = 4;

  const barsClass = css({ fill: "currentColor" });

  interface RowGeometry {
    barHeight: number;
    barWidth: number;
    gap: number;
    lastBarWidth?: number;
    rowCount: number;
  }

  interface RowBar {
    height: number;
    id: string;
    width: number;
    y: number;
  }

  const toUnits = (value: number) => Math.round(value * 100) / 100;

  const layoutRows = ({
    barHeight,
    barWidth,
    gap,
    lastBarWidth,
    rowCount,
  }: RowGeometry): RowBar[] => {
    const stackHeight = barHeight * rowCount + gap * (rowCount - 1);
    const start = (GRID - stackHeight) / 2;

    return Array.from({ length: rowCount }, (_, index) => ({
      height: barHeight,
      id: `bar-${index}`,
      width:
        lastBarWidth !== undefined && index === rowCount - 1
          ? lastBarWidth
          : barWidth,
      y: toUnits(start + index * (barHeight + gap)),
    }));
  };

  const STANDARD_BARS = { barHeight: 2.4, barWidth: 16, gap: 3.2 } as const;

  export const ROW_LAYOUTS = {
    2: layoutRows({ ...STANDARD_BARS, rowCount: 2 }),
    3: layoutRows({ ...STANDARD_BARS, rowCount: 3 }),
    4: layoutRows({ ...STANDARD_BARS, rowCount: 4 }),
    5: layoutRows({
      barHeight: 1.9,
      barWidth: 16,
      gap: 2.5,
      lastBarWidth: 8,
      rowCount: 5,
    }),
  } as const;

  export type RowCount = keyof typeof ROW_LAYOUTS;
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  interface Props extends IconProps {
    count: RowCount;
  }

  let { count, ...rest }: Props = $props();

  const rows = $derived(ROW_LAYOUTS[count]);
</script>

<Icon {...rest}>
  <g class={barsClass}>
    {#each rows as row (row.id)}
      <rect
        height={row.height}
        rx={row.height / 2}
        width={row.width}
        x={BAR_X}
        y={row.y}
      />
    {/each}
  </g>
</Icon>
