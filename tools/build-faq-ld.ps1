# Regenerates the FAQPage JSON-LD block in faq.html from the page content.
# Usage: powershell -File tools/build-faq-ld.ps1 -Path faq.html
# Requires Windows PowerShell 5.1+ (file is saved as UTF-8 with BOM on purpose).
param(
  [Parameter(Mandatory=$true)][string]$Path,
  [string]$Url = 'https://obmenjson.ru/faq.html'
)

Add-Type -AssemblyName System.Web.Extensions

function Convert-JsonPretty {
  param($Value, [int]$Level = 0)
  $pad = ' ' * ($Level * 2)
  $padIn = ' ' * (($Level + 1) * 2)
  if ($null -eq $Value) { return 'null' }
  if ($Value -is [string]) { return ($Value | ConvertTo-Json -Compress) }
  if ($Value -is [bool] -or $Value -is [int] -or $Value -is [long] -or $Value -is [double]) { return $Value.ToString().ToLower() }
  if ($Value -is [System.Collections.IDictionary]) {
    $parts = foreach ($k in $Value.Keys) { $padIn + ($k | ConvertTo-Json -Compress) + ': ' + (Convert-JsonPretty $Value[$k] ($Level + 1)) }
    if (-not $parts) { return '{}' }
    return "{`n" + ($parts -join ",`n") + "`n$pad}"
  }
  if ($Value -is [System.Collections.IEnumerable]) {
    $items = foreach ($i in $Value) { $padIn + (Convert-JsonPretty $i ($Level + 1)) }
    if (-not $items) { return '[]' }
    return "[`n" + ($items -join ",`n") + "`n$pad]"
  }
  return ($Value.ToString() | ConvertTo-Json -Compress)
}

function Get-PlainText {
  param([string]$Html)
  $t = $Html -replace '(?s)<!--.*?-->', ' '
  $t = $t -replace '<\s*li[^>]*>', ' • '
  $t = $t -replace '<[^>]+>', ' '
  $t = $t -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&#39;', "'" -replace '&nbsp;', ' ' -replace '&amp;', '&'
  $t = $t -replace '\s+', ' '
  return $t.Trim()
}

$html = Get-Content $Path -Raw -Encoding UTF8
$html = [regex]::Replace($html, '(?s)\s*<script type="application/ld\+json">.*?</script>', '')

$blocks = [regex]::Matches($html, '(?s)<h3 id="(q-[^"]+)">(.*?)</h3>\s*(.*?)(?=<h[23][\s>]|</article>)')

$questions = @()
foreach ($m in $blocks) {
  $q = Get-PlainText $m.Groups[2].Value
  $a = Get-PlainText $m.Groups[3].Value
  $questions += ,([ordered]@{
    '@type' = 'Question'
    name = $q
    acceptedAnswer = [ordered]@{
      '@type' = 'Answer'
      text = $a
    }
  })
}

$ld = [ordered]@{
  '@context' = 'https://schema.org'
  '@type' = 'FAQPage'
  '@id' = "$Url#faq"
  mainEntity = $questions
}

$json = Convert-JsonPretty $ld 0
$block = "  <script type=`"application/ld+json`">`n$json`n  </script>`n</head>"
$html = [regex]::Replace($html, '(?m)^\s*</head>', { param($m) $block })
[System.IO.File]::WriteAllText($Path, $html, (New-Object System.Text.UTF8Encoding($false)))

"questions: $($questions.Count)"
"first: $($questions[0].name)"
"answer sample: $($questions[0].acceptedAnswer.text.Substring(0, 90))..."
