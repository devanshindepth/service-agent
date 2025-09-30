import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, products, purchases, tickets, agentLogs, managerActions, serviceAppointments } from "./schema-tables";

// Load environment variables
config();

async function main() {
  const pgUrl = process.env.DATABASE_URL;
  if (!pgUrl) {
    throw new Error("DATABASE_URL not configured in env");
  }

  const client = postgres(pgUrl, { prepare: false });
  const db = drizzle(client);

  console.log("🌱 Seeding database with realistic data...");

  // Clear existing data (optional - be careful in production!)
  await db.delete(serviceAppointments);
  await db.delete(managerActions);
  await db.delete(agentLogs);
  await db.delete(tickets);
  await db.delete(purchases);
  await db.delete(users);
  await db.delete(products);

  // 1. Create a real user
  console.log("👤 Creating user...");
  const [user] = await db.insert(users).values({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1-555-0123",
  }).returning({ id: users.id });

  // 2. Create real products
  console.log("📦 Creating products...");
  const [laptop] = await db.insert(products).values([
    {
      name: "MacBook Pro 14-inch",
      brand: "Apple",
      model: "M3 Pro",
      warrantyMonths: 12,
    },
    {
      name: "Galaxy S24 Ultra",
      brand: "Samsung", 
      model: "SM-S928",
      warrantyMonths: 24,
    },
    {
      name: "QuietComfort 45",
      brand: "Bose",
      model: "QC45",
      warrantyMonths: 12,
    }
  ]).returning({ id: products.id });

  // 3. Create real purchases
  console.log("🛒 Creating purchases...");
  const [purchase] = await db.insert(purchases).values({
    userId: user.id,
    productId: laptop.id,
    invoiceNumber: "INV-2024-00125",
    invoiceFileUrl: "https://example.com/invoices/inv-2024-00125.pdf",
    purchaseDate: new Date("2024-01-15"),
  }).returning({ id: purchases.id });

  // 4. Create test tickets with known tracking codes
  console.log("🎫 Creating test tickets...");
  const testTickets = await db.insert(tickets).values([
    {
      userId: user.id,
      purchaseId: purchase.id,
      issueType: "warranty_claim",
      description: "Screen flickering issue after 6 months of use",
      status: "pending",
      trackingCode: "123e4567-e89b-12d3-a456-426614174000",
    },
    {
      userId: user.id,
      purchaseId: purchase.id,
      issueType: "warranty_claim", 
      description: "Battery not holding charge properly",
      status: "validated",
      trackingCode: "987fcdeb-51a2-43d1-9f12-123456789abc",
    },
    {
      userId: user.id,
      purchaseId: purchase.id,
      issueType: "warranty_claim",
      description: "Keyboard keys sticking",
      status: "approved",
      trackingCode: "456e7890-a12b-34c5-d678-901234567def",
    }
  ]).returning({ id: tickets.id, trackingCode: tickets.trackingCode });

  console.log("✅ Realistic data seeding completed!");
  console.log(`   User: John Smith (ID: ${user.id})`);
  console.log(`   Product: MacBook Pro 14-inch (ID: ${laptop.id})`);
  console.log(`   Purchase: INV-2024-00125 (ID: ${purchase.id})`);
  console.log("   Test Tickets:");
  testTickets.forEach((ticket, index) => {
    console.log(`     ${index + 1}. ${ticket.trackingCode}`);
  });

  await client.end();
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });