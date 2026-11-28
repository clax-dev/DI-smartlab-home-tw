# Regenera la memoria PDF a partir de memoria.html.
# Uso (desde la raíz del proyecto):  .\docs\generar-pdf.ps1
# Inserta en <!--ANEXO_CODIGO--> el código fuente actual del proyecto (escapado como HTML),
# así el anexo del PDF nunca se queda desfasado respecto al repositorio.

$docs   = $PSScriptRoot
$root   = Split-Path $docs -Parent
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$html   = Join-Path $docs "memoria.html"
$tmp    = Join-Path $docs "_memoria_tmp.html"
$pdf    = Join-Path $docs "Memoria_SmartLab_Home_RWD.pdf"

# Orden del anexo: configuración → entrada → modelo → datos → hook → páginas → componentes → estilos
$files = @(
  'package.json', 'vite.config.ts', 'tsconfig.json', 'tailwind.config.js', 'postcss.config.js',
  'capacitor.config.ts', 'index.html', 'vercel.json', 'Dockerfile', 'nginx.conf', '.dockerignore', '.gitignore',
  'src/main.tsx', 'src/App.tsx', 'src/vite-env.d.ts',
  'src/types/incident.ts', 'src/data/initialIncidents.ts', 'src/hooks/useIncidentsStorage.ts',
  'src/pages/Home.tsx', 'src/pages/IncidentDetail.tsx',
  'src/components/KpiCard.tsx', 'src/components/IncidentItem.tsx', 'src/components/NewIncidentModal.tsx',
  'src/theme/variables.css'
)

$sb = New-Object System.Text.StringBuilder
foreach ($rel in $files) {
  $path = Join-Path $root $rel
  if (-not (Test-Path $path)) { Write-Warning "No existe: $rel"; continue }
  $code  = [System.IO.File]::ReadAllText($path)
  $lines = ($code -split "`n").Count
  $esc   = [System.Net.WebUtility]::HtmlEncode($code.TrimEnd())
  [void]$sb.Append("<div class=`"file`"><h4>$rel &nbsp;·&nbsp; $lines líneas</h4><pre>$esc</pre></div>`n")
}

$content = [System.IO.File]::ReadAllText($html).Replace('<!--ANEXO_CODIGO-->', $sb.ToString())
[System.IO.File]::WriteAllText($tmp, $content, (New-Object System.Text.UTF8Encoding($false)))

& $chrome --headless=new --disable-gpu --no-pdf-header-footer "--print-to-pdf=$pdf" ("file:///" + ($tmp -replace '\\','/')) | Out-Null
Start-Sleep -Seconds 3
Remove-Item $tmp
Write-Output "PDF generado: $pdf"
