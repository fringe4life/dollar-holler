import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { db } from "#lib/server/db";
import { clients as clientsTable } from "#lib/server/db/schema";
import type { ClientStatus } from "#lib/server/db/types";
import type { CursorId } from "#lib/types";
import type { ClientInsert, ClientSelect, ClientUpdate } from "../types";

export const fetchClientById = async (
  userId: string,
  id: CursorId
): Promise<ClientSelect> => {
  const client = await db.query.clients.findFirst({
    where: { id: { eq: id }, userId: { eq: userId } },
  });
  if (!client) {
    error(404, "Client not found");
  }
  const { userId: _userId, ...rest } = client;
  return rest;
};

export const insertClient = async (
  userId: string,
  body: ClientInsert
): Promise<{ id: CursorId }> => {
  const { id: _omitId, ...values } = body;
  const [inserted] = await db
    .insert(clientsTable)
    .values({
      ...values,
      userId,
    })
    .returning({ id: clientsTable.id });
  if (!inserted) {
    error(500, "Failed to add client");
  }
  return { id: inserted.id };
};

export const patchClient = async (
  userId: string,
  id: CursorId,
  body: ClientUpdate
): Promise<ClientSelect> => {
  const [updated] = await db
    .update(clientsTable)
    .set(body)
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
    .returning();
  if (!updated) {
    error(404, "Client not found");
  }
  const { userId: _userId, ...rest } = updated;
  return rest;
};

export const patchClientStatus = async (
  userId: string,
  id: CursorId,
  clientStatus: ClientStatus
) => {
  const [updated] = await db
    .update(clientsTable)
    .set({ clientStatus })
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
    .returning({
      clientStatus: clientsTable.clientStatus,
      id: clientsTable.id,
      updatedAt: clientsTable.updatedAt,
    });
  if (!updated) {
    error(404, "Client not found");
  }
  return updated;
};

export const deleteClientRow = async (userId: string, id: CursorId) => {
  const [deleted] = await db
    .delete(clientsTable)
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
    .returning({ id: clientsTable.id });
  if (!deleted) {
    error(404, "Client not found");
  }
  return { success: true as const };
};
