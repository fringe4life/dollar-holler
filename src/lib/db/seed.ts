import { drizzle } from "drizzle-orm/neon-serverless";
import { createId } from "./id";
import type { NewClient, NewInvoice, NewLineItem, NewSettings } from "./schema";
import {
  clients,
  invoices,
  lineItems,
  schemaTables,
  settings,
  tableRelations,
} from "./schema";
// eslint-disable-next-line sonarjs/no-implicit-dependencies
import { neonConfig, Pool } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = globalThis.WebSocket;
// Create the Pool client (WebSocket-based for transaction support)
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

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

// Helper function to get random user from array
function getRandomUser<T>(users: T[]): T {
  return users[Math.floor(Math.random() * users.length)];
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
    `Found ${users.length} users. Distributing data randomly among them.`
  );

  // 2) Clear non-user tables
  await db.delete(lineItems);
  await db.delete(invoices);
  await db.delete(clients);
  await db.delete(settings);

  // 3) Create settings for each user
  const settingsData: NewSettings[] = users.map((u) => ({
    id: createId(),
    userId: u.id,
    myName: `User ${u.name || u.email}`,
    email: u.email,
    street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
    city: ["Coolville", "Tech City", "Dev Town", "Code Springs"][
      Math.floor(Math.random() * 4)
    ],
    state: ["TN", "CA", "NY", "TX"][Math.floor(Math.random() * 4)],
    zip: `${Math.floor(Math.random() * 90000) + 10000}`,
  }));

  await db.insert(settings).values(settingsData);
  console.log(`✅ Created settings for ${settingsData.length} users`);

  // 4) Create clients with random user assignment
  const clientNames = [
    "Compressed.fm",
    "Everything Svelte",
    "ZEAL",
    "TechCorp Inc",
    "Design Studio",
    "Web Solutions LLC",
    "Digital Agency",
    "Creative Co",
  ];

  const clientsData: NewClient[] = clientNames.map((name) => ({
    id: createId(),
    userId: getRandomUser(users).id,
    name,
    email: `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
    street: `${Math.floor(Math.random() * 9999) + 1} ${["Main", "Oak", "Pine", "Cedar"][Math.floor(Math.random() * 4)]} Street`,
    city: ["Somewhereville", "Nowhere", "Anywhere", "Tech City"][
      Math.floor(Math.random() * 4)
    ],
    state: ["TN", "CA", "NY", "FL"][Math.floor(Math.random() * 4)],
    zip: `${Math.floor(Math.random() * 90000) + 10000}`,
    clientStatus: (Math.random() > 0.2 ? "active" : "archive") as
      | "active"
      | "archive",
  }));

  const insertedClients = await db
    .insert(clients)
    .values(clientsData)
    .returning();
  console.log(`✅ Created ${insertedClients.length} clients`);

  // 5) Create invoices with random user and client assignment
  const invoiceSubjects = [
    "Website Development",
    "Podcast Episodes",
    "Course Material",
    "Design Services",
    "Consulting",
    "Software Development",
    "Marketing Campaign",
    "Brand Identity",
  ];

  const invoicesData: NewInvoice[] = [];
  const lineItemsData: NewLineItem[] = [];

  // Create 2-4 invoices per client
  for (const client of insertedClients) {
    const invoiceCount = Math.floor(Math.random() * 3) + 2; // 2-4 invoices

    for (let i = 0; i < invoiceCount; i++) {
      const invoiceId = createId();
      const issueDate = randomDateWithinLast6Months();
      const dueDate = randomDateWithinLast3Months();

      invoicesData.push({
        id: invoiceId,
        userId: getRandomUser(users).id, // Random user assignment
        clientId: client.id,
        invoiceNumber: `${Math.floor(Math.random() * 90000) + 10000}`,
        subject:
          invoiceSubjects[Math.floor(Math.random() * invoiceSubjects.length)],
        issueDate,
        dueDate,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0,
        notes: Math.random() > 0.5 ? "**Important** please review." : null,
        terms: Math.random() > 0.6 ? "_Payment due within 30 days._" : null,
        invoiceStatus: (["draft", "sent", "paid"] as const)[
          Math.floor(Math.random() * 3)
        ],
      });

      // Create 1-3 line items per invoice
      const lineItemCount = Math.floor(Math.random() * 3) + 1;
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

      for (let j = 0; j < lineItemCount; j++) {
        lineItemsData.push({
          id: createId(),
          userId: getRandomUser(users).id, // Random user assignment
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
