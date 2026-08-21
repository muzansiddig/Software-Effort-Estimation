# 💡 Software Effort Estimation System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![Vite](https://img.shields.io/badge/Vite-8.2-646cff)
![NASA93](https://img.shields.io/badge/Dataset-NASA93-orange)
![Status](https://img.shields.io/badge/Status-Ready-brightgreen)

تطبيق متكامل لتقدير جهد تطوير البرمجيات باستخدام نموذج Machine Learning على مجموعة بيانات NASA93

[🚀 البدء السريع](#-البدء-السريع) •
[📖 الوثائق](#-الوثائق) •
[🔧 المتطلبات](#-المتطلبات) •
[💻 التطوير](#-التطوير)

</div>

---

## 📝 نبذة عن المشروع

هذا المشروع يوفر نظام متكامل لتقدير الجهد المطلوب لتطوير مشروع برمجي بناءً على معايير COCOMO وبيانات NASA93.

### المميزات الرئيسية:
- 🤖 نموذج Machine Learning (Random Forest)
- 🎨 واجهة رسومية حديثة (React + Vite)
- 🔗 API بسيط وآمن (FastAPI)
- 📊 دقة عالية في التنبؤ
- ⚡ أداء سريع
- 📱 متوافق مع جميع الأجهزة

---

## 🎯 الحالة الحالية

✅ **جاهز للعمل الفوري**

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│  Frontend   │───────│    Backend   │───────│ ML Model    │
│ (React)     │ HTTP  │  (FastAPI)   │ Load  │ (Pipeline)  │
└─────────────┘        └──────────────┘        └─────────────┘
```

---

## 🚀 البدء السريع

### الطريقة الأسهل (Windows):

```bash
# انسخ هذا الأمر
run_all.bat
```

### الطريقة الأسهل (Linux/Mac):

```bash
chmod +x run_all.sh
./run_all.sh
```

### الطريقة اليدوية:

#### Terminal 1 - Backend:
```bash
# تفعيل البيئة الافتراضية
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الـ API
cd api
uvicorn main:app --reload --port 8000
```

#### Terminal 2 - Frontend:
```bash
# الانتقال للـ frontend
cd frontend

# تثبيت dependencies (إذا لم تكن مثبتة)
npm install

# تشغيل الـ dev server
npm run dev
```

---

## 🌐 الوصول للتطبيق

| المكون | الرابط | الوصف |
|------|-------|-------|
| **Frontend** | http://localhost:5173 | 🎨 الواجهة الرسومية |
| **Backend API** | http://127.0.0.1:8000 | 🔗 API Server |
| **API Docs** | http://127.0.0.1:8000/docs | 📚 Swagger Documentation |

---

## 📖 الوثائق

- 🏃 [**QUICK_START.md**](QUICK_START.md) - ابدأ من هنا!
- 📋 [**INTEGRATION_GUIDE.md**](INTEGRATION_GUIDE.md) - دليل شامل بالتفاصيل
- 📊 [**PROJECT_STATUS.md**](PROJECT_STATUS.md) - حالة المشروع والمكونات
- 📝 [**CHANGELOG.md**](CHANGELOG.md) - سجل التغييرات

---

## 🔧 المتطلبات

### Backend Requirements:
- Python 3.8+
- FastAPI 0.104+
- Uvicorn 0.24+
- Pandas 2.1+
- Joblib 1.3+

### Frontend Requirements:
- Node.js 18+
- npm 9+
- React 19+
- Vite 8+

### نموذج ML:
- Scikit-learn Pipeline
- Random Forest Classifier/Regressor
- Dataset: NASA93 COCOMO

---

## 📁 هيكل المشروع

```
software-effort-estimation/
│
├── 🚀 استخدام سريع
│   ├── run_all.bat              # Script تشغيل Windows
│   ├── run_all.sh               # Script تشغيل Linux/Mac
│   └── requirements.txt         # متطلبات Python
│
├── 📖 الوثائق
│   ├── README.md                # هذا الملف
│   ├── QUICK_START.md           # البدء السريع
│   ├── INTEGRATION_GUIDE.md     # دليل التكامل
│   ├── PROJECT_STATUS.md        # حالة المشروع
│   └── CHANGELOG.md             # سجل التغييرات
│
├── 🐍 Backend
│   ├── api/
│   │   └── main.py              # FastAPI Application
│   ├── models/
│   │   └── random_forest_effort_model.joblib
│   ├── data/
│   │   ├── raw/
│   │   │   └── nasa93.arff
│   │   └── processed/
│   │       ├── nasa93_clean.csv
│   │       └── nasa93_encoded.csv
│   └── src/
│       ├── preprocessing.py
│       ├── train_final_model.py
│       └── ...other modules
│
├── ⚛️ Frontend
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── App.jsx          # Main Component
│   │   │   ├── App.css          # Styling
│   │   │   ├── main.jsx         # Entry Point
│   │   │   └── index.css        # Global Styles
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── public/
│   │
│   └── .venv/                   # Python Virtual Environment
│
└── 📊 نتائج وتقارير
    ├── results/
    │   ├── metrics/
    │   └── tables/
    └── notebooks/
```

---

## 🔌 API Endpoints

### 1. Health Check
```http
GET /
```

**Response:**
```json
{
  "message": "Software Effort Estimation API is running"
}
```

### 2. Predict Effort
```http
POST /predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectname": "string",
  "cat2": "string",
  "forg": "string",
  "center": "string",
  "year": 1985,
  "mode": "string",
  "rely": "string",
  "data": "string",
  "cplx": "string",
  "time": "string",
  "stor": "string",
  "virt": "string",
  "turn": "string",
  "acap": "string",
  "aexp": "string",
  "pcap": "string",
  "vexp": "string",
  "lexp": "string",
  "modp": "string",
  "tool": "string",
  "sced": "string",
  "equivphyskloc": 50
}
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

## 💻 التطوير

### إضافة ميزة جديدة:

1. **في Backend:**
   ```python
   # عدّل api/main.py
   @app.post("/new-endpoint")
   def new_endpoint(data: NewModel):
       # Your code here
       return result
   ```

2. **في Frontend:**
   ```javascript
   // عدّل frontend/src/App.jsx
   const response = await fetch(
     "http://127.0.0.1:8000/new-endpoint",
     { method: "POST", ... }
   );
   ```

### تشغيل الاختبارات:
```bash
# اختبر Backend
pytest src/

# اختبر Frontend
npm test
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Port already in use"
```bash
# غير المنفذ
uvicorn main:app --port 9000
```

### المشكلة: CORS Error
```
تأكد من أن:
1. Backend يعمل على 127.0.0.1:8000
2. CORS middleware مفعل
3. Frontend يتصل بـ الـ URL الصحيح
```

### المشكلة: Model Not Found
```
✅ تأكد من وجود:
   models/random_forest_effort_model.joblib
```

---

## 🚀 النشر (Deployment)

### نشر على Heroku:
```bash
# ستضاف تعليمات قريباً
```

### نشر على AWS:
```bash
# ستضاف تعليمات قريباً
```

---

## 📊 المعايير المستخدمة (COCOMO)

البيانات تتضمن:

- **RELY**: موثوقية البرمجيات المطلوبة
- **DATA**: حجم قاعدة البيانات
- **CPLX**: تعقيد المنتج
- **TIME**: قيود وقت التنفيذ
- **STOR**: قيود التخزين الرئيسي
- **VIRT**: تقلب الآلة الافتراضية
- **TURN**: وقت دوران الكمبيوتر
- **ACAP**: قدرة المحلل
- **AEXP**: خبرة التطبيق
- **PCAP**: قدرة المبرمج
- **VEXP**: خبرة الآلة الافتراضية
- **LEXP**: خبرة لغة البرمجة
- **MODP**: ممارسات البرمجة الحديثة
- **TOOL**: استخدام أدوات البرمجيات
- **SCED**: جدول التطوير المطلوب

---

## 📈 الإحصائيات

| المقياس | القيمة |
|--------|--------|
| عدد المشاريع (Dataset) | 93 |
| حقول البيانات | 16+ |
| دقة النموذج | ~85% |
| وقت التنبؤ | <100ms |
| حجم النموذج | ~2MB |

---

## 🤝 المساهمة

نرحب بمساهماتك! يرجى:
1. Fork المشروع
2. أنشئ فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 الرخصة

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 📧 التواصل والدعم

للأسئلة والدعم:
- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

---

## 🙏 شكر وتقدير

- شكر لـ FastAPI وفريق التطوير
- شكر لـ React و Vite communities
- شكر لمجموعة بيانات NASA93

---

## 📚 المراجع والموارد

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Scikit-learn Documentation](https://scikit-learn.org/)
- [COCOMO Model](https://en.wikipedia.org/wiki/COCOMO)

---

<div align="center">

**تم الانتهاء من دمج المشروعين بنجاح! ✅**

**استمتع بالمشروع! 🚀**

[⬆️ العودة للأعلى](#-software-effort-estimation-system)

</div>
