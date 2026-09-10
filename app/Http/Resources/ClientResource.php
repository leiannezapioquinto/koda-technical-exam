<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'client_name' => $this->client_name,
            'project_count' => (int) $this->project_count,
            'last_activity_at' => $this->last_activity_at ? Carbon::parse($this->last_activity_at)->format('Y-m-d') : null,
        ];
    }
}
