/** Matches `theme.extend.containers.md` for the `item-row` container (`28rem`). */
const ITEM_ROW_MD_REM = 28;

export function getItemRowMdBreakpointPx(
  root: HTMLElement = document.documentElement
): number {
  const fontSize = Number.parseFloat(getComputedStyle(root).fontSize);
  return ITEM_ROW_MD_REM * (Number.isFinite(fontSize) ? fontSize : 16);
}
