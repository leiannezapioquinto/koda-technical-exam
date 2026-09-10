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
<body><div id="app"></div></body>
</html>
