import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, FileText, CheckCircle, Circle, Clock, DollarSign, AlertTriangle, Mail, Calculator, MapPin } from "lucide-react";
import type { Order, Activity, APStatus, ARStatus } from "@shared/schema";

interface ShipmentDetailsDialogProps {
    shipment: Order | null;
    activities: Activity[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAction?: (orderId: string) => void;
    context: "ap" | "ar";
}

// ─── AP Checklist ─────────────────────────────────────────────────────────────

const AP_CHECKLIST = [
    { id: "invoice_received", label: "Carrier Invoice Received", keywords: ["Invoice Received", "Carrier Invoice"] },
    { id: "data_extracted", label: "Line Items Extracted", keywords: ["Extract", "Parsed"] },
    { id: "order_matched", label: "Order Matched", keywords: ["Matching", "matched"] },
    { id: "rate_audited", label: "Rate Card Audited", keywords: ["Rate Card", "Rate Verified", "Verified", "rate"] },
    { id: "disputes_resolved", label: "Disputes Resolved", keywords: ["Dispute", "Credit", "Discrepancy"] },
    { id: "approved", label: "Approved for Payment", keywords: ["Audit Complete", "Approved", "approved"] },
];

// ─── AR Checklist ─────────────────────────────────────────────────────────────

const AR_CHECKLIST = [
    { id: "orders_collected", label: "Orders Collected", keywords: ["AR Job", "Orders Collected"] },
    { id: "shipping_retrieved", label: "Shipping Costs Retrieved", keywords: ["Shipping Costs"] },
    { id: "fees_calculated", label: "Fulfillment Fees Calculated", keywords: ["Fulfillment Fees", "Packaging", "Storage"] },
    { id: "invoice_generated", label: "Invoice Generated", keywords: ["Invoice Generated"] },
    { id: "invoice_sent", label: "Invoice Sent", keywords: ["Invoice Sent", "Invoice Email"] },
    { id: "payment_received", label: "Payment Received", keywords: ["AR Complete", "Payment"] },
];

const apStatusConfig: Record<APStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    received: { label: "Received", variant: "secondary" },
    extracting: { label: "Extracting", variant: "outline" },
    matching: { label: "Matching", variant: "outline" },
    auditing: { label: "Auditing", variant: "outline" },
    disputed: { label: "Disputed", variant: "destructive" },
    approved: { label: "Approved", variant: "default" },
    paid: { label: "Paid", variant: "default" },
    input_required: { label: "Input Required", variant: "destructive" },
};

const arStatusConfig: Record<ARStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    collecting: { label: "Collecting", variant: "secondary" },
    calculating: { label: "Calculating", variant: "outline" },
    generated: { label: "Generated", variant: "outline" },
    for_review: { label: "For Review", variant: "outline" },
    sent: { label: "Sent", variant: "default" },
    paid: { label: "Paid", variant: "default" },
    input_required: { label: "Input Required", variant: "destructive" },
};

export function ShipmentDetailsDialog({ shipment, activities, open, onOpenChange, onAction, context }: ShipmentDetailsDialogProps) {
    if (!shipment) return null;

    // Get activities related to this order's AP invoice or customer
    const relevantActivities = useMemo(() => {
        if (context === "ap") {
            return activities.filter(a => a.category === "ap" && a.shipmentId === shipment.consolidatedApInvoiceId);
        }
        return activities.filter(a => a.category === "ar" && a.shipmentId === shipment.customerId);
    }, [activities, shipment, context]);

    const checklist = context === "ap" ? AP_CHECKLIST : AR_CHECKLIST;
    const statusConfig = context === "ap" ? apStatusConfig[shipment.apStatus] : arStatusConfig[shipment.arStatus];
    const hasPendingAction = !!shipment.pendingAction;

    // Determine which checklist items are active
    const checklistStatus = useMemo(() => {
        return checklist.map(item => {
            const isComplete = item.keywords.some(kw =>
                relevantActivities.some(a =>
                    a.title.toLowerCase().includes(kw.toLowerCase()) ||
                    a.description.toLowerCase().includes(kw.toLowerCase())
                )
            );
            return { ...item, isComplete };
        });
    }, [checklist, relevantActivities]);

    const warehouseTotal =
        shipment.warehouseFees.fulfillmentFee +
        shipment.warehouseFees.itemPickFee +
        shipment.warehouseFees.packagingMaterials +
        shipment.warehouseFees.storageCost;

    const orderTotal = warehouseTotal + shipment.shippingCost;

    // Find documents in activities
    const documents = useMemo(() => {
        const docs: { name: string; url: string }[] = [];
        relevantActivities.forEach(a => {
            if (a.metadata?.document) {
                const doc = a.metadata.document as { name: string; url: string };
                if (!docs.some(d => d.url === doc.url)) {
                    docs.push(doc);
                }
            }
        });
        return docs;
    }, [relevantActivities]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-primary" />
                        Order {shipment.orderNumber}
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-100px)]">
                    <div className="space-y-6 p-1">

                        {/* Pending Action Banner */}
                        {hasPendingAction && (
                            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-amber-600" />
                                            <div>
                                                <p className="font-medium text-amber-900 dark:text-amber-100">Review Required</p>
                                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                                    {context === "ap" ? "Review dispute email draft before sending to carrier" : "Review customer invoice email before sending"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => onAction?.(shipment.id)}>
                                            Review Draft
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Details + Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Order Info */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Order Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Recipient</span>
                                        <div className="font-medium">{shipment.recipientName}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Ship To</span>
                                        <div className="font-medium">{shipment.shipToAddress}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Customer</span>
                                        <div className="font-medium">
                                            {shipment.customerId === "CUST-001" ? "TechStore Inc" : "GreenLeaf Organics"}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-muted-foreground">Items ({shipment.itemCount})</span>
                                        {shipment.items.map((item, idx) => (
                                            <div key={idx} className="text-xs mt-1">
                                                {item.quantity}× {item.description}
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Carrier</span>
                                        <span className="font-medium">{shipment.carrier} {shipment.serviceLevel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tracking</span>
                                        <span className="font-mono text-xs">...{shipment.trackingNumber.slice(-6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Weight</span>
                                        <span>{shipment.weight} lbs</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {documents.length > 0 ? (
                                        <div className="space-y-2">
                                            {documents.map((doc, idx) => (
                                                <a
                                                    key={idx}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm text-primary hover:underline"
                                                >
                                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                                    {doc.name}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-4 text-center">No documents yet</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Checklist */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {context === "ap" ? "AP Audit Progress" : "AR Billing Progress"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {checklistStatus.map((item) => (
                                            <div key={item.id} className="flex items-center gap-2">
                                                {item.isComplete ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                                                )}
                                                <span className={`text-sm ${item.isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Financials */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    {context === "ap" ? "Shipping Costs (AP)" : "Charge Breakdown (AR)"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {context === "ap" ? (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Carrier</span>
                                            <span>{shipment.carrier}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Billed Weight</span>
                                            <span>{shipment.weight} lbs (Zone {shipment.zone})</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping Charge</span>
                                            <span className="font-medium">${shipment.shippingCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Fulfillment Fee</span>
                                            <span>${shipment.warehouseFees.fulfillmentFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Item Pick Fee ({shipment.itemCount} items)</span>
                                            <span>${shipment.warehouseFees.itemPickFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Packaging Materials</span>
                                            <span>${shipment.warehouseFees.packagingMaterials.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Storage ({shipment.warehouseFees.storageDays} days)</span>
                                            <span>${shipment.warehouseFees.storageCost.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Warehouse Subtotal</span>
                                            <span className="font-medium">${warehouseTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping (pass-through)</span>
                                            <span>${shipment.shippingCost.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-medium">
                                            <span>Order Total</span>
                                            <span>${orderTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity Timeline */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Activity Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {relevantActivities.length > 0 ? (
                                    <div className="space-y-3">
                                        {[...relevantActivities].reverse().map((activity) => (
                                            <div key={activity.id} className="flex gap-3 text-sm">
                                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{activity.title}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {activity.timestamp.toLocaleTimeString("en-US", {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                                hour12: true,
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                                                    {activity.metadata?.document && (
                                                        <a
                                                            href={(activity.metadata.document as { url: string }).url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            {(activity.metadata.document as { name: string }).name}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center">No activities yet for this order</p>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
