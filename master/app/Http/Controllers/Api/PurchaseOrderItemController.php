<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseOrderItem;

class PurchaseOrderItemController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|integer|exists:purchase_orders,id',
            'item_name' => 'required|string|max:255',
            'item_type' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'received_quantity' => 'nullable|integer|min:0',
        ]);

        $item = PurchaseOrderItem::create($validated);

        return response()->json(['message' => 'Item saved successfully', 'item' => $item], 201);
    }

    public function update(Request $request, $id)
{
    $item = PurchaseOrderItem::findOrFail($id);

    $item->update($request->only(['received_quantity']));

    return response()->json([
        'message' => 'Item updated successfully',
        'item' => $item
    ]);
}

public function getByPurchaseOrder($purchaseOrderId)
{
    $items = PurchaseOrderItem::where('purchase_order_id', $purchaseOrderId)->get();
    return response()->json($items);
}

}
