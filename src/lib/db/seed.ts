import type { ClientInsert, ClientSelect } from "$lib/features/clients/types";
import type { InvoiceInsert } from "$lib/features/invoices/types";
import type { LineItemInsert } from "$lib/features/line-items/types";
import { createId } from "$lib/features/pagination/utils/create-uuidv7";
import type { SettingsInsert } from "$lib/features/settings/types";
import type { CursorId } from "$lib/types";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { tableRelations } from "./relations";
import { clients, invoices, lineItems, schemaTables, settings } from "./schema";
import type { ClientStatus, InvoiceStatus } from "./types";
import { ENV } from "varlock/env";
neonConfig.webSocketConstructor = globalThis.WebSocket;
// Create the Pool client (WebSocket-based for transaction support)
const pool = new Pool({ connectionString: ENV.DATABASE_URL });

const db = drizzle({
  client: pool,
  relations: tableRelations,
  schema: { ...schemaTables, ...tableRelations },
});

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
      userId: u.id,
      myName: `${u.name || u.email}`,
      email: u.email,
      street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
      city: ["Coolville", "Tech City", "Dev Town", "Code Springs"][
        Math.floor(Math.random() * 4)
      ],
      state: ["TN", "CA", "NY", "TX"][Math.floor(Math.random() * 4)],
      zip: `${Math.floor(Math.random() * 90000) + 10000}`,
    })
  );

  await db.insert(settings).values(settingsData);
  console.log(`✅ Created settings for ${settingsData.length} users`);

  // 4) Each user gets one client per *other* user (contact = that user’s settings)
  const clientsData: Array<ClientInsert & { userId: string }> = [];
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    for (let j = 0; j < users.length; j++) {
      if (j === i) continue;
      const peer = settingsData[j];
      clientsData.push({
        id: createId(),
        userId: u.id,
        name: peer.myName,
        email: peer.email,
        street: peer.street,
        city: peer.city,
        state: peer.state,
        zip: peer.zip,
        clientStatus: (Math.random() > 0.2
          ? "active"
          : "archive") as ClientStatus,
      });
    }
  }

  const insertedClients = await db
    .insert(clients)
    .values(clientsData)
    .returning();
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

  const invoicesData: Array<InvoiceInsert & { userId: string }> = [];
  const lineItemsData: Array<
    LineItemInsert & { userId: string; invoiceId: CursorId }
  > = [];

  const clientsByUserId = new Map<string, ClientSelect[]>();
  for (const client of insertedClients) {
    const list = clientsByUserId.get(client.userId) ?? [];
    list.push(client);
    clientsByUserId.set(client.userId, list);
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
    if (ownedClients.length === 0) continue;

    let invoiceSeq = 0;
    for (let n = 0; n < invoicesPerUser; n++) {
      // Spread across this user’s clients (one per other user), round-robin
      const client = ownedClients[n % ownedClients.length];
      const invoiceId = createId();
      const issueDate = randomDateWithinLast6Months();
      const dueDate = randomDateWithinLast3Months();
      invoiceSeq += 1;

      invoicesData.push({
        id: invoiceId,
        userId: u.id,
        clientId: client.id,
        invoiceNumber: `${u.id.slice(0, 6).toUpperCase()}-${String(invoiceSeq).padStart(4, "0")}`,
        subject:
          invoiceSubjects[Math.floor(Math.random() * invoiceSubjects.length)],
        issueDate,
        dueDate,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0,
        notes: Math.random() > 0.5 ? "**Important** please review." : null,
        terms: Math.random() > 0.6 ? "_Payment due within 30 days._" : null,
        invoiceStatus: (["draft", "sent", "paid"] as const)[
          Math.floor(Math.random() * 3)
        ] as InvoiceStatus,
      });

      const lineItemCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < lineItemCount; j++) {
        lineItemsData.push({
          id: createId(),
          userId: u.id,
          invoiceId,
          description:
            descriptions[Math.floor(Math.random() * descriptions.length)],
          quantity: Math.floor(Math.random() * 5) + 1,
          amount: Math.floor(Math.random() * 5000) + 100,
        });
      }
    }
  }

  await db.insert(invoices).values(invoicesData);
  console.log(`✅ Created ${invoicesData.length} invoices`);

  await db.insert(lineItems).values(lineItemsData);
  console.log(`✅ Created ${lineItemsData.length} line items`);

  console.log("🎉 Seeding complete!");
  console.log(`📊 Summary:`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${settingsData.length} settings records`);
  console.log(`   - ${insertedClients.length} clients`);
  console.log(`   - ${invoicesData.length} invoices`);
  console.log(`   - ${lineItemsData.length} line items`);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
