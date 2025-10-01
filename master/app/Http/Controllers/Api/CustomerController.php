<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Customer::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'billing_address' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:255',
            'bank_details' => 'nullable|string|max:255',
            'tin' => 'nullable|string|max:255',
            'discounts' => 'nullable|numeric|min:0|max:100',
        ]);

        $customer = Customer::create($validated);
        
        return response()->json($customer, 201);
    }
    
    public function destroy($id)
{
    try {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully']);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to delete customer',
            'details' => $e->getMessage()
        ], 500);
    }
}

    public function bulkDelete(Request $request)
{
    $ids = $request->input('customer_ids', []);

    if (empty($ids)) {
        return response()->json(['message' => 'No customer IDs provided'], 400);
    }

    Customer::whereIn('id', $ids)->delete();

    return response()->json(['message' => 'Customers deleted successfully']);
}

}