@echo off
title i SHOP BD - Organize Project Folder
color 0E
echo =========================================================
echo        i SHOP BD - Tidy up the project folder
echo =========================================================
echo.
echo This MOVES old test / sample / backup files into the _archive folder.
echo Nothing is deleted. To undo, move the files back from _archive.
echo Website code, .env, api\service-account.json, public\ and src\ are NOT touched.
echo.
set /p ok="Continue? (Y/N): "
if /i not "%ok%"=="Y" goto end

cd /d "%~dp0"
if not exist "_archive" mkdir "_archive"
if not exist "_archive\root_files" mkdir "_archive\root_files"

for %%F in (live_category_sample.html live_product_sample.html live_verification_raw.json checkout_props.json bengali_strings.json firestore.rules.backup create_icons.ps1 debug.log .git_backup.bundle) do (
  if exist "%%F" (
    move /Y "%%F" "_archive\root_files\" >nul && echo   moved %%F
  )
)

for %%D in (scratch scratch_images scripts_archive) do (
  if exist "%%D" (
    move /Y "%%D" "_archive\" >nul && echo   moved folder %%D
  )
)

echo.
echo Done. Old files are now in the _archive folder.
:end
echo.
pause
