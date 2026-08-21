# 📋 ملخص دمج المشروعين

## ✅ تم إنجازه

### 1. **إصلاح المسار في Backend API**
   - ✏️ تم تحديث مسار الـ Model من `best_model.pkl` إلى `random_forest_effort_model.joblib`
   - 📁 الملف الموجود: `models/random_forest_effort_model.joblib`

### 2. **الاتصال بين Frontend و Backend**
   - ✅ Frontend (React/Vite) يتواصل مع Backend (FastAPI)
   - 🔗 **Endpoint:** `POST http://127.0.0.1:8000/predict`
   - 📤 **Format:** JSON

### 3. **تثبيت CORS**
   - ✅ موجود بالفعل في Backend
   - يسمح بالاتصال من أي مصدر

### 4. **ملفات التشغيل**
   - ✅ `requirements.txt` - متطلبات Python
   - ✅ `run_all.bat` - script لـ Windows
   - ✅ `run_all.sh` - script لـ Linux/Mac
   - ✅ `INTEGRATION_GUIDE.md` - دليل شامل

---

## 🚀 كيفية البدء (Windows)

### **الطريقة السريعة:**
```bash
# افتح PowerShell في مجلد المشروع
run_all.bat
```

### **الطريقة اليدوية:**

#### **Terminal 1 - تشغيل Backend:**
```bash
.venv\Scripts\activate
pip install -r requirements.txt
cd api
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### **Terminal 2 - تشغيل Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 كيفية البدء (Linux/Mac)

### **الطريقة السريعة:**
```bash
chmod +x run_all.sh
./run_all.sh
```

### **الطريقة اليدوية:**

#### **Terminal 1 - تشغيل Backend:**
```bash
source .venv/bin/activate
pip install -r requirements.txt
cd api
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### **Terminal 2 - تشغيل Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 الوصول للتطبيق

| المكون | الرابط | الحالة |
|------|-------|-------|
| **Frontend** | http://localhost:5173 | ✅ جاهز |
| **Backend API** | http://127.0.0.1:8000 | ✅ جاهز |
| **API Docs** | http://127.0.0.1:8000/docs | ✅ Swagger |

---

## 📊 كيفية الاستخدام

### **من خلال الواجهة الرسومية:**
1. افتح http://localhost:5173
2. ملأ نموذج البيانات
3. اضغط **"Predict"** أو **"Estimate"**
4. اعرض النتيجة

### **من خلال API مباشرة (curl):**

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

---

## 📁 هيكل المشروع

```
software-effort-estimation/
├── api/
│   ├── main.py              # Backend API (FastAPI)
│   └── __pycache__/
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main Component
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/
├── models/
│   └── random_forest_effort_model.joblib  # Trained Model
├── data/
│   ├── raw/
│   │   └── nasa93.arff
│   └── processed/
│       ├── nasa93_clean.csv
│       └── nasa93_encoded.csv
├── requirements.txt         # Python Dependencies
├── run_all.bat             # Windows Script
├── run_all.sh              # Linux/Mac Script
├── INTEGRATION_GUIDE.md    # Detailed Guide
├── .venv/                  # Virtual Environment
└── README.md
```

---

## 🔧 معلومات التقنية

### **Backend:**
- 🐍 Framework: FastAPI
- 🚀 Server: Uvicorn
- 📊 Model: Random Forest (scikit-learn)
- 📦 Dataset: NASA93 COCOMO

### **Frontend:**
- ⚛️ Framework: React 19.2.8
- 🎨 Build Tool: Vite 8.2.0
- 📝 Package Manager: npm

### **Communication:**
- 🔗 Protocol: HTTP/HTTPS
- 📤 Format: JSON
- 🔓 CORS: Enabled
- ✅ Content-Type: application/json

---

## ⚙️ Configuration

### **تغيير منفذ Backend:**
```bash
uvicorn main:app --reload --port 9000
```

ثم في `frontend/src/App.jsx`:
```javascript
const response = await fetch("http://127.0.0.1:9000/predict", {
  // ...
})
```

### **تغيير منفذ Frontend:**
في `frontend/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

---

## 🐛 استكشاف الأخطاء

### ❌ "Model not found"
```
⚠️ Model not found at ...models/random_forest_effort_model.joblib
```
**الحل:** تأكد من وجود الملف في المسار الصحيح

### ❌ "Failed to fetch" أو CORS error
**الحل:**
- تأكد أن Backend يعمل على `http://127.0.0.1:8000`
- تحقق من أن CORS middleware مفعل

### ❌ "npm: command not found"
**الحل:** ثبّت Node.js من https://nodejs.org

### ❌ "port already in use"
**الحل:** استخدم منفذ مختلف:
```bash
# للـ Backend:
uvicorn main:app --port 9000

# للـ Frontend:
npm run dev -- --port 3000
```

---

## 📚 موارد إضافية

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [API Documentation (Swagger)](http://127.0.0.1:8000/docs)

---

## ✨ الخطوات التالية (اختياري)

- [ ] إضافة التحقق من صحة البيانات
- [ ] إضافة رسائل خطأ أفضل
- [ ] إضافة رسوم بيانية للنتائج
- [ ] حفظ النتائج في قاعدة بيانات
- [ ] إضافة نماذج إضافية
- [ ] نشر على الإنترنت (Deploy)

---

**تم إعداد المشروع بنجاح! ✅**

**للمساعدة أو الأسئلة، راجع `INTEGRATION_GUIDE.md`**
