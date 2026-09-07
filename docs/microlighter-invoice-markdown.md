# Research: MicroLighter for invoice notes/terms

Status: research only (no implementation).  
Usual textarea/editor approaches (overlay, CodeMirror, Svelte APIs): [`textarea-syntax-highlighting.md`](./textarea-syntax-highlighting.md).  
Package: [`microlighter` 2.1.0](https://github.com/davatron5000/microlighter) (MIT).  
Target fields: `notes` and `terms` in `InvoiceFormLayout.svelte` (plain `<Textarea>` today).  
Persisted markdown still converts on the server via `markdownToHtml` in `src/lib/utils/markdown.server.ts` and `appendInvoiceNotesTermsHtmlForInsert` / `ForPatch` in `src/lib/server/utils/invoice-notes-terms-html.server.ts`. Highlighting must stay **client paint only**. Do not write editor HTML into `notesHtml` / `termsHtml`.

## Verdict

**Fit: yes, with a control swap — not as a drop-in on `<textarea>`.**

MicroLighter paints tokens with the [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API) (`Range` + `CSS.highlights` + `::highlight()`). Native `<textarea>` / `<input>` values are **not** DOM text nodes, so Highlights cannot style them. That is a platform gap, not a library bug ([WHATWG DOM #1375](https://github.com/whatwg/dom/issues/1375); [web.dev on `plaintext-only`](https://web.dev/blog/contenteditable-plaintext-only-baseline)).

Official editable path is `contenteditable="plaintext-only"` on a `<code>` (or similar) that stays a **single text node**, then re-run highlight after each change ([MicroLighter README “Editable code”](https://github.com/davatron5000/microlighter)).

**Product mismatch:** bundled markdown grammar does **not** highlight `*bold*` / `_italic_`, which is what the Terms hint currently teaches. Headings, lists, quotes, links, backticks, fences, HTML comments, YAML front matter — yes. Emphasis / strikethrough — no. See [Grammar vs invoice markdown](#grammar-vs-invoice-markdown).

## How MicroLighter works

Primary sources: [README](https://raw.githubusercontent.com/davatron5000/microlighter/main/README.md), [`src/highlight.js`](https://raw.githubusercontent.com/davatron5000/microlighter/main/src/highlight.js), [`src/index.js`](https://raw.githubusercontent.com/davatron5000/microlighter/main/src/index.js) (re-exports `highlightAll` only).

- Zero runtime deps. Core ~2 KiB gzip. Grammars load on demand as ES modules. Markdown grammar `dependencies: ["yaml"]` (front matter).
- `highlightAll({ root, selector, languageAliases })` finds nodes, `normalize()`s each block, requires `firstChild` to be a **lone** `TEXT_NODE`, tokenizes with native `RegExp` (`d` + `g` + `m` flags), registers named `Highlight` objects on the **global** `CSS.highlights` map.
- Language: `class="language-markdown"` (alias `md`) or `data-language` on `code` / parent `pre`.
- Themes: import e.g. `microlighter/themes/github.css` and set `data-syntax-theme` on a container. Palette is CSS custom properties (`--syntax-string`, `--syntax-keyword`, …).
- Web component `<micro-lighter>` is optional (copy, line numbers). Skip for form fields.
- README mentions a low-level tokenizer at `microlighter/highlight.js`. **Public export is still `highlightAll`.** There is no separate “highlight this string” API in `src/index.js`.

### Global registry (two fields)

`highlightAll` **clears** every category it owns, then rebuilds ranges for **all** matching blocks in that scan. Calling it only on Notes would wipe Terms (and vice versa).

Implication: one scan that includes **both** editors (shared `root` + selector such as `[data-md-editor] code.language-markdown`), on every input (debounced). Do not run two independent highlighters.

## Svelte 5 / this app

Relevant Svelte APIs ([`@attach`](https://svelte.dev/docs/svelte/@attach), [`bind:`](https://svelte.dev/docs/svelte/bind), `$effect`):

- Attachments: mount highlighter, listen `input`, cleanup. Prefer `{@attach}` over `use:` for new code (Svelte 5.29+; this repo is Svelte 5.56).
- `contenteditable` supports `bind:textContent` / `bind:innerHTML`. Prefer `textContent` so the editor never becomes HTML.
- `saveInvoice.fields.notes.as("text", …)` / `terms` expect a **named form control**. `contenteditable` is not one. Keep a **visually hidden `<textarea>`** (or `<input type="hidden">` if newlines are preserved) that receives the same attrs and stays in sync. Label `for` must point at the visible editor’s `id` (or `aria-labelledby` if the control is not labelable).
- Existing pattern for capability gates: `src/lib/client/supports.ts` (`supportsBaseSelect`, `supportsCssTypedOm`). Add `supportsCssHighlights` (`typeof CSS !== "undefined" && Boolean(CSS.highlights)`). On SSR / unsupported browsers, keep current `Textarea`.
- UI split ([ADR 0001](./adr/0001-components-primitives-patterns-and-client.md)): a markdown editor is **pattern** chrome, not a primitive. Primitive `Textarea.svelte` stays a real `<textarea>`. New pattern e.g. `MarkdownField` / `HighlightedPlaintextEditor` under `components/patterns/` (or invoices feature if it stays invoice-only).
- `::highlight()` is **not** scoped CSS. Load theme + `::highlight(...)` rules globally. Panda component styles will not wrap Highlights. May need a small unscoped stylesheet; `::highlight()` also cannot set many properties (typically `color`, `background-color`, `text-decoration` — not layout).

## Grammar vs invoice markdown

Server path: `marked` → `sanitize-html` with tags including `strong`, `em`, `del`, `code`, `a`, lists, headings, `blockquote`, `pre` (`markdown.server.ts`).

MicroLighter markdown grammar ([`src/grammars/markdown.js`](https://raw.githubusercontent.com/davatron5000/microlighter/main/src/grammars/markdown.js)), VS Code–derived, patterns:

| Construct                                      | Highlighted?                |
| ---------------------------------------------- | --------------------------- |
| `#` headings                                   | yes (`entity.name.section`) |
| `>`, lists `-+*` / `1.`                        | yes                         |
| `[text](url)`, `![alt](url)`                   | yes                         |
| `` `code` ``, fenced ` ``` `                   | yes                         |
| HTML comments, YAML `---`                      | yes                         |
| `*bold*`, `**bold**`, `_italic_`, `~~strike~~` | **no**                      |

Users following the Terms hint would see **no** color on the syntax they actually type unless we:

1. extend / fork the grammar (small extra `match` rules for emphasis), or
2. change the hint to constructs the grammar paints (headings, lists, links, backticks), or
3. accept highlight as “bonus for headings/lists/code” only.

Option 1 is still client-only and does not change the sanitize policy.

## Browser support

- CSS Custom Highlight API: MDN **Baseline 2025** (widely in latest browsers since ~June 2025). Older Safari / Firefox / Chromium miss Highlights → fallback to unstyled textarea.
- `contenteditable="plaintext-only"`: [Baseline newly available (2025)](https://web.dev/blog/contenteditable-plaintext-only-baseline). Without it, `contenteditable=true` allows rich paste (bold via Cmd-B, HTML fragments). Flatten with `Node.normalize()` before each `highlightAll` (library already calls `normalize()`; still skip highlight if extra siblings exist).

Cloudflare / invoice users on older iOS: **must** degrade to current `Textarea`.

## Security / a11y (invoice HTML contract)

- Highlight Ranges are not markup. XSS surface of the editor is paste into `contenteditable`, not MicroLighter. `plaintext-only` + sync **plain string** to the hidden field. Server still sanitizes via `markdownToHtml`.
- Do not `@html` the editor contents.
- Custom highlights have **no** inherent semantics for AT ([MDN accessibility note](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API#accessibility)). Treat as visual sugar; keep `aria-describedby` on the real (or hidden) field, `aria-invalid`, and a proper label. Hidden textarea: `tabindex="-1"` + `aria-hidden="true"` if the contenteditable is the tab stop; then copy `name`/`required` to hidden field only for submit.
- Spellcheck: README sets `spellcheck=false` on code editors. Invoice notes are prose — consider leaving spellcheck **on**.

## Suggested integration (if we build)

1. Feature-detect `CSS.highlights` and `plaintext-only`. Else: existing `Textarea`.
2. Visible: `<pre><code class="language-markdown" contenteditable="plaintext-only" role="textbox" …>`.
3. Hidden: `<textarea {...saveInvoice.fields.notes.as("text", …)}>` synced on `input`.
4. `{@attach}`: import theme once, `await highlightAll({ root: wrapper, selector: "code.language-markdown" })` covering **both** notes and terms (parent grid as `root`, or document fragment wrapper).
5. On `input`: `element.normalize()`; restore caret if needed; debounce `highlightAll` (same scan).
6. Align hint copy with grammar **or** add emphasis rules.
7. Theme: pick a light theme (`github` / `solarized-light` / `min`) and map `--syntax-*` to existing Panda tokens if possible.

## Alternatives (if Highlights / grammar are too costly)

- Keep textarea; no in-field highlight; keep markdown preview elsewhere (server HTML already exists on invoices).
- Overlay highlighter (`<pre>` behind transparent `<textarea>`) — does **not** use Highlights on the textarea; sync scroll; more CSS debt; still need a tokenizer.
- Heavier editors (CodeMirror, etc.) — worse bundle vs ~2 KiB + markdown grammar.

## Sources

- MicroLighter README, `package.json` 2.1.0, `src/highlight.js`, `src/grammars/markdown.js`
- MDN CSS Custom Highlight API
- WHATWG DOM issue 1375 (textarea + Range)
- web.dev: `contenteditable="plaintext-only"` + Highlights vs textarea
- Bramus: Highlight API + flatten text nodes (`normalize()`)
- This repo: `InvoiceFormLayout.svelte`, `Textarea.svelte`, `FormField.svelte`, `markdown.server.ts`, `invoice-notes-terms-html.server.ts`, `src/lib/client/supports.ts`
