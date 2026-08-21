@echo off
REM Script لتشغيل Frontend و Backend معاً

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     Software Effort Estimation - Integrated System            ║
echo ║         Backend API + Frontend (React/Vite)                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM التحقق من وجود .venv
if not exist ".venv" (
    echo ❌ Virtual environment غير موجود!
    echo 📌 الرجاء إنشاء .venv أولاً:
    echo    python -m venv .venv
    pause
    exit /b 1
)

REM تفعيل البيئة الافتراضية
echo ✅ تفعيل البيئة الافتراضية...
call .venv\Scripts\activate.bat

REM التحقق من متطلبات Python
echo.
echo ✅ التحقق من متطلبات Backend...
python -c "import fastapi" 2>nul || (
    echo ⚠️ تثبيت متطلبات Backend...
    pip install fastapi uvicorn pandas joblib
)

REM بدء Backend في Terminal جديد
echo.
echo 🚀 بدء Backend API على http://127.0.0.1:8000...
start "Backend API - Software Effort Estimation" cmd /k "cd api && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM الانتظار قليلاً
timeout /t 3 /nobreak

REM بدء Frontend في Terminal جديد
if exist "frontend" (
    echo 🚀 بدء Frontend على http://localhost:5173...
    
    REM التحقق من node_modules
    if not exist "frontend\node_modules" (
        echo ⚠️ تثبيت dependencies للـ Frontend...
        cd frontend
        call npm install
        cd ..
    )
    
    start "Frontend - Software Effort Estimation" cmd /k "cd frontend && npm run dev"
) else (
    echo ❌ مجلد frontend غير موجود!
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║ ✅ تم بدء كلا المشروعين!                                      ║
echo ║                                                                ║
echo ║ 🌐 Backend:  http://127.0.0.1:8000                            ║
echo ║ 🌐 Frontend: http://localhost:5173                            ║
echo ║                                                                ║
echo ║ سيتم فتح نافذتي Terminal منفصلتين لكل منهما                  ║
echo ║ أغلقهما عند الانتهاء                                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause
