import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Package, Bot, Mail, FileText, CheckCircle, AlertCircle, Clock, DollarSign, Calculator } from "lucide-react";
import { ActivityStream } from "@/components/activity-stream";
import { InvoiceTable } from "@/components/invoice-table";
import { StatusFilters } from "@/components/status-filters";
import { ChatInterface } from "@/components/chat-interface";
import { InvoiceDetailsDialog } from "@/components/invoice-details-dialog";
import { EmailApprovalDialog } from "@/components/email-approval-dialog";
import type { Order, Activity, APStatus, ARStatus, SimulationState, Customer, ConsolidatedAPInvoice, ConsolidatedARInvoice } from "@shared/schema";

// ─── Customers & Initial Data ────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  {
    id: "CUST-001", name: "TechStore Inc", contactName: "James Wu", contactEmail: "jwu@techstore.com",
    billingAddress: "500 Market St #300, SF, CA 94105", paymentTerms: "Net 30", managementFeePercent: 10,
  },
  {
    id: "CUST-002", name: "GreenLeaf Organics", contactName: "Maria Santos", contactEmail: "maria@greenleaforganics.com",
    billingAddress: "2200 N Central Ave, Phoenix, AZ 85004", paymentTerms: "Net 15", managementFeePercent: 8,
  },
];

const AP_INVOICES: ConsolidatedAPInvoice[] = [
  {
    id: "AP-INV-001", carrier: "UPS", invoiceNumber: "UPS-9201-2026-W09", invoiceDate: new Date("2026-03-01"), billingPeriod: "Feb 24 – Mar 1, 2026", totalAmount: 52.65, status: "received", documentUrl: "/demo/documents/ups_consolidated_invoice.pdf",
    lineItems: [
      { trackingNumber: "1Z999AA10412345671", orderId: "ORD-1001", weight: 3.0, zone: 5, baseCharge: 9.80, fuelSurcharge: 0.83, residentialSurcharge: 0, totalCharge: 11.42, expectedCharge: 10.58, variance: 0.84, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345672", orderId: "ORD-1002", weight: 3.1, zone: 7, baseCharge: 13.20, fuelSurcharge: 1.12, residentialSurcharge: 1.55, totalCharge: 15.87, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345673", orderId: "ORD-1004", weight: 0.8, zone: 3, baseCharge: 6.10, fuelSurcharge: 0.52, residentialSurcharge: 0, totalCharge: 7.23, expectedCharge: 6.62, variance: 0.61, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345674", orderId: "ORD-2001", weight: 3.2, zone: 3, baseCharge: 7.60, fuelSurcharge: 0.65, residentialSurcharge: 0.93, totalCharge: 9.18, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345675", orderId: "ORD-2003", weight: 1.1, zone: 5, baseCharge: 7.50, fuelSurcharge: 0.64, residentialSurcharge: 0.81, totalCharge: 8.95, auditStatus: "unmatched" },
    ],
  },
  {
    id: "AP-INV-002", carrier: "FedEx", invoiceNumber: "FX-7834-2026-W09", invoiceDate: new Date("2026-03-01"), billingPeriod: "Feb 24 – Mar 1, 2026", totalAmount: 55.68, status: "received", documentUrl: "/demo/documents/fedex_consolidated_invoice.pdf",
    lineItems: [
      { trackingNumber: "7489401523456001", orderId: "ORD-1003", weight: 8.6, zone: 6, baseCharge: 15.90, fuelSurcharge: 1.43, residentialSurcharge: 1.60, totalCharge: 18.93, auditStatus: "unmatched" },
      { trackingNumber: "7489401523456002", orderId: "ORD-1005", weight: 1.5, zone: 8, baseCharge: 12.10, fuelSurcharge: 1.09, residentialSurcharge: 1.42, totalCharge: 14.61, auditStatus: "unmatched" },
      { trackingNumber: "7489401523456003", orderId: "ORD-2002", weight: 12.5, zone: 7, baseCharge: 18.40, fuelSurcharge: 1.66, residentialSurcharge: 2.08, totalCharge: 22.14, auditStatus: "unmatched" },
    ],
  },
];

const INITIAL_ORDERS: Order[] = [
  // TechStore Inc
  { id: "ORD-1001", orderNumber: "AV-2026-4401", customerId: "CUST-001", recipientName: "David Chen", shipToAddress: "Phoenix, AZ", items: [{ sku: "WM-200", description: "Wireless Mouse", quantity: 1 }, { sku: "HUB-31", description: "USB-C Hub", quantity: 1 }], itemCount: 2, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345671", weight: 2.4, zone: 5, shipDate: new Date("2026-02-25"), shippingCost: 11.42, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 1.70, packagingMaterials: 1.20, storageDays: 3, storageCost: 0.45 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001" },
  { id: "ORD-1002", orderNumber: "AV-2026-4402", customerId: "CUST-001", recipientName: "Sarah Kim", shipToAddress: "Atlanta, GA", items: [{ sku: "KB-MX1", description: "Mechanical Keyboard", quantity: 1 }], itemCount: 1, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345672", weight: 3.1, zone: 7, shipDate: new Date("2026-02-25"), shippingCost: 15.87, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 0.85, packagingMaterials: 1.50, storageDays: 1, storageCost: 0.15 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001" },
  { id: "ORD-1003", orderNumber: "AV-2026-4410", customerId: "CUST-001", recipientName: "Mike Torres", shipToAddress: "Dallas, TX", items: [{ sku: "LS-PRO", description: "Laptop Stand", quantity: 1 }, { sku: "MR-100", description: "Monitor Riser", quantity: 1 }, { sku: "CK-50", description: "Cable Kit", quantity: 1 }], itemCount: 3, carrier: "FedEx", serviceLevel: "Ground", trackingNumber: "7489401523456001", weight: 8.6, zone: 6, shipDate: new Date("2026-02-27"), shippingCost: 18.93, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 2.55, packagingMaterials: 2.10, storageDays: 5, storageCost: 0.75 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-002" },
  { id: "ORD-1004", orderNumber: "AV-2026-4418", customerId: "CUST-001", recipientName: "Lisa Park", shipToAddress: "San Francisco, CA", items: [{ sku: "WC-720", description: "Webcam HD", quantity: 1 }], itemCount: 1, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345673", weight: 0.8, zone: 2, shipDate: new Date("2026-02-28"), shippingCost: 7.23, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 0.85, packagingMaterials: 0.80, storageDays: 1, storageCost: 0.15 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001" },
  { id: "ORD-1005", orderNumber: "AV-2026-4425", customerId: "CUST-001", recipientName: "Robert Hayes", shipToAddress: "New York, NY", items: [{ sku: "UC-6FT", description: "USB-C Cable", quantity: 2 }, { sku: "PA-65W", description: "Power Adapter", quantity: 1 }], itemCount: 3, carrier: "FedEx", serviceLevel: "Ground", trackingNumber: "7489401523456002", weight: 1.5, zone: 8, shipDate: new Date("2026-02-28"), shippingCost: 14.61, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 2.55, packagingMaterials: 1.00, storageDays: 2, storageCost: 0.30 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-002" },
  // GreenLeaf Organics
  { id: "ORD-2001", orderNumber: "AV-2026-4405", customerId: "CUST-002", recipientName: "Angela Price", shipToAddress: "Los Angeles, CA", items: [{ sku: "OT-12PK", description: "Organic Tea Sampler", quantity: 1 }, { sku: "HN-16OZ", description: "Honey Jar", quantity: 1 }], itemCount: 2, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345674", weight: 3.2, zone: 3, shipDate: new Date("2026-02-26"), shippingCost: 9.18, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 1.70, packagingMaterials: 1.80, storageDays: 2, storageCost: 0.30 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001" },
  { id: "ORD-2002", orderNumber: "AV-2026-4412", customerId: "CUST-002", recipientName: "Tom Sullivan", shipToAddress: "Chicago, IL", items: [{ sku: "PB-CASE12", description: "Organic Protein Bars", quantity: 3 }], itemCount: 3, carrier: "FedEx", serviceLevel: "Ground", trackingNumber: "7489401523456003", weight: 12.5, zone: 7, shipDate: new Date("2026-02-27"), shippingCost: 22.14, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 2.55, packagingMaterials: 2.50, storageDays: 4, storageCost: 0.60 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-002" },
  { id: "ORD-2003", orderNumber: "AV-2026-4420", customerId: "CUST-002", recipientName: "Jessica Lin", shipToAddress: "Phoenix, AZ", items: [{ sku: "VB-30DAY", description: "Vitamin Bundle", quantity: 1 }], itemCount: 1, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345675", weight: 1.1, zone: 5, shipDate: new Date("2026-02-28"), shippingCost: 8.95, warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 0.85, packagingMaterials: 0.80, storageDays: 1, storageCost: 0.15 }, apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001" },
];

const INITIAL_AR_INVOICES: ConsolidatedARInvoice[] = [
  {
    id: "AR-INV-001", customerId: "CUST-001", invoiceNumber: "CL-AR-2026-0301-TS", invoiceDate: new Date("2026-03-01"), billingPeriod: "Feb 24 – Mar 1, 2026", dueDate: new Date("2026-03-31"),
    orderIds: ["ORD-1001", "ORD-1002", "ORD-1003", "ORD-1004", "ORD-1005"],
    totalFulfillmentFees: 13.75, totalItemPickFees: 8.50, totalPackagingMaterials: 6.60, totalStorage: 1.80, totalShippingCost: 68.06,
    subtotal: 98.71, managementFee: 9.87, totalAmount: 108.58, status: "collecting", documentUrl: "/demo/documents/ar_invoice_techstore.pdf"
  },
  {
    id: "AR-INV-002", customerId: "CUST-002", invoiceNumber: "CL-AR-2026-0301-GL", invoiceDate: new Date("2026-03-01"), billingPeriod: "Feb 24 – Mar 1, 2026", dueDate: new Date("2026-03-16"),
    orderIds: ["ORD-2001", "ORD-2002", "ORD-2003"],
    totalFulfillmentFees: 8.25, totalItemPickFees: 5.10, totalPackagingMaterials: 5.10, totalStorage: 1.05, totalShippingCost: 40.27,
    subtotal: 59.77, managementFee: 4.78, totalAmount: 64.55, status: "collecting", documentUrl: "/demo/documents/ar_invoice_greenleaf.pdf"
  }
];

// ─── Simulation Step Interface ───────────────────────────────────────────────

interface SimStep {
  delay: number;
  type: Activity["type"];
  title: string;
  description: string;
  status: APStatus | ARStatus;
  document?: { name: string; url: string };
  requiresApproval?: boolean;
  draftContent?: { to: string; subject: string; body: string; attachments?: string[]; };
}

// ─── AP Step Generator (per Consolidated AP Invoice) ────────────────────────────

const createConsolidatedAPSteps = (invoice: ConsolidatedAPInvoice, orders: Order[]): SimStep[] => {
  const lineCount = invoice.lineItems.length;
  const disputes = invoice.lineItems.filter(li => li.variance && li.variance > 0);
  const totalVariance = disputes.reduce((sum, li) => sum + (li.variance || 0), 0);

  const matchSteps: SimStep[] = invoice.lineItems.map((li, idx) => {
    const order = orders.find(o => o.id === li.orderId);
    return {
      delay: idx === 0 ? 1500 : 1000, type: "order_matched", title: `Matching Orders (${idx + 1}/${lineCount})`,
      description: `${li.trackingNumber} → Order ${order?.orderNumber || li.orderId}`, status: "matching",
    };
  });

  const disputeSteps: SimStep[] = [];
  if (disputes.length > 0) {
    disputes.forEach((li) => {
      const order = orders.find(o => o.id === li.orderId);
      const reason = li.expectedCharge && li.weight
        ? (li.zone <= 2 && order?.zone && order.zone < li.zone
          ? `Billed Zone ${li.zone}, should be Zone ${order.zone}. Overcharge: $${li.variance?.toFixed(2)}`
          : `Billed ${li.weight} lbs (dimensional), actual ${order?.weight || "?"} lbs. Overcharge: $${li.variance?.toFixed(2)}`)
        : `Variance of $${li.variance?.toFixed(2)} detected`;

      disputeSteps.push({ delay: 2000, type: "discrepancy_found", title: `Discrepancy: ${li.trackingNumber.slice(-4)}`, description: reason, status: "disputed" });
    });

    disputeSteps.push({
      delay: 2000, type: "email_draft", title: `Drafting Dispute to ${invoice.carrier}`,
      description: `Drafted email to ${invoice.carrier} disputing ${disputes.length} line items ($${totalVariance.toFixed(2)} total)`,
      status: "input_required", requiresApproval: true,
      draftContent: {
        to: invoice.carrier === "UPS" ? "disputes@ups.com" : "billing@fedex.com", subject: `Invoice Dispute - ${invoice.invoiceNumber}`,
        body: `Hello,\n\nWe have identified ${disputes.length} discrepancies on invoice ${invoice.invoiceNumber}:\n\n${disputes.map(li => {
          const order = orders.find(o => o.id === li.orderId);
          const reason = li.expectedCharge && li.weight
            ? (li.zone <= 2 && order?.zone && order.zone < li.zone
              ? `As per contract, shipped to Zone ${order.zone}, but billed at Zone ${li.zone}.`
              : `Billed at ${li.weight} lbs (dimensional weight), but actual package weight is ${order?.weight || "?"} lbs.`)
            : `Unexpected charge variance against contracted rate.`;
          return `• Tracking ${li.trackingNumber}: Billed $${li.totalCharge.toFixed(2)}, Expected $${li.expectedCharge?.toFixed(2) || "N/A"} (Variance: $${li.variance?.toFixed(2)})\n  Reason: ${reason}`;
        }).join("\n\n")}\n\nTotal disputed amount: $${totalVariance.toFixed(2)}\n\nPlease review and issue credit.\n\nThank you,\nCascade Logistics`,
      },
    });

    disputeSteps.push({ delay: 1000, type: "email_sent", title: `Dispute Filed with ${invoice.carrier}`, description: `Dispute submitted for ${disputes.length} line items ($${totalVariance.toFixed(2)} total)`, status: "disputed" });
    disputeSteps.push({ delay: 6000, type: "email_received", title: `${invoice.carrier} Dispute Response`, description: `${invoice.carrier} acknowledged errors, credit memo issued for $${totalVariance.toFixed(2)}`, status: "auditing" });
    disputeSteps.push({ delay: 1000, type: "dispute_resolved", title: "Credit Applied", description: `${disputes.map(li => `$${li.variance?.toFixed(2)}`).join(" + ")} credit applied. Adjusted total: $${(invoice.totalAmount - totalVariance).toFixed(2)}`, status: "auditing" });
  }

  const verifiedCount = lineCount - disputes.length;
  const adjustedTotal = disputes.length > 0 ? invoice.totalAmount - totalVariance : invoice.totalAmount;

  return [
    { delay: 1000, type: "email_received", title: `Carrier Invoice Received`, description: `Weekly invoice from ${invoice.carrier} received — ${lineCount} line items, $${invoice.totalAmount.toFixed(2)} total`, status: "received" as APStatus, document: { name: `${invoice.carrier} Consolidated Invoice`, url: invoice.documentUrl || "" } },
    { delay: 2000, type: "data_extracted", title: "Extracting Line Items", description: `Parsed ${lineCount} tracking numbers and charges from invoice PDF`, status: "extracting" as APStatus },
    ...matchSteps,
    { delay: 2000, type: "rate_verified", title: "Rate Card Audit", description: `Comparing ${lineCount} line items against contract`, status: "auditing" as APStatus },
    ...(verifiedCount > 0 ? [{ delay: 2000, type: "rate_verified" as const, title: `${verifiedCount} Lines Verified`, description: `${verifiedCount} of ${lineCount} line items match contracted rates ✓`, status: "auditing" as APStatus }] : []),
    ...disputeSteps,
    { delay: 2000, type: "audit_complete", title: `AP Audit Complete`, description: `All ${lineCount} line items verified. Total $${adjustedTotal.toFixed(2)} approved for payment`, status: "approved" as APStatus },
  ];
};

// ─── AR Step Generator (per Consolidated AR Invoice) ─────────────────────────

const createConsolidatedARSteps = (invoice: ConsolidatedARInvoice, customer: Customer, customerOrders: Order[]): SimStep[] => {
  const apInvoiceIds = Array.from(new Set(customerOrders.map(o => o.consolidatedApInvoiceId)));

  return [
    { delay: 1000, type: "email_received", title: `AR Job Opened — ${customer.name}`, description: `Collecting fulfilled orders for billing period ${invoice.billingPeriod}`, status: "collecting" as ARStatus },
    { delay: 2000, type: "order_matched", title: "Orders Collected", description: `Found ${invoice.orderIds.length} orders for ${customer.name} across ${apInvoiceIds.length} carrier invoices`, status: "collecting" as ARStatus },
    { delay: 2000, type: "charges_calculated", title: "Shipping Costs Retrieved", description: `Pulled audited shipping costs: $${invoice.totalShippingCost.toFixed(2)}`, status: "calculating" as ARStatus },
    { delay: 2000, type: "charges_calculated", title: "Fulfillment Fees Calculated", description: `Fulfillment base + Item picks = $${(invoice.totalFulfillmentFees + invoice.totalItemPickFees).toFixed(2)}`, status: "calculating" as ARStatus },
    { delay: 1500, type: "charges_calculated", title: "Packaging & Storage", description: `Materials: $${invoice.totalPackagingMaterials.toFixed(2)}, Storage: $${invoice.totalStorage.toFixed(2)}`, status: "calculating" as ARStatus },
    { delay: 2000, type: "invoice_generated", title: "Invoice Generated", description: `${invoice.invoiceNumber} — Subtotal $${invoice.subtotal.toFixed(2)} + ${customer.managementFeePercent}% fee = $${invoice.totalAmount.toFixed(2)}`, status: "generated" as ARStatus, document: { name: `AR Invoice — ${customer.name}`, url: invoice.documentUrl || "" } },
    {
      delay: 2000, type: "email_draft", title: "Drafting Invoice Email", description: `Drafted email to ${customer.contactEmail} with invoice + fulfillment report`, status: "input_required" as ARStatus, requiresApproval: true,
      draftContent: {
        to: customer.contactEmail, subject: `Invoice for Fulfillment Services — ${invoice.billingPeriod}`,
        body: `Dear ${customer.contactName},\n\nPlease find attached your fulfillment invoice for the period ${invoice.billingPeriod}.\n\nSummary:\n- Orders Fulfilled: ${invoice.orderIds.length}\n- Fulfillment Fees: $${(invoice.totalFulfillmentFees + invoice.totalItemPickFees).toFixed(2)}\n- Packaging Materials: $${invoice.totalPackagingMaterials.toFixed(2)}\n- Storage: $${invoice.totalStorage.toFixed(2)}\n- Shipping (pass-through): $${invoice.totalShippingCost.toFixed(2)}\n- Management Fee (${customer.managementFeePercent}%): $${invoice.managementFee.toFixed(2)}\n- Total: $${invoice.totalAmount.toFixed(2)}\n\nPayment Terms: ${customer.paymentTerms}\n\nThank you for your business.\n\nCascade Logistics`,
        attachments: ["AR Invoice", "Fulfillment Report"],
      },
    },
    { delay: 1000, type: "email_sent", title: "Invoice Sent", description: `Invoice emailed to ${customer.name} with fulfillment report attached`, status: "sent" as ARStatus },
    { delay: 5000, type: "payment_received", title: "AR Complete", description: `Invoice sent. Payment due per ${customer.paymentTerms} terms`, status: "sent" as ARStatus },
  ];
};

// ─── Dashboard Component ─────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"ap" | "ar">("ap");
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false, currentPhase: "idle", currentStep: 0
  });
  const [autonomyMode, setAutonomyMode] = useState<"semi" | "full">("semi");
  const [activities, setActivities] = useState<Activity[]>([]);

  // State now tracks the array of invoices
  const [apInvoices, setApInvoices] = useState<ConsolidatedAPInvoice[]>(AP_INVOICES);
  const [arInvoices, setArInvoices] = useState<ConsolidatedARInvoice[]>(INITIAL_AR_INVOICES);

  // We keep orders for reference, they are constant
  const orders = INITIAL_ORDERS;

  const activitiesRef = useRef<Activity[]>(activities);
  const apInvoicesRef = useRef<ConsolidatedAPInvoice[]>(apInvoices);
  const arInvoicesRef = useRef<ConsolidatedARInvoice[]>(arInvoices);
  const autonomyModeRef = useRef<"semi" | "full">(autonomyMode);

  useEffect(() => { activitiesRef.current = activities; }, [activities]);
  useEffect(() => { apInvoicesRef.current = apInvoices; }, [apInvoices]);
  useEffect(() => { arInvoicesRef.current = arInvoices; }, [arInvoices]);
  useEffect(() => { autonomyModeRef.current = autonomyMode; }, [autonomyMode]);

  const [apFilter, setApFilter] = useState<APStatus | "all">("all");
  const [arFilter, setArFilter] = useState<ARStatus | "all">("all");
  const [completedAPInvoices, setCompletedAPInvoices] = useState<Set<string>>(new Set());

  // Selection now works on invoices
  const [selectedAPInvoice, setSelectedAPInvoice] = useState<ConsolidatedAPInvoice | null>(null);
  const [selectedARInvoice, setSelectedARInvoice] = useState<ConsolidatedARInvoice | null>(null);

  const [draftToApprove, setDraftToApprove] = useState<string | null>(null);
  const [activeSteps, setActiveSteps] = useState<Record<string, number>>({});
  const [pendingDrafts, setPendingDrafts] = useState<Record<string, SimStep['draftContent']>>({});

  const [pendingInvoiceActions, setPendingInvoiceActions] = useState<Record<string, boolean>>({});

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const hasAutoStarted = useRef(false);

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  // ─── AR Runner ──────────────────────────────────────────────────────────────

  const runARForInvoice = useCallback((invoiceId: string, stepIndex: number = 0) => {
    const invoice = arInvoicesRef.current.find(i => i.id === invoiceId);
    if (!invoice) return;
    const customer = CUSTOMERS.find(c => c.id === invoice.customerId);
    if (!customer) return;
    const customerOrders = orders.filter(o => o.customerId === customer.id);
    const arSteps = createConsolidatedARSteps(invoice, customer, customerOrders);

    if (stepIndex >= arSteps.length) return;

    setActiveSteps(prev => ({ ...prev, [invoiceId]: stepIndex }));
    const step = arSteps[stepIndex];

    const timeout = setTimeout(() => {
      const shouldPause = step.requiresApproval && autonomyModeRef.current !== "full";

      if (shouldPause && step.draftContent) {
        setPendingDrafts(prev => ({ ...prev, [invoiceId]: step.draftContent }));
        const draftActivity: Activity = {
          id: `ar-${invoiceId}-${Date.now()}-${stepIndex}`, shipmentId: invoiceId, type: "email_draft", category: "ar", title: step.title, description: step.description, timestamp: new Date(), metadata: { pendingAction: true }
        };
        setActivities(prev => [draftActivity, ...prev]);
        setArInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: "input_required" as ARStatus } : inv));
        setPendingInvoiceActions(prev => ({ ...prev, [invoiceId]: true }));
        return;
      }

      const newActivity: Activity = {
        id: `ar-${invoiceId}-${Date.now()}-${stepIndex}`, shipmentId: invoiceId, type: step.type, category: "ar", title: step.title, description: step.description, timestamp: new Date(), metadata: step.document ? { document: step.document } : undefined
      };
      setActivities(prev => [newActivity, ...prev]);
      setArInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: step.status as ARStatus } : inv));

      runARForInvoice(invoiceId, stepIndex + 1);
    }, step.delay);

    timeoutRefs.current.push(timeout);
  }, []);

  // ─── AP Runner ─────────────────────────────────────────────────────────────

  const runAPForInvoice = useCallback((invoiceId: string, stepIndex: number = 0) => {
    const invoice = apInvoicesRef.current.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    const apSteps = createConsolidatedAPSteps(invoice, orders);
    if (stepIndex >= apSteps.length) return;

    setActiveSteps(prev => ({ ...prev, [invoiceId]: stepIndex }));
    const step = apSteps[stepIndex];

    const timeout = setTimeout(() => {
      const shouldPause = step.requiresApproval && autonomyModeRef.current !== "full";

      if (shouldPause && step.draftContent) {
        setPendingDrafts(prev => ({ ...prev, [invoiceId]: step.draftContent }));
        const pendingActivity: Activity = {
          id: `ap-${invoiceId}-${Date.now()}-${stepIndex}`, shipmentId: invoiceId, type: "email_draft", category: "ap", title: step.title, description: step.description, timestamp: new Date(), metadata: { pendingAction: true }
        };
        setActivities(prev => [pendingActivity, ...prev]);
        setApInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: "input_required" as APStatus } : inv));
        setPendingInvoiceActions(prev => ({ ...prev, [invoiceId]: true }));
        return;
      }

      const newActivity: Activity = {
        id: `ap-${invoiceId}-${Date.now()}-${stepIndex}`, shipmentId: invoiceId, type: step.type, category: "ap", title: step.title, description: step.description, timestamp: new Date(), metadata: step.document ? { document: step.document } : undefined
      };
      setActivities(prev => [newActivity, ...prev]);
      setApInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: step.status as APStatus } : inv));

      if (step.type === "audit_complete") {
        setCompletedAPInvoices(prev => {
          const next = new Set(Array.from(prev).concat(invoiceId));
          if (next.size === AP_INVOICES.length) {
            INITIAL_AR_INVOICES.forEach((arInvoice, idx) => {
              const arTimeout = setTimeout(() => { runARForInvoice(arInvoice.id, 0); }, (idx + 1) * 2000);
              timeoutRefs.current.push(arTimeout);
            });
            setSimulation(prev => ({ ...prev, currentPhase: "ar" }));
          }
          return next;
        });
      } else {
        runAPForInvoice(invoiceId, stepIndex + 1);
      }
    }, step.delay);

    timeoutRefs.current.push(timeout);
  }, [runARForInvoice]);

  // ─── Approval Handler ──────────────────────────────────────────────────────

  const handleApproveAction = useCallback((entityId: string) => {
    setPendingDrafts(prev => { const copy = { ...prev }; delete copy[entityId]; return copy; });
    setPendingInvoiceActions(prev => { const copy = { ...prev }; delete copy[entityId]; return copy; });

    setActivities(prev => prev.map(a =>
      (a.shipmentId === entityId && a.type === 'email_draft' && a.metadata?.pendingAction)
        ? { ...a, metadata: { ...a.metadata, pendingAction: false } } : a
    ));

    const currentIndex = activeSteps[entityId];
    if (AP_INVOICES.some(inv => inv.id === entityId)) {
      runAPForInvoice(entityId, currentIndex + 1);
    } else if (INITIAL_AR_INVOICES.some(inv => inv.id === entityId)) {
      runARForInvoice(entityId, currentIndex + 1);
    }
  }, [activeSteps, runAPForInvoice, runARForInvoice]);

  useEffect(() => {
    if (autonomyMode !== "full") return;
    const pendingEntities = Object.keys(pendingInvoiceActions);
    if (pendingEntities.length === 0) return;
    setDraftToApprove(null);
    pendingEntities.forEach(id => handleApproveAction(id));
  }, [autonomyMode, pendingInvoiceActions, handleApproveAction]);

  // ─── Simulation Controls ───────────────────────────────────────────────────

  const startSimulation = useCallback(() => {
    clearTimeouts();
    setActivities([]);
    setApInvoices(AP_INVOICES);
    setArInvoices(INITIAL_AR_INVOICES);
    setCompletedAPInvoices(new Set());
    setActiveSteps({});
    setPendingDrafts({});
    setPendingInvoiceActions({});
    setSimulation({ isRunning: true, currentPhase: "ap", currentStep: 0 });

    AP_INVOICES.forEach((invoice, index) => {
      const timeout = setTimeout(() => { runAPForInvoice(invoice.id, 0); }, index * 8000);
      timeoutRefs.current.push(timeout);
    });

    const completeTimeout = setTimeout(() => {
      setSimulation(prev => ({ ...prev, isRunning: false, currentPhase: "complete" }));
    }, 120000);
    timeoutRefs.current.push(completeTimeout);
  }, [clearTimeouts, runAPForInvoice]);

  const pauseSimulation = useCallback(() => {
    clearTimeouts();
    setSimulation(prev => ({ ...prev, isRunning: false }));
  }, [clearTimeouts]);

  const resetSimulation = useCallback(() => {
    clearTimeouts();
    setActivities([]);
    setApInvoices(AP_INVOICES);
    setArInvoices(INITIAL_AR_INVOICES);
    setCompletedAPInvoices(new Set());
    setActiveSteps({});
    setPendingDrafts({});
    setPendingInvoiceActions({});
    setSimulation({ isRunning: false, currentPhase: "idle", currentStep: 0 });
    setApFilter("all");
    setArFilter("all");
  }, [clearTimeouts]);

  const resumeSimulation = useCallback(() => {
    setSimulation(prev => ({ ...prev, isRunning: true }));
    apInvoices.forEach(inv => {
      if (pendingInvoiceActions[inv.id] && autonomyMode !== "full") return;
      if (completedAPInvoices.has(inv.id)) return;
      if (activeSteps[inv.id] !== undefined) runAPForInvoice(inv.id, activeSteps[inv.id]);
    });
    arInvoices.forEach(inv => {
      if (pendingInvoiceActions[inv.id] && autonomyMode !== "full") return;
      if (activeSteps[inv.id] !== undefined) runARForInvoice(inv.id, activeSteps[inv.id]);
    });
  }, [autonomyMode, apInvoices, arInvoices, activeSteps, completedAPInvoices, pendingInvoiceActions, runAPForInvoice, runARForInvoice]);

  const toggleSimulation = useCallback(() => {
    if (simulation.isRunning) pauseSimulation();
    else if (simulation.currentPhase === 'idle' || simulation.currentPhase === 'complete') startSimulation();
    else resumeSimulation();
  }, [simulation, pauseSimulation, startSimulation, resumeSimulation]);

  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      const autoStartTimer = setTimeout(() => startSimulation(), 800);
      return () => { clearTimeout(autoStartTimer); clearTimeouts(); };
    }
  }, [startSimulation, clearTimeouts]);

  // ─── Computed Values ───────────────────────────────────────────────────────

  const apCounts = {
    received: apInvoices.filter(i => i.status === "received").length,
    extracting: apInvoices.filter(i => i.status === "extracting").length,
    matching: apInvoices.filter(i => i.status === "matching").length,
    auditing: apInvoices.filter(i => i.status === "auditing").length,
    disputed: apInvoices.filter(i => i.status === "disputed").length,
    approved: apInvoices.filter(i => i.status === "approved").length,
    paid: apInvoices.filter(i => i.status === "paid").length,
    input_required: apInvoices.filter(i => i.status === "input_required").length,
    total: apInvoices.length
  };

  const arCounts = {
    collecting: arInvoices.filter(i => i.status === "collecting").length,
    calculating: arInvoices.filter(i => i.status === "calculating").length,
    generated: arInvoices.filter(i => i.status === "generated").length,
    for_review: arInvoices.filter(i => i.status === "for_review").length,
    sent: arInvoices.filter(i => i.status === "sent").length,
    paid: arInvoices.filter(i => i.status === "paid").length,
    input_required: arInvoices.filter(i => i.status === "input_required").length,
    total: arInvoices.length
  };

  const filteredApInvoices = apInvoices.filter(i => apFilter === "all" || i.status === apFilter);
  const filteredArInvoices = arInvoices.filter(i => arFilter === "all" || i.status === arFilter);

  const apActivities = activities.filter(a => a.category === "ap");
  const arActivities = activities.filter(a => a.category === "ar");

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Cascade Logistics</h1>
                <p className="text-sm text-muted-foreground">3PL AP/AR on autopilot</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <div className={`w-2 h-2 rounded-full ${simulation.isRunning ? 'bg-chart-2 animate-pulse' : simulation.currentPhase === 'complete' ? 'bg-chart-2' : 'bg-muted-foreground'}`} />
                <span className="text-sm font-medium">
                  {simulation.currentPhase === "idle" ? "Ready" :
                    simulation.currentPhase === "complete" ? "Complete" :
                      simulation.isRunning ? (simulation.currentPhase === "ap" ? `Processing AP...` : `Generating AR...`) : "Paused"}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-2 py-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Autonomy</span>
                <div className="flex items-center rounded-md bg-muted p-0.5">
                  <Button type="button" size="sm" variant={autonomyMode === "semi" ? "secondary" : "ghost"} aria-pressed={autonomyMode === "semi"} onClick={() => setAutonomyMode("semi")} data-testid="button-autonomy-semi">Semi</Button>
                  <Button type="button" size="sm" variant={autonomyMode === "full" ? "secondary" : "ghost"} aria-pressed={autonomyMode === "full"} onClick={() => setAutonomyMode("full")} data-testid="button-autonomy-full">Full</Button>
                </div>
              </div>

              {!simulation.isRunning && (simulation.currentPhase === "idle" || simulation.currentPhase === "complete") && (
                <Button onClick={startSimulation} data-testid="button-start-demo">
                  <Play className="w-4 h-4 mr-2" /> Start Demo
                </Button>
              )}
              {simulation.isRunning && (
                <Button variant="secondary" onClick={pauseSimulation} data-testid="button-pause-demo">
                  <Pause className="w-4 h-4 mr-2" /> Pause
                </Button>
              )}
              {!simulation.isRunning && simulation.currentPhase !== "idle" && simulation.currentPhase !== "complete" && (
                <Button onClick={resumeSimulation} data-testid="button-resume-demo">
                  <Play className="w-4 h-4 mr-2" /> Resume
                </Button>
              )}
              {(simulation.currentPhase !== "idle" || activities.length > 0) && (
                <Button variant="outline" onClick={resetSimulation} data-testid="button-reset-demo">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ap" | "ar")} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ap" className="gap-2" data-testid="tab-ap">
              <FileText className="w-4 h-4" /> AP Invoices
              {apActivities.length > 0 && <Badge variant="secondary" className="ml-1 min-w-[20px] h-5 text-xs">{apActivities.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="ar" className="gap-2" data-testid="tab-ar">
              <DollarSign className="w-4 h-4" /> AR Invoices
              {arActivities.length > 0 && <Badge variant="secondary" className="ml-1 min-w-[20px] h-5 text-xs">{arActivities.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-primary" /> AP Activity Stream
                      <Badge variant="outline" className="ml-2">Live</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityStream activities={apActivities} emptyMessage="Start the demo to see AP activities" onAction={(a) => setDraftToApprove(a.shipmentId)} />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <ChatInterface />
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" /> Consolidated AP Invoices
                    <Badge variant="outline" className="ml-2">{completedAPInvoices.size}/{AP_INVOICES.length} Audited</Badge>
                  </CardTitle>
                  <StatusFilters activeTab="ap" apFilter={apFilter} arFilter={arFilter} onApFilterChange={setApFilter} onArFilterChange={setArFilter} apCounts={apCounts} arCounts={arCounts} />
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceTable invoices={filteredApInvoices} activeTab="ap" onInvoiceClick={(id) => setSelectedAPInvoice(filteredApInvoices.find(i => i.id === id) || null)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-primary" /> AR Activity Stream
                      <Badge variant="outline" className="ml-2">Live</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityStream activities={arActivities} emptyMessage="AR process starts after all carrier invoices are audited" onAction={(a) => setDraftToApprove(a.shipmentId)} />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <ChatInterface />
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" /> Customer AR Invoices
                  </CardTitle>
                  <StatusFilters activeTab="ar" apFilter={apFilter} arFilter={arFilter} onApFilterChange={setApFilter} onArFilterChange={setArFilter} apCounts={apCounts} arCounts={arCounts} />
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceTable invoices={filteredArInvoices} consumers={CUSTOMERS} activeTab="ar" onInvoiceClick={(id) => setSelectedARInvoice(filteredArInvoices.find(i => i.id === id) || null)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <InvoiceDetailsDialog
        invoice={activeTab === "ap" ? selectedAPInvoice : selectedARInvoice}
        orders={orders}
        customer={selectedARInvoice ? CUSTOMERS.find(c => c.id === selectedARInvoice.customerId) : undefined}
        activities={activities}
        open={!!(selectedAPInvoice || selectedARInvoice)}
        onOpenChange={(open) => { if (!open) { setSelectedAPInvoice(null); setSelectedARInvoice(null); } }}
        onAction={(id) => setDraftToApprove(id)}
        context={activeTab}
        pendingAction={!!(selectedAPInvoice && pendingInvoiceActions[selectedAPInvoice.id]) || !!(selectedARInvoice && pendingInvoiceActions[selectedARInvoice.id])}
      />

      <EmailApprovalDialog
        open={!!draftToApprove}
        onOpenChange={(open) => !open && setDraftToApprove(null)}
        draft={draftToApprove ? (pendingDrafts[draftToApprove] || null) : null}
        onApprove={() => { if (draftToApprove) { handleApproveAction(draftToApprove); setDraftToApprove(null); } }}
        onCancel={() => setDraftToApprove(null)}
      />
    </div>
  );
}
