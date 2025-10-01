<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('inventories')->insert([
            ['item' => '350ml', 'unit' => 'cases', 'quantity' => 1000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '500ml', 'unit' => 'cases', 'quantity' => 1500, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '1L', 'unit' => 'cases', 'quantity' => 1000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '6L', 'unit' => 'tubs', 'quantity' => 500, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
