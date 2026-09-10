<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="Projexia — your client projects, organized.">
    <title>Projexia · Client projects</title>
    <link rel="icon" type="image/svg+xml" href="/logo.svg">
    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body>
    <div id="app"></div>
    <script id="project-config" type="application/json">{!! json_encode([
        'statuses' => \App\constants\ProjectConstants::STATUSES,
        'priorities' => \App\constants\ProjectConstants::PRIORITIES,
        'pageSize' => \App\constants\AppConstants::PAGE_SIZE,
        'nameMaxLength' => \App\constants\AppConstants::NAME_MAX_LENGTH,
        'descriptionMaxLength' => \App\constants\ProjectConstants::DESCRIPTION_MAX_LENGTH,
        'searchMaxLength' => \App\constants\ProjectConstants::SEARCH_MAX_LENGTH,
        'minPasswordLength' => \App\constants\AppConstants::MIN_PASSWORD_LENGTH,
    ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
</body>
</html>
