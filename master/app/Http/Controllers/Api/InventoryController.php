<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inventory;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(Inventory::all());
    }

    public function update(Request $request, $id)
    {
        try {
            // Validate quantity
            $validated = $request->validate([
                'quantity' => 'required|integer|min:0',
            ]);

            // Find and update item
            $item = Inventory::findOrFail($id);
            $item->quantity = $validated['quantity'];
            $item->save();

            return response()->json(['message' => 'Inventory updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Deducts quantities from inventory based on a sales order.
     * This method is called from the SalesOrder.jsx file.
     */
    public function deduct(Request $request)
    {
        $quantities = $request->input('quantities');

        DB::beginTransaction();
        try {
            // Deduct each item from the inventory
            foreach ($quantities as $item => $quantity) {
                if ($quantity > 0) {
                    $inventoryItem = Inventory::where('item', $item)->firstOrFail();

                    if ($inventoryItem->quantity < $quantity) {
                        throw new \Exception("Insufficient stock for {$item}. Available: {$inventoryItem->quantity}, Ordered: {$quantity}");
                    }

                    $inventoryItem->quantity -= $quantity;
                    $inventoryItem->save();
                }
            }

            DB::commit();

            return response()->json(['message' => 'Inventory updated successfully']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    public function receiveItem(Request $request)
{
    $request->validate([
        'item_name' => 'required|string',
        'quantity' => 'required|integer|min:1',
    ]);

    $item = Inventory::firstOrCreate(
        ['item_name' => $request->item_name],
        ['quantity' => 0]
    );

    $item->quantity += $request->quantity;
    $item->save();

    return response()->json(['message' => 'Finished goods inventory updated', 'item' => $item]);
}

public function addQuantity(Request $request, $id)
{
    $request->validate([
        'quantity' => 'required|integer|min:1',
    ]);

    $inventory = Inventory::findOrFail($id);
    $inventory->quantity += $request->quantity;
    $inventory->save();

    return response()->json([
        'message' => 'Quantity updated successfully',
        'data' => $inventory
    ], 200);
}

}