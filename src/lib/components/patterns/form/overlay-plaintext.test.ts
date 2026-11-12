import { describe, expect, it } from "bun:test";
import { overlayPlainHtml } from "./overlay-plaintext.ts";
import { highlightMarkdown } from "./highlight-markdown.ts";

describe("overlayPlainHtml", () => {
  it("matches highlightMarkdown trailing-newline padding", () => {
    expect(overlayPlainHtml("line\n")).toMatch(/ $/);
    expect(overlayPlainHtml("line\n").endsWith(" ")).toBe(true);
    expect(highlightMarkdown("line\n")).toMatch(/ $/);
  });

  it("escapes markup without adding a trailing space when no newline", () => {
    const html = overlayPlainHtml("<b>x</b> & y");
    expect(html).toBe("&lt;b>x&lt;/b> &amp; y");
  });
});
