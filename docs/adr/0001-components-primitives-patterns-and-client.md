# Shared UI: primitives, patterns, and a slim `$lib/client`

We dropped the leftover shadcn-shaped `components/ui/` tree and split shared UI into `components/primitives/` (presentational leaves) and `components/patterns/` (composed interaction chrome). `$lib/client` keeps only highly reusable, markup-agnostic modules (`Toggle`, `Counter`, `supports.ts`); runes and attachments that exist mainly to drive a pattern (`ItemPanel` + `dialogController`, toast queue, swipe) colocate under that pattern so agents and humans find the pair in one place.
