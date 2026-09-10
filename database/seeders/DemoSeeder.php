<?php

namespace Database\Seeders;

use App\constants\ProjectConstants as ProjectValues;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            throw new \RuntimeException('Demo data is only available in local or testing environments.');
        }
        $user = User::firstOrCreate(['email' => 'demo@projexia.test'], ['name' => 'Alex Morgan', 'password' => Hash::make('ProjexiaDemo2026!')]);
        $examples = [
            ['Acme Studio', 'Brand identity refresh', 'A cohesive visual identity across print and digital.', ProjectValues::STATUS_IN_PROGRESS, ProjectValues::PRIORITY_HIGH],
            ['Bloom & Co.', 'E-commerce website', 'A new storefront for the spring collection.', ProjectValues::STATUS_IN_PROGRESS, ProjectValues::PRIORITY_HIGH],
            ['Lumina', 'Social media campaign', 'Launch assets and a monthly content calendar.', ProjectValues::STATUS_PLANNING, ProjectValues::PRIORITY_MEDIUM],
            ['Vertex Labs', 'Product landing page', 'A focused landing page for the new platform.', ProjectValues::STATUS_COMPLETED, ProjectValues::PRIORITY_MEDIUM],
            ['Northstar', 'Mobile app redesign', 'Refresh the customer-facing mobile experience.', ProjectValues::STATUS_ON_HOLD, ProjectValues::PRIORITY_LOW],
            ['Evergreen', 'SEO & content strategy', 'Editorial planning and on-page improvements.', ProjectValues::STATUS_IN_PROGRESS, ProjectValues::PRIORITY_MEDIUM],
            ['Forma Design', 'Portfolio website', 'Showcase the studio’s latest work.', ProjectValues::STATUS_PLANNING, ProjectValues::PRIORITY_LOW],
            ['Orbit Digital', 'Marketing dashboard', 'Bring campaign reporting into one place.', ProjectValues::STATUS_COMPLETED, ProjectValues::PRIORITY_HIGH],
        ];
        foreach ($examples as $index => [$client, $name, $description, $status, $priority]) {
            $user->projects()->firstOrCreate(['project_name' => $name], [
                'client_name' => $client, 'description' => $description, 'status' => $status, 'priority' => $priority,
                'start_date' => now()->subDays(14 + $index)->toDateString(), 'due_date' => now()->addDays($index * 3 + 2)->toDateString(),
            ]);
        }
    }
}
