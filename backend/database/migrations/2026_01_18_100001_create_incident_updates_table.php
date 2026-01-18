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
        Schema::create('incident_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incidents')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('action_type', [
                'status_change',
                'comment',
                'assignment',
                'priority_change',
                'severity_change',
                'edit'
            ]);
            $table->string('previous_value')->nullable();
            $table->string('new_value')->nullable();
            $table->text('comment')->nullable();
            $table->boolean('is_internal')->default(false);
            $table->timestamps();

            // Index for fetching updates by incident
            $table->index(['incident_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incident_updates');
    }
};
