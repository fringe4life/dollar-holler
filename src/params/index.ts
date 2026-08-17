import { defineParams } from "@sveltejs/kit/params";
import { uuid } from "./uuid.ts";
// fallow-ignore-next-line
export const params = defineParams({ uuid });
