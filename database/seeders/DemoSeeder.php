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
            ['Acme Corporation', 'Corporate Website Redesign', "Redesign and modernize the company's corporate website.", ProjectValues::STATUS_IN_PROGRESS, ProjectValues::PRIORITY_HIGH, '2026-06-01', '2026-07-15'],
            ['GreenLeaf Cafe', 'Online Ordering System', 'Develop an online ordering platform for customers.', ProjectValues::STATUS_PLANNING, ProjectValues::PRIORITY_MEDIUM, '2026-06-10', '2026-08-01'],
            ['Bright Realty', 'Property Listing Portal', 'Build a portal for managing property listings.', ProjectValues::STATUS_ON_HOLD, ProjectValues::PRIORITY_MEDIUM, '2026-05-15', '2026-07-30'],
            ['Nova Fitness', 'Mobile App MVP', 'Develop the first version of the fitness tracking app.', ProjectValues::STATUS_IN_PROGRESS, ProjectValues::PRIORITY_HIGH, '2026-06-05', '2026-08-20'],
            ['Blue Ocean Travel', 'Booking Platform Enhancement', 'Improve search and booking functionalities.', ProjectValues::STATUS_COMPLETED, ProjectValues::PRIORITY_MEDIUM, '2026-04-01', '2026-05-30'],
            ['TechVision Solutions', 'CRM Dashboard', 'Develop an internal CRM dashboard.', ProjectValues::STATUS_PLANNING, ProjectValues::PRIORITY_HIGH, '2026-06-15', '2026-08-15'],
            ['Urban Living', 'Property Management System', 'Create a platform for managing rental properties.', ProjectValues::STATUS_IN_PROGRESS, ProjectValues::PRIORITY_MEDIUM, '2026-05-20', '2026-08-10'],
            ['Elite Events', 'Event Registration Portal', 'Develop a registration and ticketing portal.', ProjectValues::STATUS_PLANNING, ProjectValues::PRIORITY_LOW, '2026-06-20', '2026-09-01'],
            ['HealthFirst Clinic', 'Patient Appointment System', 'Build an appointment scheduling application.', ProjectValues::STATUS_COMPLETED, ProjectValues::PRIORITY_HIGH, '2026-03-01', '2026-05-01'],
            ['MarketPro', 'Marketing Campaign Dashboard', 'Track and manage digital marketing campaigns.', ProjectValues::STATUS_IN_PROGRESS, ProjectValues::PRIORITY_MEDIUM, '2026-06-01', '2026-07-31'],
            ['Sunrise Education', 'Learning Management Portal', 'Develop a portal for students and instructors.', ProjectValues::STATUS_PLANNING, ProjectValues::PRIORITY_HIGH, '2026-07-01', '2026-09-30'],
            ['FreshFarm', 'Inventory Management System', 'Track inventory across multiple locations.', ProjectValues::STATUS_ON_HOLD, ProjectValues::PRIORITY_LOW, '2026-05-01', '2026-08-01'],
        ];
        foreach ($examples as [$client, $name, $description, $status, $priority, $startDate, $dueDate]) {
            $user->projects()->firstOrCreate(['project_name' => $name], [
                'client_name' => $client, 'description' => $description, 'status' => $status, 'priority' => $priority,
                'start_date' => $startDate, 'due_date' => $dueDate,
            ]);
        }
    }
}
