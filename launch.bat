@echo off
REM 🚀 AAZAN AI - QUICK LAUNCH SCRIPT (Windows)
REM Run this batch file to launch AAZAN AI

echo.
echo 🚀 AAZAN AI - Quick Launch (Windows)
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Node.js not installed. Please install from nodejs.org
    pause
    exit /b 1
)

echo 📦 Step 1: Installing Dependencies
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🗄️  Step 2: Checking Environment Setup

if not exist .env.local (
    echo ⚠️  .env.local not found. Creating from .env.example
    copy .env.example .env.local
    echo 📝 Please edit .env.local with your API keys
    echo Edit this file: .env.local
    pause
)

echo.
echo 🐳 Starting Docker services (if available)...
docker-compose up -d 2>nul

echo.
echo 🔄 Step 3: Running Database Migrations
call npx prisma db push --skip-generate

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Database migration warning (database might not be ready)
    echo Make sure PostgreSQL is running
    pause
)

echo.
echo ✅ Setup Complete!
echo.
echo 🚀 Starting Development Server...
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start development server
    pause
    exit /b 1
)

echo.
echo 🎉 AAZAN AI is running!
echo Visit: http://localhost:3000
echo.
pause
