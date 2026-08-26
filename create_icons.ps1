Add-Type -AssemblyName System.Drawing

$inputPath = Resolve-Path "public/logo.png"
$img = [System.Drawing.Image]::FromFile($inputPath)

function Save-SquareIcon($outFile, $outSize) {
    $bmp = New-Object System.Drawing.Bitmap($outSize, $outSize)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $scale = [Math]::Min($outSize / $img.Width, $outSize / $img.Height)
    $destW = [int]($img.Width * $scale)
    $destH = [int]($img.Height * $scale)
    $destX = [int](($outSize - $destW) / 2)
    $destY = [int](($outSize - $destH) / 2)

    $g.DrawImage($img, $destX, $destY, $destW, $destH)
    $g.Dispose()
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created $outFile"
}

Save-SquareIcon 'public/icon-512x512.png' 512
Save-SquareIcon 'public/icon-192x192.png' 192
Save-SquareIcon 'public/icon-144x144.png' 144
Save-SquareIcon 'public/icon-96x96.png' 96
Save-SquareIcon 'public/icon-48x48.png' 48
Save-SquareIcon 'public/favicon.ico' 48

# Also create og-image
$ogBmp = New-Object System.Drawing.Bitmap(1200, 630)
$ogG = [System.Drawing.Graphics]::FromImage($ogBmp)
$ogG.Clear([System.Drawing.Color]::White)
$ogG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$scaleOg = [Math]::Min(1100 / $img.Width, 550 / $img.Height)
$wOg = [int]($img.Width * $scaleOg)
$hOg = [int]($img.Height * $scaleOg)
$xOg = [int]((1200 - $wOg) / 2)
$yOg = [int]((630 - $hOg) / 2)
$ogG.DrawImage($img, $xOg, $yOg, $wOg, $hOg)
$ogG.Dispose()
$ogBmp.Save('public/og-image.png', [System.Drawing.Imaging.ImageFormat]::Png)
$ogBmp.Dispose()
Write-Host "Created public/og-image.png"

$img.Dispose()

