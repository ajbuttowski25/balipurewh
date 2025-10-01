<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\InventoryRawMatsController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\PurchaseOrderItemController;
use App\Http\Controllers\Api\ForecastController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\CustomerController;

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Sales Order Count Routes (put these first)
Route::get('/sales-orders/cso-count', [SalesOrderController::class, 'getCsoCount']);
Route::get('/sales-orders/rtv-count', [SalesOrderController::class, 'getRtvCount']);
Route::get('/sales-orders/disposal-count', [SalesOrderController::class, 'getDisposalCount']);

// Sales Order Analytics (must come BEFORE {id})
Route::get('/sales-orders/most-selling', [SalesOrderController::class, 'mostSelling']);
Route::get('/sales-orders/top-products', [SalesOrderController::class, 'topProducts']); 

// Sales Order Routes
Route::get('/sales-orders', [SalesOrderController::class, 'index']);
Route::post('/sales-orders', [SalesOrderController::class, 'store']);
Route::put('/sales-orders/{id}', [SalesOrderController::class, 'update']);
Route::delete('/sales-orders/{id}', [SalesOrderController::class, 'destroy']);
Route::delete('/sales-orders', [SalesOrderController::class, 'destroy']);
Route::get('/sales-orders/{id}/pdf', [SalesOrderController::class, 'generatePdf']);
Route::get('/sales-orders/{id}', [SalesOrderController::class, 'show']);


// Inventory Routes (Finished Goods and Raw Materials)
Route::get('/inventories', [InventoryController::class, 'index']);
Route::put('/inventories/{id}', [InventoryController::class, 'update']);
Route::get('/inventory_rawmats', [InventoryRawMatsController::class, 'index']);
Route::put('/inventory_rawmats/{id}', [InventoryRawMatsController::class, 'update']);

// NEW: Inventory Deduction Route
Route::post('/inventories/deduct', [InventoryController::class, 'deduct']);
Route::post('/inventory_rawmats/{id}/deduct', [InventoryRawMatsController::class, 'deduct']);


// Finished goods inventory receiving
Route::post('/inventories/receive', [InventoryController::class, 'receiveItem']);

// Raw materials inventory receiving
Route::post('/inventory_rawmats/receive', [InventoryRawMatsController::class, 'receiveItem']);



// Customer Routes
Route::get('/customers', [CustomerController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'store']);
Route::delete('/customers/bulk-delete', [CustomerController::class, 'bulkDelete']);
Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

// Item Routes
Route::apiResource('items', ItemController::class);

// Purchase Order Routes
Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
Route::delete('/purchase-orders/{id}', [PurchaseOrderController::class, 'destroy']);
Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update']);
Route::post('/purchase-order-items', [PurchaseOrderItemController::class, 'store']);
Route::put('/purchase-order-items/{id}', [PurchaseOrderItemController::class, 'update']);
Route::get('/purchase-order-items/{purchaseOrderId}', [PurchaseOrderItemController::class, 'getByPurchaseOrder']);
Route::get('/purchase-orders/{id}/delivery-note', [PurchaseOrderController::class, 'generateDeliveryNote'])->name('purchase_orders.delivery_note');
Route::post('/purchase-orders/{id}/receive', [PurchaseOrderController::class, 'receiveItems']);

// Purchase Order Count Routes
Route::get('/purchase-orders/pending-count', [PurchaseOrderController::class, 'getPendingCount']);
Route::get('/purchase-orders/partial-count', [PurchaseOrderController::class, 'getPartialCount']);
Route::get('/purchase-orders/completed-count', [PurchaseOrderController::class, 'getCompletedCount']);

// User Management Routes
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{employeeID}', [UserController::class, 'showByEmployeeID']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Forecast Routes
Route::get('/historical-sales', [ForecastController::class, 'historicalSales']);
Route::get('/forecast', [ForecastController::class, 'forecast']);

Route::post('/inventories/{id}/add', [InventoryController::class, 'addQuantity']);
Route::post('/inventory_rawmats/{id}/add', [InventoryRawMatsController::class, 'addQuantity']);
Route::get('/inventory_rawmats', [InventoryRawMatsController::class, 'index']);
Route::post('/inventory_rawmats', [InventoryRawMatsController::class, 'store']);
