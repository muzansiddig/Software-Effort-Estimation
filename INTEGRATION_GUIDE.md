# 🚀 دليل تشغيل المشروع المدمج

## البنية الحالية

```
Backend API (FastAPI)  ← Connected →  Frontend (React/Vite)
  :8000                               :5173
```

## المتطلبات

- ✅ Python 3.x + Virtual Environment (.venv موجود)
- ✅ Node.js 18+ (للـ Frontend)
- ✅ FastAPI و Uvicorn (في الـ Backend)
- ✅ React 19 (في الـ Frontend)

---

## 📌 خطوات التشغيل

### **1️⃣ تشغيل Backend API**

```bash
# تفعيل البيئة الافتراضية
.venv\Scripts\activate

# التأكد من تثبيت المتطلبات
pip install fastapi uvicorn pandas joblib

# تشغيل الـ API
cd api
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**النتيجة المتوقعة:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

---

### **2️⃣ تشغيل Frontend**

في **terminal جديد**:

```bash
# الانتقال إلى مجلد Frontend
cd frontend

# تثبيت المتطلبات (إذا لم تُثبت من قبل)
npm install

# تشغيل الـ Development Server
npm run dev
```

**النتيجة المتوقعة:**
```
VITE v8.2.0  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 🔗 تدفق الاتصال

```
1. المستخدم يملأ النموذج في Frontend
         ↓
2. يضغط "Submit" أو "Predict"
         ↓
3. Frontend يرسل POST request إلى:
   http://127.0.0.1:8000/predict
         ↓
4. Backend API يعالج البيانات
         ↓
5. Model يقوم بالتنبؤ
         ↓
6. يُرجع النتيجة JSON للـ Frontend
         ↓
7. Frontend يعرض النتيجة للمستخدم
```

---

## 📊 Endpoints المتاحة

### **GET `/`**
اختبار اتصال الـ API

**Request:**
```bash
curl http://127.0.0.1:8000
```

**Response:**
```json
{"message": "Software Effort Estimation API is running"}
```

---

### **POST `/predict`**
توقع Effort

**Request:**
```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "projectname": "X",
    "cat2": "simulation",
    "forg": "g",
    "center": "2",
    "year": 1985,
    "mode": "organic",
    "rely": "n",
    "data": "n",
    "cplx": "n",
    "time": "n",
    "stor": "n",
    "virt": "n",
    "turn": "n",
    "acap": "n",
    "aexp": "n",
    "pcap": "n",
    "vexp": "n",
    "lexp": "n",
    "modp": "n",
    "tool": "n",
    "sced": "n",
    "equivphyskloc": 50
  }'
```

**Response:**
```json
{
  "estimated_effort": 23.45,
  "unit": "person-months",
  "model": "Random Forest",
  "dataset": "NASA93"
}
```

---

## 🐛 استكشاف الأخطاء

### ❌ Backend لا يستطيع العثور على Model
```
⚠️ Model not found at ...models/random_forest_effort_model.joblib
```
**الحل:** تأكد من وجود الملف في `models/random_forest_effort_model.joblib`

---

### ❌ Frontend لا يستطيع الاتصال بـ Backend
```
Error: Failed to fetch
CORS error
```
**الحل:**
- تأكد أن Backend يعمل على `http://127.0.0.1:8000`
- تحقق من أن CORS middleware مفعل (موجود في main.py)

---

### ❌ Node modules مفقودة
```
Error: Cannot find module 'react'
```
**الحل:**
```bash
cd frontend
npm install
```

---

## 🎨 Customization

### تغيير رقم المنفذ للـ Frontend
في `frontend/vite.config.js`:
```javascript
export default {
  server: {
    port: 3000 // غير إلى أي رقم تريده
  }
}
```

### تغيير رقم المنفذ للـ Backend
عند التشغيل:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 9000
```

ثم عدّل في Frontend (`App.jsx`):
```javascript
const response = await fetch("http://127.0.0.1:9000/predict", ...
```

---

## ✅ التحقق من الاتصال

```bash
# اختبر الـ Backend
curl http://127.0.0.1:8000

# اختبر الـ Frontend
curl http://localhost:5173
```

---

## 📝 ملاحظات مهمة

- ✅ CORS مفعل لتقبل طلبات من أي مصدر
- ✅ Model محمل تلقائياً عند بدء الـ API
- ✅ Frontend يتواصل عبر HTTP JSON
- ✅ Python version: 3.8+

---

**Happy Coding! 🎉**
