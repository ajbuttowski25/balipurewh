<?php

namespace App\Http\Controllers\Api;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PurchaseOrderController extends Controller
{
    /**
     * List all purchase orders with items
     */
    public function index()
    {
        return response()->json(PurchaseOrder::with('items')->get());
    }

public function getPendingCount() {
    $count = \App\Models\PurchaseOrder::where('status', 'Pending')->count();
    return response()->json(['count' => $count]);
}

public function getPartialCount() {
    $count = \App\Models\PurchaseOrder::where('status', 'Partially Received')->count();
    return response()->json(['count' => $count]);
}

public function getCompletedCount() {
    $count = \App\Models\PurchaseOrder::where('status', 'Completed')->count();
    return response()->json(['count' => $count]);
}


    /**
     * Create new purchase order
     */
    public function store(Request $request)
    {
        $request->validate([
            'po_number'      => 'required|unique:purchase_orders',
            'supplier_name'  => 'required|string',
            'order_date'     => 'required|date',
            'expected_date'  => 'required|date',
            'status'         => 'required|string',
            'amount'         => 'required|numeric'
        ]);

        $order = PurchaseOrder::create($request->only([
            'po_number',
            'supplier_name',
            'order_date',
            'expected_date',
            'status',
            'amount'
        ]));

        return response()->json($order, 201);
    }

    /**
     * Delete a purchase order and its items
     */
    public function destroy($id)
    {
        $order = PurchaseOrder::findOrFail($id);
        $order->items()->delete();
        $order->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Generate Delivery Note (PDF) — for Completed & Partially Received
     */
    public function generateDeliveryNote($id)
    {
        $order = PurchaseOrder::with('items')->findOrFail($id);

        if (!in_array(strtolower(trim($order->status)), ['completed', 'partially received'])) {
            abort(403, 'Delivery note only available after some items are received.');
        }

        // Filter items that have received quantity
        $receivedItems = $order->items->filter(fn($item) => $item->received_quantity > 0);

        $pdf = Pdf::loadView('pdfs.delivery_note', [
            'order' => $order,
            'items' => $receivedItems
        ]);

        return $pdf->download('delivery_note_' . $order->po_number . '.pdf');
    }

    /**
     * Update purchase order details
     */
    public function update(Request $request, $id)
    {
        $order = PurchaseOrder::findOrFail($id);

        $request->validate([
            'supplier_name' => 'required|string',
            'order_date'    => 'required|date',
            'expected_date' => 'required|date',
            'status'        => 'required|string',
            'amount'        => 'required|numeric'
        ]);

        $order->update($request->only([
            'supplier_name',
            'order_date',
            'expected_date',
            'status',
            'amount'
        ]));

        return response()->json([
            'message' => 'Purchase order updated successfully',
            'order'   => $order
        ]);
    }

    /**
     * Receive items and update inventory
     */
public function receiveItems(Request $request, $id)
{
    $request->validate([
        'item_id'  => 'required|exists:purchase_order_items,id',
        'quantity' => 'required|integer|min:1'
    ]);

    DB::beginTransaction();

    try {
        $order = PurchaseOrder::with('items')->findOrFail($id);
        $item  = $order->items()->where('id', $request->item_id)->firstOrFail();

        $qty = (int) $request->quantity;
        $remaining = ($item->quantity ?? 0) - ($item->received_quantity ?? 0);

        if ($qty > $remaining) {
            DB::rollBack();
            return response()->json([
                'error' => "Cannot receive more than remaining quantity ({$remaining})."
            ], 422);
        }

        // 1) Update received quantity on the PO item
        $item->received_quantity = ($item->received_quantity ?? 0) + $qty;
        $item->save();

        $itemName = $item->item_name;
        $itemType = strtolower($item->item_type ?? '');
        $supplier = $order->supplier_name;

        $rawCol = 'item'; // inventory_rawmats
        $invCol = Schema::hasColumn('inventories', 'item') ? 'item' : 'item_name';

        // Handle multi-supplier items
        if (in_array($itemName, ['500ml', 'Cap'])) {
            $inventoryItemName = "{$itemName} ({$supplier})";
        } else {
            $inventoryItemName = $itemName;
        }

        // 2) Update inventory (only if it exists)
        $isRaw = in_array($itemName, [
            '1L', '350ml', '6L', '6L Cap', '500ml', 'Cap',
            'Shrinkfilm', 'Stretchfilm', 'Label'   // ← add these
        ]);

        if ($isRaw) {
            $rawRow = DB::table('inventory_rawmats')->where($rawCol, $inventoryItemName)->first();
            if ($rawRow) {
                DB::table('inventory_rawmats')->where('id', $rawRow->id)
                    ->update([
                        'quantity'   => DB::raw("COALESCE(quantity,0) + {$qty}"),
                        'updated_at' => now(),
                    ]);
            }
        } else {
            $invRow = DB::table('inventories')->where($invCol, $inventoryItemName)->first();
            if ($invRow) {
                DB::table('inventories')->where('id', $invRow->id)
                    ->update([
                        'quantity'   => DB::raw("COALESCE(quantity,0) + {$qty}"),
                        'updated_at' => now(),
                    ]);
            }
        }

        // 3) Update order status
        $order->load('items');
        $totalOrdered  = $order->items->sum('quantity');
        $totalReceived = $order->items->sum('received_quantity');

        if ($totalReceived === 0) {
            $order->status = 'Pending';
        } elseif ($totalReceived < $totalOrdered) {
            $order->status = 'Partially Received';
        } else {
            $order->status = 'Completed';
        }
        $order->save();

        DB::commit();

        return response()->json([
            'message' => 'Inventory and purchase order updated successfully',
            'order'   => $order->load('items')
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('receiveItems error: '.$e->getMessage());
        return response()->json([
            'error' => 'Server error while receiving items.',
            'details' => $e->getMessage()
        ], 500);
    }
}

    
}