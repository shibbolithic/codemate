#!/bin/bash

echo "🚀 Starting CodeMate Frontend..."
echo "📍 Project directory: $(pwd)"

cd frontend/holo-pr-vision-main

echo "🔧 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo "🌐 Starting Vite development server on http://localhost:5173"
echo "🔗 Backend API should be running on http://localhost:8000"
echo ""
echo "=================================================="

npm run dev
