# Icon system

Add or edit a **glyph** — filled SVG under `src/lib/components/primitives/icons/`. Decision: [ADR 0002](./adr/0002-custom-icon-system.md). Contract: [`Icon.svelte`](../src/lib/components/primitives/Icon.svelte) + [`icons/types.ts`](../src/lib/components/primitives/icons/types.ts).

Leading words: **owner role** · **parts** · **rest** · **beat** · **held** · **ink** / **hue**.

## Add a glyph

Each step ends when its criterion holds.

1. **Owner role** — pick from [Owner roles](#owner-roles). Animate only states that role reaches. Done: role named on the inventory row.

2. **File** — `src/lib/components/primitives/icons/Name.svelte` (PascalCase). Wrap drawing in `<Icon {...props}>`. Done: satisfies `IconProps` / `IconComponent`.

3. **Parts** — split independently moving surfaces into `<g>` / `<path>` / `<circle>` before writing motion. Done: every surface that moves alone is its own node.

4. **Rest** — filled; default `viewBox="0 0 24 24"`; **ink** is `currentColor` (or a documented destructive rest tint). Done: readable at 16px with motion off.

5. **Beat** — one hover / `_groupFocusVisible` beat; press continues from hover. **Held** loops only for lasting owner state (`aria-busy`, expanded). Done: hover and press verified; any held loop is bound to lasting state.

6. **Disabled & reduce** — `_groupDisabled` / owner `:disabled` freezes motion; `_motionReduce` on every animated part. Done: disabled is still; reduced-motion keeps colour/state changes and drops movement.

7. **Caller size** — honour `size` / `width` / `height` from the owner. Done: glyph stylesheet sets no fixed box.

8. **Verify** — at 16, 18, and 24 on a real route (`/invoices`, `/clients`, `/`, invoice detail). Done: rest, hover, focus-visible, active, and held each checked.

9. **Inventory** — add the row in the same PR. When a third glyph wants the same beat, extract it to `icons/interaction.ts`. Done: inventory row matches disk; shared beat has one home.

## Owner roles

The owner element decides which Panda conditions the glyph may use. Prefer `_groupHoverEnabled` over `_groupHover` (Chrome matches `:hover` on disabled buttons — #281).

| Owner role | Typical owner | Conditions | Glyph may |
| --- | --- | --- | --- |
| **Link** | `<a>`, link-shaped `rowActionButton`, landing CTAs | `_groupHoverEnabled`, `_groupFocusVisible`, `_groupActive`, `_current` | travel, draw, hue a moving part |
| **Button** | `Button`, `rowActionButton`, `LoaderButton`, pagination, theme presses | `_groupHoverEnabled`, `_groupFocusVisible`, `_groupActive`, `_groupDisabled`; owner may set `aria-busy` | one **beat**; **held** while pending / expanded |
| **Menu trigger** | `ThreeDots`, navbar menu | `_open`, `aria-expanded`, `:popover-open` | held while open; reverse on close |
| **Select option** | `<option>` under `appearance: base-select` | `:checked`, `selectedcontent` `_starting` | static marks only (#261) |
| **Select chrome** | sibling glyph beside `<select>` (`ChevronDown`) | selectors on the sibling `select` | quiet hover / press |
| **Status** | `BoundaryError`, badge, live region | colour / meaning | hue only |
| **Passive** | decorative SVG outside this folder | — | — |

Always on animated glyphs:

- `_motionReduce` — colour/state may stay; movement stops
- `_groupFocusVisible` — same beat as hover
- Owner state via `group` / explicit props (or the select-chrome sibling selectors above)
- `_current` where it emits; some colour contexts still need `[aria-current]` (see `nav-item-styles.ts`)

**Held** hangs off lasting owner state (`aria-busy`, expanded, an explicit prop). Clicks are too short for `:active`-only loops (pilot: `Send` on #259).

## Colour

**Rest ink** is `currentColor`; static parts stay `currentColor` in every state. **Hue** only on the part that moves or whose meaning changed:

| Part | Token | Why |
| --- | --- | --- |
| Trail / wake | `primary` | exists while travelling |
| Light source | `warning` | light being emitted |
| Opening lid / flap | `primary` | the part that opens |
| Confirmation stroke | `success` | the stroke _is_ the state |
| Destructive body | `destructive` | may stay tinted at rest (`Shredder`) |
| Invoice status family | `statusDraft` / `statusSent` / `statusPaid` / `statusLate` | badges only |

Hue indexes motion at 16–20px; keep most of the silhouette on ink.

## Motion

| Mechanic | Use |
| --- | --- |
| `transition` on `translate` / `rotate` / `scale` / `opacity` / `fill` / `fill-opacity` | nudges, lifts, palette |
| Easings in [`theme/tokens.ts`](../theme/tokens.ts) | `elastic` playful; `glide` restrained; often `{ base: "anticipate", _supportsLinear: "glide" }` |
| `keyframes()` on the glyph | one-off beats (`Send`, `View`, `Dashboard`, `Retry`) |
| [`theme/keyframes.ts`](../theme/keyframes.ts) | shared by three or more glyphs |
| Part-level classes | independent motion |
| `transform-box: fill-box` + `transform-origin` | rotate about a part’s centre |
| `@property` in [`src/app.css`](../src/app.css) | animated custom properties (Panda cannot emit them) |

Draw beats use `scale` / `clip-path` / `fill-opacity` on filled parts, or a deliberately stroked trail. Press that must beat hover uses a more specific selector (pilot: `.group:active:not(:disabled) &`). `will-change` only after a measurement.

## Panda

- Enumerated literal `css()` — computed maps bail the Svelte transform and ship the style runtime (`Spinner.svelte` precedent).
- Glyph styles its own **parts**; size and colour come from owner props and `currentColor` (#116).
- Prefer `_current`, a `group` class, or a plain class over valued attribute selectors inside `:has()`.
- Register `@property` in `src/app.css`.
- Prefer top-level `css()` maps over local `cva` when `hash: true` would pull the recipe runtime into the client (#109).

## Inventory

Every `*.svelte` in `icons/` gets a row. Owners are today’s import sites. **flat — open** = ported, still waiting on a hover/press answer (#259 children).

| Glyph | Owners | Role | Motion |
| --- | --- | --- | --- |
| Activate | `ClientRow` | button | flat — open (#272) |
| AlertTriangle | `BoundaryError` | status | static (colour only) |
| Archive | `ClientRow` | button | flat — open (#272) |
| Arrow | invoice detail back link | link | shaft grows from tip; barbs close |
| ArrowUpRight | landing CTAs, `LandingHeroSession` | link | head leads shaft on diagonal |
| Cancel | `Modal`, `Toaster`, `Swipeable` | button | flat — open (#273) |
| Check | settings, `ClientForm`, `PasswordForm`, `InvoiceEditor` | button | flat — open (#275) |
| ChevronDown | `Select` (sibling of `<select>`) | select chrome | barbs spread on hover, close on press |
| ChevronLeft | `PaginationControl` | button | echo fades in |
| ChevronRight | `PaginationControl` | button | echo fades in |
| Dashboard | `LandingNavSession` | link | tiles land staggered |
| Edit | `InvoiceRow`, `ClientRow`, `ClientInvoicePlate` | button | pencil squish; tip `warning`, eraser `destructive` |
| Flag | `States` (`<option>`) | select option | static |
| LogIn | `LandingNav` | link | arrow steps in; barbs pinch |
| Monitor | `ThemeControl` | button (`aria-pressed`) | flat — open (#265) |
| Moon | `ThemeControl` | button (`aria-pressed`) | flat — open (#265) |
| Retry | `BoundaryError` retry | button | quarter turn; spin on press |
| Rows | `PaginationLimit` (`Rows2` / `Rows3` / `Rows5`) | select option | static (density marks) |
| Search | list `Search` | button / VT (`search-icon-loader`) | flat — open (#274); beat is the load swap |
| Send | `InvoiceRow` | button | pilot: pitch + tuck; launch; exhaust while held |
| Shredder | invoice/client/line-item rows, forms | button (destructive) | paper descends; body `destructive` |
| Sun | `ThemeControl` | button (`aria-pressed`) | flat — open (#265) |
| ThreeDots | `AdditionalOptionsButton` | menu trigger | flat — open (#277) |
| UserPlus | `LandingNav` | link | head to plus; plus grows on stagger |
| View | `InvoiceRow`, `ClientRow`, `AdditionalOptionsItem` | link / menu item | blink then pupil lift; dilate on press |

## Scope

This folder is interactive chrome. Backgrounds, logos, favicon, CircledAmount ring, empty-state arrows, `GlowingOrb` / gauge SVG, and `NavbarAccent` stay outside.
