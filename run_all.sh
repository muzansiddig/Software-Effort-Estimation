#!/bin/bash

# Script لتشغيل Frontend و Backend معاً (Linux/Mac)

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Software Effort Estimation - Integrated System            ║"
echo "║         Backend API + Frontend (React/Vite)                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# التحقق من وجود .venv
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment غير موجود!"
    echo "📌 الرجاء إنشاء .venv أولاً:"
    echo "   python3 -m venv .venv"
    exit 1
fi

# تفعيل البيئة الافتراضية
echo "✅ تفعيل البيئة الافتراضية..."
source .venv/bin/activate

# التحقق من متطلبات Python
echo ""
echo "✅ التحقق من متطلبات Backend..."
python3 -c "import fastapi" 2>/dev/null || {
    echo "⚠️ تثبيت متطلبات Backend..."
    pip install fastapi uvicorn pandas joblib
}

# بدء Backend
echo ""
echo "🚀 بدء Backend API على http://127.0.0.1:8000..."
(cd api && uvicorn main:app --reload --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

# الانتظار قليلاً
sleep 2

# بدء Frontend
if [ -d "frontend" ]; then
    echo "🚀 بدء Frontend على http://localhost:5173..."
    
    # التحقق من node_modules
    if [ ! -d "frontend/node_modules" ]; then
        echo "⚠️ تثبيت dependencies للـ Frontend..."
        cd frontend
        npm install
        cd ..
    fi
    
    (cd frontend && npm run dev) &
    FRONTEND_PID=$!
else
    echo "❌ مجلد frontend غير موجود!"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ ✅ تم بدء كلا المشروعين!                                      ║"
echo "║                                                                ║"
echo "║ 🌐 Backend:  http://127.0.0.1:8000                            ║"
echo "║ 🌐 Frontend: http://localhost:5173                            ║"
echo "║                                                                ║"
echo "║ لإيقاف الخادمين: Ctrl+C                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# الحفاظ على العمليات
wait $BACKEND_PID $FRONTEND_PID
