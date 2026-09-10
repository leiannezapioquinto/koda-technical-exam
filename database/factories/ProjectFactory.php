<?php

namespace Database\Factories;

use App\constants\ProjectConstants;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-2 months', 'now');

        return [
            'user_id' => User::factory(),
            'client_name' => fake()->company(),
            'project_name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(ProjectConstants::STATUSES),
            'priority' => fake()->randomElement(ProjectConstants::PRIORITIES),
            'start_date' => $start->format('Y-m-d'),
            'due_date' => (clone $start)->modify('+45 days')->format('Y-m-d'),
        ];
    }
}
