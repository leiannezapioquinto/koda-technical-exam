<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Repositories\ProjectRepository;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ProjectRepositoryTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_create_translates_date_check_violation_into_validation_exception(): void
    {
        $user = User::factory()->create();
        $repository = new ProjectRepository;

        try {
            $repository->create($user, [
                'client_name' => 'Acme Studio', 'project_name' => 'Brand refresh',
                'status' => 'Planning', 'priority' => 'Medium',
                'start_date' => '2026-09-10', 'due_date' => '2026-09-01',
            ]);
            $this->fail('Expected a ValidationException.');
        } catch (ValidationException $e) {
            $this->assertSame('The due date cannot be earlier than the start date.', $e->errors()['due_date'][0]);
        }
        $this->assertDatabaseCount('projects', 0);
    }

    public function test_update_translates_date_check_violation_into_validation_exception(): void
    {
        $project = Project::factory()->create(['start_date' => '2026-09-01', 'due_date' => '2026-09-10']);
        $repository = new ProjectRepository;

        try {
            $repository->update($project, ['due_date' => '2026-08-01']);
            $this->fail('Expected a ValidationException.');
        } catch (ValidationException $e) {
            $this->assertSame('The due date cannot be earlier than the start date.', $e->errors()['due_date'][0]);
        }
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'due_date' => '2026-09-10']);
    }
}
