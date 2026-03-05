import { z } from "zod";

// --- AP (Accounts Payable) ---

// AP status for consolidated carrier invoices
export const apStatusSchema = z.enum([
  "received",
  "extracting",
  "matching",
  "auditing",
  "disputed",
  "approved",
  "paid",
  "input_required"
]);

export type APStatus = z.infer<typeof apStatusSchema>;

// --- AR (Accounts Receivable) ---

// AR status for customer billing
export const arStatusSchema = z.enum([
  "collecting",
  "calculating",
  "generated",
  "for_review",
  "sent",
  "paid",
  "input_required"
]);

export type ARStatus = z.infer<typeof arStatusSchema>;

// --- Activity Types ---

export const activityTypeSchema = z.enum([
  "email_received",
  "email_sent",
  "email_draft",
  "data_extracted",
  "order_matched",
  "rate_verified",
  "discrepancy_found",
  "dispute_filed",
  "dispute_resolved",
  "charges_calculated",
  "invoice_generated",
  "audit_complete",
  "payment_sent",
  "payment_received"
]);

export type ActivityType = z.infer<typeof activityTypeSchema>;

// --- Customer ---

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  billingAddress: z.string(),
  paymentTerms: z.string(),
  managementFeePercent: z.number(),
});

export type Customer = z.infer<typeof customerSchema>;

// --- Warehouse Fees ---

export const warehouseFeesSchema = z.object({
  fulfillmentFee: z.number(),        // per-order base ($2.75)
  itemPickFee: z.number(),           // per-item ($0.85 × qty)
  packagingMaterials: z.number(),    // box, dunnage, labels
  storageDays: z.number(),           // number of days stored
  storageCost: z.number(),           // storageDays × $0.15/unit-day
});

export type WarehouseFees = z.infer<typeof warehouseFeesSchema>;

// --- Order (replaces Shipment) ---

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),

  // Fulfillment details
  recipientName: z.string(),
  shipToAddress: z.string(),
  items: z.array(z.object({
    sku: z.string(),
    description: z.string(),
    quantity: z.number(),
  })),
  itemCount: z.number(),

  // Shipping
  carrier: z.string(),
  serviceLevel: z.string(),
  trackingNumber: z.string(),
  weight: z.number(),
  zone: z.number(),
  shipDate: z.date(),
  shippingCost: z.number(),

  // Warehouse fees
  warehouseFees: warehouseFeesSchema,

  // Status
  apStatus: apStatusSchema,
  arStatus: arStatusSchema,

  // Links
  consolidatedApInvoiceId: z.string(),
  consolidatedArInvoiceId: z.string().optional(),

  // UI state
  pendingAction: z.enum(["approve_email"]).optional(),
});

export type Order = z.infer<typeof orderSchema>;

// --- Consolidated AP Invoice ---

export const apLineItemSchema = z.object({
  trackingNumber: z.string(),
  orderId: z.string(),
  weight: z.number(),
  zone: z.number(),
  baseCharge: z.number(),
  fuelSurcharge: z.number(),
  residentialSurcharge: z.number(),
  totalCharge: z.number(),
  expectedCharge: z.number().optional(),
  variance: z.number().optional(),
  auditStatus: z.enum(["unmatched", "matched", "verified", "disputed", "credit_applied"]),
});

export type APLineItem = z.infer<typeof apLineItemSchema>;

export const consolidatedAPInvoiceSchema = z.object({
  id: z.string(),
  carrier: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.date(),
  billingPeriod: z.string(),
  totalAmount: z.number(),
  lineItems: z.array(apLineItemSchema),
  status: apStatusSchema,
  documentUrl: z.string().optional(),
});

export type ConsolidatedAPInvoice = z.infer<typeof consolidatedAPInvoiceSchema>;

// --- Consolidated AR Invoice ---

export const consolidatedARInvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.date(),
  billingPeriod: z.string(),
  dueDate: z.date(),
  orderIds: z.array(z.string()),
  totalFulfillmentFees: z.number(),
  totalItemPickFees: z.number(),
  totalPackagingMaterials: z.number(),
  totalStorage: z.number(),
  totalShippingCost: z.number(),
  subtotal: z.number(),
  managementFee: z.number(),
  totalAmount: z.number(),
  status: arStatusSchema,
  documentUrl: z.string().optional(),
});

export type ConsolidatedARInvoice = z.infer<typeof consolidatedARInvoiceSchema>;

// --- Activity ---

export const activitySchema = z.object({
  id: z.string(),
  shipmentId: z.string(),             // kept as shipmentId for minimal refactor, but holds orderId or invoiceId
  type: activityTypeSchema,
  category: z.enum(["ap", "ar"]),
  title: z.string(),
  description: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
});

export type Activity = z.infer<typeof activitySchema>;

// --- Document Types ---

export const documentTypeSchema = z.enum([
  "carrier_invoice",
  "rate_card",
  "customer_invoice",
  "dispute_submission",
  "credit_memo",
  "fulfillment_report"
]);

export type DocumentType = z.infer<typeof documentTypeSchema>;

export const documentSchema = z.object({
  id: z.string(),
  shipmentId: z.string(),
  type: documentTypeSchema,
  name: z.string(),
  status: z.enum(["pending", "verified", "issue", "corrected"]),
  uploadedAt: z.date()
});

export type Document = z.infer<typeof documentSchema>;

// --- Simulation State ---

export const simulationStateSchema = z.object({
  isRunning: z.boolean(),
  currentPhase: z.enum(["idle", "ap", "ar", "complete"]),
  currentStep: z.number(),
  shipmentId: z.string().optional()
});

export type SimulationState = z.infer<typeof simulationStateSchema>;

// --- Users (database) ---

import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
