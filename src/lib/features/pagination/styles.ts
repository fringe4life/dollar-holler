import { flex, grid, stack } from "#styled-system/patterns/index.js";

export const paginatedListStack = stack({ flexGrow: 1 });

export const paginatedListGrid = grid({
  alignItems: "start",
  gridTemplateRows: {
    base: "1fr min-content",
    lg: "min-content 1fr min-content",
  },
  minBlockSize: "full",
  rowGap: 4,
});

export const paginatedListRows = flex({
  blockSize: "full",
  direction: "column-reverse",
  gap: { base: 10, sm: 4 },
  justify: "flex-end",
});
