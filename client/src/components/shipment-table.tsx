import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order, APStatus, ARStatus, Activity } from "@shared/schema";

const apStatusConfig: Record<APStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  received: { label: "Received", variant: "secondary" },
  extracting: { label: "Extracting", variant: "outline" },
  matching: { label: "Matching", variant: "outline" },
  auditing: { label: "Auditing", variant: "outline" },
  disputed: { label: "Disputed", variant: "destructive" },
  approved: { label: "Approved", variant: "default" },
  paid: { label: "Paid", variant: "default" },
  input_required: { label: "Input Required", variant: "destructive" }
};

const arStatusConfig: Record<ARStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  collecting: { label: "Collecting", variant: "secondary" },
  calculating: { label: "Calculating", variant: "outline" },
  generated: { label: "Generated", variant: "outline" },
  for_review: { label: "For Review", variant: "outline" },
  sent: { label: "Sent", variant: "default" },
  paid: { label: "Paid", variant: "default" },
  input_required: { label: "Input Required", variant: "destructive" }
};

interface ShipmentTableProps {
  shipments: Order[];
  activeTab: "ap" | "ar";
  activities: Activity[];
  onShipmentClick?: (order: Order) => void;
}

export function ShipmentTable({ shipments, activeTab, activities, onShipmentClick }: ShipmentTableProps) {
  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No orders match the selected filter</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            {activeTab === "ap" ? (
              <>
                <TableHead>Recipient</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead className="text-right">Shipping Cost</TableHead>
              </>
            ) : (
              <>
                <TableHead>Recipient</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Warehouse</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </>
            )}
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((order) => {
            const statusConfig = activeTab === "ap"
              ? apStatusConfig[order.apStatus]
              : arStatusConfig[order.arStatus];

            const warehouseTotal =
              order.warehouseFees.fulfillmentFee +
              order.warehouseFees.itemPickFee +
              order.warehouseFees.packagingMaterials +
              order.warehouseFees.storageCost;

            const orderTotal = warehouseTotal + order.shippingCost;

            return (
              <TableRow
                key={order.id}
                data-testid={`shipment-row-${order.id}`}
                className={onShipmentClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onShipmentClick?.(order)}
              >
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                {activeTab === "ap" ? (
                  <>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{order.recipientName}</div>
                        <div className="text-muted-foreground">{order.shipToAddress}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.carrier}</TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        ...{order.trackingNumber.slice(-6)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.shippingCost.toFixed(2)}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{order.recipientName}</div>
                        <div className="text-muted-foreground">{order.shipToAddress}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {order.customerId === "CUST-001" ? "TechStore Inc" : "GreenLeaf Organics"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">${warehouseTotal.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{order.itemCount} items</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${orderTotal.toFixed(2)}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-center">
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
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
