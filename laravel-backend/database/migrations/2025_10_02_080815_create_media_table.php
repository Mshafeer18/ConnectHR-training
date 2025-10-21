<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->string('collection_name');
            $table->string('name');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->string('disk');
            $table->string('conversions_disk')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->text('manipulations')->nullable();
            $table->text('custom_properties')->nullable();
            $table->text('generated_conversions')->nullable();
            $table->text('responsive_images')->nullable();
            $table->integer('order_column')->nullable()->index();
            $table->timestamps();

            $table->index(['model_type', 'model_id'], 'media_model_type_model_id_index');
            $table->index('collection_name', 'media_collection_name_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};