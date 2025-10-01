<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;
    protected $table = 'inventories'; 
    // Add this to allow mass assignment
    protected $fillable = ['item', 'unit','quantity'];

}