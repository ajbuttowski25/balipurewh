<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SalesOrder;
use App\Models\Inventory;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class SalesOrderController extends Controller
{
    // ----- Count Methods -----
    public function getPendingCount()
    {
        $count = SalesOrder::where('order_type', 'Pending')->count();
        return response()->json(['count' => $count]);
    }

    public function getProcessingCount()
    {
        $count = SalesOrder::where('order_type', 'Processing')->count();
        return response()->json(['count' => $count]);
    }

    public function getCompletedCount()
    {
        $count = SalesOrder::where('order_type', 'Completed')->count();
        return response()->json(['count' => $count]);
    }

    public function getCsoCount()
    {
        $count = SalesOrder::where('order_type', 'CSO')->count();
        return response()->json(['count' => $count]);
    }

    public function getRtvCount()
    {
        $count = SalesOrder::where('order_type', 'RTV')->count();
        return response()->json(['count' => $count]);
    }

    public function getDisposalCount()
    {
        $count = SalesOrder::where('order_type', 'Disposal')->count();
        return response()->json(['count' => $count]);
    }

    // ----- List & Filter -----
    public function index(Request $request)
    {
        if ($request->has('order_type') && $request->input('order_type') !== 'All') {
            return SalesOrder::where('order_type', $request->input('order_type'))->get();
        }
        return SalesOrder::all();
    }

    // ----- Show by ID -----
    public function show($id)
    {
        $order = SalesOrder::with('customer')->findOrFail($id);
        return response()->json($order);
    }

    // ----- Create -----

public function store(Request $request)
{
    $validatedData = $request->validate([
        'customer_id' => 'required|exists:customers,id',
        'location' => 'required|string',
        'date' => 'required|date',
        'delivery_date' => 'required|date',
        'order_type' => 'required|string',
        'products' => 'required|string',
        'amount' => 'required|numeric',
        'quantities' => 'required|array',
        'qty_350ml' => 'nullable|integer',
        'qty_500ml' => 'nullable|integer',
        'qty_1L' => 'nullable|integer',
        'qty_6L' => 'nullable|integer',
    ]);

    DB::beginTransaction();

    try {
        // Create the sales order
        $order = SalesOrder::create($validatedData);

        // Deduct inventory for each product
        foreach ($validatedData['quantities'] as $product => $qty) {
            if ($qty > 0) {
                $inventory = Inventory::where('item', $product)->first();
                if (!$inventory) {
                    DB::rollBack();
                    return response()->json(['error' => "Inventory record for {$product} not found."], 400);
                }

                if ($inventory->quantity < $qty) {
                    DB::rollBack();
                    return response()->json(['error' => "Not enough stock for {$product}. Available: {$inventory->quantity}"], 400);
                }

                $inventory->quantity -= $qty;
                $inventory->save();
            }
        }

        DB::commit();

        $newOrder = SalesOrder::with('customer')->findOrFail($order->id);

        return response()->json([
            'message' => 'Sales order created successfully.',
            'data' => $newOrder
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Sales Order Creation Error: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to create sales order: ' . $e->getMessage()], 500);
    }
}

    // ----- Update -----
    public function update(Request $request, $id)
    {
        $order = SalesOrder::findOrFail($id);

        $request->validate([
            'order_type' => 'required|string|in:CSO,RTV,Disposal',
        ]);

        $order->order_type = $request->order_type;
        $order->save();

        return response()->json(['message' => 'Updated successfully', 'order' => $order]);
    }

    // ----- Delete -----
    public function destroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:sales_orders,id',
        ]);

        SalesOrder::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Selected orders deleted successfully']);
    }

    // ----- PDF Generation -----
    public function generatePdf($id)
    {
        $order = SalesOrder::with('customer')->findOrFail($id);

        $datePart = str_replace('-', '', $order->date);
        $idPart = str_pad($order->id, 4, '0', STR_PAD_LEFT);
        $orderNumber = "SO-{$datePart}-{$idPart}";

        $pdf = PDF::loadView('pdfs.sales_order', [
            'order' => $order,
            'customer' => $order->customer,
            'orderNumber' => $orderNumber
        ]);

        return $pdf->download('sales-order-' . $order->id . '.pdf');
    }
public function mostSelling()
{
    try {
        $totals = \DB::table('sales_orders')
            ->selectRaw('
                COALESCE(SUM("qty_350ml"), 0) as total_350ml,
                COALESCE(SUM("qty_500ml"), 0) as total_500ml,
                COALESCE(SUM("qty_1L"), 0) as total_1l,
                COALESCE(SUM("qty_6L"), 0) as total_6l
            ')
            ->whereRaw('EXTRACT(MONTH FROM "date") = ?', [now()->month])
            ->whereRaw('EXTRACT(YEAR FROM "date") = ?', [now()->year])
            ->first();

        $products = [
            "350ml" => $totals->total_350ml,
            "500ml" => $totals->total_500ml,
            "1L"    => $totals->total_1l, // ✅ lowercase alias matches
            "6L"    => $totals->total_6l,
        ];

        $topProduct = collect($products)->sortDesc()->keys()->first();
        $topQty = $products[$topProduct];

        return response()->json([
            "success" => true,
            "top_product" => $topProduct,
            "total_sold" => $topQty,
            "all_products" => $products
        ]);
    } catch (\Exception $e) {
        return response()->json([
            "success" => false,
            "message" => $e->getMessage()
        ], 500);
    }
}
public function topProducts()
{
    $totals = \DB::table('sales_orders')
        ->selectRaw('
            COALESCE(SUM("qty_350ml"), 0) as total_350ml,
            COALESCE(SUM("qty_500ml"), 0) as total_500ml,
            COALESCE(SUM("qty_1L"), 0) as total_1l,
            COALESCE(SUM("qty_6L"), 0) as total_6l
        ')
        ->whereRaw('EXTRACT(MONTH FROM "date") = ?', [now()->month]) // filter by current month
        ->whereRaw('EXTRACT(YEAR FROM "date") = ?', [now()->year])   // filter by current year
        ->first();

    $products = [
        ['product' => '350ml', 'total_sales' => $totals->total_350ml ?? 0],
        ['product' => '500ml', 'total_sales' => $totals->total_500ml ?? 0],
        ['product' => '1L',    'total_sales' => $totals->total_1l ?? 0],
        ['product' => '6L',    'total_sales' => $totals->total_6l ?? 0],
    ];

    // Sort descending & get top 3
    usort($products, fn($a, $b) => $b['total_sales'] <=> $a['total_sales']);
    $topProducts = array_slice($products, 0, 3);

    return response()->json($products); // return top 3 for this month
}


}
