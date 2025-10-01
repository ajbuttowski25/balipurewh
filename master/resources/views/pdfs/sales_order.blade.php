<!DOCTYPE html>
<html>
<head>
    <title>Customer Order Form</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif;  }
        .form-container { width: 100%; border: 2px solid #000; padding: 10px; box-sizing: border-box; font-family: 'DejaVu Sans', sans-serif; }
        .header { background-color: #A0E7E5; text-align: center; padding: 10px; border: 2px solid #000; margin-bottom: 10px; }
        .header h1 { margin: 0; font-size: 24px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        td, th { padding: 5px; border: 1px solid #000; }
        .info-title { font-weight: bold; background-color: #A0E7E5; }
        .items-table th { text-align: center; font-weight: bold; }
        .total-row td { font-weight: bold; }
        .text-right { text-align: right; }
    </style>
</head>
<body>

    <div class="form-container">
        <div class="header ">
                    <table>
            <tr>
                <td style="padding: 10px; width: 50%; justify-content: space-between; align-items: center; display: flex">
                    Balipure Purified Drinking Water<br>
                    Warehouse #12 Don Onofre Village Banay-banay 4025 City of Cabuyao Laguna<br>
                    VAT Registered TIN 009-068-451-00002
                </td>
            </tr>
        </table>
        </div>


        
<table class="info-grid">
    <thead>
        <tr>
            <td class="info-title" colspan="2">Order Information:</td>
            <td class="info-title" colspan="2">Customer Information:</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Order NO:</td>
            <td>{{ $orderNumber }}</td>
            <td>Customer Name:</td>
            <td>{{ $customer?->name ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Order Date:</td>
            <td>{{ $order->date }}</td>
            <td>Billing Address:</td>
            <td>{{ $customer?->billing_address ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Order Type:</td>
            <td>{{ $order->order_type }}</td>
            <td>Shipping Address:</td>
            <td>{{ $customer?->shipping_address ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td>TIN:</td>
            <td>{{ $customer?->tin ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td>Discounts:</td>
            <td>{{ $customer?->discounts ?? '0' }}%</td>
        </tr>
    </tbody>
</table>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th style="background-color: #A0E7E5;">Item Description</th>
                    <th style="background-color: #A0E7E5;">Quantity</th>
                    <th style="background-color: #A0E7E5;">Unit Price</th>
                    <th style="background-color: #A0E7E5;">Total Price</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>350ml</td>
                    <td>{{ $order->qty_350ml }}</td>
                    <td>₱130.00</td>
                    <td>₱{{ number_format($order->qty_350ml * 130, 2) }}</td>
                </tr>
                <tr>
                    <td>500ml</td>
                    <td>{{ $order->qty_500ml }}</td>
                    <td>₱155.00</td>
                    <td>₱{{ number_format($order->qty_500ml * 155, 2) }}</td>
                </tr>
                <tr>
                    <td>1L</td>
                    <td>{{ $order->qty_1L }}</td>
                    <td>₱130.00</td>
                    <td>₱{{ number_format($order->qty_1L * 130, 2) }}</td>
                </tr>
                <tr>
                    <td>6L</td>
                    <td>{{ $order->qty_6L }}</td>
                    <td>₱60.00</td>
                    <td>₱{{ number_format($order->qty_6L * 60, 2) }}</td>
                </tr>
            </tbody>
        </table>
        
        <table>
            <tr>
                <td style="width: 50%;">Payment Details:</td>
                <td style="width: 25%;">Subtotal:</td>
                <td style="width: 25%;" class="text-right">₱{{ number_format($order->amount, 2) }}</td>
            </tr>
            <tr>
                <td>Bank Details: {{ $customer?->bank_details ?? 'N/A' }}</td>
                <td>Discount:</td>
                <td class="text-right">₱{{ number_format(($order->amount * ($customer?->discounts / 100)), 2) }}</td>
            </tr>
            <tr>
                <td></td>
                <td>Tax:</td>
                <td class="text-right">₱0.00</td>
            </tr>
            <tr class="total-row">
                <td></td>
                <td>Grand total:</td>
                <td class="text-right">₱{{ number_format($order->amount - ($order->amount * ($customer?->discounts / 100)), 2) }}</td>
            </tr>
        </table>

        <div style="margin-top: 10px; border-bottom: 2px solid #000; padding-bottom: 5px;">
            <strong>Terms and Conditions:</strong>
            <br>
            <small>This is a custom terms and conditions section. Add your specific terms here.</small>
        </div>

        <div style="margin-top: 20px; text-align: right;">
            <div style="display: inline-block; padding: 5px 15px; background-color: #A0E7E5; border: 2px solid #000; text-align: center;">
                Signature with Date
            </div>
        </div>
    </div>
</body>
</html>