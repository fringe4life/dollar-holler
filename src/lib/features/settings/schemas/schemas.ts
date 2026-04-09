import { type } from "arktype";

/** PUT body: fields the client sends when saving invoice details; `userId` is overridden from auth. */
export const settingsPutBodySchema = type({
  "userId?": "string",
  myName: "string",
  email: "string",
  street: "string",
  city: "string",
  state: "string",
  zip: "string",
  "createdAt?": "string.date.parse",
  "updatedAt?": "string.date.parse",
});
