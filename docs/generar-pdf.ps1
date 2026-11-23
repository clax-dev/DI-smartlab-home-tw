# Regenera la memoria PDF a partir de memoria.html.
# Uso (desde la raíz del proyecto):
#   .\docs\generar-pdf.ps1 -Url "https://tu-app.vercel.app"
# Si se pasa -Url, sustituye URL_VERCEL en una copia temporal del HTML (el original no se toca).
param([string]$Url = "")

$docs   = $PSScriptRoot
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$html   = Join-Path $docs "memoria.html"
$tmp    = Join-Path $docs "_memoria_tmp.html"
$pdf    = Join-Path $docs "Memoria_SmartLab_Home_RWD.pdf"

$content = [System.IO.File]::ReadAllText($html)
if ($Url) { $content = $content.Replace("URL_VERCEL", $Url) }
[System.IO.File]::WriteAllText($tmp, $content, (New-Object System.Text.UTF8Encoding($false)))

& $chrome --headless=new --disable-gpu --no-pdf-header-footer "--print-to-pdf=$pdf" ("file:///" + ($tmp -replace '\\','/')) | Out-Null
Start-Sleep -Seconds 2
Remove-Item $tmp
Write-Output "PDF generado: $pdf"
