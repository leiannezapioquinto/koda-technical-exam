<?php

namespace App\Repositories;

use App\constants\AppConstants;
use App\constants\ProjectConstants;
use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ProjectRepository
{
    protected function ownedBy(User $user): Builder
    {
        return Project::query()->where('user_id', $user->id);
    }

    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        $query = $this->ownedBy($user);
        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $filters['search']).'%';
            $query->where(function (Builder $query) use ($search): void {
                $query->where('client_name', 'ilike', $search)
                    ->orWhere('project_name', 'ilike', $search)
                    ->orWhere('description', 'ilike', $search);
            });
        }
        if (isset($filters['client']) && $filters['client'] !== '') {
            $query->where('client_name', $filters['client']);
        }
        foreach (['status', 'priority'] as $field) {
            if (! empty($filters[$field])) {
                $query->where($field, $filters[$field]);
            }
        }
        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        if ($sort === 'priority') {
            $query->orderByRaw('CASE priority WHEN ? THEN 1 WHEN ? THEN 2 WHEN ? THEN 3 END '.$direction, ProjectConstants::PRIORITIES);
        } else {
            $query->orderBy($sort, $direction);
        }

        return $query->orderBy('id', $direction)->paginate(AppConstants::PAGE_SIZE)->withQueryString();
    }

    public function findOwned(User $user, int $id): Project
    {
        return $this->ownedBy($user)->findOrFail($id);
    }

    public function create(User $user, array $attributes): Project
    {
        $project = new Project($attributes);
        $project->user()->associate($user);
        $project->save();

        return $project;
    }

    public function update(Project $project, array $attributes): Project
    {
        $project->update($attributes);

        return $project->refresh();
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    /**
     * Distinct clients for the user, each with its project count and most recent activity.
     *
     * @return Collection<int, Project>
     */
    public function clientSummaries(User $user): Collection
    {
        return $this->ownedBy($user)
            ->selectRaw('client_name, COUNT(*) as project_count, MAX(updated_at) as last_activity_at')
            ->groupBy('client_name')
            ->orderByRaw('COUNT(*) DESC')
            ->orderBy('client_name')
            ->get();
    }

    public function statusCounts(User $user): array
    {
        return $this->ownedBy($user)->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status')->all();
    }
}
