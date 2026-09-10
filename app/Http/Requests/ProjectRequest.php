<?php

namespace App\Http\Requests;

use App\constants\AppConstants;
use App\constants\ProjectConstants;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'client_name' => ['required', 'string', 'max:'.AppConstants::NAME_MAX_LENGTH],
            'project_name' => ['required', 'string', 'max:'.AppConstants::NAME_MAX_LENGTH],
            'description' => ['nullable', 'string', 'max:'.ProjectConstants::DESCRIPTION_MAX_LENGTH],
            'status' => ['required', Rule::in(ProjectConstants::STATUSES)],
            'priority' => ['required', Rule::in(ProjectConstants::PRIORITIES)],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'due_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
        ];
    }

    public function messages(): array
    {
        return ['due_date.after_or_equal' => 'The due date cannot be earlier than the start date.'];
    }
}
