# Research: usual approaches to syntax highlighting in text fields (and the Svelte way)

Status: research only. Complements [`microlighter-invoice-markdown.md`](./microlighter-invoice-markdown.md).  
Question: CSS Custom Highlight API is ~Baseline Newly Available (MDN: since June 2025). Highlighting _inside_ `<textarea>` / `<input>` is a common want. What do people actually ship? What does Svelte push you toward?

**Short answer:** Nobody highlights _inside_ a native textarea. Platform forbids it. Usual work is one of: (1) don’t highlight the source, show a **preview**; (2) **overlay** a highlighted `<pre>` under a transparent textarea; (3) **contenteditable** + re-tokenize + restore caret; (4) a **real editor** (CodeMirror / Monaco) that is not a textarea. Highlights API is a new paint layer on (3), not a replacement for (2).

Svelte has **no first-party editor**. Official docs push native form controls, `bind:`, `{@attach}` for third-party DOM, `{@html}` only after escape/sanitize. Overlay maps onto that best for invoice notes/terms.

## Why textarea cannot be highlighted

Same constraint as the MicroLighter note: Highlights and token `<span>`s both need DOM text. `<textarea>` value is not a text node ([WHATWG DOM #1375](https://github.com/whatwg/dom/issues/1375); [web.dev `plaintext-only`](https://web.dev/blog/contenteditable-plaintext-only-baseline)).

So “syntax highlighting in a textarea” in the wild always means **illusion** (overlay) or **different control**.

## Taxonomy of usual approaches

### 0. Preview, not in-field color (most common for _product_ markdown)

GitHub comments, many CMS, invoice-style notes: keep a real textarea; render markdown **beside/below** (or on the printed invoice). No tokenizer in the field.

This app already converts notes/terms to sanitized HTML on the **server** (`markdownToHtml`). In-field highlighting is optional sugar.

### 1. Overlay (canonical lightweight “highlighted textarea”)

Documented in depth by [CSS-Tricks (live-updated through 2025)](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/): Prism (or similar) **cannot** style textarea text; `contenteditable` + Prism **oninput** dumps the caret to the start. Fix: **both** controls.

- Real `<textarea>`: typing, selection, IME, undo, form `name`, screen readers.
- Decorative `<pre><code aria-hidden="true">`: tokenizer writes **escaped** HTML + token spans.
- Stack them (`position` / CSS grid), match font/padding/line-height/wrap/`tab-size`.
- Textarea: `color: transparent; caret-color: …`; highlight layer: `pointer-events: none`.
- Sync `scrollTop` / `scrollLeft` on `scroll`.
- Escape `&` `<` `>` **before** wrapping tokens (user text is not trusted HTML).

Same pattern restated 2026: [Helge Sverre overlay article](https://helgesver.re/articles/syntax-highlighting-textarea-overlay) (avoid CodeMirror/Monaco for a small playground). [ratfactor Hiss test](https://ratfactor.com/hiss/highlight.html) uses **background** tokens through a transparent textarea so a failed overlay still leaves a usable field.

**This is the usual answer** when people say they want highlighting _and_ a textarea.

Pain: pixel-perfect wrap/scroll; `::selection` vs token colors; mobile zoom; textarea scrollbar width.

### 2. contenteditable + innerHTML highlighter + caret restore

Tried first in the CSS-Tricks piece; failed until caret restore. [CodeJar](https://github.com/antonmedv/codejar) (~2.5 kB) owns that loop: `contenteditable`, highlight callback (Prism / highlight.js) writes `innerHTML`, `save()` / `restore()` caret. Not a form control. Spellcheck off by default. Tab-as-indent, auto-brackets — code-editor UX, not invoice prose.

### 3. Real editors (CodeMirror 6, Ace, Monaco)

Own document model. CodeMirror 6 content is `contenteditable` lines (`cm-content` / `cm-line`), not a textarea ([CM guide](https://codemirror.net/docs/guide)). Highlighting is `syntaxHighlighting()` + language packs ([CM ref](https://codemirror.net/docs/ref)).

CM5 had `fromTextArea`. **CM6 dropped it** (“robustness and transparency”). Official migration recipe: insert `EditorView` as sibling, **hide** the textarea, copy `view.state.doc` back onto the textarea **on form submit** ([CM migration](https://codemirror.net/docs/migration)).

Svelte wrappers exist, e.g. [`svelte-codemirror-editor`](https://github.com/touchifyapp/svelte-codemirror-editor) (`bind:value`, Svelte 5 runes in v2). Right tool for IDEs / markdown _apps_. Overkill for two optional invoice fields (bundle, theming, a11y of a fake textarea).

### 4. CSS Custom Highlight API (new, still experimental in ecosystem)

Paint `Range`s with `::highlight()`; **no token spans**, so caret is not destroyed on repaint.

- [MicroLighter](https://github.com/davatron5000/microlighter): `contenteditable="plaintext-only"` + `highlightAll`. See prior note (global registry; markdown grammar **misses** `*bold*` / `_italic_`).
- [`svelte-highlight` `HighlightEditable`](https://github.com/metonym/svelte-highlight) (v7.15+, Jul 2026): default `engine="dom"` (span wrap + caret). Opt-in `engine="css-highlights"` with **silent fallback** to `dom` if `CSS.highlights` missing (README: Chrome 105+ / Safari 17.2+ / Firefox 140+). Still **contenteditable**, not `<textarea>`. `::highlight()` colors only.

Industry has **not** standardized on Highlights for form fields yet. Overlay + Prism/hljs is still what tutorials teach.

### Grammar note (invoice copy)

Terms hint teaches `*bold*` / `_italic_`. highlight.js markdown has `strong` / `emphasis` classes ([hljs class ref](https://highlightjs.readthedocs.io/) / markdown language). MicroLighter’s markdown grammar does not. Overlay + hljs/Prism markdown matches the hint better than MicroLighter.

## What Svelte actually specifies

There is **no** “Svelte syntax-highlighted textarea” in the docs. Relevant primitives:

| Need | Svelte / SvelteKit |
| --- | --- |
| Form field | Native `<textarea>`, `bind:value` ([`bind:`](https://svelte.dev/docs/svelte/bind)) |
| Custom input wrapper | `$bindable` |
| Third-party editor DOM | `{@attach}` (Svelte 5.29+), cleanup on destroy; `use:` is the older action form ([`@attach`](https://svelte.dev/docs/svelte/@attach), [`$effect`](https://svelte.dev/docs/svelte/$effect) “third-party library integration”) |
| Token HTML | `{@html}` **only** escaped or trusted — “Never render unsanitized content” ([`{@html}`](https://svelte.dev/docs/svelte/@html)) |
| Token CSS | `{@html}` is invisible to scoped CSS → `:global` ([same page](https://svelte.dev/docs/svelte/@html)) |
| `window` / highlighters | `browser` from `$app/environment` or `onMount` + dynamic `import()` ([Kit FAQ](https://svelte.dev/docs/kit/faq#How-do-I-use-a-client-side-library-accessing-document-or-window)) |
| Web platform | Kit prefers standards over framework-only widgets ([web standards](https://svelte.dev/docs/kit/web-standards)) |
| A11y | One accessible name; don’t double-read overlay ([Kit a11y](https://svelte.dev/docs/kit/accessibility)); decorative layer `aria-hidden` as CSS-Tricks does |
| Remote functions | Named form control still needed (`saveInvoice.fields.*.as("text")`) |

**Svelte way by approach:**

1. **Overlay (preferred fit here):** keep existing `Textarea` primitive; pattern wraps it + `aria-hidden` `<pre>`. `bind:value` on textarea. `$derived` highlighted HTML from escaped source + tokenizer. `{@html}` into `<code>`. `onscroll` copies scroll. Highlighter CSS `:global(.hljs-*)`. Progressive enhancement: without JS, textarea still submits.

2. **CodeMirror:** `{@attach}` mounts `EditorView` on a host `div`; keep hidden textarea for remote functions / submit (CM6 recipe). Dynamic import so SSR doesn’t touch `document`.

3. **Highlights / MicroLighter / HighlightEditable:** `{@attach}` or the Svelte component; **leave** native textarea as sole submitter **or** accept contenteditable + hidden field. Feature-detect like `src/lib/client/supports.ts`.

4. **Do not** `{@html}` unsanitized `innerHTML` from a highlighter if the language or source can inject markup. Escape first; then allow only span/class from the tokenizer.

This repo’s UI split ([ADR 0001](./adr/0001-components-primitives-patterns-and-client.md)): overlay or editor chrome is a **pattern**, not a change to `Textarea.svelte` (that stays a real textarea).

## Fit for notes/terms

| Approach | Keep native textarea | Matches `*bold*` hint | Bundle | SvelteKit forms |
| --- | --- | --- | --- | --- |
| Preview only | yes | n/a (render HTML) | 0 extra | best |
| Overlay + Prism/hljs markdown | yes | yes (hljs emphasis/strong) | highlighter + markdown | best of highlight options |
| CodeJar / HighlightEditable `dom` | no (unless hidden twin) | yes if hljs | small–medium | extra sync |
| MicroLighter / `css-highlights` | no | **no** (stock grammar) | tiny | extra sync + baseline floor |
| CodeMirror 6 + `@codemirror/lang-markdown` | hidden twin | yes | large | `@attach` + submit sync |

**Usual for this kind of field:** overlay if in-field color is required; preview if not. Highlights/MicroLighter = newer, smaller, worse match to current hint and to “keep the textarea.”

## Sources

- CSS-Tricks overlay + Prism; caret bug of contenteditable+highlighter
- WHATWG DOM #1375; web.dev plaintext-only + Highlights vs textarea
- CodeMirror 6 guide, ref (`syntaxHighlighting`), migration (`fromTextArea` gone)
- CodeJar README
- svelte-highlight README / v7.15 `HighlightEditable` engines
- MicroLighter README / `src/grammars/markdown.js` (prior note)
- Svelte `{@html}`, `{@attach}`, `bind:`, `$effect`; Kit FAQ client libraries, a11y, web-standards
- highlight.js markdown `strong` / `emphasis` (class reference + markdown issues)
