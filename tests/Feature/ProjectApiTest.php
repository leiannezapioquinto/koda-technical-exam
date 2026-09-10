<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Repositories\ProjectRepository;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function payload(array $changes = []): array
    {
        return array_replace([
            'client_name' => 'Acme Studio', 'project_name' => 'Brand refresh',
            'description' => 'A cohesive identity.', 'status' => 'Planning', 'priority' => 'Medium',
            'start_date' => '2026-09-10', 'due_date' => '2026-10-10',
        ], $changes);
    }

    #[DataProvider('protectedEndpoints')]
    public function test_guest_project_requests_return_401(string $method, string $path): void
    {
        $this->json($method, $path, $this->payload())->assertUnauthorized();
    }

    public static function protectedEndpoints(): array
    {
        return [['GET', '/projects'], ['GET', '/projects/1'], ['POST', '/projects'], ['PUT', '/projects/1'], ['DELETE', '/projects/1'], ['GET', '/dashboard/summary']];
    }

    public function test_create_persists_project_and_ignores_owner_injection(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/projects', $this->payload(['user_id' => $other->id, 'id' => 999999]));
        $response->assertCreated()->assertJsonPath('data.project_name', 'Brand refresh')->assertJsonPath('data.start_date', '2026-09-10')->assertJsonMissingPath('data.user_id');
        $this->assertDatabaseHas('projects', ['id' => $response->json('data.id'), 'user_id' => $user->id, 'project_name' => 'Brand refresh']);
        $this->assertDatabaseMissing('projects', ['id' => 999999]);
    }

    public function test_show_returns_project_fields(): void
    {
        $project = Project::factory()->create();
        $this->actingAs($project->user)->getJson('/projects/'.$project->id)->assertOk()
            ->assertJsonPath('data.id', $project->id)
            ->assertExactJsonStructure(['data' => ['id', 'client_name', 'project_name', 'description', 'status', 'priority', 'start_date', 'due_date', 'created_at', 'updated_at']]);
    }

    public function test_update_persists_all_editable_fields_without_changing_owner(): void
    {
        $project = Project::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($project->user)->putJson('/projects/'.$project->id, $this->payload(['status' => 'Completed', 'description' => null, 'user_id' => $other->id]))
            ->assertOk()->assertJsonPath('data.status', 'Completed')->assertJsonPath('data.description', null);
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'user_id' => $project->user_id, 'status' => 'Completed', 'description' => null]);
    }

    public function test_delete_removes_only_selected_project(): void
    {
        $project = Project::factory()->create();
        $kept = Project::factory()->for($project->user)->create();
        $this->actingAs($project->user)->deleteJson('/projects/'.$project->id)->assertNoContent();
        $this->assertModelMissing($project);
        $this->assertModelExists($kept);
    }

    #[DataProvider('recordMethods')]
    public function test_other_users_records_return_404_without_mutation(string $method): void
    {
        $project = Project::factory()->create(['project_name' => 'Private project']);
        $this->actingAs(User::factory()->create())->json($method, '/projects/'.$project->id, $this->payload())->assertNotFound();
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'project_name' => 'Private project']);
    }

    public static function recordMethods(): array
    {
        return [['GET'], ['PUT'], ['DELETE']];
    }

    public function test_missing_record_returns_404(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/projects/999999')->assertNotFound();
    }

    public function test_oversized_numeric_id_returns_404(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/projects/999999999999999999999999')->assertNotFound();
    }

    public function test_empty_payload_returns_required_field_errors_without_writing(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/projects', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['client_name', 'project_name', 'status', 'priority', 'start_date', 'due_date']);
        $this->assertDatabaseCount('projects', 0);
    }

    #[DataProvider('invalidProjects')]
    public function test_invalid_project_values_return_422_without_writing(array $change, string $field): void
    {
        $this->actingAs(User::factory()->create())->postJson('/projects', $this->payload($change))
            ->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->assertDatabaseCount('projects', 0);
    }

    public static function invalidProjects(): array
    {
        return [
            'blank client' => [['client_name' => '  '], 'client_name'],
            'blank project' => [['project_name' => '  '], 'project_name'],
            'long name' => [['project_name' => str_repeat('a', 256)], 'project_name'],
            'invalid status' => [['status' => 'Cancelled'], 'status'],
            'invalid priority' => [['priority' => 'Urgent'], 'priority'],
            'long description' => [['description' => str_repeat('a', 5001)], 'description'],
            'bad start date' => [['start_date' => '2026-02-30'], 'start_date'],
            'bad due date' => [['due_date' => 'not-a-date'], 'due_date'],
            'inverted dates' => [['due_date' => '2026-09-09'], 'due_date'],
        ];
    }

    public function test_invalid_update_leaves_saved_project_unchanged(): void
    {
        $project = Project::factory()->create(['project_name' => 'Original']);
        $this->actingAs($project->user)->putJson('/projects/'.$project->id, $this->payload(['due_date' => '2026-09-09']))
            ->assertUnprocessable()->assertJsonPath('errors.due_date.0', 'The due date cannot be earlier than the start date.');
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'project_name' => 'Original']);
    }

    public function test_same_day_dates_are_allowed(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/projects', $this->payload(['due_date' => '2026-09-10']))->assertCreated();
    }

    public function test_lists_only_owned_projects_and_paginates_at_25(): void
    {
        $user = User::factory()->create();
        $projects = Project::factory()->count(26)->for($user)->create(['created_at' => '2026-09-10 00:00:00']);
        Project::factory()->create(['project_name' => 'Private']);
        $this->actingAs($user)->getJson('/projects?per_page=100')->assertOk()->assertJsonCount(25, 'data')
            ->assertJsonPath('meta.total', 26)->assertJsonPath('meta.per_page', 25)->assertJsonPath('data.0.id', $projects->last()->id)->assertJsonMissing(['project_name' => 'Private']);
        $this->getJson('/projects?page=2')->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $projects->first()->id);
    }

    public function test_combined_filters_search_and_sort_respect_ownership(): void
    {
        $user = User::factory()->create();
        $match = Project::factory()->for($user)->create(['client_name' => 'ACME', 'status' => 'Planning', 'priority' => 'High']);
        Project::factory()->for($user)->create(['client_name' => 'ACME', 'status' => 'Completed', 'priority' => 'High']);
        Project::factory()->for($user)->create(['client_name' => 'ACME', 'status' => 'Planning', 'priority' => 'Low']);
        Project::factory()->create(['client_name' => 'ACME', 'status' => 'Planning', 'priority' => 'High']);
        $this->actingAs($user)->getJson('/projects?search=acme&status=Planning&priority=High&sort=due_date&direction=asc')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $match->id);
    }

    #[DataProvider('literalSearches')]
    public function test_search_matches_literal_characters_in_description(string $needle): void
    {
        $user = User::factory()->create();
        $match = Project::factory()->for($user)->create(['client_name' => 'Acme', 'project_name' => 'Identity', 'description' => 'Contains '.$needle]);
        Project::factory()->for($user)->create(['client_name' => 'Other', 'project_name' => 'Website', 'description' => 'No match']);
        $this->actingAs($user)->getJson('/projects?search='.urlencode($needle))->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $match->id);
    }

    public static function literalSearches(): array
    {
        return [['0'], ['%'], ['_'], ['\\'], ["' OR 1=1 --"]];
    }

    public function test_priority_sort_uses_business_order(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(3)->for($user)->sequence(['priority' => 'Low'], ['priority' => 'High'], ['priority' => 'Medium'])->create();
        $response = $this->actingAs($user)->getJson('/projects?sort=priority&direction=desc')->assertOk();
        $this->assertSame(['High', 'Medium', 'Low'], array_column($response->json('data'), 'priority'));
    }

    public function test_name_sort_is_ascending(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(2)->for($user)->sequence(['project_name' => 'Zulu'], ['project_name' => 'Alpha'])->create();
        $this->actingAs($user)->getJson('/projects?sort=project_name&direction=asc')->assertOk()->assertJsonPath('data.0.project_name', 'Alpha');
    }

    #[DataProvider('invalidQueries')]
    public function test_invalid_query_returns_422(string $query, string $field): void
    {
        $this->actingAs(User::factory()->create())->getJson('/projects?'.$query)->assertUnprocessable()->assertJsonValidationErrors($field);
    }

    public static function invalidQueries(): array
    {
        return [
            ['sort=project_name%3BDROP%20TABLE%20projects', 'sort'],
            ['direction=desc%3BDELETE', 'direction'],
            ['status=Unknown', 'status'], ['priority=Urgent', 'priority'],
            ['page=0', 'page'], ['page=abc', 'page'], ['search[]=x', 'search'],
        ];
    }

    public function test_unexpected_exception_returns_generic_error_and_is_logged(): void
    {
        Log::spy();
        $this->app->bind(ProjectRepository::class, fn () => new class extends ProjectRepository
        {
            public function findOwned($user, $id): Project
            {
                throw new \RuntimeException('Database connection lost');
            }
        });
        $project = Project::factory()->create();

        $this->actingAs($project->user)->getJson('/projects/'.$project->id)
            ->assertStatus(500)
            ->assertExactJson(['message' => 'Something went wrong. Please try again later.']);

        Log::shouldHaveReceived('error')->once()->withArgs(
            fn (string $message, array $context) => $message === 'Database connection lost'
                && $context['exception'] === \RuntimeException::class
                && $context['user_id'] === $project->user->id,
        );
    }

    public function test_summary_counts_only_the_current_users_projects(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(4)->for($user)->sequence(['status' => 'Planning'], ['status' => 'In Progress'], ['status' => 'Completed'], ['status' => 'On Hold'])->create();
        Project::factory()->create(['status' => 'In Progress']);
        $this->actingAs($user)->getJson('/dashboard/summary')->assertExactJson(['total' => 4, 'in_progress' => 1, 'completed' => 1, 'on_hold' => 1]);
    }
}
