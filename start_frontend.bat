@echo off
echo 🚀 Starting CodeMate Frontend...
echo 📍 Project directory: %CD%

cd frontend\holo-pr-vision-main

echo 🔧 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo 🌐 Starting Vite development server on http://localhost:5173
echo 🔗 Backend API should be running on http://localhost:8000
echo.
echo ==================================================

call npm run dev
