<?php

namespace App\Http\Controllers;

use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private ProjectService $projects) {}

    public function __invoke(Request $request): JsonResponse
    {
        return response()->json($this->projects->summary($request->user()));
    }
}
