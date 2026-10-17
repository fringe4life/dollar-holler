import { cx } from "#styled-system/css/index.js";
import { cq, flex, grid, stack } from "#styled-system/patterns/index.js";

export const paginatedListStack = cx(
  stack({
    flexGrow: 1,
    inlineSize: "full",
  }),
  cq({ name: "item-row" })
);

export const paginatedListGrid = cx(
  cq({ name: "item-row" }),
  grid({
    alignItems: "start",
    gridTemplateRows: "1fr min-content",
    minBlockSize: "full",
    rowGap: 4,
  })
);

export const paginatedListRows = flex({
  blockSize: "full",
  direction: "column-reverse",
  gap: { base: 10, sm: 4 },
  justify: "flex-end",
});
