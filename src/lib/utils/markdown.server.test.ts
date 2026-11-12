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

  it("rejects quote-breaking and obfuscated javascript hrefs", () => {
    const quoteBreak = sanitizeMarkdownHtmlForTest(
      `<a href='x" onclick="alert(1)'>x</a>`
    );
    expect(quoteBreak).not.toContain("onclick");
    expect(quoteBreak).not.toMatch(/href='x"/);

    const entityJs = sanitizeMarkdownHtmlForTest(
      '<a href="&#106;avascript:alert(1)">x</a>'
    );
    expect(entityJs).not.toContain("javascript:");
    expect(entityJs).not.toContain("alert(1)");

    const tabJs = sanitizeMarkdownHtmlForTest(
      '<a href="java&#9;script:alert(1)">x</a>'
    );
    expect(tabJs).not.toContain("javascript:");
    expect(tabJs).not.toContain("alert(1)");

    const wsJs = sanitizeMarkdownHtmlForTest(
      '<a href=" javascript:alert(1)">x</a>'
    );
    expect(wsJs).not.toContain("javascript:");

    const nlJs = sanitizeMarkdownHtmlForTest(
      '<a href="java\nscript:alert(1)">x</a>'
    );
    expect(nlJs).not.toContain("javascript:");
    expect(nlJs).not.toContain("alert(1)");
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

  it("sanitizes obfuscated javascript markdown links", () => {
    const html = markdownToHtml("[x](javascript:alert(1))");
    expect(html ?? "").not.toContain("javascript:");
    expect(html ?? "").not.toContain("alert(1)");
  });
});
