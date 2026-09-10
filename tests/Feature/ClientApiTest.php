<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ClientApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guest_client_requests_return_401(): void
    {
        $this->getJson('/clients')->assertUnauthorized();
    }

    public function test_index_groups_projects_by_client_with_counts(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(3)->for($user)->create(['client_name' => 'Acme Studio']);
        Project::factory()->for($user)->create(['client_name' => 'Bloom & Co.']);

        $response = $this->actingAs($user)->getJson('/clients');

        $response->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.client_name', 'Acme Studio')
            ->assertJsonPath('data.0.project_count', 3)
            ->assertJsonPath('data.1.client_name', 'Bloom & Co.')
            ->assertJsonPath('data.1.project_count', 1);
    }

    public function test_index_returns_last_activity_as_a_plain_date(): void
    {
        $user = User::factory()->create();
        Project::factory()->for($user)->create(['client_name' => 'Acme Studio']);

        $response = $this->actingAs($user)->getJson('/clients');

        $response->assertOk()->assertJsonPath('data.0.last_activity_at', now()->format('Y-m-d'));
    }

    public function test_index_excludes_clients_belonging_to_other_users(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Project::factory()->for($user)->create(['client_name' => 'Acme Studio']);
        Project::factory()->count(5)->for($other)->create(['client_name' => 'Rival Corp']);

        $response = $this->actingAs($user)->getJson('/clients');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.client_name', 'Acme Studio');
    }

    public function test_projects_can_be_filtered_to_a_single_client(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(2)->for($user)->create(['client_name' => 'Acme Studio']);
        Project::factory()->for($user)->create(['client_name' => 'Bloom & Co.']);

        $response = $this->actingAs($user)->getJson('/projects?client=Acme+Studio');

        $response->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 2);
        foreach ($response->json('data') as $project) {
            $this->assertSame('Acme Studio', $project['client_name']);
        }
    }

    public function test_client_filter_does_not_match_partial_names(): void
    {
        $user = User::factory()->create();
        Project::factory()->for($user)->create(['client_name' => 'Acme Studio']);

        $this->actingAs($user)->getJson('/projects?client=Acme')->assertOk()->assertJsonPath('meta.total', 0);
    }
}
