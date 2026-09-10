<?php

namespace Tests\Unit;

use App\Models\User;
use App\Repositories\ProjectRepository;
use App\Services\ProjectService;
use Mockery;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use PHPUnit\Framework\TestCase;

class ProjectServiceTest extends TestCase
{
    use MockeryPHPUnitIntegration;

    public function test_empty_workspace_has_zero_totals(): void
    {
        $user = new User;
        $repository = Mockery::mock(ProjectRepository::class);
        $repository->shouldReceive('statusCounts')->once()->with($user)->andReturn([]);
        $service = new ProjectService($repository);

        $this->assertSame(['total' => 0, 'in_progress' => 0, 'on_hold' => 0, 'completed' => 0], $service->summary($user));
    }

    public function test_summary_normalizes_database_count_strings_and_includes_planning(): void
    {
        $user = new User;
        $repository = Mockery::mock(ProjectRepository::class);
        $repository->shouldReceive('statusCounts')->once()->with($user)->andReturn(['Planning' => '3', 'Completed' => '2']);
        $service = new ProjectService($repository);

        $this->assertSame(['total' => 5, 'in_progress' => 0, 'on_hold' => 0, 'completed' => 2], $service->summary($user));
    }
}
