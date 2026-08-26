import { describe, expect, it } from "bun:test";
import { parse } from "valibot";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";
import {
  planLineItemSync,
  shouldDeleteRemovedLineItems,
} from "./line-item-sync";

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
  it("skips upsert when owned lines unchanged", () => {
    expect(
      planLineItemSync([row(idA), row(idB)], [row(idA), row(idB)])
    ).toEqual({
      keepIds: [idA, idB],
      toInsert: [],
      toUpsert: [],
    });
  });

  it("upserts only owned rows whose fields changed", () => {
    expect(
      planLineItemSync(
        [row(idA), row(idB)],
        [row(idA, { amount: 20 }), row(idB)]
      )
    ).toEqual({
      keepIds: [idA, idB],
      toInsert: [],
      toUpsert: [row(idA, { amount: 20 })],
    });
  });

  it("inserts rows with missing or unowned ids and strips those ids", () => {
    expect(
      planLineItemSync(
        [row(idA)],
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
      toUpsert: [],
    });
  });

  it("treats omitted quantity as the schema default of 1", () => {
    expect(planLineItemSync([], [{ amount: 5, description: "New" }])).toEqual({
      keepIds: [],
      toInsert: [{ amount: 5, description: "New", quantity: 1 }],
      toUpsert: [],
    });
  });

  it("drops existing ids missing from incoming (delete via keepIds)", () => {
    const plan = planLineItemSync([row(idA), row(idB)], [row(idA)]);
    expect(plan.keepIds).toEqual([idA]);
    expect(
      shouldDeleteRemovedLineItems([row(idA), row(idB)], plan.keepIds)
    ).toBe(true);
  });

  it("empty incoming keeps nothing so all existing delete", () => {
    const plan = planLineItemSync([row(idA)], []);
    expect(plan).toEqual({ keepIds: [], toInsert: [], toUpsert: [] });
    expect(shouldDeleteRemovedLineItems([row(idA)], plan.keepIds)).toBe(true);
  });
});

describe("shouldDeleteRemovedLineItems", () => {
  it("is false when every existing id is kept", () => {
    expect(shouldDeleteRemovedLineItems([row(idA)], [idA])).toBe(false);
  });
});
