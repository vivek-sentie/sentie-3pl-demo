import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Package, Bot, Mail, FileText, CheckCircle, AlertCircle, Clock, DollarSign } from "lucide-react";
import { ActivityStream } from "@/components/activity-stream";
import { ShipmentTable } from "@/components/shipment-table";
import { StatusFilters } from "@/components/status-filters";
import { ChatInterface } from "@/components/chat-interface";
import { ShipmentDetailsDialog } from "@/components/shipment-details-dialog";
import { EmailApprovalDialog } from "@/components/email-approval-dialog";
import type { Order, Activity, APStatus, ARStatus, SimulationState, Customer, ConsolidatedAPInvoice, ConsolidatedARInvoice } from "@shared/schema";

// ─── Customers ───────────────────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  {
    id: "CUST-001",
    name: "TechStore Inc",
    contactName: "James Wu",
    contactEmail: "jwu@techstore.com",
    billingAddress: "500 Market St #300, SF, CA 94105",
    paymentTerms: "Net 30",
    managementFeePercent: 10,
  },
  {
    id: "CUST-002",
    name: "GreenLeaf Organics",
    contactName: "Maria Santos",
    contactEmail: "maria@greenleaforganics.com",
    billingAddress: "2200 N Central Ave, Phoenix, AZ 85004",
    paymentTerms: "Net 15",
    managementFeePercent: 8,
  },
];

// ─── Consolidated AP Invoices ────────────────────────────────────────────────

const AP_INVOICES: ConsolidatedAPInvoice[] = [
  {
    id: "AP-INV-001",
    carrier: "UPS",
    invoiceNumber: "UPS-9201-2026-W09",
    invoiceDate: new Date("2026-03-01"),
    billingPeriod: "Feb 24 – Mar 1, 2026",
    totalAmount: 52.65,
    status: "received",
    documentUrl: "/demo/documents/ups_consolidated_invoice.pdf",
    lineItems: [
      { trackingNumber: "1Z999AA10412345671", orderId: "ORD-1001", weight: 3.0, zone: 5, baseCharge: 9.80, fuelSurcharge: 0.83, residentialSurcharge: 0, totalCharge: 11.42, expectedCharge: 10.58, variance: 0.84, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345672", orderId: "ORD-1002", weight: 3.1, zone: 7, baseCharge: 13.20, fuelSurcharge: 1.12, residentialSurcharge: 1.55, totalCharge: 15.87, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345673", orderId: "ORD-1004", weight: 0.8, zone: 3, baseCharge: 6.10, fuelSurcharge: 0.52, residentialSurcharge: 0, totalCharge: 7.23, expectedCharge: 6.62, variance: 0.61, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345674", orderId: "ORD-2001", weight: 3.2, zone: 3, baseCharge: 7.60, fuelSurcharge: 0.65, residentialSurcharge: 0.93, totalCharge: 9.18, auditStatus: "unmatched" },
      { trackingNumber: "1Z999AA10412345675", orderId: "ORD-2003", weight: 1.1, zone: 5, baseCharge: 7.50, fuelSurcharge: 0.64, residentialSurcharge: 0.81, totalCharge: 8.95, auditStatus: "unmatched" },
    ],
  },
  {
    id: "AP-INV-002",
    carrier: "FedEx",
    invoiceNumber: "FX-7834-2026-W09",
    invoiceDate: new Date("2026-03-01"),
    billingPeriod: "Feb 24 – Mar 1, 2026",
    totalAmount: 55.68,
    status: "received",
    documentUrl: "/demo/documents/fedex_consolidated_invoice.pdf",
    lineItems: [
      { trackingNumber: "7489401523456001", orderId: "ORD-1003", weight: 8.6, zone: 6, baseCharge: 15.90, fuelSurcharge: 1.43, residentialSurcharge: 1.60, totalCharge: 18.93, auditStatus: "unmatched" },
      { trackingNumber: "7489401523456002", orderId: "ORD-1005", weight: 1.5, zone: 8, baseCharge: 12.10, fuelSurcharge: 1.09, residentialSurcharge: 1.42, totalCharge: 14.61, auditStatus: "unmatched" },
      { trackingNumber: "7489401523456003", orderId: "ORD-2002", weight: 12.5, zone: 7, baseCharge: 18.40, fuelSurcharge: 1.66, residentialSurcharge: 2.08, totalCharge: 22.14, auditStatus: "unmatched" },
    ],
  },
];

// ─── Initial Orders ──────────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  // TechStore Inc orders
  {
    id: "ORD-1001", orderNumber: "AV-2026-4401", customerId: "CUST-001",
    recipientName: "David Chen", shipToAddress: "Phoenix, AZ",
    items: [{ sku: "WM-200", description: "Wireless Mouse", quantity: 1 }, { sku: "HUB-31", description: "USB-C Hub", quantity: 1 }],
    itemCount: 2, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345671",
    weight: 2.4, zone: 5, shipDate: new Date("2026-02-25"), shippingCost: 11.42,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 1.70, packagingMaterials: 1.20, storageDays: 3, storageCost: 0.45 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001",
  },
  {
    id: "ORD-1002", orderNumber: "AV-2026-4402", customerId: "CUST-001",
    recipientName: "Sarah Kim", shipToAddress: "Atlanta, GA",
    items: [{ sku: "KB-MX1", description: "Mechanical Keyboard", quantity: 1 }],
    itemCount: 1, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345672",
    weight: 3.1, zone: 7, shipDate: new Date("2026-02-25"), shippingCost: 15.87,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 0.85, packagingMaterials: 1.50, storageDays: 1, storageCost: 0.15 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001",
  },
  {
    id: "ORD-1003", orderNumber: "AV-2026-4410", customerId: "CUST-001",
    recipientName: "Mike Torres", shipToAddress: "Dallas, TX",
    items: [{ sku: "LS-PRO", description: "Laptop Stand", quantity: 1 }, { sku: "MR-100", description: "Monitor Riser", quantity: 1 }, { sku: "CK-50", description: "Cable Kit", quantity: 1 }],
    itemCount: 3, carrier: "FedEx", serviceLevel: "Ground", trackingNumber: "7489401523456001",
    weight: 8.6, zone: 6, shipDate: new Date("2026-02-27"), shippingCost: 18.93,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 2.55, packagingMaterials: 2.10, storageDays: 5, storageCost: 0.75 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-002",
  },
  {
    id: "ORD-1004", orderNumber: "AV-2026-4418", customerId: "CUST-001",
    recipientName: "Lisa Park", shipToAddress: "San Francisco, CA",
    items: [{ sku: "WC-720", description: "Webcam HD", quantity: 1 }],
    itemCount: 1, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345673",
    weight: 0.8, zone: 2, shipDate: new Date("2026-02-28"), shippingCost: 7.23,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 0.85, packagingMaterials: 0.80, storageDays: 1, storageCost: 0.15 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001",
  },
  {
    id: "ORD-1005", orderNumber: "AV-2026-4425", customerId: "CUST-001",
    recipientName: "Robert Hayes", shipToAddress: "New York, NY",
    items: [{ sku: "UC-6FT", description: "USB-C Cable", quantity: 2 }, { sku: "PA-65W", description: "Power Adapter", quantity: 1 }],
    itemCount: 3, carrier: "FedEx", serviceLevel: "Ground", trackingNumber: "7489401523456002",
    weight: 1.5, zone: 8, shipDate: new Date("2026-02-28"), shippingCost: 14.61,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 2.55, packagingMaterials: 1.00, storageDays: 2, storageCost: 0.30 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-002",
  },
  // GreenLeaf Organics orders
  {
    id: "ORD-2001", orderNumber: "AV-2026-4405", customerId: "CUST-002",
    recipientName: "Angela Price", shipToAddress: "Los Angeles, CA",
    items: [{ sku: "OT-12PK", description: "Organic Tea Sampler", quantity: 1 }, { sku: "HN-16OZ", description: "Honey Jar", quantity: 1 }],
    itemCount: 2, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345674",
    weight: 3.2, zone: 3, shipDate: new Date("2026-02-26"), shippingCost: 9.18,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 1.70, packagingMaterials: 1.80, storageDays: 2, storageCost: 0.30 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001",
  },
  {
    id: "ORD-2002", orderNumber: "AV-2026-4412", customerId: "CUST-002",
    recipientName: "Tom Sullivan", shipToAddress: "Chicago, IL",
    items: [{ sku: "PB-CASE12", description: "Organic Protein Bars", quantity: 3 }],
    itemCount: 3, carrier: "FedEx", serviceLevel: "Ground", trackingNumber: "7489401523456003",
    weight: 12.5, zone: 7, shipDate: new Date("2026-02-27"), shippingCost: 22.14,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 2.55, packagingMaterials: 2.50, storageDays: 4, storageCost: 0.60 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-002",
  },
  {
    id: "ORD-2003", orderNumber: "AV-2026-4420", customerId: "CUST-002",
    recipientName: "Jessica Lin", shipToAddress: "Phoenix, AZ",
    items: [{ sku: "VB-30DAY", description: "Vitamin Bundle", quantity: 1 }],
    itemCount: 1, carrier: "UPS", serviceLevel: "Ground", trackingNumber: "1Z999AA10412345675",
    weight: 1.1, zone: 5, shipDate: new Date("2026-02-28"), shippingCost: 8.95,
    warehouseFees: { fulfillmentFee: 2.75, itemPickFee: 0.85, packagingMaterials: 0.80, storageDays: 1, storageCost: 0.15 },
    apStatus: "received", arStatus: "collecting", consolidatedApInvoiceId: "AP-INV-001",
  },
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
  draftContent?: {
    to: string;
    subject: string;
    body: string;
    attachments?: string[];
  };
}

// ─── AP Step Generator (per Consolidated Invoice) ────────────────────────────

const createConsolidatedAPSteps = (invoice: ConsolidatedAPInvoice, orders: Order[]): SimStep[] => {
  const lineCount = invoice.lineItems.length;
  const disputes = invoice.lineItems.filter(li => li.variance && li.variance > 0);
  const totalVariance = disputes.reduce((sum, li) => sum + (li.variance || 0), 0);

  const matchSteps: SimStep[] = invoice.lineItems.map((li, idx) => {
    const order = orders.find(o => o.id === li.orderId);
    return {
      delay: idx === 0 ? 1500 : 1000,
      type: "order_matched" as const,
      title: `Matching Orders (${idx + 1}/${lineCount})`,
      description: `${li.trackingNumber} → Order ${order?.orderNumber || li.orderId} (${order?.recipientName || "Unknown"}, ${order?.shipToAddress || ""})`,
      status: "matching" as APStatus,
    };
  });

  const disputeSteps: SimStep[] = [];
  if (disputes.length > 0) {
    disputes.forEach((li) => {
      const order = orders.find(o => o.id === li.orderId);
      const reason = li.expectedCharge && li.weight
        ? (li.zone <= 2 && order?.zone && order.zone < li.zone
          ? `Billed Zone ${li.zone}, should be Zone ${order.zone} (${order.shipToAddress}). Overcharge: $${li.variance?.toFixed(2)}`
          : `Billed ${li.weight} lbs (dimensional), actual ${order?.weight || "?"} lbs. Overcharge: $${li.variance?.toFixed(2)}`)
        : `Variance of $${li.variance?.toFixed(2)} detected`;

      disputeSteps.push({
        delay: 2000,
        type: "discrepancy_found",
        title: `Discrepancy: ${li.trackingNumber.slice(-4)}`,
        description: reason,
        status: "disputed" as APStatus,
      });
    });

    disputeSteps.push({
      delay: 2000,
      type: "email_draft",
      title: `Drafting Dispute to ${invoice.carrier}`,
      description: `Drafted email to ${invoice.carrier} disputing ${disputes.length} line item${disputes.length > 1 ? "s" : ""} ($${totalVariance.toFixed(2)} total)`,
      status: "input_required" as APStatus,
      requiresApproval: true,
      draftContent: {
        to: invoice.carrier === "UPS" ? "disputes@ups.com" : "billing@fedex.com",
        subject: `Invoice Dispute - ${invoice.invoiceNumber}`,
        body: `Hello,\n\nWe have identified ${disputes.length} discrepancies on invoice ${invoice.invoiceNumber}:\n\n${disputes.map(li => `• Tracking ${li.trackingNumber}: Billed $${li.totalCharge.toFixed(2)}, Expected $${li.expectedCharge?.toFixed(2) || "N/A"} (Variance: $${li.variance?.toFixed(2)})`).join("\n")}\n\nTotal disputed amount: $${totalVariance.toFixed(2)}\n\nPlease review and issue credit.\n\nThank you,\nCascade Logistics`,
      },
    });

    disputeSteps.push({
      delay: 1000,
      type: "email_sent",
      title: `Dispute Filed with ${invoice.carrier}`,
      description: `Dispute submitted for ${disputes.length} line item${disputes.length > 1 ? "s" : ""} ($${totalVariance.toFixed(2)} total)`,
      status: "disputed" as APStatus,
    });

    disputeSteps.push({
      delay: 6000,
      type: "email_received",
      title: `${invoice.carrier} Dispute Response`,
      description: `${invoice.carrier} acknowledged errors, credit memo issued for $${totalVariance.toFixed(2)}`,
      status: "auditing" as APStatus,
    });

    disputeSteps.push({
      delay: 1000,
      type: "dispute_resolved",
      title: "Credit Applied",
      description: `${disputes.map(li => `$${li.variance?.toFixed(2)}`).join(" + ")} credit applied. Adjusted total: $${(invoice.totalAmount - totalVariance).toFixed(2)}`,
      status: "auditing" as APStatus,
    });
  }

  const verifiedCount = lineCount - disputes.length;
  const adjustedTotal = disputes.length > 0 ? invoice.totalAmount - totalVariance : invoice.totalAmount;

  return [
    {
      delay: 1000,
      type: "email_received",
      title: `Carrier Invoice Received`,
      description: `Weekly invoice from ${invoice.carrier} received — ${lineCount} line items, $${invoice.totalAmount.toFixed(2)} total`,
      status: "received" as APStatus,
      document: { name: `${invoice.carrier} Consolidated Invoice`, url: invoice.documentUrl || "" },
    },
    {
      delay: 2000,
      type: "data_extracted",
      title: "Extracting Line Items",
      description: `Parsed ${lineCount} tracking numbers and charges from invoice PDF`,
      status: "extracting" as APStatus,
    },
    ...matchSteps,
    {
      delay: 2000,
      type: "rate_verified",
      title: "Rate Card Audit",
      description: `Comparing ${lineCount} line items against ${invoice.carrier} contracted rates`,
      status: "auditing" as APStatus,
    },
    ...(verifiedCount > 0 ? [{
      delay: 2000,
      type: "rate_verified" as const,
      title: `${verifiedCount} Line${verifiedCount > 1 ? "s" : ""} Verified`,
      description: `${verifiedCount} of ${lineCount} line items match contracted rates ✓`,
      status: "auditing" as APStatus,
    }] : []),
    ...disputeSteps,
    {
      delay: 2000,
      type: "audit_complete" as const,
      title: `AP Audit Complete`,
      description: `All ${lineCount} line items verified. ${disputes.length > 0 ? `Adjusted total $${adjustedTotal.toFixed(2)}` : `Total $${invoice.totalAmount.toFixed(2)}`} approved for payment`,
      status: "approved" as APStatus,
    },
  ];
};

// ─── AR Step Generator (per Customer) ────────────────────────────────────────

const createCustomerARSteps = (customer: Customer, customerOrders: Order[]): SimStep[] => {
  const orderCount = customerOrders.length;
  const totalItemCount = customerOrders.reduce((sum, o) => sum + o.itemCount, 0);
  const totalShipping = customerOrders.reduce((sum, o) => sum + o.shippingCost, 0);
  const totalFulfillment = customerOrders.reduce((sum, o) => sum + o.warehouseFees.fulfillmentFee, 0);
  const totalItemPick = customerOrders.reduce((sum, o) => sum + o.warehouseFees.itemPickFee, 0);
  const totalPackaging = customerOrders.reduce((sum, o) => sum + o.warehouseFees.packagingMaterials, 0);
  const totalStorage = customerOrders.reduce((sum, o) => sum + o.warehouseFees.storageCost, 0);
  const subtotal = totalShipping + totalFulfillment + totalItemPick + totalPackaging + totalStorage;
  const mgmtFee = Math.round(subtotal * customer.managementFeePercent) / 100;
  const grandTotal = subtotal + mgmtFee;

  // Find unique AP invoices referenced
  const apInvoiceIds = [...new Set(customerOrders.map(o => o.consolidatedApInvoiceId))];

  return [
    {
      delay: 1000,
      type: "email_received",
      title: `AR Job Opened — ${customer.name}`,
      description: `Collecting fulfilled orders for billing period Feb 24–Mar 1`,
      status: "collecting" as ARStatus,
    },
    {
      delay: 2000,
      type: "order_matched",
      title: "Orders Collected",
      description: `Found ${orderCount} orders for ${customer.name} across ${apInvoiceIds.length} carrier invoice${apInvoiceIds.length > 1 ? "s" : ""}`,
      status: "collecting" as ARStatus,
    },
    {
      delay: 2000,
      type: "charges_calculated",
      title: "Shipping Costs Retrieved",
      description: `Pulled audited shipping costs: $${totalShipping.toFixed(2)} from ${apInvoiceIds.join(" + ")}`,
      status: "calculating" as ARStatus,
    },
    {
      delay: 2000,
      type: "charges_calculated",
      title: "Fulfillment Fees Calculated",
      description: `${orderCount} orders × $2.75 + ${totalItemCount} items × $0.85 = $${(totalFulfillment + totalItemPick).toFixed(2)}`,
      status: "calculating" as ARStatus,
    },
    {
      delay: 1500,
      type: "charges_calculated",
      title: "Packaging & Storage",
      description: `Materials: $${totalPackaging.toFixed(2)}, Storage: $${totalStorage.toFixed(2)}`,
      status: "calculating" as ARStatus,
    },
    {
      delay: 2000,
      type: "invoice_generated",
      title: "Invoice Generated",
      description: `CL-AR-2026-0301 — Subtotal $${subtotal.toFixed(2)} + ${customer.managementFeePercent}% mgmt fee = $${grandTotal.toFixed(2)}`,
      status: "generated" as ARStatus,
      document: {
        name: `AR Invoice — ${customer.name}`,
        url: customer.id === "CUST-001" ? "/demo/documents/ar_invoice_techstore.pdf" : "/demo/documents/ar_invoice_greenleaf.pdf"
      },
    },
    {
      delay: 2000,
      type: "email_draft",
      title: "Drafting Invoice Email",
      description: `Drafted email to ${customer.contactEmail} with invoice + fulfillment report`,
      status: "input_required" as ARStatus,
      requiresApproval: true,
      draftContent: {
        to: customer.contactEmail,
        subject: `Invoice for Fulfillment Services — Feb 24–Mar 1, 2026`,
        body: `Dear ${customer.contactName},\n\nPlease find attached your fulfillment invoice for the period Feb 24–Mar 1, 2026.\n\nSummary:\n- Orders Fulfilled: ${orderCount}\n- Fulfillment Fees: $${(totalFulfillment + totalItemPick).toFixed(2)}\n- Packaging Materials: $${totalPackaging.toFixed(2)}\n- Storage: $${totalStorage.toFixed(2)}\n- Shipping (pass-through): $${totalShipping.toFixed(2)}\n- Management Fee (${customer.managementFeePercent}%): $${mgmtFee.toFixed(2)}\n- Total: $${grandTotal.toFixed(2)}\n\nPayment Terms: ${customer.paymentTerms}\n\nThank you for your business.\n\nCascade Logistics`,
        attachments: ["AR Invoice", "Fulfillment Report"],
      },
    },
    {
      delay: 1000,
      type: "email_sent",
      title: "Invoice Sent",
      description: `Invoice emailed to ${customer.name} with fulfillment report attached`,
      status: "sent" as ARStatus,
    },
    {
      delay: 5000,
      type: "payment_received",
      title: "AR Complete",
      description: `Invoice sent. Payment due per ${customer.paymentTerms} terms`,
      status: "sent" as ARStatus,
    },
  ];
};

// ─── Dashboard Component ─────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"ap" | "ar">("ap");
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentPhase: "idle",
    currentStep: 0
  });
  const [autonomyMode, setAutonomyMode] = useState<"semi" | "full">("semi");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [apInvoices, setApInvoices] = useState<ConsolidatedAPInvoice[]>(AP_INVOICES);

  const activitiesRef = useRef<Activity[]>(activities);
  const ordersRef = useRef<Order[]>(orders);
  const autonomyModeRef = useRef<"semi" | "full">(autonomyMode);

  useEffect(() => { activitiesRef.current = activities; }, [activities]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  useEffect(() => { autonomyModeRef.current = autonomyMode; }, [autonomyMode]);

  const [apFilter, setApFilter] = useState<APStatus | "all">("all");
  const [arFilter, setArFilter] = useState<ARStatus | "all">("all");
  const [completedAPInvoices, setCompletedAPInvoices] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [draftToApprove, setDraftToApprove] = useState<string | null>(null);
  const [activeSteps, setActiveSteps] = useState<Record<string, number>>({});
  const [pendingDrafts, setPendingDrafts] = useState<Record<string, SimStep['draftContent']>>({});
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const hasAutoStarted = useRef(false);

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  // ─── AR Runner (per Customer) ──────────────────────────────────────────────

  const runARForCustomer = useCallback((customerId: string, stepIndex: number = 0) => {
    const customer = CUSTOMERS.find(c => c.id === customerId);
    if (!customer) return;
    const customerOrders = ordersRef.current.filter(o => o.customerId === customerId);
    const arSteps = createCustomerARSteps(customer, customerOrders);
    if (stepIndex >= arSteps.length) return;

    setActiveSteps(prev => ({ ...prev, [customerId]: stepIndex }));
    const step = arSteps[stepIndex];

    const timeout = setTimeout(() => {
      const shouldPause = step.requiresApproval && autonomyModeRef.current !== "full";

      if (shouldPause && step.draftContent) {
        setPendingDrafts(prev => ({ ...prev, [customerId]: step.draftContent }));
        const draftActivity: Activity = {
          id: `ar-${customerId}-${Date.now()}-${stepIndex}`,
          shipmentId: customerId,
          type: "email_draft",
          category: "ar",
          title: step.title,
          description: step.description,
          timestamp: new Date(),
          metadata: { pendingAction: true }
        };
        setActivities(prev => [draftActivity, ...prev]);
        setOrders(prev => prev.map(o =>
          o.customerId === customerId ? { ...o, arStatus: "input_required" as ARStatus, pendingAction: "approve_email" as const } : o
        ));
        return;
      }

      const newActivity: Activity = {
        id: `ar-${customerId}-${Date.now()}-${stepIndex}`,
        shipmentId: customerId,
        type: step.type,
        category: "ar",
        title: step.title,
        description: step.description,
        timestamp: new Date(),
        metadata: step.document ? { document: step.document } : undefined
      };
      setActivities(prev => [newActivity, ...prev]);

      // Update all orders for this customer with the new AR status
      setOrders(prev => prev.map(o =>
        o.customerId === customerId ? { ...o, arStatus: step.status as ARStatus } : o
      ));

      runARForCustomer(customerId, stepIndex + 1);
    }, step.delay);

    timeoutRefs.current.push(timeout);
  }, []);

  // ─── AP Runner (per Consolidated Invoice) ──────────────────────────────────

  const runAPForInvoice = useCallback((invoiceId: string, stepIndex: number = 0) => {
    const invoice = AP_INVOICES.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    const apSteps = createConsolidatedAPSteps(invoice, ordersRef.current);
    if (stepIndex >= apSteps.length) return;

    setActiveSteps(prev => ({ ...prev, [invoiceId]: stepIndex }));
    const step = apSteps[stepIndex];

    const timeout = setTimeout(() => {
      const shouldPause = step.requiresApproval && autonomyModeRef.current !== "full";

      if (shouldPause && step.draftContent) {
        setPendingDrafts(prev => ({ ...prev, [invoiceId]: step.draftContent }));
        const pendingActivity: Activity = {
          id: `ap-${invoiceId}-${Date.now()}-${stepIndex}`,
          shipmentId: invoiceId,
          type: "email_draft",
          category: "ap",
          title: step.title,
          description: step.description,
          timestamp: new Date(),
          metadata: { pendingAction: true }
        };
        setActivities(prev => [pendingActivity, ...prev]);

        // Set input_required on all orders linked to this invoice
        const orderIds = invoice.lineItems.map(li => li.orderId);
        setOrders(prev => prev.map(o =>
          orderIds.includes(o.id) ? { ...o, apStatus: "input_required" as APStatus, pendingAction: "approve_email" as const } : o
        ));
        return;
      }

      const newActivity: Activity = {
        id: `ap-${invoiceId}-${Date.now()}-${stepIndex}`,
        shipmentId: invoiceId,
        type: step.type,
        category: "ap",
        title: step.title,
        description: step.description,
        timestamp: new Date(),
        metadata: step.document ? { document: step.document } : undefined
      };
      setActivities(prev => [newActivity, ...prev]);

      // Update all orders linked to this invoice with the new AP status
      const orderIds = invoice.lineItems.map(li => li.orderId);
      setOrders(prev => prev.map(o =>
        orderIds.includes(o.id) ? { ...o, apStatus: step.status as APStatus } : o
      ));

      // When AP audit is complete, mark this invoice as done
      if (step.type === "audit_complete") {
        setCompletedAPInvoices(prev => {
          const next = new Set(Array.from(prev).concat(invoiceId));
          // Check if ALL AP invoices are now complete
          if (next.size === AP_INVOICES.length) {
            // Start AR for each customer with a stagger
            const customerIds = [...new Set(INITIAL_ORDERS.map(o => o.customerId))];
            customerIds.forEach((custId, idx) => {
              const arTimeout = setTimeout(() => {
                runARForCustomer(custId, 0);
              }, (idx + 1) * 2000);
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
  }, [runARForCustomer]);

  // ─── Approval Handler ──────────────────────────────────────────────────────

  const handleApproveAction = useCallback((entityId: string) => {
    setPendingDrafts(prev => {
      const copy = { ...prev };
      delete copy[entityId];
      return copy;
    });

    setOrders(prev => prev.map(o => {
      if (o.customerId === entityId || o.consolidatedApInvoiceId === entityId) {
        return { ...o, pendingAction: undefined };
      }
      return o;
    }));

    setActivities(prev => prev.map(a =>
      (a.shipmentId === entityId && a.type === 'email_draft' && a.metadata?.pendingAction)
        ? { ...a, metadata: { ...a.metadata, pendingAction: false } }
        : a
    ));

    const currentIndex = activeSteps[entityId];
    const isAPEntity = AP_INVOICES.some(inv => inv.id === entityId);
    const isAREntity = CUSTOMERS.some(c => c.id === entityId);

    if (isAPEntity) {
      runAPForInvoice(entityId, currentIndex + 1);
    } else if (isAREntity) {
      runARForCustomer(entityId, currentIndex + 1);
    }
  }, [activeSteps, runAPForInvoice, runARForCustomer]);

  // Auto-approve in full autonomy mode
  useEffect(() => {
    if (autonomyMode !== "full") return;

    // Find any entities with pending actions
    const pendingAPInvoices = AP_INVOICES.filter(inv => {
      const orderIds = inv.lineItems.map(li => li.orderId);
      return orders.some(o => orderIds.includes(o.id) && o.pendingAction);
    });
    const pendingCustomers = CUSTOMERS.filter(c =>
      orders.some(o => o.customerId === c.id && o.pendingAction)
    );

    if (pendingAPInvoices.length === 0 && pendingCustomers.length === 0) return;

    setDraftToApprove(null);
    pendingAPInvoices.forEach(inv => handleApproveAction(inv.id));
    pendingCustomers.forEach(c => handleApproveAction(c.id));
  }, [autonomyMode, orders, handleApproveAction]);

  // ─── Simulation Controls ───────────────────────────────────────────────────

  const startSimulation = useCallback(() => {
    clearTimeouts();
    setActivities([]);
    setOrders(INITIAL_ORDERS);
    setApInvoices(AP_INVOICES);
    setCompletedAPInvoices(new Set());
    setActiveSteps({});
    setPendingDrafts({});
    setSimulation({ isRunning: true, currentPhase: "ap", currentStep: 0 });

    // Run AP invoices in parallel with staggered starts
    AP_INVOICES.forEach((invoice, index) => {
      const timeout = setTimeout(() => {
        runAPForInvoice(invoice.id, 0);
      }, index * 8000);
      timeoutRefs.current.push(timeout);
    });

    // Mark complete after timeout
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
    setOrders(INITIAL_ORDERS);
    setApInvoices(AP_INVOICES);
    setCompletedAPInvoices(new Set());
    setActiveSteps({});
    setPendingDrafts({});
    setSimulation({ isRunning: false, currentPhase: "idle", currentStep: 0 });
    setApFilter("all");
    setArFilter("all");
  }, [clearTimeouts]);

  const resumeSimulation = useCallback(() => {
    setSimulation(prev => ({ ...prev, isRunning: true }));

    // Resume AP invoices
    AP_INVOICES.forEach(invoice => {
      const orderIds = invoice.lineItems.map(li => li.orderId);
      const hasPending = autonomyMode !== "full" && orders.some(o => orderIds.includes(o.id) && o.pendingAction);
      if (hasPending) return;
      if (completedAPInvoices.has(invoice.id)) return;
      const currentIndex = activeSteps[invoice.id];
      if (currentIndex !== undefined) {
        runAPForInvoice(invoice.id, currentIndex);
      }
    });

    // Resume AR for customers
    CUSTOMERS.forEach(customer => {
      const hasPending = autonomyMode !== "full" && orders.some(o => o.customerId === customer.id && o.pendingAction);
      if (hasPending) return;
      const currentIndex = activeSteps[customer.id];
      if (currentIndex !== undefined) {
        runARForCustomer(customer.id, currentIndex);
      }
    });
  }, [autonomyMode, orders, activeSteps, completedAPInvoices, runAPForInvoice, runARForCustomer]);

  const toggleSimulation = useCallback(() => {
    if (simulation.isRunning) {
      pauseSimulation();
    } else if (simulation.currentPhase === 'idle' || simulation.currentPhase === 'complete') {
      startSimulation();
    } else {
      resumeSimulation();
    }
  }, [simulation.isRunning, simulation.currentPhase, pauseSimulation, startSimulation, resumeSimulation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        toggleSimulation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSimulation]);

  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      const autoStartTimer = setTimeout(() => {
        startSimulation();
      }, 800);
      return () => {
        clearTimeout(autoStartTimer);
        clearTimeouts();
      };
    }
    return () => clearTimeouts();
  }, []);

  // ─── Computed Values ───────────────────────────────────────────────────────

  const apCounts = {
    received: orders.filter(o => o.apStatus === "received").length,
    extracting: orders.filter(o => o.apStatus === "extracting").length,
    matching: orders.filter(o => o.apStatus === "matching").length,
    auditing: orders.filter(o => o.apStatus === "auditing").length,
    disputed: orders.filter(o => o.apStatus === "disputed").length,
    approved: orders.filter(o => o.apStatus === "approved").length,
    paid: orders.filter(o => o.apStatus === "paid").length,
    input_required: orders.filter(o => o.apStatus === "input_required").length,
    total: orders.length
  };

  const arCounts = {
    collecting: orders.filter(o => o.arStatus === "collecting").length,
    calculating: orders.filter(o => o.arStatus === "calculating").length,
    generated: orders.filter(o => o.arStatus === "generated").length,
    for_review: orders.filter(o => o.arStatus === "for_review").length,
    sent: orders.filter(o => o.arStatus === "sent").length,
    paid: orders.filter(o => o.arStatus === "paid").length,
    input_required: orders.filter(o => o.arStatus === "input_required").length,
    total: orders.length
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === "ap") {
      return apFilter === "all" || o.apStatus === apFilter;
    }
    return arFilter === "all" || o.arStatus === arFilter;
  });

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
                <h1 className="text-xl font-semibold">Sentie</h1>
                <p className="text-sm text-muted-foreground">3PL AP/AR on autopilot</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <div className={`w-2 h-2 rounded-full ${simulation.isRunning ? 'bg-chart-2 animate-pulse' : simulation.currentPhase === 'complete' ? 'bg-chart-2' : 'bg-muted-foreground'}`} />
                <span className="text-sm font-medium">
                  {simulation.currentPhase === "idle" ? "Ready" :
                    simulation.currentPhase === "complete" ? "Complete" :
                      simulation.isRunning ? `Processing ${simulation.currentPhase === "ap" ? `${AP_INVOICES.length} Invoices` : `${CUSTOMERS.length} Customers`}` : "Paused"}
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
                  <Play className="w-4 h-4 mr-2" />
                  Start Demo
                </Button>
              )}

              {simulation.isRunning && (
                <Button variant="secondary" onClick={pauseSimulation} data-testid="button-pause-demo">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}

              {!simulation.isRunning && simulation.currentPhase !== "idle" && simulation.currentPhase !== "complete" && (
                <Button onClick={resumeSimulation} data-testid="button-resume-demo">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}

              {(simulation.currentPhase !== "idle" || activities.length > 0) && (
                <Button variant="outline" onClick={resetSimulation} data-testid="button-reset-demo">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
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
              <FileText className="w-4 h-4" />
              Accounts Payable
              {apActivities.length > 0 && (
                <Badge variant="secondary" className="ml-1 min-w-[20px] h-5 text-xs">{apActivities.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ar" className="gap-2" data-testid="tab-ar">
              <DollarSign className="w-4 h-4" />
              Accounts Receivable
              {arActivities.length > 0 && (
                <Badge variant="secondary" className="ml-1 min-w-[20px] h-5 text-xs">{arActivities.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      AP Activity Stream
                      <Badge variant="outline" className="ml-2">Live</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityStream
                      activities={apActivities}
                      emptyMessage="Start the demo to see AP activities"
                      onAction={(activity) => {
                        setDraftToApprove(activity.shipmentId);
                      }}
                    />
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
                    <Package className="w-5 h-5 text-primary" />
                    AP Orders
                    <Badge variant="outline" className="ml-2">
                      {completedAPInvoices.size}/{AP_INVOICES.length} Invoices Audited
                    </Badge>
                  </CardTitle>
                  <StatusFilters
                    activeTab="ap"
                    apFilter={apFilter}
                    arFilter={arFilter}
                    onApFilterChange={setApFilter}
                    onArFilterChange={setArFilter}
                    apCounts={apCounts}
                    arCounts={arCounts}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ShipmentTable
                  shipments={filteredOrders}
                  activeTab="ap"
                  activities={activities}
                  onShipmentClick={setSelectedOrder}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      AR Activity Stream
                      <Badge variant="outline" className="ml-2">Live</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityStream
                      activities={arActivities}
                      emptyMessage="AR process starts after all carrier invoices are audited"
                      onAction={(activity) => {
                        setDraftToApprove(activity.shipmentId);
                      }}
                    />
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
                    <Package className="w-5 h-5 text-primary" />
                    AR Orders
                  </CardTitle>
                  <StatusFilters
                    activeTab="ar"
                    apFilter={apFilter}
                    arFilter={arFilter}
                    onApFilterChange={setApFilter}
                    onArFilterChange={setArFilter}
                    apCounts={apCounts}
                    arCounts={arCounts}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ShipmentTable
                  shipments={filteredOrders}
                  activeTab="ar"
                  activities={activities}
                  onShipmentClick={setSelectedOrder}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ShipmentDetailsDialog
        shipment={selectedOrder ? (orders.find(o => o.id === selectedOrder.id) || selectedOrder) : null}
        activities={activities}
        open={!!selectedOrder}
        onOpenChange={(open: boolean) => !open && setSelectedOrder(null)}
        onAction={(orderId: string) => {
          // Find the AP invoice or customer for this order
          const order = orders.find(o => o.id === orderId);
          if (order) {
            const entityId = completedAPInvoices.has(order.consolidatedApInvoiceId)
              ? order.customerId
              : order.consolidatedApInvoiceId;
            setDraftToApprove(entityId);
          }
        }}
        context={activeTab}
      />

      <EmailApprovalDialog
        open={!!draftToApprove}
        onOpenChange={(open: boolean) => !open && setDraftToApprove(null)}
        draft={draftToApprove ? (pendingDrafts[draftToApprove] || null) : null}
        onApprove={() => {
          if (draftToApprove) {
            handleApproveAction(draftToApprove);
            setDraftToApprove(null);
          }
        }}
        onCancel={() => setDraftToApprove(null)}
      />
    </div>
  );
}
