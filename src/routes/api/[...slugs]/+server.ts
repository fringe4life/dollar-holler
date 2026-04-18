import { app } from "$lib/server/app";

interface WithRequest {
  request: Request;
}

export const fallback = ({ request }: WithRequest) => app.handle(request);

export type App = typeof app;
