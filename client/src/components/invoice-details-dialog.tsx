import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, FileText, CheckCircle, Circle, Clock, DollarSign, Mail, MapPin, Calculator } from "lucide-react";
import type { Order, Activity, APStatus, ARStatus, ConsolidatedAPInvoice, ConsolidatedARInvoice, Customer } from "@shared/schema";

interface InvoiceDetailsDialogProps {
    invoice: ConsolidatedAPInvoice | ConsolidatedARInvoice | null;
    orders: Order[]; // Global list of orders to resolve line items
    customer?: Customer; // For AR invoices
    activities: Activity[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAction?: (invoiceId: string) => void;
    context: "ap" | "ar";
    pendingAction?: boolean;
}

// ─── Checklists ───────────────────────────────────────────────────────────────

const AP_CHECKLIST = [
    { id: "invoice_received", label: "Carrier Invoice Received", keywords: ["Invoice Received", "Carrier Invoice"] },
    { id: "data_extracted", label: "Line Items Extracted", keywords: ["Extract", "Parsed"] },
    { id: "order_matched", label: "Order Matched", keywords: ["Matching", "matched"] },
    { id: "rate_audited", label: "Rate Card Audited", keywords: ["Rate Card", "Rate Verified", "Verified", "rate"] },
    { id: "disputes_resolved", label: "Disputes Resolved", keywords: ["Dispute", "Credit", "Discrepancy"] },
    { id: "approved", label: "Approved for Payment", keywords: ["Audit Complete", "Approved", "approved"] },
];

const AR_CHECKLIST = [
    { id: "orders_collected", label: "Orders Collected", keywords: ["Orders Collected", "AR Job Opened"] },
    { id: "shipping_retrieved", label: "Shipping Costs Retrieved", keywords: ["Shipping Costs Retrieved"] },
    { id: "fees_calculated", label: "Fulfillment Fees Calculated", keywords: ["Fulfillment Fees Calculated", "Packaging & Storage"] },
    { id: "invoice_generated", label: "Invoice Generated", keywords: ["Invoice Generated"] },
    { id: "invoice_sent", label: "Invoice Sent", keywords: ["Invoice Sent"] },
    { id: "payment_received", label: "Payment Received", keywords: ["AR Complete"] },
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

export function InvoiceDetailsDialog({ invoice, orders, customer, activities, open, onOpenChange, onAction, context, pendingAction }: InvoiceDetailsDialogProps) {
    if (!invoice) return null;

    const invoiceId = invoice.id;
    const isAP = context === "ap";
    const apInvoice = isAP ? (invoice as ConsolidatedAPInvoice) : null;
    const arInvoice = !isAP ? (invoice as ConsolidatedARInvoice) : null;

    const statusConfig = isAP
        ? apStatusConfig[apInvoice!.status]
        : arStatusConfig[arInvoice!.status];

    const hasPendingAction = pendingAction;

    // Get activities related to this invoice
    const relevantActivities = useMemo(() => {
        return activities.filter(a => a.category === context && a.shipmentId === invoiceId);
    }, [activities, invoiceId, context]);

    const checklist = isAP ? AP_CHECKLIST : AR_CHECKLIST;

    // Determine checklist status
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

    // Extract documents
    const documents = useMemo(() => {
        const docs: { name: string; url: string }[] = [];
        if (invoice.documentUrl) {
            docs.push({
                name: isAP ? `${apInvoice?.carrier} Invoice` : `Customer Invoice`,
                url: invoice.documentUrl
            });
        }
        relevantActivities.forEach(a => {
            if (a.metadata?.document) {
                const doc = a.metadata.document as { name: string; url: string };
                if (!docs.some(d => d.url === doc.url)) {
                    docs.push(doc);
                }
            }
        });
        return docs;
    }, [relevantActivities, invoice, isAP, apInvoice]);

    // AR Dynamic Cost Visibility
    const arProgress = useMemo(() => {
        if (!arInvoice) return null;
        return {
            shippingRetrieved: relevantActivities.some(a => a.title === "Shipping Costs Retrieved"),
            feesCalculated: relevantActivities.some(a => a.title === "Fulfillment Fees Calculated"),
            packagingCalculated: relevantActivities.some(a => a.title === "Packaging & Storage"),
            invoiceGenerated: relevantActivities.some(a => a.type === "invoice_generated"),
            ordersCollected: relevantActivities.some(a => a.title === "Orders Collected"),
        };
    }, [arInvoice, relevantActivities]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {isAP ? <FileText className="w-5 h-5 text-primary" /> : <DollarSign className="w-5 h-5 text-primary" />}
                        {invoice.invoiceNumber}
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
                                                    {isAP ? "Review dispute email draft before sending to carrier" : "Review customer invoice email before sending"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => onAction?.(invoiceId)}>
                                            Review Draft
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Invoice Info & Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Info summary */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Invoice Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">{isAP ? "Carrier" : "Customer"}</span>
                                        <div className="font-medium text-base">
                                            {isAP ? apInvoice?.carrier : customer?.name}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Billing Period</span>
                                        <div className="font-medium">{invoice.billingPeriod}</div>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span className="text-muted-foreground">Total Amount</span>
                                        <span className="text-lg">${invoice.totalAmount.toFixed(2)}</span>
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

                            {/* Progress Checklist */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {isAP ? "AP Audit Progress" : "AR Billing Progress"}
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

                        {/* Line Items / Orders Breakdown */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    {isAP ? "Shipped Line Items" : "Orders Fulfilled Breakdown"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isAP && apInvoice ? (
                                    <Table className="text-sm">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tracking</TableHead>
                                                <TableHead>Order</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Weight</TableHead>
                                                <TableHead className="text-right">Billed</TableHead>
                                                <TableHead className="text-right">Variance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {apInvoice.lineItems.map((li, idx) => {
                                                const matchingOrder = orders.find(o => o.id === li.orderId);

                                                const isMatched = relevantActivities.some(a => a.type === "order_matched" && a.description.includes(li.trackingNumber));
                                                const isAuditing = relevantActivities.some(a => a.title === "Rate Card Audit");
                                                const hasDiscrepancy = relevantActivities.some(a => a.type === "discrepancy_found" && a.title.includes(li.trackingNumber.slice(-4)));
                                                const isAuditComplete = relevantActivities.some(a => a.type === "audit_complete");

                                                const isExtracting = !relevantActivities.some(a => a.type === "data_extracted");
                                                const isMatching = !isExtracting && !isMatched;

                                                const hasViolation = hasDiscrepancy;
                                                const isVerified = (isAuditing && (li.variance || 0) === 0) || (isAuditComplete && !hasDiscrepancy);

                                                return (
                                                    <TableRow key={idx} className={hasViolation ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                                                        <TableCell className="font-mono text-xs">{li.trackingNumber}</TableCell>
                                                        <TableCell>{!isMatched ? "-" : (matchingOrder?.orderNumber || li.orderId)}</TableCell>
                                                        <TableCell>
                                                            {isExtracting ? (
                                                                <span className="text-muted-foreground italic">Parsing...</span>
                                                            ) : isMatching ? (
                                                                <span className="text-muted-foreground italic">Matching...</span>
                                                            ) : hasViolation ? (
                                                                <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">Exception</Badge>
                                                            ) : isVerified ? (
                                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-emerald-200 text-emerald-600">Verified</Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground italic">Auditing...</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">{li.weight} lbs</TableCell>
                                                        <TableCell className="text-right">${li.totalCharge.toFixed(2)}</TableCell>
                                                        <TableCell className={`text-right ${hasViolation ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                                            {hasViolation ? `+$${li.variance?.toFixed(2)}` : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : arInvoice ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Table className="text-sm">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order</TableHead>
                                                    <TableHead>Tracking</TableHead>
                                                    <TableHead className="text-right">Total Fee</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {arProgress?.ordersCollected ? (
                                                    arInvoice.orderIds.map((orderId, idx) => {
                                                        const order = orders.find(o => o.id === orderId);
                                                        if (!order) return null;
                                                        const totalWarehouse = order.warehouseFees.fulfillmentFee + order.warehouseFees.itemPickFee + order.warehouseFees.packagingMaterials + order.warehouseFees.storageCost;
                                                        return (
                                                            <TableRow key={idx}>
                                                                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                                                <TableCell className="font-mono text-xs text-muted-foreground">{order.trackingNumber.slice(-8)}</TableCell>
                                                                <TableCell className="text-right">${(totalWarehouse + order.shippingCost).toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">
                                                            Collecting fulfilled orders...
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>

                                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                            <h4 className="font-medium text-sm flex items-center gap-2 mb-4">
                                                <Calculator className="w-4 h-4 text-primary" /> Cost Aggregation
                                            </h4>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Fulfillment (Base)</span>
                                                <span>{arProgress?.feesCalculated ? `$${arInvoice.totalFulfillmentFees.toFixed(2)}` : <span className="text-[10px] italic text-muted-foreground">Calculating...</span>}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Item Pick Fees</span>
                                                <span>{arProgress?.feesCalculated ? `$${arInvoice.totalItemPickFees.toFixed(2)}` : "-"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Packaging Materials</span>
                                                <span>{arProgress?.packagingCalculated ? `$${arInvoice.totalPackagingMaterials.toFixed(2)}` : "-"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Storage Fees</span>
                                                <span>{arProgress?.packagingCalculated ? `$${arInvoice.totalStorage.toFixed(2)}` : "-"}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Warehouse Subtotal</span>
                                                <span>{arProgress?.packagingCalculated ? `$${(arInvoice.totalFulfillmentFees + arInvoice.totalItemPickFees + arInvoice.totalPackagingMaterials + arInvoice.totalStorage).toFixed(2)}` : "-"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Pass-Through Shipping</span>
                                                <span>{arProgress?.shippingRetrieved ? `$${arInvoice.totalShippingCost.toFixed(2)}` : <span className="text-[10px] italic text-muted-foreground">Retrieving...</span>}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Cost Subtotal</span>
                                                <span>{arProgress?.invoiceGenerated ? `$${arInvoice.subtotal.toFixed(2)}` : "-"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-primary">
                                                <span>Management Fee ({customer?.managementFeePercent}%)</span>
                                                <span>{arProgress?.invoiceGenerated ? `$${arInvoice.managementFee.toFixed(2)}` : "-"}</span>
                                            </div>
                                            <Separator className="bg-primary/20" />
                                            <div className="flex justify-between font-bold text-base">
                                                <span>Total Invoice Amount</span>
                                                <span>{arProgress?.invoiceGenerated ? `$${arInvoice.totalAmount.toFixed(2)}` : <span className="text-[10px] italic text-muted-foreground">Pending Generation</span>}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
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
                                    <p className="text-sm text-muted-foreground py-4 text-center">No activities yet for this invoice</p>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
