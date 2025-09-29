import { pgTable, serial, text, varchar, integer, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

// ------------------- USERS -------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ------------------- PRODUCTS -------------------
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  warrantyMonths: integer("warranty_months").default(12),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ------------------- PURCHASES -------------------
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  invoiceFileUrl: text("invoice_file_url"), // uploaded invoice PDF/image
  purchaseDate: timestamp("purchase_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ------------------- SUPPORT TICKETS -------------------
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  purchaseId: integer("purchase_id").references(() => purchases.id).notNull(),
  issueType: varchar("issue_type", { length: 50 }).notNull(), // e.g. "warranty_claim"
  description: text("description"),
  status: varchar("status", { length: 30 }).default("pending"), // pending, validated, manager_review, approved, rejected, scheduled
  trackingCode: uuid("tracking_code").defaultRandom().notNull(), // unique for user link
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ------------------- N8N AGENT ACTION LOG -------------------
export const agentLogs = pgTable("agent_logs", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g. "extract_invoice", "validate_warranty"
  success: boolean("success").default(false),
  details: text("details"), // e.g. extracted fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ------------------- MANAGER DECISION -------------------
export const managerActions = pgTable("manager_actions", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  approved: boolean("approved").default(false),
  remarks: text("remarks"),
  actionDate: timestamp("action_date").defaultNow().notNull(),
});

// ------------------- SERVICE CENTER APPOINTMENT -------------------
export const serviceAppointments = pgTable("service_appointments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  serviceCenter: varchar("service_center", { length: 150 }),
  appointmentDate: timestamp("appointment_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});