Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('public/logo.png')
$size = [Math]::Max($img.Width, $img.Height)

function Save-SquareIcon($outFile, $outSize) {
    $bmp = New-Object System.Drawing.Bitmap($outSize, $outSize)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    
    $ratio = [Math]::Min($outSize / $img.Width, $outSize / $img.Height)
    $ratio = $ratio * 0.9
    $newW = [int]($img.Width * $ratio)
    $newH = [int]($img.Height * $ratio)
    $x = [int](($outSize - $newW) / 2)
    $y = [int](($outSize - $newH) / 2)
    
    $g.DrawImage($img, $x, $y, $newW, $newH)
    $g.Dispose()
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created $outFile"
}

Save-SquareIcon 'public/icon-512x512.png' 512
Save-SquareIcon 'public/icon-192x192.png' 192

$img.Dispose()
