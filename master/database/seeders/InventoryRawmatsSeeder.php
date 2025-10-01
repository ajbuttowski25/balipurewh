<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventoryRawmatsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('inventory_rawmats')->insert([
            ['item' => '350ml', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '500ml (McBride)', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '500ml (Filpet)', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '1L', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => 'Cap (McBride)', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => 'Cap (Filpet)', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '6L', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['item' => '6L Cap', 'unit' => 'pcs', 'quantity' => 150000, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
