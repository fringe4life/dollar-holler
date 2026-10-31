import { cva, css, cx } from "#styled-system/css/index.js";
import { cq, grid } from "#styled-system/patterns/index.js";
import { CORNER_SHAPE } from "#lib/styles.ts";

/**
 * Client invoice gauge — Concept A.
 *
 * Three containers stack here:
 * - `clientTotals` (the section) decides the *layout*: a 2x2 grid under the ring,
 *   a ledger beside it, or cards flanking it. Tiers start as early as the
 *   measurements allow: rows at `ledger` (36rem/576), flanks at `3xl` (48rem/768).
 * - `gauge` (the ring box) decides the *hollow*: type, stroke and insets scale
 *   with the ring itself, so one clamp covers every tier instead of a font
 *   variable per breakpoint.
 * - `bucketCard` (each card) decides the *row's own density*: the invoice count
 *   appears only when the row can hold it, so the ledger does not need a rung
 *   per width.
 *
 * Three chrome modes, in order: a boxed tile, a ledger row (chrome off, one rule
 * below, term and amount across), and a bare flank. The card sits *between* two
 * arrangements — beside the ring at 576 it is still only ~230px, so it keeps the
 * mobile tile look and only turns into a row at `rows` (640) when it has room.
 * Note the shape cannot be a query on `bucketCard` itself: a container query
 * styles descendants, never the container, so the shape rungs stay on
 * `clientTotals` and `bucketCard` governs what is inside the card.
 *
 * What actually gates each tier — measured, not assumed:
 * - Rows are limited by the *ring*, not the cards. A 50/50 split capped the ring
 *   at half the container, so `46cqi` made it shrink to 294 at the switch — less
 *   than the 318 the tier below gives it. The ring column is now `auto` with a
 *   318 floor, so identity width no longer regresses; a row then needs ~250px for
 *   term + amount, which puts the floor at ~570.
 * - Flanks are limited only by flank width: the ring is a constant 392 there, so
 *   from 768 up nothing but the gutters changes.
 *
 * The hollow holds one centered stack at every tier: initials, identity, the
 * address (where it fits) and the mouth readout. Only the address's placement
 * changes — below `3xl` a <=392px ring cannot carry it without crowding the
 * readout, so it steps out under the ring. Centering the rest keeps the stack
 * from hugging the top of the hollow when that happens.
 */

/** Ring-relative sizes (1cqw = 1% of the ring box, which is the `gauge` container). */
const RING_STROKE = "clamp(9px, 3.6cqw, 16px)";
const RING_NAME = "clamp(19px, 5.8cqw, 26px)";
const RING_BODY = "clamp(12px, 3.2cqw, 14px)";
const RING_META = "clamp(11.5px, 3.1cqw, 12px)";
const RING_READOUT = "clamp(15px, 4.4cqw, 19px)";

/** Ring stroke as a mask, so each arc can carry its own thickness. */
const ringMask = (thickness: string) =>
  `radial-gradient(farthest-side, transparent calc(100% - ${thickness}), #000 calc(100% - ${thickness}) 100%)`;

export const clientSummarySection = cx(
  css({
    marginBlockEnd: 10,
    // Archived clients step back: the state is carried by the badge, not the type.
    "&[data-state='archive'] [data-role='avatar']": {
      filter: "grayscale(1)",
      opacity: 0.7,
    },
    "&[data-state='archive'] [data-role='name']": { color: "textMuted" },
    "&[data-state='archive'] [data-role='email']": { color: "metricLabel" },
    "&[data-state='archive'] [data-role='address'] p": { color: "metricLabel" },
    "&[data-state='archive'] [data-role='since'] span": {
      color: "metricLabel",
    },
    "&[data-state='archive'] [data-role='since'] strong": {
      color: "textMuted",
    },
    "&[data-state='archive'] [data-role='empty-title']": { color: "textMuted" },
  }),
  cq({ name: "clientTotals" })
);

export const clientSummaryHero = grid({
  alignItems: "center",
  columnGap: { base: 3, "@clientTotals/ledger": 7 },
  gridTemplateAreas: {
    base: '"gauge gauge" "overdue outstanding" "draft paid"',
    "@clientTotals/ledger":
      '"gauge overdue" "gauge outstanding" "gauge draft" "gauge paid"',
    "@clientTotals/3xl": '"overdue gauge draft" "outstanding gauge paid"',
  },
  gridTemplateColumns: {
    base: "repeat(2, minmax(0, 1fr))",
    // Ring gets its own column and the rows take the rest: a 50/50 split caps
    // the ring at half the container, which is what forced `46cqi` and made the
    // ring *shrink* at the switch. `auto` lets the ring keep its floor instead.
    "@clientTotals/ledger": "auto minmax(0, 1fr)",
    "@clientTotals/3xl": "minmax(0, 1fr) auto minmax(0, 1fr)",
  },
  // Boxed tiles need air; ledger rows are separated by their own rule.
  rowGap: {
    base: 2.5,
    "@clientTotals/ledger": 2,
    "@clientTotals/rows": 0,
    "@clientTotals/3xl": 6,
  },
  // Card ↔ arc/mouth via :has — no hover $state. `data-bucket` only when amount is ready.
  "&:has([data-bucket='draft']:is(:hover, :focus-within)) [data-arc]:not([data-arc='draft'])":
    { opacity: 0.22 },
  "&:has([data-bucket='outstanding']:is(:hover, :focus-within)) [data-arc]:not([data-arc='outstanding'])":
    { opacity: 0.22 },
  "&:has([data-bucket='overdue']:is(:hover, :focus-within)) [data-arc]:not([data-arc='overdue'])":
    { opacity: 0.22 },
  "&:has([data-bucket='paid']:is(:hover, :focus-within)) [data-arc]:not([data-arc='paid'])":
    { opacity: 0.22 },
  // The other cards step back with their arcs, so a hover reads as a selection.
  "&:has([data-bucket='draft']:is(:hover, :focus-within)) [data-bucket]:not([data-bucket='draft'])":
    { opacity: 0.55 },
  "&:has([data-bucket='outstanding']:is(:hover, :focus-within)) [data-bucket]:not([data-bucket='outstanding'])":
    { opacity: 0.55 },
  "&:has([data-bucket='overdue']:is(:hover, :focus-within)) [data-bucket]:not([data-bucket='overdue'])":
    { opacity: 0.55 },
  "&:has([data-bucket='paid']:is(:hover, :focus-within)) [data-bucket]:not([data-bucket='paid'])":
    { opacity: 0.55 },
  "& [data-readout]:not([data-readout='total'])": { display: "none" },
  "&:has([data-bucket]:is(:hover, :focus-within)) [data-readout='total']": {
    display: "none",
  },
  "&:has([data-bucket='draft']:is(:hover, :focus-within)) [data-readout='draft']":
    { display: "flex" },
  "&:has([data-bucket='outstanding']:is(:hover, :focus-within)) [data-readout='outstanding']":
    { display: "flex" },
  "&:has([data-bucket='overdue']:is(:hover, :focus-within)) [data-readout='overdue']":
    { display: "flex" },
  "&:has([data-bucket='paid']:is(:hover, :focus-within)) [data-readout='paid']":
    { display: "flex" },
});

/** Empty hero: one centered column, so the gauge is not stranded beside a void. */
export const clientSummaryHeroEmpty = grid({
  alignItems: "center",
  // `gauge` must be declared, or `clientSummaryGaugeCol`'s area reference
  // spawns an implicit second column and the two rows sit side by side.
  gridTemplateAreas: '"gauge" "empty"',
  gridTemplateColumns: "minmax(0, 1fr)",
  justifyItems: "center",
  rowGap: { base: 5, "@clientTotals/ledger": 7 },
});

/** The list blank states' arrow, sized against the panel. */
const EMPTY_ARROW_SIZE = "clamp(2.5rem, 8cqi, 3.25rem)";

export const clientSummaryEmptyPanel = css({
  alignItems: "center",
  backgroundColor: "surface",
  // Same arrow the list blank states use, aimed at the route's add button:
  // up-left while the button sits first in the stacked header, else up-right.
  backgroundImage: {
    base: "var(--arrow-up-left)",
    "@clientTotals/ledger": "var(--arrow-up-right)",
  },
  backgroundPosition: {
    base: "left 20px top 18px",
    "@clientTotals/ledger": "right 20px top 18px",
  },
  backgroundRepeat: "no-repeat",
  backgroundSize: EMPTY_ARROW_SIZE,
  borderColor: "borderSubtle",
  borderRadius: "xl",
  borderStyle: "solid",
  borderWidth: "1px",
  cornerShape: CORNER_SHAPE,
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  gridArea: "empty",
  inlineSize: "100%",
  maxInlineSize: "34rem",
  // Reserve the arrow's band on both sides: top so the copy never runs under the
  // doodle, bottom so it stays optically centred instead of being pushed down.
  justifyContent: "center",
  paddingBlock: `calc(${EMPTY_ARROW_SIZE} + 18px)`,
  paddingInline: { base: 4, "@clientTotals/3xl": 6 },
  textAlign: "center",
});

/** The list blank states' voice — handwriting in success — sized for a header. */
export const clientSummaryEmptyTitle = css({
  color: "success",
  fontFamily: "handwriting",
  fontSize: { base: "2xl", "@clientTotals/3xl": "3xl" },
  fontWeight: "bold",
  lineHeight: "tight",
  margin: 0,
});

export const clientSummaryEmptyBody = css({
  color: "textMuted",
  fontSize: "sm",
  margin: 0,
});

export const clientSummaryGaugeCol = css({
  gridArea: "gauge",
  inlineSize: {
    /**
     * Fill the cell. The `min(318px, …)` cap this used to carry left a 330–575
     * band where the ring stopped growing and sat centred in dead gutters — at a
     * 543 section, 112px either side, which reads as an inexplicably small ring
     * rather than a deliberate one. Below `ledger` the ring is stacked and owns
     * the full width, so the whole cell is its to use; the swap to
     * beside-the-rows is where it hands width back to the cards.
     */
    base: "100cqi",
    // The rows tier used to drop to `min(392px, 46cqi)`, which at 640 shrank the
    // ring to 294 — *narrower* than the 318 the tier below gives it, so the
    // identity got worse at the switch. Floor it at the base ring instead.
    "@clientTotals/ledger": "clamp(318px, 46cqi, 392px)",
    "@clientTotals/3xl": "clamp(392px, 42cqi, 440px)",
  },
  justifySelf: "center",
  /**
   * Reserve the band the address drops into while it hangs below the ring. It has
   * to follow the row exactly — reserve while the row is out, stop as soon as it
   * is inside — or the ring is followed by 68px of nothing (or the row overlaps
   * the cards). The conditions are cumulative and ordered by width, so `ledger`
   * puts the reservation back for the band where the ring is small again.
   */
  paddingBlockEnd: {
    base: "68px",
    "@clientTotals/sm": 0,
    "@clientTotals/ledger": "68px",
    "@clientTotals/3xl": 0,
  },
  position: "relative",
});

export const clientSummaryGauge = css({
  aspectRatio: "1",
  containerName: "gauge",
  containerType: "inline-size",
  inlineSize: "100%",
  position: "relative",
});

/**
 * Intro fill: one conic mask over the whole arc set, so a single sweep cursor
 * travels the horseshoe clockwise and each bucket lights up as it is passed —
 * the sequencing comes for free, no per-arc delay or keyframe target.
 *
 * The mask edge is driven by `--arc-sweep`, registered as an `<angle>` in
 * `app.css` so it can interpolate. The element's resting value is the end
 * state; only `arc-fill` lowers it, so nothing can leave the ring hidden.
 */
export const clientSummaryArcSweep = css({
  // `glide` front-loads 97% of the sweep into the first half and then crawls;
  // `out` gets the horseshoe drawn briskly while still travelling at 50%.
  animation: "arc-fill 800ms var(--easings-out) both",
  inset: 0,
  // #000 is opaque: everything up to the sweep is revealed, the rest is not.
  maskImage:
    "conic-gradient(from 135deg, #000 0deg var(--arc-sweep), transparent var(--arc-sweep) 360deg)",
  pointerEvents: "none",
  position: "absolute",
});

export const clientSummaryArc = cva({
  base: {
    // Fill comes from the element style (`--arc-from` / `--arc-to` + conic-gradient).
    borderRadius: "50%",
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "normal",
    transitionProperty: "opacity",
  },
  defaultVariants: { lead: false },
  variants: {
    bucket: {
      draft: { color: "statusDraft" },
      outstanding: { color: "primary" },
      overdue: { color: "statusLate" },
      paid: { color: "success" },
    },
    lead: {
      false: { maskImage: ringMask(RING_STROKE) },
      true: { maskImage: ringMask(`calc(${RING_STROKE} * 1.72)`) },
    },
  },
});

/**
 * Empty gauge: the same 270deg horseshoe the data arcs occupy, drawn as a dashed
 * ghost so the hollow reads "nothing to total" rather than "nothing rendered".
 * The stroke is in viewBox units (3.3% of the ring), so it tracks the arcs'
 * cqw-based weight without a second clamp.
 */
export const clientSummaryGhostRing = css({
  blockSize: "100%",
  color: "borderSubtle",
  fill: "none",
  inlineSize: "100%",
  inset: 0,
  opacity: 0.9,
  position: "absolute",
  stroke: "currentColor",
  strokeDasharray: "1 2.6",
  strokeLinecap: "round",
  strokeWidth: "2.2",
});

/** Plate width once the address/since row sits inside the hollow. */
const PLATE_INSIDE = "min(78%, 22rem)";

export const clientSummaryPlate = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: { base: 3, "@clientTotals/ledger": 4 },
  inset: 0,
  justifyContent: "center",
  marginInline: "auto",
  textAlign: "start",
  /**
   * While the address hangs below the ring the plate uses the full hollow; once
   * the row moves inside, the stack narrows to clear the stroke and is capped at
   * 22rem so a filled-up base ring (up to 575) cannot stretch it. 22rem is above
   * the widest `3xl` plate (78% of 440 = 343), so that tier is unchanged.
   */
  inlineSize: {
    base: "100%",
    "@clientTotals/sm": { "@clientTotals/ledgerDown": PLATE_INSIDE },
    "@clientTotals/3xl": PLATE_INSIDE,
  },
  position: "absolute",
});

export const clientSummaryAvatar = css({
  alignSelf: "center",
  display: "inline-flex",
  marginBlockEnd: 1,
});

export const clientSummaryIdentity = css({
  display: "flex",
  flexDirection: "column",
  gap: "clamp(4px, 2.2cqw, 7px)",
  /**
   * 78% of the 318 ring is the width this stack was designed against. Now that
   * the stacked ring fills its cell it can be 560, and 78% of that stretched the
   * `1fr auto` rows until the name and Edit sat at opposite ends with the badge
   * stranded under the button. Cap at the widest tier's identity (78% of 440 is
   * 343) and let the stack stay a single centered block inside a wide hollow.
   * Once the address comes inside, the cap moves to the plate and the identity
   * fills it again, as it does at `3xl`.
   */
  inlineSize: {
    base: "min(78%, 21rem)",
    "@clientTotals/sm": { "@clientTotals/ledgerDown": "100%" },
    "@clientTotals/3xl": "100%",
  },
  minInlineSize: 0,
});

export const clientSummaryHead = grid({
  alignItems: "center",
  columnGap: 2.5,
  gridTemplateColumns: "minmax(0, 1fr) auto",
  minInlineSize: 0,
});

export const clientSummaryName = css({
  color: "foreground",
  fontSize: RING_NAME,
  fontWeight: "bold",
  letterSpacing: "tight",
  lineHeight: 1.05,
  margin: 0,
  marginBlockEnd: "-0.14em",
  minInlineSize: 0,
  overflow: "hidden",
  // Display leading crops descenders once the name is clipped to one line.
  paddingBlockEnd: "0.14em",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/** Only what the Button recipe leaves open: ghost sets colour, size sets padding. */
export const clientSummaryEditButton = css({
  backgroundColor: "surface",
  borderColor: "borderSubtle",
  borderStyle: "solid",
  borderWidth: "1px",
  cornerShape: CORNER_SHAPE,
  flexShrink: 0,
  _hover: { borderColor: "borderMuted" },
});

export const clientSummaryMeta = grid({
  alignItems: "center",
  columnGap: 2,
  gridTemplateColumns: "minmax(0, 1fr) auto",
  minInlineSize: 0,
});

export const clientSummaryEmail = css({
  color: "textMuted",
  fontSize: RING_BODY,
  minInlineSize: 0,
  overflow: "hidden",
  textDecoration: "none",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  _hover: { color: "foreground", textDecoration: "underline" },
});

export const clientSummaryBadge = css({ justifySelf: "end" });

/**
 * Address + client-since, sitting inside the hollow as soon as the ring can carry
 * them and hanging under the ring when it cannot. Two bands, because "the ring is
 * wide" means two different section widths: while the ring is stacked it *is* the
 * section, so `sm` (384) is already the ~392 the `3xl` tier measured as the floor;
 * while the cards are beside it the ring is only 318–353 right up to `3xl`, which
 * hands it 392 again.
 */
const FIELDS_INSIDE = {
  columnGap: 3,
  insetBlockStart: "auto",
  position: "static",
} as const;

export const clientSummaryFields = grid({
  alignItems: "start",
  borderBlockStartColor: "borderSubtle",
  borderBlockStartStyle: "solid",
  borderBlockStartWidth: "1px",
  columnGap: 3.5,
  gridTemplateColumns: "minmax(0, 1fr) auto",
  insetBlockStart: "calc(100% + 12px)",
  insetInline: 0,
  inlineSize: "100%",
  marginInline: "auto",
  minInlineSize: 0,
  paddingBlockStart: 2.5,
  position: "absolute",
  textAlign: "start",
  "@clientTotals/sm": { "@clientTotals/ledgerDown": FIELDS_INSIDE },
  "@clientTotals/3xl": FIELDS_INSIDE,
});

export const clientSummaryAddress = css({
  minInlineSize: 0,
  "& p": {
    color: "textMuted",
    fontSize: RING_META,
    lineHeight: 1.45,
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

export const clientSummarySince = css({
  margin: 0,
  textAlign: "end",
  "& span": {
    color: "metricLabel",
    display: "block",
    fontSize: RING_META,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  "& strong": {
    color: "foreground",
    display: "block",
    fontSize: RING_META,
    fontWeight: "bold",
    lineHeight: 1.45,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

export const clientSummaryReadout = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  inlineSize: "64%",
  maxInlineSize: {
    base: "172px",
    "@clientTotals/ledger": "186px",
    "@clientTotals/3xl": "224px",
  },
  textAlign: "center",
  "@clientTotals/3xl": { inlineSize: "100%" },
});

export const clientSummaryReadoutItem = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  inlineSize: "100%",
  minInlineSize: 0,
});

export const clientSummaryReadoutLabel = css({
  alignItems: "center",
  color: "metricLabel",
  display: "inline-flex",
  fontSize: RING_META,
  fontWeight: "semibold",
  gap: 1.5,
  minInlineSize: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const clientSummaryReadoutAmount = css({
  color: "foreground",
  fontSize: RING_READOUT,
  fontWeight: "bold",
  letterSpacing: "tight",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});

/** Bucket card: boxed in the 2x2 grid, a ledger row beside the ring, plain in the flanks. */
export const clientTotalsCard = cva({
  base: {
    alignItems: "start",
    appearance: "none",
    backgroundColor: "surface",
    borderColor: "borderSubtle",
    borderRadius: "xl",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "inherit",
    // The card is its own container so the count can drop out on its own when
    // the row gets short, independent of which section tier is active.
    containerName: "bucketCard",
    containerType: "inline-size",
    cornerShape: CORNER_SHAPE,
    cursor: "default",
    display: "flex",
    flexDirection: "column",
    font: "inherit",
    gap: 1,
    // Own stacking context, so the `::before` wash paints above the card's own
    // background and below its text at every tier.
    isolation: "isolate",
    inlineSize: "100%",
    minInlineSize: 0,
    paddingBlock: 2.5,
    paddingInline: 3,
    position: "relative",
    textAlign: "start",
    transitionDuration: "normal",
    transitionProperty:
      "border-color, border-radius, box-shadow, translate, opacity",
    _hover: { boxShadow: "sm", translate: "0 -2px" },
    /**
     * Hover has to survive three shapes — a boxed tile, a borderless ledger row,
     * and a bare flank at 3xl. The bucket's own colour does the work, and every
     * change is a colour, transform or opacity, so nothing reflows.
     *
     * The wash (`::before`) is deliberately *bigger* than the padding box on the
     * borderless tiers: a fill flush to the box squared off against the row
     * rules, which is what made the old hover look ragged.
     */
    _before: {
      borderRadius: "inherit",
      content: '""',
      inset: 0,
      opacity: 0,
      pointerEvents: "none",
      position: "absolute",
      transitionDuration: "normal",
      transitionProperty: "opacity",
      zIndex: -1,
    },
    /**
     * Underline that fills in from the left; on a ledger row it becomes the rule.
     * It spans exactly the card's inline box so the sweep starts and ends on the
     * default rule — bleeding it wider (`-10px`) made the hover line begin out of
     * register with the divider it is supposed to be filling.
     */
    _after: {
      blockSize: "2px",
      borderRadius: "full",
      content: '""',
      insetBlockEnd: "-1px",
      insetInline: 0,
      opacity: 0,
      pointerEvents: "none",
      position: "absolute",
      transform: "scaleX(0)",
      transformOrigin: "left center",
      transitionDuration: "normal",
      transitionProperty: "opacity, transform",
    },
    // Only a ledger row has a rule for the sweep to fill; the rows band turns the
    // opacity on, everywhere else it stays invisible.
    "&:is(:hover, :focus-visible)::after": { transform: "scaleX(1)" },
    "&:is(:hover, :focus-visible)::before": { opacity: 0.16 },
    "&:is(:hover, :focus-visible) [data-role='term']": { color: "foreground" },
    "&:is(:hover, :focus-visible) [data-role='key']": {
      transform: "scale(1.45)",
    },
    "&:is(:hover, :focus-visible) [data-role='amount']": {
      transform: "scale(1.04)",
    },
    _focusVisible: {
      outlineColor: "primary",
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "2px",
    },
    /**
     * Each chrome mode owns a *disjoint* band, because every rule below is
     * cumulative otherwise: `3xl` sits inside `rows`, so a row property set on
     * `rows` also lands on the flanks. That leak is what made the left flank read
     * as two columns (label left, amount right) and the right flank as one.
     *
     * Panda's `*Only` conditions cannot express this: `ledger` is a custom token,
     * so it emits `>= 36rem and < 36rem` — an impossible band — and `rowsOnly`
     * resolves against the *scale* neighbour (42rem), not the real next rung. The
     * `X` + `XDown` pair gives the exact range from named conditions.
     */
    // Beside the ring, still narrow (36–40rem): the mobile boxed tile, stacked in
    // one column. It just needs the count's extra room.
    "@clientTotals/ledger": {
      "@clientTotals/rowsDown": { justifyContent: "center" },
    },
    // Wide enough for a ledger row (40–48rem): chrome off, one rule below, and
    // the term/amount pair across the row instead of stacked.
    "@clientTotals/rows": {
      "@clientTotals/3xlDown": {
        // Rows don't lift; a floating row would break the ledger rhythm.
        _hover: { boxShadow: "none", translate: "none" },
        backgroundColor: "transparent",
        borderRadius: 0,
        borderBlockEndColor: "borderSubtle",
        borderBlockEndStyle: "solid",
        borderBlockEndWidth: "1px",
        borderWidth: 0,
        columnGap: 2.5,
        display: "grid",
        // The amount column is reserved rather than `auto`: with `auto`, a wider
        // amount pushed its count left and the invoice counts stopped lining up
        // across rows. 7.5rem covers the usual `$12,345.67` at this size.
        gridTemplateColumns: "minmax(0, 1fr) minmax(7.5rem, auto)",
        paddingBlock: 3,
        paddingInline: 0,
        // Vertical bleed only: an inline bleed painted past the section's right
        // edge and added 10px to `scrollWidth`.
        _before: { borderRadius: "lg", inset: "-6px 0" },
        "&:is(:hover, :focus-visible)::after": { opacity: 1 },
      },
    },
    /**
     * Flanks (48rem+): chrome-less by arrangement, not by width — the four
     * numbers sit bare either side of the ring, mirrored toward it by `alignItems`.
     * These properties are stated outright rather than inherited from the rows
     * band, which is what made the flanks sprout borders once the bands were made
     * disjoint.
     */
    "@clientTotals/3xl": {
      _before: { borderRadius: "lg", inset: "-6px 0" },
      backgroundColor: "transparent",
      borderBlockEndWidth: 0,
      borderRadius: 0,
      borderWidth: 0,
      columnGap: 0,
      display: "flex",
      flexDirection: "column",
      paddingBlock: 2.5,
    },
  },
  defaultVariants: { bucket: "overdue" },
  variants: {
    bucket: {
      draft: {
        "&:is(:hover, :focus-visible)": { borderColor: "statusDraft/60" },
        _after: { backgroundColor: "statusDraft" },
        _before: { backgroundColor: "statusDraft" },
        gridArea: "draft",
        "@clientTotals/3xl": { alignItems: "start" },
      },
      outstanding: {
        "&:is(:hover, :focus-visible)": { borderColor: "primary/60" },
        _after: { backgroundColor: "primary" },
        _before: { backgroundColor: "primary" },
        gridArea: "outstanding",
        "@clientTotals/3xl": { alignItems: "end" },
      },
      overdue: {
        _after: { backgroundColor: "statusLate" },
        _before: { backgroundColor: "statusLate" },
        backgroundColor: {
          base: "statusLate/8",
          "@clientTotals/rows": "transparent",
        },
        borderColor: {
          base: "statusLate/25",
          "@clientTotals/rows": "borderSubtle",
        },
        // No borderBlockStartWidth here: the tile tier already inherits the 1px
        // base border, and at the ledger tier a top rule doubles up against the
        // previous row's bottom rule — overdue would be the only row with a seam.
        "&:is(:hover, :focus-visible)": { borderColor: "statusLate/60" },
        gridArea: "overdue",
        _dark: {
          backgroundColor: {
            base: "statusLate/12",
            "@clientTotals/rows": "transparent",
          },
        },
        "@clientTotals/3xl": { alignItems: "end" },
      },
      paid: {
        "&:is(:hover, :focus-visible)": { borderColor: "success/60" },
        _after: { backgroundColor: "success" },
        _before: { backgroundColor: "success" },
        gridArea: "paid",
        "@clientTotals/3xl": { alignItems: "start" },
      },
    },
  },
});

export const clientTotalsTerm = css({
  alignItems: "center",
  color: "textMuted",
  display: "inline-flex",
  fontSize: "sm",
  fontWeight: "semibold",
  gap: 2,
  minInlineSize: 0,
  transitionDuration: "normal",
  transitionProperty: "color",
  // Fill the column so the count has an edge to align to. Both boxed-beside and
  // rows get this; the flank tier keeps a shrink-wrapped term so the card's
  // `alignItems` can mirror label and amount toward the ring.
  "@clientTotals/ledger": {
    "@clientTotals/rowsDown": { display: "flex", inlineSize: "100%" },
  },
  "@clientTotals/rows": {
    "@clientTotals/3xlDown": { display: "flex", inlineSize: "100%" },
  },
});

export const clientTotalsKey = cva({
  base: {
    blockSize: "3px",
    borderRadius: "sm",
    display: "block",
    flexShrink: 0,
    inlineSize: "14px",
    // Scaled on hover rather than resized, so the label never shifts.
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "transform",
  },
  defaultVariants: { bucket: "overdue" },
  variants: {
    bucket: {
      draft: { backgroundColor: "statusDraft" },
      outstanding: { backgroundColor: "primary" },
      overdue: {
        backgroundColor: "statusLate",
        blockSize: "4px",
        inlineSize: "22px",
      },
      paid: { backgroundColor: "success" },
    },
  },
});

/**
 * The count is the first thing to go when a row narrows — it is secondary to the
 * term and the amount (see #207: counts matter only where there is room). Asking
 * the card rather than the section means the row adapts at any tier instead of
 * every rung needing its own rule.
 */
/** `auto` margin right-aligns every count against one edge, so the column scans. */
const COUNT_SHOWN = { display: "inline", marginInlineStart: "auto" } as const;

export const clientTotalsCount = css({
  color: "metricLabel",
  display: "none",
  fontSize: "xs",
  fontWeight: "bold",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  /**
   * The gate is the *card*, not the tier: a boxed tile puts the amount on its own
   * line, so it only needs room for label + count (~11rem) rather than the ~250px
   * a row needs for label + count + amount. Gated to the beside/rows bands so the
   * mobile grid and the bare flanks stay count-free.
   */
  "@clientTotals/ledger": {
    "@clientTotals/rowsDown": {
      "@container bucketCard (min-width: 11rem)": COUNT_SHOWN,
    },
  },
  "@clientTotals/rows": {
    "@clientTotals/3xlDown": {
      "@container bucketCard (min-width: 11rem)": COUNT_SHOWN,
    },
  },
});

export const clientTotalsAmount = cva({
  base: {
    color: "foreground",
    fontSize: {
      base: "xl",
      "@clientTotals/ledger": "2xl",
      "@clientTotals/3xl": "3xl",
    },
    fontWeight: "bold",
    letterSpacing: "tight",
    lineHeight: 1.1,
    margin: 0,
    transitionDuration: "normal",
    transitionProperty: "color",
    whiteSpace: "nowrap",
    // A row reserves the amount column, so the number sits on its right edge and
    // every count above it lands on one shared line. Scaling from that same edge
    // keeps the hover from pushing 2px past the card. Rows only — the flank tier
    // aligns its amount with the card's `alignItems`, not with text-align.
    "@clientTotals/rows": {
      "@clientTotals/3xlDown": {
        textAlign: "end",
        transformOrigin: "right center",
      },
    },
  },
  defaultVariants: { bucket: "overdue" },
  variants: {
    bucket: {
      draft: {},
      outstanding: {},
      overdue: { color: "statusLate", fontWeight: "black" },
      paid: {},
    },
  },
});

/** Rows reserve the amount column, so the number sits against its right edge. */
export const clientTotalsAmountRow = css({
  textAlign: "end",
});

export const clientSummarySkeletonRing = css({
  aspectRatio: "1",
  borderColor: "borderSubtle",
  borderRadius: "50%",
  borderStyle: "solid",
  borderWidth: "clamp(9px, 3.6cqi, 16px)",
  inlineSize: "100%",
  opacity: 0.4,
});

export const clientSummarySkeletonLine = css({
  backgroundColor: "skeletonSubtle/40",
  blockSize: 4,
  borderRadius: "sm",
});
