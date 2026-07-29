Add-Type -AssemblyName System.Drawing
 = [System.Drawing.Image]::FromFile('public/logo.png')
 = [Math]::Max(.Width, .Height)

function Save-SquareIcon(, ) {
     = New-Object System.Drawing.Bitmap(, )
     = [System.Drawing.Graphics]::FromImage()
    .Clear([System.Drawing.Color]::White)
    
    # Calculate scaled dimensions to fit inside outSize while preserving aspect ratio
     = [Math]::Min( / .Width,  / .Height)
    # Add a little padding (e.g., 80% of max size)
     =  * 0.8
     = [int](.Width * )
     = [int](.Height * )
     = [int](( - ) / 2)
     = [int](( - ) / 2)
    
    .DrawImage(, , , , )
    .Dispose()
    .Save(, [System.Drawing.Imaging.ImageFormat]::Png)
    .Dispose()
    Write-Host "Created "
}

Save-SquareIcon 'public/icon-512x512.png' 512
Save-SquareIcon 'public/icon-192x192.png' 192

.Dispose()
