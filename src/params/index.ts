import { defineParams } from "@sveltejs/kit/params";
import { cursorSchema } from "#lib/features/pagination/schemas.ts";
// fallow-ignore-next-line
export const params = defineParams({ uuid: cursorSchema });
