<?php

namespace App\constants;

final class ProjectConstants
{
    public const STATUS_PLANNING = 'Planning';

    public const STATUS_IN_PROGRESS = 'In Progress';

    public const STATUS_ON_HOLD = 'On Hold';

    public const STATUS_COMPLETED = 'Completed';

    public const STATUSES = [self::STATUS_PLANNING, self::STATUS_IN_PROGRESS, self::STATUS_ON_HOLD, self::STATUS_COMPLETED];

    public const PRIORITY_LOW = 'Low';

    public const PRIORITY_MEDIUM = 'Medium';

    public const PRIORITY_HIGH = 'High';

    public const PRIORITIES = [self::PRIORITY_LOW, self::PRIORITY_MEDIUM, self::PRIORITY_HIGH];

    public const SORT_FIELDS = ['created_at', 'client_name', 'project_name', 'status', 'priority', 'start_date', 'due_date'];

    public const SORT_DIRECTIONS = ['asc', 'desc'];

    public const DESCRIPTION_MAX_LENGTH = 5000;

    public const SEARCH_MAX_LENGTH = 255;
}
