import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { D1Database } from "@cloudflare/workers-types";
import { getColumns, type Table } from "drizzle-orm";
import { getPlatformProxy, unstable_readConfig } from "wrangler";
import type { ClientInsert, ClientSelect } from "#features/clients/types.ts";
import type { LineItemInsert } from "#features/line-items/types.ts";
import type { SettingsInsert } from "#features/settings/types.ts";
import { appendInvoiceNotesTermsHtmlForInsert } from "#lib/server/utils/invoice-notes-terms-html.server.ts";
import type { CursorId } from "#lib/types.ts";
import { createId } from "../utils/create-id";
import { createDb } from "./create-db";
import { clients, invoices, lineItems, settings } from "./schema";
import type { ClientStatus, InvoiceStatus } from "./types";

const useRemote = process.argv.includes("--remote");

/** D1 SQLITE_MAX_VARIABLE_NUMBER is 100 (Turso/libSQL is typically 999). */
const D1_MAX_SQL_VARIABLES = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function d1InsertChunkSize(table: Table): number {
  const columnCount = Object.keys(getColumns(table)).length;
  return Math.max(
    1,
    Math.floor(D1_MAX_SQL_VARIABLES / Math.max(columnCount, 1))
  );
}

async function createSeedProxy() {
  if (!useRemote) {
    console.log("Seeding local D1 (Miniflare persist under .wrangler)");
    return getPlatformProxy<{ DB: D1Database }>({
      persist: true,
      remoteBindings: false,
    });
  }

  const wranglerConfig = unstable_readConfig({});
  const d1Binding = wranglerConfig.d1_databases[0];
  if (!d1Binding?.database_id) {
    throw new Error(
      "wrangler D1 database_id missing; cannot seed remote. Set it in wrangler.jsonc."
    );
  }

  const dir = join(process.cwd(), ".wrangler");
  await mkdir(dir, { recursive: true });
  const stubMain = join(dir, "seed-remote-stub.js");
  await writeFile(
    stubMain,
    "export default { fetch() { return new Response(''); } };\n"
  );
  const configPath = join(dir, "seed-remote.json");
  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        compatibility_date: wranglerConfig.compatibility_date,
        compatibility_flags: wranglerConfig.compatibility_flags,
        d1_databases: [
          {
            binding: d1Binding.binding,
            database_id: d1Binding.database_id,
            database_name: d1Binding.database_name,
            remote: true,
          },
        ],
        main: "./seed-remote-stub.js",
        name: `${wranglerConfig.name}-seed-remote`,
      },
      null,
      2
    )}\n`
  );

  console.warn(
    "Seeding REMOTE Cloudflare D1. Wipes clients, invoices, line_items, and settings. Auth users are kept."
  );
  // getPlatformProxy remote session hangs forever under Bun (workerd/miniflare).
  // db:seed:remote must run via Node (tsx). @see https://github.com/cloudflare/workers-sdk/issues/7718
  console.log(
    "Starting wrangler remote proxy (needs Node + wrangler login)..."
  );

  return getPlatformProxy<{ DB: D1Database }>({
    configPath,
    persist: false,
    remoteBindings: true,
  });
}

const proxy = await createSeedProxy();
const d1 = proxy.env.DB;
if (!d1) {
  throw new Error("D1 binding DB missing from wrangler platform proxy");
}
const db = createDb(d1);

// Helper function to generate random date within last 6 months
function randomDateWithinLast6Months(): Date {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  const randomTime =
    sixMonthsAgo.getTime() +
    Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
}

// Helper function to generate random date within last 3 months (for due dates)
function randomDateWithinLast3Months(): Date {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
  const randomTime =
    threeMonthsAgo.getTime() +
    Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTime);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: seed file
async function main() {
  // 1) Load existing users from Better Auth tables
  const users = await db.query.user.findMany();

  if (users.length === 0) {
    throw new Error(
      "No auth users found. Create at least 3 users via Better Auth first."
    );
  }

  if (users.length < 3) {
    throw new Error(
      `Found only ${users.length} users. Need at least 3 users for proper data distribution.`
    );
  }

  console.log(
    `Found ${users.length} users. Each gets ${users.length - 1} clients (other users); invoices round-robin per user.`
  );

  // 2) Clear non-user tables
  await db.delete(lineItems);
  await db.delete(invoices);
  await db.delete(clients);
  await db.delete(settings);

  // 3) Create settings for each user
  const settingsData: Array<SettingsInsert & { userId: string }> = users.map(
    (u) => ({
      city: ["Coolville", "Tech City", "Dev Town", "Code Springs"][
        Math.floor(Math.random() * 4)
      ],
      email: u.email,
      myName: `${u.name || u.email}`,
      state: ["TN", "CA", "NY", "TX"][Math.floor(Math.random() * 4)],
      street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
      userId: u.id,
      zip: `${Math.floor(Math.random() * 90_000) + 10_000}`,
    })
  );

  await Promise.all(
    chunk(settingsData, d1InsertChunkSize(settings)).map((rows) =>
      db.insert(settings).values(rows)
    )
  );
  console.log(`✅ Created settings for ${settingsData.length} users`);

  // 4) Each user gets one client per *other* user (contact = that user’s settings)
  const clientsData: Array<ClientInsert & { userId: string }> = [];
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    for (let j = 0; j < users.length; j++) {
      if (j === i) {
        continue;
      }
      const peer = settingsData[j];
      clientsData.push({
        city: peer.city,
        clientStatus: (Math.random() > 0.2
          ? "active"
          : "archive") as ClientStatus,
        email: peer.email,
        id: createId(),
        name: peer.myName,
        state: peer.state,
        street: peer.street,
        userId: u.id,
        zip: peer.zip,
      });
    }
  }

  const insertedClients = (
    await Promise.all(
      chunk(clientsData, d1InsertChunkSize(clients)).map((rows) =>
        db.insert(clients).values(rows).returning()
      )
    )
  ).flat();
  console.log(`✅ Created ${insertedClients.length} clients`);

  // 5) At least 15 invoices per user (pagination / list density)
  const invoiceSubjects = [
    "Website Development",
    "Podcast Episodes",
    "Course Material",
    "Design Services",
    "Consulting",
    "Software Development",
    "Marketing Campaign",
    "Brand Identity",
    "Retainer — Q1",
    "Retainer — Q2",
    "Bugfix sprint",
    "UX audit",
    "Infrastructure",
    "Content migration",
    "Training workshop",
  ];

  const invoicesData: (typeof invoices.$inferInsert)[] = [];
  const lineItemsData: Array<
    LineItemInsert & { userId: string; invoiceId: CursorId }
  > = [];

  const clientsByUserId = new Map<string, ClientSelect[]>();
  for (const clientRow of insertedClients) {
    const list = clientsByUserId.get(clientRow.userId) ?? [];
    list.push(clientRow);
    clientsByUserId.set(clientRow.userId, list);
  }

  const descriptions = [
    "Development Hours",
    "Design Work",
    "Consulting Services",
    "Content Creation",
    "Project Management",
    "Quality Assurance",
    "Documentation",
    "Training",
  ];

  const invoicesPerUser = 15;

  for (const u of users) {
    const ownedClients = clientsByUserId.get(u.id) ?? [];
    if (ownedClients.length === 0) {
      continue;
    }

    let invoiceSeq = 0;
    for (let n = 0; n < invoicesPerUser; n++) {
      // Spread across this user’s clients (one per other user), round-robin
      const ownedClient = ownedClients[n % ownedClients.length];
      const invoiceId = createId();
      const issueDate = randomDateWithinLast6Months();
      const dueDate = randomDateWithinLast3Months();
      invoiceSeq += 1;

      const notes = Math.random() > 0.5 ? "**Important** please review." : null;
      const terms =
        Math.random() > 0.6 ? "_Payment due within 30 days._" : null;

      invoicesData.push({
        clientId: ownedClient.id,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0,
        dueDate,
        id: invoiceId,
        invoiceNumber: `${u.id.slice(0, 6).toUpperCase()}-${String(invoiceSeq).padStart(4, "0")}`,
        issueDate,
        notes,
        subject:
          invoiceSubjects[Math.floor(Math.random() * invoiceSubjects.length)],
        terms,
        userId: u.id,
        ...appendInvoiceNotesTermsHtmlForInsert({ notes, terms }),
        invoiceStatus: (["draft", "sent", "paid"] as const)[
          Math.floor(Math.random() * 3)
        ] as InvoiceStatus,
      });

      const lineItemCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < lineItemCount; j++) {
        lineItemsData.push({
          amount: Math.floor(Math.random() * 5000) + 100,
          description:
            descriptions[Math.floor(Math.random() * descriptions.length)],
          id: createId(),
          invoiceId,
          quantity: Math.floor(Math.random() * 5) + 1,
          userId: u.id,
        });
      }
    }
  }

  await Promise.all(
    chunk(invoicesData, d1InsertChunkSize(invoices)).map((rows) =>
      db.insert(invoices).values(rows)
    )
  );
  console.log(`✅ Created ${invoicesData.length} invoices`);

  await Promise.all(
    chunk(lineItemsData, d1InsertChunkSize(lineItems)).map((rows) =>
      db.insert(lineItems).values(rows)
    )
  );
  console.log(`✅ Created ${lineItemsData.length} line items`);

  console.log("🎉 Seeding complete!");
  console.log("📊 Summary:");
  console.log(`   - ${users.length} users`);
  console.log(`   - ${settingsData.length} settings records`);
  console.log(`   - ${insertedClients.length} clients`);
  console.log(`   - ${invoicesData.length} invoices`);
  console.log(`   - ${lineItemsData.length} line items`);
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => proxy.dispose());
