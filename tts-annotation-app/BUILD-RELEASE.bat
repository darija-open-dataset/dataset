@echo off
echo ========================================
echo  Building TTS Annotation Tool
echo  Portable Executable for Distribution
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies first...
    echo.
    call npm install
    echo.
)

echo Building portable executable...
echo This may take 3-5 minutes...
echo.
call npm run build:exe

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Your executable is ready:
echo Location: dist-electron\TTS-Annotation-Tool-Portable.exe
echo.
echo You can now distribute this file to users.
echo They can double-click it to run (no installation needed).
echo.

pause
