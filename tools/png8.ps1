param(
  [Parameter(Mandatory=$true)][string]$Path,
  [Parameter(Mandatory=$true)][string]$Out
)

# Re-encodes a PNG screenshot to an 8-bit palette PNG (max 256 colors) to cut file size.
# Usage: powershell -NoProfile -File tools/png8.ps1 -Path assets/product/new.png -Out out.png
# Write the result over the original only if it is meaningfully smaller.

Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile((Resolve-Path $Path))
$w = $img.Width
$h = $img.Height
$tmpGif = Join-Path $env:TEMP ("png8-" + [guid]::NewGuid().ToString('N') + ".gif")
$img.Save($tmpGif, [System.Drawing.Imaging.ImageFormat]::Gif)
$img.Dispose()

$gif = [System.Drawing.Bitmap]::FromFile($tmpGif)
$dst = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format8bppIndexed)

$pal = $dst.Palette
$srcPal = $gif.Palette
for ($i = 0; $i -lt 256; $i++) { $pal.Entries[$i] = $srcPal.Entries[$i] }
$dst.Palette = $pal

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$srcData = $gif.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format8bppIndexed)
$dstData = $dst.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format8bppIndexed)

$buf = New-Object byte[] ($srcData.Stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $buf, 0, $buf.Length)
[System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $dstData.Scan0, $buf.Length)

$gif.UnlockBits($srcData)
$dst.UnlockBits($dstData)

$dst.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)

$dst.Dispose()
$gif.Dispose()
Remove-Item $tmpGif -Force -ErrorAction SilentlyContinue

$before = (Get-Item $Path).Length
$after = (Get-Item $Out).Length
[pscustomobject]@{
  File = Split-Path $Path -Leaf
  BeforeKB = [math]::Round($before / 1KB, 1)
  AfterKB = [math]::Round($after / 1KB, 1)
  SavedPct = [math]::Round((1 - $after / $before) * 100, 0)
}
