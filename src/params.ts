import { defineParams } from "@sveltejs/kit/params";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";

export const params = defineParams({ uuid: cursorSchema });
