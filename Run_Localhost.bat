@echo off
title Rokomari Ponno Hari - Local Development Server
color 0A
echo =========================================================
echo       Rokomari Ponno Hari - Localhost Server
echo =========================================================
echo.
echo Starting development server on http://localhost:3000 ...
echo Press Ctrl+C anytime to stop the server.
echo.
cd /d "%~dp0"
npm run dev
pause
