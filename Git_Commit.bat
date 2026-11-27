@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === iShopBD: saving code to git ===
git rev-parse --is-inside-work-tree >nul 2>&1 || (echo This folder is not a git repository. & pause & exit /b 1)
git add -A
git diff --cached --name-only | findstr /i /r "service-account\.json \.env$ \.env\." | findstr /v /i "\.env\.example" >nul
if not errorlevel 1 (
  echo A secret file was about to be committed. Stopping - nothing was committed.
  git reset -q
  pause
  exit /b 1
)
git diff --cached --quiet && (echo Nothing new to commit. & pause & exit /b 0)
echo Files in this commit:
git diff --cached --stat
git commit -m "Admin update: orders, stock, products, categories, POS, campaigns, image speed" -m "Order edit window made compact; district no longer defaults to Dhaka; stock ledger per size with restore on cancel/return/delete; create order with SMS; gray admin theme (no yellow); manual courier check; category deep links; campaign rebuild."
if errorlevel 1 (
  echo.
  echo Commit failed. If git asked for your name/email, run once:
  echo   git config --global user.name "Your Name"
  echo   git config --global user.email "you@example.com"
  pause
  exit /b 1
)
echo.
git log --oneline -1
echo Done - code saved in git.
pause
