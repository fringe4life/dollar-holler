import { describe, expect, it } from "bun:test";
import { highlightMarkdown } from "./highlight-markdown.ts";

describe("highlightMarkdown", () => {
  it("wraps CommonMark emphasis the Terms hint types", () => {
    const italic = highlightMarkdown("*bold* and _italic_");
    expect(italic).toContain('class="token italic"');
    expect(italic).toContain("bold");
    expect(italic).toContain("italic");
  });

  it("wraps **strong** as bold", () => {
    expect(highlightMarkdown("**strong**")).toContain('class="token bold"');
  });

  it("html-encodes user text so overlay {@html} cannot inject tags", () => {
    const html = highlightMarkdown('<script>alert("x")</script> & more');
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain("&lt;");
    expect(html).toContain("&amp;");
  });

  it("emits only span.token markup (no wrap-hook attributes)", () => {
    const html = highlightMarkdown("```js\nconst x = 1;\n```");
    expect(html).toContain("<span class=");
    expect(html).not.toMatch(/\sid=/i);
    expect(html).not.toMatch(/<(?!\/?span\b)/i);
  });

  it("keeps a trailing newline visible in the overlay", () => {
    expect(highlightMarkdown("line\n")).toMatch(/ $/);
  });

  it("returns empty string for empty source", () => {
    expect(highlightMarkdown("")).toBe("");
  });
});
