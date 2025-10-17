@echo off
REM AppTest - Flask Blueprint Server Management Script

if "%1"=="start" (
    echo =======================================
    echo 🚀 AppTest - Flask Blueprint Server
    echo =======================================
    echo Starting Flask server...
    
    REM Check if virtual environment exists
    if exist ".venv\Scripts\python.exe" (
        echo Using virtual environment Python...
        ".venv\Scripts\python.exe" app.py
    ) else (
        REM Fallback to system Python
        echo Using system Python...
        python app.py
    )
    
    echo.
    echo Note: Server is running in current terminal.
    echo Press Ctrl+C to stop the server.
    echo.
    echo 🌐 Access URLs:
    echo   Main Portal: http://localhost:8080
    echo   Stopwatch:   http://localhost:8080/stopwatch
    echo   Board:       http://localhost:8080/board
    echo   QRCode:      http://localhost:8080/qrcode
    echo   Calculator:  http://localhost:8080/jsapps/calculator
    echo.
    goto :eof
)

if "%1"=="stop" (
    echo Stopping AppTest server...
    taskkill /f /im python.exe 2>nul
    echo ✅ AppTest stopped.
    goto :eof
)

if "%1"=="status" (
    echo Checking AppTest status...
    netstat -an | findstr ":8080 " >nul
    if %ERRORLEVEL%==0 (
        echo ✅ AppTest is running on port 8080
    ) else (
        echo ❌ AppTest is not running
    )
    goto :eof
)



echo =======================================
echo 🚀 AppTest - Flask Blueprint Server
echo =======================================
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   start        - Start AppTest server
echo   stop         - Stop AppTest server
echo   status       - Check server status
echo.
echo Windows Features:
echo   ✅ Flask Framework with Blueprints
echo   ✅ Independent App Modules
echo   ✅ Lightweight & Fast (Windows Optimized)
echo   ✅ Auto-detect Virtual Environment
echo   ✅ Server Compatible
echo.
echo Quick Start:
echo   %0 start
echo   Open: http://localhost:8080
echo.
echo Note: Optimized for Windows development
echo.