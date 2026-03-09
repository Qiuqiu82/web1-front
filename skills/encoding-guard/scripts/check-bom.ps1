param(
  [Parameter(Mandatory = $true)]
  [string]$Path,
  [switch]$Recurse
)

$ErrorActionPreference = 'Stop'

function Test-Utf8Bom {
  param([string]$FilePath)
  $bytes = [System.IO.File]::ReadAllBytes($FilePath)
  return $bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191
}

$resolved = Resolve-Path $Path
$items = @()
foreach ($entry in $resolved) {
  if (Test-Path $entry -PathType Container) {
    $items += Get-ChildItem $entry -File -Recurse:$Recurse
  } else {
    $items += Get-Item $entry
  }
}

if (-not $items.Count) {
  Write-Output 'No files found.'
  exit 0
}

$results = foreach ($item in $items) {
  $hasBom = Test-Utf8Bom -FilePath $item.FullName
  [PSCustomObject]@{
    File = $item.FullName
    Utf8Bom = $hasBom
    Status = if ($hasBom) { 'HAS_BOM' } else { 'OK' }
  }
}

$results | Format-Table -AutoSize

$badCount = ($results | Where-Object { $_.Utf8Bom }).Count
if ($badCount -gt 0) {
  Write-Output "Found $badCount file(s) with UTF-8 BOM."
  exit 1
}

Write-Output 'No UTF-8 BOM found.'
exit 0