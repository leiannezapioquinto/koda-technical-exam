<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function __construct(private ProjectService $projects) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return ClientResource::collection($this->projects->clients($request->user()));
    }
}
