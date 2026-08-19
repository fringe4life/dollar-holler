import { defineParams } from "@sveltejs/kit/params";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";
// fallow-ignore-next-line
export const params = defineParams({ uuid: cursorSchema });
