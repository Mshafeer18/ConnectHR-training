<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // users table
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
                // add FK only if tenants table exists; otherwise add column now and FK later
                if (Schema::hasTable('tenants')) {
                    $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                }
            });
        }

        // students table
        if (Schema::hasTable('students') && ! Schema::hasColumn('students', 'tenant_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
                if (Schema::hasTable('tenants')) {
                    $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', function (Blueprint $table) {
                // drop foreign if exists
                $sm = Schema::getConnection()->getDoctrineSchemaManager();
                // safe drop foreign, fallback to just dropColumn if not found
                try {
                    $table->dropForeign(['tenant_id']);
                } catch (\Throwable $e) {
                    // ignore
                }
                $table->dropColumn('tenant_id');
            });
        }

        if (Schema::hasTable('students') && Schema::hasColumn('students', 'tenant_id')) {
            Schema::table('students', function (Blueprint $table) {
                try {
                    $table->dropForeign(['tenant_id']);
                } catch (\Throwable $e) {
                    // ignore
                }
                $table->dropColumn('tenant_id');
            });
        }
    }
};
