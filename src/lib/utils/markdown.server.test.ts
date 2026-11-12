import { describe, expect, it } from "bun:test";
import {
  markdownToHtml,
  sanitizeMarkdownHtmlForTest,
} from "./markdown.server.ts";

describe("sanitizeMarkdownHtml", () => {
  it("keeps markdown tags and class, including href on anchors", () => {
    const html = sanitizeMarkdownHtmlForTest(
      '<p class="note"><a class="link" href="https://example.com">hi</a></p>'
    );
    expect(html).toContain("<p");
    expect(html).toContain('class="note"');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('class="link"');
  });

  it("allows http, https, and mailto hrefs", () => {
    expect(
      sanitizeMarkdownHtmlForTest('<a href="http://example.com">a</a>')
    ).toContain('href="http://example.com"');
    expect(
      sanitizeMarkdownHtmlForTest('<a href="mailto:a@example.com">a</a>')
    ).toContain('href="mailto:a@example.com"');
  });

  it("drops style attributes and javascript / protocol-relative hrefs", () => {
    const html = sanitizeMarkdownHtmlForTest(
      '<p style="color:red" class="ok"><a href="javascript:alert(1)">x</a><a href="//evil.test">y</a></p>'
    );
    expect(html).not.toContain("style");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("//evil.test");
    expect(html).toContain('class="ok"');
  });

  it("strips script and style bodies", () => {
    const html = sanitizeMarkdownHtmlForTest(
      "<p>ok</p><script>alert(1)</script><style>body{color:red}</style>"
    );
    expect(html).toContain("ok");
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain("alert(1)");
    expect(html).not.toMatch(/<style/i);
    expect(html).not.toContain("color:red");
  });
});

describe("markdownToHtml", () => {
  it("renders emphasis through marked then sanitizes", () => {
    const html = markdownToHtml("**bold** and *italic*");
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
  });

  it("returns null for empty source", () => {
    expect(markdownToHtml(null)).toBeNull();
    expect(markdownToHtml("")).toBeNull();
  });
});
