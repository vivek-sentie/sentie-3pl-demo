# 3PL Sample Data: 2 AP Invoices + 2 AR Invoices

## Context
- **3PL Company**: Sentie Fulfillment (warehouse in San Francisco, CA)
- **Billing Period**: Week of Feb 24 – Mar 2, 2026
- **Carriers Used**: UPS, FedEx

---

## Customers

### Customer 1
| Field | Value |
|:---|:---|
| Customer ID | `CUST-001` |
| Company Name | TechStore Inc |
| Contact Name | James Wu |
| Contact Email | jwu@techstore.com |
| Billing Address | 500 Market St, Suite 300, San Francisco, CA 94105 |
| Payment Terms | Net 30 |

### Customer 2
| Field | Value |
|:---|:---|
| Customer ID | `CUST-002` |
| Company Name | GreenLeaf Organics |
| Contact Name | Maria Santos |
| Contact Email | maria@greenleaforganics.com |
| Billing Address | 2200 N Central Ave, Phoenix, AZ 85004 |
| Payment Terms | Net 15 |

---

## Orders (8 total, across both customers)

### TechStore Inc Orders (5 orders)

#### Order 1
| Field | Value |
|:---|:---|
| Order ID | `ORD-1001` |
| Order Number | AV-2026-4401 |
| Customer | TechStore Inc (`CUST-001`) |
| Recipient | David Chen |
| Ship-To Address | 4521 N 7th Ave, Phoenix, AZ 85013 |
| Items | 1× Wireless Mouse (SKU: WM-200), 1× USB-C Hub (SKU: HUB-31) |
| Item Count | 2 |
| Box Size | 12×10×6 in |
| Actual Weight | 2.4 lbs |
| Carrier | UPS |
| Service Level | Ground |
| Tracking Number | 1Z999AA10412345671 |
| Ship Zone | 5 (SF → Phoenix) |
| Shipping Cost (from AP) | $11.42 |
| Warehouse Pick & Pack | $3.50 (base $2.50 + $0.50/item × 2) |
| Packing Materials | $1.20 |
| Storage (3 days × $0.15/day) | $0.45 |
| **Total Warehouse Fees** | **$5.15** |
| Ship Date | 2026-02-25 |

#### Order 2
| Field | Value |
|:---|:---|
| Order ID | `ORD-1002` |
| Order Number | AV-2026-4402 |
| Customer | TechStore Inc (`CUST-001`) |
| Recipient | Sarah Kim |
| Ship-To Address | 789 Peachtree St NE, Atlanta, GA 30308 |
| Items | 1× Mechanical Keyboard (SKU: KB-MX1) |
| Item Count | 1 |
| Box Size | 18×8×4 in |
| Actual Weight | 3.1 lbs |
| Carrier | UPS |
| Service Level | Ground |
| Tracking Number | 1Z999AA10412345672 |
| Ship Zone | 7 (SF → Atlanta) |
| Shipping Cost (from AP) | $15.87 |
| Warehouse Pick & Pack | $3.00 (base $2.50 + $0.50/item × 1) |
| Packing Materials | $1.50 |
| Storage (1 day × $0.15/day) | $0.15 |
| **Total Warehouse Fees** | **$4.65** |
| Ship Date | 2026-02-25 |

#### Order 3
| Field | Value |
|:---|:---|
| Order ID | `ORD-1003` |
| Order Number | AV-2026-4410 |
| Customer | TechStore Inc (`CUST-001`) |
| Recipient | Mike Torres |
| Ship-To Address | 1422 Elm St, Dallas, TX 75201 |
| Items | 1× Laptop Stand (SKU: LS-PRO), 1× Monitor Riser (SKU: MR-100), 1× Cable Kit (SKU: CK-50) |
| Item Count | 3 |
| Box Size | 24×16×8 in |
| Actual Weight | 8.6 lbs |
| Carrier | FedEx |
| Service Level | Ground |
| Tracking Number | 7489401523456001 |
| Ship Zone | 6 (SF → Dallas) |
| Shipping Cost (from AP) | $18.93 |
| Warehouse Pick & Pack | $4.00 (base $2.50 + $0.50/item × 3) |
| Packing Materials | $2.10 |
| Storage (5 days × $0.15/day) | $0.75 |
| **Total Warehouse Fees** | **$6.85** |
| Ship Date | 2026-02-27 |

#### Order 4
| Field | Value |
|:---|:---|
| Order ID | `ORD-1004` |
| Order Number | AV-2026-4418 |
| Customer | TechStore Inc (`CUST-001`) |
| Recipient | Lisa Park |
| Ship-To Address | 950 Mason St, San Francisco, CA 94108 |
| Items | 1× Webcam HD (SKU: WC-720) |
| Item Count | 1 |
| Box Size | 8×6×4 in |
| Actual Weight | 0.8 lbs |
| Carrier | UPS |
| Service Level | Ground |
| Tracking Number | 1Z999AA10412345673 |
| Ship Zone | 2 (SF → SF local) |
| Shipping Cost (from AP) | $7.23 |
| Warehouse Pick & Pack | $3.00 (base $2.50 + $0.50/item × 1) |
| Packing Materials | $0.80 |
| Storage (1 day × $0.15/day) | $0.15 |
| **Total Warehouse Fees** | **$3.95** |
| Ship Date | 2026-02-28 |

#### Order 5
| Field | Value |
|:---|:---|
| Order ID | `ORD-1005` |
| Order Number | AV-2026-4425 |
| Customer | TechStore Inc (`CUST-001`) |
| Recipient | Robert Hayes |
| Ship-To Address | 225 Broadway, New York, NY 10007 |
| Items | 2× USB-C Cable (SKU: UC-6FT), 1× Power Adapter (SKU: PA-65W) |
| Item Count | 3 |
| Box Size | 10×8×4 in |
| Actual Weight | 1.5 lbs |
| Carrier | FedEx |
| Service Level | Ground |
| Tracking Number | 7489401523456002 |
| Ship Zone | 8 (SF → NYC) |
| Shipping Cost (from AP) | $14.61 |
| Warehouse Pick & Pack | $4.00 (base $2.50 + $0.50/item × 3) |
| Packing Materials | $1.00 |
| Storage (2 days × $0.15/day) | $0.30 |
| **Total Warehouse Fees** | **$5.30** |
| Ship Date | 2026-02-28 |

---

### GreenLeaf Organics Orders (3 orders)

#### Order 6
| Field | Value |
|:---|:---|
| Order ID | `ORD-2001` |
| Order Number | AV-2026-4405 |
| Customer | GreenLeaf Organics (`CUST-002`) |
| Recipient | Angela Price |
| Ship-To Address | 8834 Sunset Blvd, Los Angeles, CA 90069 |
| Items | 1× Organic Tea Sampler (SKU: OT-12PK), 1× Honey Jar (SKU: HN-16OZ) |
| Item Count | 2 |
| Box Size | 12×10×6 in |
| Actual Weight | 3.2 lbs |
| Carrier | UPS |
| Service Level | Ground |
| Tracking Number | 1Z999AA10412345674 |
| Ship Zone | 3 (SF → LA) |
| Shipping Cost (from AP) | $9.18 |
| Warehouse Pick & Pack | $3.50 (base $2.50 + $0.50/item × 2) |
| Packing Materials | $1.80 (insulated liner) |
| Storage (2 days × $0.15/day) | $0.30 |
| **Total Warehouse Fees** | **$5.60** |
| Ship Date | 2026-02-26 |

#### Order 7
| Field | Value |
|:---|:---|
| Order ID | `ORD-2002` |
| Order Number | AV-2026-4412 |
| Customer | GreenLeaf Organics (`CUST-002`) |
| Recipient | Tom Sullivan |
| Ship-To Address | 1900 W Madison St, Chicago, IL 60612 |
| Items | 3× Organic Protein Bars (SKU: PB-CASE12) |
| Item Count | 3 |
| Box Size | 16×12×10 in |
| Actual Weight | 12.5 lbs |
| Carrier | FedEx |
| Service Level | Ground |
| Tracking Number | 7489401523456003 |
| Ship Zone | 7 (SF → Chicago) |
| Shipping Cost (from AP) | $22.14 |
| Warehouse Pick & Pack | $4.00 (base $2.50 + $0.50/item × 3) |
| Packing Materials | $2.50 |
| Storage (4 days × $0.15/day) | $0.60 |
| **Total Warehouse Fees** | **$7.10** |
| Ship Date | 2026-02-27 |

#### Order 8
| Field | Value |
|:---|:---|
| Order ID | `ORD-2003` |
| Order Number | AV-2026-4420 |
| Customer | GreenLeaf Organics (`CUST-002`) |
| Recipient | Jessica Lin |
| Ship-To Address | 4200 E Camelback Rd, Phoenix, AZ 85018 |
| Items | 1× Vitamin Bundle (SKU: VB-30DAY) |
| Item Count | 1 |
| Box Size | 8×6×4 in |
| Actual Weight | 1.1 lbs |
| Carrier | UPS |
| Service Level | Ground |
| Tracking Number | 1Z999AA10412345675 |
| Ship Zone | 5 (SF → Phoenix) |
| Shipping Cost (from AP) | $8.95 |
| Warehouse Pick & Pack | $3.00 (base $2.50 + $0.50/item × 1) |
| Packing Materials | $0.80 |
| Storage (1 day × $0.15/day) | $0.15 |
| **Total Warehouse Fees** | **$3.95** |
| Ship Date | 2026-02-28 |

---

## AP Invoice 1: UPS Weekly Consolidated

| Field | Value |
|:---|:---|
| AP Invoice ID | `AP-INV-001` |
| Carrier | UPS |
| Invoice Number | UPS-9201-2026-W09 |
| Invoice Date | 2026-03-01 |
| Billing Period | Feb 24 – Mar 1, 2026 |
| Account Number | 9201X7 |
| Document URL | `/demo/documents/ups_consolidated_invoice.pdf` |
| Status | `received` |

### Line Items (5 parcels on this invoice)

| # | Tracking Number | Order ID | Recipient | Weight | Zone | Base Charge | Fuel Surcharge (8.5%) | Residential Surcharge | Total Charge | Audit Status |
|:--|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | 1Z999AA10412345671 | ORD-1001 | David Chen | 2.4 lbs | 5 | $9.80 | $0.83 | $0.00 | **$11.42**¹ | ⚠️ Disputed |
| 2 | 1Z999AA10412345672 | ORD-1002 | Sarah Kim | 3.1 lbs | 7 | $13.20 | $1.12 | $1.55 | **$15.87** | Verified |
| 3 | 1Z999AA10412345673 | ORD-1004 | Lisa Park | 0.8 lbs | 2 | $6.10 | $0.52 | $0.00 | **$7.23**² | ⚠️ Disputed |
| 4 | 1Z999AA10412345674 | ORD-2001 | Angela Price | 3.2 lbs | 3 | $7.60 | $0.65 | $0.93 | **$9.18** | Verified |
| 5 | 1Z999AA10412345675 | ORD-2003 | Jessica Lin | 1.1 lbs | 5 | $7.50 | $0.64 | $0.81 | **$8.95** | Verified |

| | |
|:---|:---|
| **Subtotal** | **$52.65** |
| **Total Surcharges** | **$7.05** |
| **Invoice Total** | **$52.65** |

> ¹ **Dispute**: UPS billed weight as 3.0 lbs (dimensional), but actual weight is 2.4 lbs. Expected charge: $10.58. Variance: +$0.84.
>
> ² **Dispute**: UPS charged Zone 3 rate ($7.23), but delivery address is in SF (should be Zone 2, $6.62). Variance: +$0.61.

---

## AP Invoice 2: FedEx Weekly Consolidated

| Field | Value |
|:---|:---|
| AP Invoice ID | `AP-INV-002` |
| Carrier | FedEx |
| Invoice Number | FX-7834-2026-W09 |
| Invoice Date | 2026-03-01 |
| Billing Period | Feb 24 – Mar 1, 2026 |
| Account Number | 4892-7341-0 |
| Document URL | `/demo/documents/fedex_consolidated_invoice.pdf` |
| Status | `received` |

### Line Items (3 parcels on this invoice)

| # | Tracking Number | Order ID | Recipient | Weight | Zone | Base Charge | Fuel Surcharge (9.0%) | Residential Surcharge | Oversize Surcharge | Total Charge | Audit Status |
|:--|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | 7489401523456001 | ORD-1003 | Mike Torres | 8.6 lbs | 6 | $15.90 | $1.43 | $1.60 | $0.00 | **$18.93** | Verified |
| 2 | 7489401523456002 | ORD-1005 | Robert Hayes | 1.5 lbs | 8 | $12.10 | $1.09 | $1.42 | $0.00 | **$14.61** | Verified |
| 3 | 7489401523456003 | ORD-2002 | Tom Sullivan | 12.5 lbs | 7 | $18.40 | $1.66 | $2.08 | $0.00 | **$22.14** | Verified |

| | |
|:---|:---|
| **Subtotal** | **$55.68** |
| **Total Surcharges** | **$9.28** |
| **Invoice Total** | **$55.68** |

No disputes on this invoice.

---

## AR Invoice 1: TechStore Inc (5 orders)

| Field | Value |
|:---|:---|
| AR Invoice ID | `AR-INV-001` |
| Customer | TechStore Inc (`CUST-001`) |
| Contact | James Wu (jwu@techstore.com) |
| Invoice Number | SF-AR-2026-0301-TS |
| Invoice Date | 2026-03-02 |
| Billing Period | Feb 24 – Mar 1, 2026 |
| Payment Terms | Net 30 |
| Due Date | 2026-04-01 |
| Document URL | `/demo/documents/ar_invoice_techstore.pdf` |
| Status | `preparing` |

### Line Items

| Order # | Recipient | Carrier | Shipping Cost | Pick & Pack | Packing | Storage | Order Total |
|:---|:---|:---|:---|:---|:---|:---|:---|
| AV-2026-4401 | David Chen, Phoenix AZ | UPS | $11.42 | $3.50 | $1.20 | $0.45 | **$16.57** |
| AV-2026-4402 | Sarah Kim, Atlanta GA | UPS | $15.87 | $3.00 | $1.50 | $0.15 | **$20.52** |
| AV-2026-4410 | Mike Torres, Dallas TX | FedEx | $18.93 | $4.00 | $2.10 | $0.75 | **$25.78** |
| AV-2026-4418 | Lisa Park, SF CA | UPS | $7.23 | $3.00 | $0.80 | $0.15 | **$11.18** |
| AV-2026-4425 | Robert Hayes, NYC NY | FedEx | $14.61 | $4.00 | $1.00 | $0.30 | **$19.91** |

| | |
|:---|:---|
| **Total Shipping** | **$68.06** |
| **Total Warehouse Fees** | **$25.90** |
| **Subtotal** | **$93.96** |
| **Service Fee (15% markup)** | **$14.09** |
| **Invoice Total** | **$108.05** |

### Source AP Invoices Referenced
- AP-INV-001 (UPS): Orders 4401, 4402, 4418 → $34.52 shipping
- AP-INV-002 (FedEx): Orders 4410, 4425 → $33.54 shipping

---

## AR Invoice 2: GreenLeaf Organics (3 orders)

| Field | Value |
|:---|:---|
| AR Invoice ID | `AR-INV-002` |
| Customer | GreenLeaf Organics (`CUST-002`) |
| Contact | Maria Santos (maria@greenleaforganics.com) |
| Invoice Number | SF-AR-2026-0301-GL |
| Invoice Date | 2026-03-02 |
| Billing Period | Feb 24 – Mar 1, 2026 |
| Payment Terms | Net 15 |
| Due Date | 2026-03-17 |
| Document URL | `/demo/documents/ar_invoice_greenleaf.pdf` |
| Status | `preparing` |

### Line Items

| Order # | Recipient | Carrier | Shipping Cost | Pick & Pack | Packing | Storage | Order Total |
|:---|:---|:---|:---|:---|:---|:---|:---|
| AV-2026-4405 | Angela Price, LA CA | UPS | $9.18 | $3.50 | $1.80 | $0.30 | **$14.78** |
| AV-2026-4412 | Tom Sullivan, Chicago IL | FedEx | $22.14 | $4.00 | $2.50 | $0.60 | **$29.24** |
| AV-2026-4420 | Jessica Lin, Phoenix AZ | UPS | $8.95 | $3.00 | $0.80 | $0.15 | **$12.90** |

| | |
|:---|:---|
| **Total Shipping** | **$40.27** |
| **Total Warehouse Fees** | **$16.65** |
| **Subtotal** | **$56.92** |
| **Service Fee (12% markup)** | **$6.83** |
| **Invoice Total** | **$63.75** |

### Source AP Invoices Referenced
- AP-INV-001 (UPS): Orders 4405, 4420 → $18.13 shipping
- AP-INV-002 (FedEx): Order 4412 → $22.14 shipping

---

## Cross-Reference Summary

| AP Invoice | Orders on Invoice | Customers Affected |
|:---|:---|:---|
| AP-INV-001 (UPS, $52.65) | ORD-1001, 1002, 1004, 2001, 2003 | TechStore (3), GreenLeaf (2) |
| AP-INV-002 (FedEx, $55.68) | ORD-1003, 1005, 2002 | TechStore (2), GreenLeaf (1) |

| AR Invoice | Orders Billed | AP Invoices Referenced |
|:---|:---|:---|
| AR-INV-001 (TechStore, $108.05) | ORD-1001–1005 | AP-INV-001, AP-INV-002 |
| AR-INV-002 (GreenLeaf, $63.75) | ORD-2001–2003 | AP-INV-001, AP-INV-002 |

### Built-in Dispute Scenarios (for simulation)
1. **ORD-1001 (UPS)**: Dimensional weight vs actual weight dispute. UPS billed 3.0 lbs, actual is 2.4 lbs. Variance: $0.84.
2. **ORD-1004 (UPS)**: Zone misclassification. UPS charged Zone 3 rate for an SF-to-SF delivery that should be Zone 2. Variance: $0.61.
