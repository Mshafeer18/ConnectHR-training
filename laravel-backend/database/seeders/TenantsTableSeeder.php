<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TenantsTableSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now()->toDateTimeString();

        DB::table('tenants')->insert([
            ['name' => 'Tenant A', 'slug' => 'tenant-a', 'meta' => json_encode(['plan' => 'free']), 'created_at'=>$now, 'updated_at'=>$now],
            ['name' => 'Tenant B', 'slug' => 'tenant-b', 'meta' => json_encode(['plan' => 'pro']), 'created_at'=>$now, 'updated_at'=>$now],
        ]);
    }
}
