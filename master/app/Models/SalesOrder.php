<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Customer;

class SalesOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'location',
        'products',
        'quantities',
        'amount',
        'date',
        'delivery_date',
        'order_type',
        'qty_350ml',
        'qty_500ml',
        'qty_1L',
        'qty_6L'
    ];

    protected $casts = [
        'quantities' => 'array',
    ];

    /**
     * Get the customer that owns the sales order.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}