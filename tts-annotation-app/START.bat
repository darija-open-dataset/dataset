@echo off
echo ========================================
echo  TTS Annotation Tool
echo ========================================
echo.
echo Starting application...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo First time setup detected!
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    echo.
)

echo Launching TTS Annotation Tool...
echo.
call npm run electron:dev

pause
