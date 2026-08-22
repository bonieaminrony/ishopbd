@echo off
title i SHOP BD - Live Server Deployment
echo =======================================================
echo         i SHOP BD - Live Server Deployment
echo =======================================================
echo.
echo Pushing committed logo updates to GitHub...
echo (If prompted, please click "Sign in with your browser")
echo.
E:
cd "E:\Making File\Logo\ishopbd.com"
git push origin main
echo.
echo =======================================================
echo If the push succeeded, GitHub Actions will now build 
echo and deploy the new logo to Hostinger live server.
echo =======================================================
echo.
pause
