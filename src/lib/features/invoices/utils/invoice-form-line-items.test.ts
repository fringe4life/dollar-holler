import { describe, expect, it } from "bun:test";
import type { InvoiceFormData } from "../schemas";
import {
  emptyToNull,
  filterInvoiceFormLineItems,
  lineItemFormFieldValues,
  lineItemHiddenIdAttrs,
  newClientFromInvoiceForm,
} from "./invoice-form-line-items";
import type { CursorId } from "#lib/types.ts";

const form = (patch: Partial<InvoiceFormData>): InvoiceFormData => ({
  discount: 0,
  dueDate: "2026-08-19",
  invoiceNumber: "INV-1",
  isNewClient: false,
  issueDate: "2026-08-19",
  lineItems: [],
  subject: "Work",
  ...patch,
});

describe("filterInvoiceFormLineItems", () => {
  it("drops blank and whitespace-only descriptions", () => {
    expect(
      filterInvoiceFormLineItems([
        { amount: 10, description: "Dev", quantity: 1 },
        { amount: 0, description: "", quantity: 0 },
        { amount: 5, description: "  ", quantity: 1 },
      ])
    ).toEqual([{ amount: 10, description: "Dev", quantity: 1 }]);
  });

  it("returns empty list when all rows blank or missing", () => {
    expect(filterInvoiceFormLineItems(undefined)).toEqual([]);
    expect(
      filterInvoiceFormLineItems([{ amount: 0, description: "", quantity: 0 }])
    ).toEqual([]);
  });
});

describe("emptyToNull", () => {
  it("trims empty strings to null", () => {
    expect(emptyToNull(undefined)).toBeNull();
    expect(emptyToNull("  ")).toBeNull();
    expect(emptyToNull("note")).toBe("note");
  });
});

describe("newClientFromInvoiceForm", () => {
  it("maps trimmed name/email and blank address fields", () => {
    expect(
      newClientFromInvoiceForm(
        form({
          email: " ada@example.com ",
          name: " Ada ",
        })
      )
    ).toEqual({
      city: "",
      clientStatus: "active",
      email: "ada@example.com",
      name: "Ada",
      state: "",
      street: "",
      zip: "",
    });
  });

  it("returns null when name or email missing", () => {
    expect(
      newClientFromInvoiceForm(form({ email: "ada@example.com" }))
    ).toBeNull();
    expect(newClientFromInvoiceForm(form({ name: "Ada" }))).toBeNull();
  });
});

const PERSISTED_ID = "018f0000-0000-7000-8000-000000000001" as CursorId;

describe("lineItemFormFieldValues", () => {
  it("defaults missing row", () => {
    expect(lineItemFormFieldValues(undefined)).toEqual({
      amount: 0,
      description: "",
      persistedId: undefined,
      quantity: 0,
    });
  });

  it("keeps numeric UI ids off the wire", () => {
    expect(
      lineItemFormFieldValues({
        amount: 10,
        description: "Dev",
        id: 1,
        quantity: 2,
      })
    ).toEqual({
      amount: 10,
      description: "Dev",
      persistedId: undefined,
      quantity: 2,
    });
  });

  it("keeps persisted cursor ids", () => {
    expect(
      lineItemFormFieldValues({
        amount: 10,
        description: "Dev",
        id: PERSISTED_ID,
        quantity: 2,
      })
    ).toEqual({
      amount: 10,
      description: "Dev",
      persistedId: PERSISTED_ID,
      quantity: 2,
    });
  });
});

describe("lineItemHiddenIdAttrs", () => {
  it("omits hidden id when not persisted", () => {
    expect(lineItemHiddenIdAttrs(undefined, () => ({ name: "id" }))).toEqual(
      {}
    );
  });

  it("spreads hidden attrs for persisted id", () => {
    expect(
      lineItemHiddenIdAttrs(PERSISTED_ID, (id) => ({ name: "id", value: id }))
    ).toEqual({ id: { name: "id", value: PERSISTED_ID } });
  });
});
