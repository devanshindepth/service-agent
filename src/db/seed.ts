import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { seed } from "drizzle-seed";
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

  const schema = {
    users,
    products,
    purchases,
    tickets,
    agentLogs,
    managerActions,
    serviceAppointments,
  };

  console.log("🌱 Seeding database...");

  // Seed multiple entries for each table
  await seed(db, schema, {
    count: 10, // 10 entries per table
  });

  console.log("✅ Seeding completed!");

  await client.end();
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });