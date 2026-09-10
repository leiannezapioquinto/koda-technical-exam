<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectIndexRequest;
use App\Http\Requests\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    public function __construct(private ProjectService $projects) {}

    public function index(ProjectIndexRequest $request): AnonymousResourceCollection
    {
        return ProjectResource::collection($this->projects->list($request->user(), $request->validated()));
    }

    public function show(Request $request, int $id): ProjectResource
    {
        return new ProjectResource($this->projects->find($request->user(), $id));
    }

    public function store(ProjectRequest $request): ProjectResource
    {
        return new ProjectResource($this->projects->create($request->user(), $request->validated()));
    }

    public function update(ProjectRequest $request, int $id): ProjectResource
    {
        return new ProjectResource($this->projects->update($request->user(), $id, $request->validated()));
    }

    public function destroy(Request $request, int $id): Response
    {
        $this->projects->delete($request->user(), $id);

        return response()->noContent();
    }
}
