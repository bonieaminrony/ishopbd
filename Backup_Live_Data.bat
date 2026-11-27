@echo off
title i SHOP BD - Backup Live Data
color 0A
echo =========================================================
echo        i SHOP BD - Full backup of live data
echo =========================================================
echo.
echo Copies ALL Firestore data (products + photos, orders, users, banners...)
echo and the live server's uploaded images into the live_backup folder.
echo Nothing on the live website is changed or deleted.
echo.
echo  [1] Full backup (Firestore + live images)
echo  [2] Full backup + copy live images that are missing locally into public\uploads
echo.
set /p choice="Choose 1 or 2 [Default: 1]: "
cd /d "%~dp0"
if "%choice%"=="2" (
  call npm run backup -- --restore-missing-uploads
) else (
  call npm run backup
)
echo.
pause
