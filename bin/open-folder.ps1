param([string]$raw)
$logFile = "c:\Users\David\Documents\local wp\bin\protocol.log"
Add-Content -Path $logFile -Value "--- $(Get-Date) ---"
Add-Content -Path $logFile -Value "RAW: $raw"

if (-not $raw) { exit }

# Decode URL
$decoded = [System.Uri]::UnescapeDataString($raw)
Add-Content -Path $logFile -Value "UNESCAPED: $decoded"

# Remove fastwp:// or fastwp:
$clean = $decoded -replace '^fastwp://+', '' -replace '^fastwp:+', ''
$clean = $clean.Replace('/', '\').Trim().Trim('"').Trim("'")
$clean = $clean.TrimStart('\')

# Restore colon if browser stripped it from drive letter (e.g. C\Users -> C:\Users)
if ($clean -match '^[a-zA-Z]\\[^\\]') {
    $clean = $clean.Substring(0, 1) + ':\' + $clean.Substring(2)
}

Add-Content -Path $logFile -Value "CLEAN: $clean"
$exists = Test-Path -LiteralPath $clean
Add-Content -Path $logFile -Value "EXISTS: $exists"

if ($exists) {
    try {
        Start-Process explorer.exe -ArgumentList "`"$clean`""
        Add-Content -Path $logFile -Value "METHOD: Start-Process explorer.exe SUCCESS ($clean)"
    } catch {
        $sh = New-Object -ComObject Shell.Application
        $sh.Open($clean)
        Add-Content -Path $logFile -Value "METHOD: Shell.Application.Open fallback SUCCESS"
    }
} else {
    Add-Content -Path $logFile -Value "PATH DOES NOT EXIST: $clean"
}
