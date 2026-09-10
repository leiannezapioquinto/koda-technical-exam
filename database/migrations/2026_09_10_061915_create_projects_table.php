<?php

use App\constants\ProjectConstants;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('client_name');
            $table->string('project_name');
            $table->text('description')->nullable();
            $table->enum('status', ProjectConstants::STATUSES);
            $table->enum('priority', ProjectConstants::PRIORITIES);
            $table->date('start_date');
            $table->date('due_date');
            $table->timestamps();
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'priority']);
            $table->index(['user_id', 'due_date']);
        });
        DB::statement('ALTER TABLE projects ADD CONSTRAINT projects_dates_check CHECK (due_date >= start_date)');
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
