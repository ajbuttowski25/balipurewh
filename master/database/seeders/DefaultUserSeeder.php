<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DefaultUserSeeder extends Seeder
{
    public function run()
    {
        // Clear old data (optional)
        DB::table('users')->where('companyID', 'E12345')->delete();

        DB::table('users')->insert([
            'companyID' => 'E12345',
            'password' => Hash::make('12345'),
            'created_at' => now(),
            'updated_at' => now(),
            'role' => 'Admin',
            'name' => 'Default User',
            'email' => 'defaultuser@gmail.com',
        ]);
    }
}
