<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryRawmat extends Model
{
    protected $table = 'inventory_rawmats';
    protected $fillable = ['item', 'unit', 'quantity'];
    public $timestamps = false;
}
