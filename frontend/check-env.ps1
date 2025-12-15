Write-Host "Checking for process.env in all files..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Recurse -Include *.js,*.jsx
$found = $false

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "process\.env") {
        Write-Host "`n❌ Found in: $($file.FullName)" -ForegroundColor Red
        $lines = Get-Content $file.FullName
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "process\.env") {
                Write-Host "   Line $($i+1): $($lines[$i])" -ForegroundColor Yellow
            }
        }
        $found = $true
    }
}

if (-not $found) {
    Write-Host "`n✅ No process.env found!" -ForegroundColor Green
}