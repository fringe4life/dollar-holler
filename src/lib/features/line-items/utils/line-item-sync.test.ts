import { describe, expect, it } from "bun:test";
import { parse } from "valibot";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";
import { planLineItemSync } from "./line-item-sync";

const idA = parse(cursorSchema, "018f0000-0000-7000-8000-000000000001");
const idB = parse(cursorSchema, "018f0000-0000-7000-8000-000000000002");
const idForeign = parse(cursorSchema, "018f0000-0000-7000-8000-000000000099");

const row = (
  id: typeof idA,
  patch?: { amount?: number; description?: string; quantity?: number }
) => ({
  amount: patch?.amount ?? 10,
  description: patch?.description ?? "Dev",
  id,
  quantity: patch?.quantity ?? 1,
});

describe("planLineItemSync", () => {
  it("upserts every owned id so SQL compares live row values", () => {
    expect(planLineItemSync([idA, idB], [row(idA), row(idB)])).toEqual({
      keepIds: [idA, idB],
      toInsert: [],
      toUpsert: [row(idA), row(idB)],
    });
  });

  it("upserts owned rows including those whose fields match a stale snapshot", () => {
    expect(
      planLineItemSync([idA, idB], [row(idA, { amount: 20 }), row(idB)])
    ).toEqual({
      keepIds: [idA, idB],
      toInsert: [],
      toUpsert: [row(idA, { amount: 20 }), row(idB)],
    });
  });

  it("inserts rows with missing or unowned ids and strips those ids", () => {
    expect(
      planLineItemSync(
        [idA],
        [
          row(idA),
          { amount: 5, description: "New", quantity: 2 },
          row(idForeign, { description: "Other" }),
        ]
      )
    ).toEqual({
      keepIds: [idA],
      toInsert: [
        { amount: 5, description: "New", quantity: 2 },
        { amount: 10, description: "Other", quantity: 1 },
      ],
      toUpsert: [row(idA)],
    });
  });

  it("treats omitted quantity as the schema default of 1", () => {
    expect(planLineItemSync([], [{ amount: 5, description: "New" }])).toEqual({
      keepIds: [],
      toInsert: [{ amount: 5, description: "New", quantity: 1 }],
      toUpsert: [],
    });
  });

  it("keeps last duplicate owned id instead of dropping an earlier update", () => {
    expect(
      planLineItemSync(
        [idA],
        [row(idA, { amount: 20 }), row(idA, { amount: 10 })]
      )
    ).toEqual({
      keepIds: [idA],
      toInsert: [],
      toUpsert: [row(idA, { amount: 10 })],
    });
  });

  it("omits existing ids missing from incoming (delete via keepIds)", () => {
    const plan = planLineItemSync([idA, idB], [row(idA)]);
    expect(plan.keepIds).toEqual([idA]);
    expect(plan.toUpsert).toEqual([row(idA)]);
  });

  it("empty incoming keeps nothing so all existing delete", () => {
    expect(planLineItemSync([idA], [])).toEqual({
      keepIds: [],
      toInsert: [],
      toUpsert: [],
    });
  });
});
