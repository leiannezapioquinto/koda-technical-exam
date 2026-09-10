$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $projectRoot '.env.docker'
if (Test-Path -LiteralPath $environmentPath) {
    Write-Host '.env.docker already exists; preserving its secrets.'
    exit 0
}
$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$keyBytes = New-Object byte[] 32
$passwordBytes = New-Object byte[] 32
$random.GetBytes($keyBytes)
$random.GetBytes($passwordBytes)
$random.Dispose()
$content = Get-Content (Join-Path $projectRoot '.env.docker.example') -Raw
$content = $content.Replace('APP_KEY=', 'APP_KEY=base64:' + [Convert]::ToBase64String($keyBytes))
$content = $content.Replace('DB_PASSWORD=', 'DB_PASSWORD=' + [Convert]::ToBase64String($passwordBytes))
[IO.File]::WriteAllText($environmentPath, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host 'Created .env.docker with random application and database secrets.'

