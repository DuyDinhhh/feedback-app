<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateActivityLogTable extends Migration
{
    public function up()
    {
        Schema::connection(config('activitylog.database_connection'))
            ->create(config('activitylog.table_name'), function (Blueprint $table) {

                // --- ORIGINAL STRUCTURE (UNCHANGED) ---
                $table->bigIncrements('id');
                $table->string('log_name')->nullable();
                $table->text('description');
                $table->string('subject_id')->nullable();
                $table->string('subject_type')->nullable();
                $table->nullableMorphs('causer', 'causer');
                $table->json('properties')->nullable();
                $table->timestamps();
                $table->index('log_name'); // original index

                // --- ADDITIONAL INDEXES ONLY ---
                $table->index(['log_name', 'created_at'], 'idx_log_name_created_at');
                $table->index(['subject_type', 'subject_id'], 'idx_subject');
                $table->index(['causer_type', 'causer_id'], 'idx_causer');
                $table->index('created_at', 'idx_created_at');

                // MySQL FULLTEXT (TEXT column only)
                if (Schema::getConnection()->getDriverName() === 'mysql') {
                    $table->fullText('description', 'idx_fulltext_description');
                }
            });
    }

    public function down()
    {
        Schema::connection(config('activitylog.database_connection'))
            ->dropIfExists(config('activitylog.table_name'));
    }
}
