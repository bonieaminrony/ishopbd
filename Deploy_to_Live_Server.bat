@echo off
title Rokomari Ponno Hari - Live Server Deployment
color 0B
echo =========================================================
echo       Rokomari Ponno Hari - Live Server Deployment
echo =========================================================
echo.
echo  [1] Direct Live Deploy (Build & Upload to Hostinger)
echo  [2] Push to GitHub & Deploy via GitHub Actions
echo  [3] Complete Live Deploy (Build + Upload + GitHub Push)
echo.
set /p choice="Choose an option (1, 2, or 3) [Default: 1]: "

if "%choice%"=="" set choice=1

cd /d "%~dp0"

if "%choice%"=="1" goto direct_deploy
if "%choice%"=="2" goto git_push
if "%choice%"=="3" goto full_deploy

:direct_deploy
echo.
echo =========================================================
echo Building and Deploying directly to Hostinger Live Server...
echo =========================================================
echo.
npm run deploy
goto end

:git_push
echo.
echo =========================================================
echo Pushing to GitHub (origin/main)...
echo =========================================================
echo.
git add .
git commit -m "Live updates: Production release and fixes"
git push origin main
goto end

:full_deploy
echo.
echo =========================================================
echo Step 1: Building and Deploying to Hostinger Live Server...
echo =========================================================
echo.
npm run deploy
echo.
echo =========================================================
echo Step 2: Pushing to GitHub repository...
echo =========================================================
echo.
git add .
git commit -m "Live updates: Production release and fixes"
git push origin main
goto end

:end
echo.
echo =========================================================
echo Deployment process finished!
echo =========================================================
echo.
pause
