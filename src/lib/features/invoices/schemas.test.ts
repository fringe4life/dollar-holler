import { describe, expect, it } from "bun:test";
import { safeParse } from "valibot";
import { invoiceFormSchema } from "./schemas";

const CLIENT_ID = "018f0000-0000-7000-8000-000000000001";

const baseFields = {
  discount: 0,
  dueDate: "2026-08-19",
  invoiceNumber: "INV-1",
  issueDate: "2026-08-19",
  lineItems: [
    { amount: 100, description: "Dev", quantity: 2 },
    { amount: 0, description: "   ", quantity: 0 },
  ],
  subject: "Work",
};

describe("invoiceFormSchema", () => {
  it("accepts existing client id and defaults isNewClient to false", () => {
    const result = safeParse(invoiceFormSchema, {
      ...baseFields,
      clientId: CLIENT_ID,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.isNewClient).toBe(false);
    }
  });

  it("accepts new client without clientId", () => {
    const result = safeParse(invoiceFormSchema, {
      ...baseFields,
      email: "ada@example.com",
      isNewClient: true,
      name: "Ada",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when neither existing nor new client", () => {
    const result = safeParse(invoiceFormSchema, baseFields);
    expect(result.success).toBe(false);
  });

  it("rejects new client without name", () => {
    const result = safeParse(invoiceFormSchema, {
      ...baseFields,
      email: "ada@example.com",
      isNewClient: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid zip on new client", () => {
    const result = safeParse(invoiceFormSchema, {
      ...baseFields,
      email: "ada@example.com",
      isNewClient: true,
      name: "Ada",
      zip: "hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate persisted line item ids", () => {
    const result = safeParse(invoiceFormSchema, {
      ...baseFields,
      clientId: CLIENT_ID,
      lineItems: [
        { amount: 10, description: "Dev", id: CLIENT_ID, quantity: 1 },
        { amount: 20, description: "QA", id: CLIENT_ID, quantity: 1 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("allows multiple new lines without ids", () => {
    const result = safeParse(invoiceFormSchema, {
      ...baseFields,
      clientId: CLIENT_ID,
      lineItems: [
        { amount: 10, description: "Dev", quantity: 1 },
        { amount: 20, description: "QA", quantity: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });
});
