<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryRawMat;

class InventoryRawMatsController extends Controller
{
    /**
     * Get all raw materials
     */
    public function index()
    {
        return response()->json(InventoryRawMat::all());
    }

    /**
     * Update an existing raw material by ID
     */
    public function update(Request $request, $id)
    {
        $item = InventoryRawMat::find($id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        // Only allow specific fields instead of $request->all()
        $validated = $request->validate([
            'item' => 'sometimes|string',
            'unit' => 'sometimes|string',
            'quantity' => 'sometimes|integer|min:0',
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Raw material updated successfully',
            'item' => $item
        ]);
    }

    /**
     * Receive (add) raw material stock
     */
    public function receiveItem(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'unit' => 'nullable|string',
        ]);

        $rawMat = InventoryRawMat::firstOrCreate(
            ['item' => $validated['item_name']], // column name is "item"
            ['unit' => $validated['unit'] ?? '', 'quantity' => 0]
        );

        $rawMat->quantity += $validated['quantity'];
        $rawMat->save();

        return response()->json([
            'message' => 'Raw materials inventory updated',
            'item' => $rawMat
        ]);
    }
    public function store(Request $request)
{
    $validated = $request->validate([
        'item' => 'required|string',
        'unit' => 'required|string',
        'quantity' => 'required|integer',
    ]);

    return InventoryRawMat::create($validated);
}

public function deduct(Request $request, $id)
{
    $request->validate([
        'quantity' => 'required|integer|min:1',
    ]);

    $item = InventoryRawMat::findOrFail($id);

    if ($item->quantity < $request->quantity) {
        return response()->json(['message' => 'Not enough stock to deduct'], 400);
    }

    $item->quantity -= $request->quantity;
    $item->save();

    return response()->json(['message' => 'Quantity deducted successfully', 'quantity' => $item->quantity]);
}


}
