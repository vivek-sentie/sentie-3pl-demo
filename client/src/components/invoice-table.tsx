import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { APStatus, ARStatus, ConsolidatedAPInvoice, ConsolidatedARInvoice, Customer } from "@shared/schema";

interface InvoiceTableProps {
    invoices: (ConsolidatedAPInvoice | ConsolidatedARInvoice)[];
    consumers?: Customer[]; // For AR invoices to lookup customer details
    activeTab: "ap" | "ar";
    onInvoiceClick: (invoiceId: string) => void;
}

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

export function InvoiceTable({ invoices, consumers, activeTab, onInvoiceClick }: InvoiceTableProps) {
    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="w-8 h-8 mb-4 opacity-20" />
                <p>No invoices found matching the current filters.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>{activeTab === "ap" ? "Carrier" : "Customer"}</TableHead>
                        <TableHead>Billing Period</TableHead>
                        <TableHead className="text-right">{activeTab === "ap" ? "Line Items" : "Orders Fulfilled"}</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => {
                        let entityName = "";
                        let itemCount = 0;
                        let statusConfig;

                        if (activeTab === "ap") {
                            const apInv = invoice as ConsolidatedAPInvoice;
                            entityName = apInv.carrier;
                            itemCount = apInv.lineItems.length;
                            statusConfig = apStatusConfig[apInv.status];
                        } else {
                            const arInv = invoice as ConsolidatedARInvoice;
                            const customer = consumers?.find(c => c.id === arInv.customerId);
                            entityName = customer?.name || arInv.customerId;
                            itemCount = arInv.orderIds.length;
                            statusConfig = arStatusConfig[arInv.status];
                        }

                        return (
                            <TableRow
                                key={invoice.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => onInvoiceClick(invoice.id)}
                            >
                                <TableCell className="font-medium text-primary">
                                    {invoice.invoiceNumber}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        {entityName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground text-sm">
                                        {invoice.billingPeriod}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {itemCount}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ${invoice.totalAmount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusConfig?.variant || "outline"} className="flex items-center gap-1 w-fit">
                                        {statusConfig?.variant === "outline" ? (
                                            <Clock className="w-3 h-3 animate-pulse text-muted-foreground" />
                                        ) : statusConfig?.variant === "destructive" ? (
                                            <AlertCircle className="w-3 h-3" />
                                        ) : (
                                            <CheckCircle className="w-3 h-3" />
                                        )}
                                        {statusConfig?.label || invoice.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
