import { describe, expect, it } from "bun:test";
import { BadRequestError } from "./errors";
import { assertAllowedInvoiceStatusTransition } from "./invoice-status-transitions";

describe("assertAllowedInvoiceStatusTransition", () => {
  it("allows no-op same status", () => {
    expect(() =>
      assertAllowedInvoiceStatusTransition("draft", "draft")
    ).not.toThrow();
    expect(() =>
      assertAllowedInvoiceStatusTransition("sent", "sent")
    ).not.toThrow();
    expect(() =>
      assertAllowedInvoiceStatusTransition("paid", "paid")
    ).not.toThrow();
  });

  it("allows draft → sent and sent → paid", () => {
    expect(() =>
      assertAllowedInvoiceStatusTransition("draft", "sent")
    ).not.toThrow();
    expect(() =>
      assertAllowedInvoiceStatusTransition("sent", "paid")
    ).not.toThrow();
  });

  it("rejects draft → paid (skip sent)", () => {
    expect(() => assertAllowedInvoiceStatusTransition("draft", "paid")).toThrow(
      BadRequestError
    );
  });

  it("rejects draft → paid and sent → draft", () => {
    expect(() => assertAllowedInvoiceStatusTransition("sent", "draft")).toThrow(
      BadRequestError
    );
  });

  it("rejects any change from paid", () => {
    expect(() => assertAllowedInvoiceStatusTransition("paid", "sent")).toThrow(
      BadRequestError
    );
    expect(() => assertAllowedInvoiceStatusTransition("paid", "draft")).toThrow(
      BadRequestError
    );
  });
});
