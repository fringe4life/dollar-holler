# Interactive pseudo-classes without explicit transitions / timing

This document lists places in the codebase where **hover**, **focus** / **focus-visible**, **active**, or related interactive states change appearance, but the element **does not declare a matching transition** (or declares `transition-*` **without** explicit `duration-*` and **without** explicit easing such as `ease-*` or `supports-linear:ease-*`).

**Why it matters:** Without a transition (or without explicit duration/easing), state changes can feel abrupt. Global CSS variables such as `--ease-dramatic` / `--ease-glide` in [`src/app.css`](../src/app.css) are most effective when paired with `transition-*`, `duration-*`, and easing utilities.

**Conventions used below**

- **No transition:** the class/CSS rule has interactive pseudo-states but no `transition*` / `transition:` that covers those properties (or no transition at all).
- **Transition, default timing:** `transition-*` or `transition-[…]` is present but **neither** `duration-*` **nor** `ease-*` / `supports-linear:*` appears on the same utility string (Tailwind’s defaults still apply; this is flagged for consistency with the rest of the app).

---

## Components — no transition on interactive states

`Dialog.Close` in [`Modal.svelte`](../src/lib/components/Modal.svelte#L54-L56) and [`SlidePanel.svelte`](../src/lib/components/SlidePanel.svelte#L52-L54): **closed** — fixed `outline-2` + `outline-color` in `transition-*` (see **Reference — already covered**).

### Button variants ([`src/lib/components/ui/button/button.svelte`](../src/lib/components/ui/button/button.svelte))

| Variant / area | Lines | Issue |
| --- | --- | --- |
| **Base** (all variants) | [L10](../src/lib/components/ui/button/button.svelte#L10) | `focus-visible:border-ring`, `focus-visible:ring-[3px]` — ring/focus changes are **not** covered by a `transition-*` in base (only some variants add their own transitions). |
| **destructive** | [L16](../src/lib/components/ui/button/button.svelte#L16) | `hover:bg-destructive/90` — **no** `transition-colors` / duration / ease. |
| **secondary** | [L26](../src/lib/components/ui/button/button.svelte#L26) | `hover:bg-gallery`, `hover:text-blueGem` — **no** transition. |
| **textOnlyDestructive** | [L22](../src/lib/components/ui/button/button.svelte#L22) | `hover:no-underline` — **no** transition. |
| **textOnly** | [L24](../src/lib/components/ui/button/button.svelte#L24) | `hover:underline` — **no** transition. |
| **link** | [L27](../src/lib/components/ui/button/button.svelte#L27) | `hover:underline` — **no** transition. |
| **auth** | [L28](../src/lib/components/ui/button/button.svelte#L28) | Has `transition-all duration-200` for lift/shadow; **no** `ease-*` / `supports-linear:*` on the same string. |

**Already in good shape:** `default` (transform + after shadow), `ghost`, `outline` use `transition-*` with `duration-200` (and easing where noted).

---

## Routes — text links with hover only

These use `underline` / `hover:no-underline` (or similar) **without** a `transition-*` utility:

| File |
| --- |
| [`src/routes/(auth)/forgot-password/+page.svelte`](<../src/routes/(auth)/forgot-password/+page.svelte#L30>) |
| [`src/routes/(auth)/login/+page.svelte`](<../src/routes/(auth)/login/+page.svelte#L27>) and [L39](<../src/routes/(auth)/login/+page.svelte#L39>) |
| [`src/routes/(auth)/signup/+page.svelte`](<../src/routes/(auth)/signup/+page.svelte#L51>) |
| [`src/routes/(auth)/reset-password/+page.svelte`](<../src/routes/(auth)/reset-password/+page.svelte#L27>) |
| [`src/routes/(dashboard)/invoices/[id]/+page.svelte`](<../src/routes/(dashboard)/invoices/[id]/+page.svelte#L80>) |

---

## Global & scoped CSS — focus without transition

| Location | Notes |
| --- | --- |
| [`src/app.css`](../src/app.css#L181-L188) | `input` (text/number/date/password/email, excluding `.search` / `.line-item`) `:focus-visible` — border/outline changes via `@apply`; **no** `transition` on this rule, and the shared base block for those inputs ([L165–L170](../src/app.css#L165-L170)) also omits `transition-*`. (`textarea` / `select` use the same `:focus-visible` selector but already have `transition-colors duration-200` on their base rules [L173–L178](../src/app.css#L173-L178), so their focus border change is covered.) |
| [`src/lib/features/line-items/components/LineItemRows.svelte`](../src/lib/features/line-items/components/LineItemRows.svelte#L93-L94) | Discount `.line-item` input: `focus:border-solid`, `focus:border-lavenderIndigo` — **no** `transition-*` on the same class string (still abrupt vs. neighbors). |

---

## Transition present, but missing explicit duration and easing

These use Tailwind `transition-*` so **something** animates, but the utility string does **not** include both explicit timing and easing (defaults apply). Worth aligning with `duration-*` + `ease-glide` / `supports-linear:ease-*` if you want parity with [`Navbar.svelte`](../src/lib/components/Navbar.svelte#L82-L91) and button polish.

| File | Notes |
| --- | --- |
| [`src/lib/components/ui/input/input.svelte`](../src/lib/components/ui/input/input.svelte#L32-L50) | `transition-[color,box-shadow]` for `focus-visible` ring/border — **no** `duration-*` or `ease-*` in string. |
| [`src/lib/components/ui/select/select-trigger.svelte`](../src/lib/components/ui/select/select-trigger.svelte#L22) | Same; also `dark:hover:bg-input/50` shares the generic transition. |
| [`src/lib/components/ui/dialog/dialog-content.svelte`](../src/lib/components/ui/dialog/dialog-content.svelte#L32-L33) | `transition-opacity` + `hover:opacity-100` — **no** `duration-*` / `ease-*` on close control. |
| [`src/routes/+page.svelte`](../src/routes/+page.svelte#L451-L454) | “Already have an account?” link: `transition-colors` + `hover:text-white/90` — **no** `duration-*` (footer links on the same page use `duration-150`). |

---

## Reference — already covered

These were checked and **do** use `transition-*` with explicit `duration-*` (and often easing) for the main interactive affordance:

- [`src/lib/components/Navbar.svelte`](../src/lib/components/Navbar.svelte#L82-L91) — nav links (`transition-colors duration-200`, `before`/`after` transitions, `supports-linear:ease-dramatic`).
- [`src/routes/+page.svelte`](../src/routes/+page.svelte#L326) — marketing cards (`transition-all duration-200`, etc.).
- [`src/lib/components/additionaloptions/AdditionalOptionsButton.svelte`](../src/lib/components/additionaloptions/AdditionalOptionsButton.svelte#L16), [`AdditionalOptionsItem.svelte`](../src/lib/components/additionaloptions/AdditionalOptionsItem.svelte#L25) — `transition-[color] duration-200` + hover (text color only; default easing is enough).
- [`src/lib/features/invoices/components/InvoiceRow.svelte`](../src/lib/features/invoices/components/InvoiceRow.svelte#L93), [`src/lib/features/clients/components/ClientRow.svelte`](../src/lib/features/clients/components/ClientRow.svelte#L97) — `transition-colors duration-200` + hover.
- [`src/lib/features/line-items/components/LineItemRow.svelte`](../src/lib/features/line-items/components/LineItemRow.svelte#L150-L151) — line-item text/number inputs: `transition-colors duration-200` on the scoped base rule; decorative underlines use `transition-[opacity,scale] duration-200` ([L74–L75](../src/lib/features/line-items/components/LineItemRow.svelte#L74-L75), etc.). (Previously flagged for `:focus` border without transition; scoped `:focus` border styling is now commented out.)
- [`src/lib/components/Search.svelte`](../src/lib/components/Search.svelte#L79-L96) — search `<input>`: `outline-transparent` + `focus-visible:outline-2` + `focus-visible:outline-lavenderIndigo` with `transition-colors duration-200` so the focus ring is a **color** transition (no `outline-none`, which would drop the outline and block interpolation). Decorative underline span: `transition-[opacity,scale] duration-200`; search button: `transition-transform duration-200 ease-out`.
- [`src/lib/components/ui/badge/badge.svelte`](../src/lib/components/ui/badge/badge.svelte#L4-L11) — **Closed:** `outline-transparent` + `transition-colors duration-200` + `focus-visible:outline-2` + `focus-visible:outline-ring/50` (base) / `focus-visible:outline-destructive/*` (`late`), replacing `ring-*` so focus animates like [`Search.svelte`](../src/lib/components/Search.svelte#L80).
- [`src/lib/components/Modal.svelte`](../src/lib/components/Modal.svelte#L54-L56), [`SlidePanel.svelte`](../src/lib/components/SlidePanel.svelte#L52-L54) — **Closed:** `Dialog.Close` with `outline-2` / `outline-transparent` / `focus-visible:outline-ring/50` and `transition-[color,outline-color,scale] duration-200`. With constant width, animating **`outline-color`** is enough for the focus ring; `color` and `scale` cover hover text and `active:scale-95`.

---

_Generated from a static search of `src/` for Tailwind-style `hover:`, `focus`, `focus-visible:`, `active:` and review of adjacent `transition` / `duration` / `ease` utilities. Re-run the same search after refactors to keep this list current._
