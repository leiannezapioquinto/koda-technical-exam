<?php

namespace App\Http\Requests;

use App\constants\AppConstants;
use App\constants\ProjectConstants;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:'.ProjectConstants::SEARCH_MAX_LENGTH],
            'client' => ['nullable', 'string', 'max:'.AppConstants::NAME_MAX_LENGTH],
            'status' => ['nullable', Rule::in(ProjectConstants::STATUSES)],
            'priority' => ['nullable', Rule::in(ProjectConstants::PRIORITIES)],
            'sort' => ['nullable', Rule::in(ProjectConstants::SORT_FIELDS)],
            'direction' => ['nullable', Rule::in(ProjectConstants::SORT_DIRECTIONS)],
            'page' => ['nullable', 'integer', 'min:1', 'max:1000000'],
        ];
    }
}
