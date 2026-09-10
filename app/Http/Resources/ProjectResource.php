<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'client_name' => $this->client_name,
            'project_name' => $this->project_name, 'description' => $this->description,
            'status' => $this->status, 'priority' => $this->priority,
            'start_date' => $this->start_date->format('Y-m-d'),
            'due_date' => $this->due_date->format('Y-m-d'),
            'created_at' => $this->created_at->toISOString(), 'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
