# 💡 Software Effort Estimation System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![Vite](https://img.shields.io/badge/Vite-8.2-646cff)
![NASA93](https://img.shields.io/badge/Dataset-NASA93-orange)
![Status](https://img.shields.io/badge/Status-Ready-brightgreen)

نظام كامل لتقدير جهد تطوير البرمجيات باستخدام نموذج Machine Learning على بيانات NASA93.

[🚀 التشغيل السريع](#-التشغيل-السريع) • [🌐 الروابط](#-الروابط) • [🧩 البنية](#-البنية) • [✅ التحقق](#-التحقق)

</div>

---

## 📝 نبذة عن المشروع

هذا المشروع يقدّم نظامًا متكاملًا لتقدير الجهد المطلوب لتطوير مشروع برمجي باستخدام نموذج Random Forest مدرّب على بيانات NASA93 COCOMO.

### المزايا الأساسية
- 🤖 نموذج ML للتنبؤ بالجهد
- 🎨 واجهة أمامية حديثة باستخدام React + Vite
- 🔗 API سريع وموثوق باستخدام FastAPI
- 📊 تنسيق مدخلات متوافق مع بيانات NASA93
- ⚡ جاهز للتشغيل محليًا في دقائق
- 🔐 مهيأ للـ Firebase لاحقًا إذا تم تفعيل Authentication

---

## ✅ الحالة الحالية

النظام يعمل بشكل صحيح محليًا، والواجهة + الـ Backend + النموذج متكاملان.

- Frontend: يعمل بنجاح على http://localhost:5173
- Backend: يعمل بنجاح على http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs
- API Prediction: يعمل ويعيد نتائج حقيقية

> ملاحظة: Google Authentication تم إيقافه في هذا الإصدار حسب طلب المستخدم، لأن تفعيله يتطلب إعداد Firebase Console بشكل فعلي.

---

## 🚀 التشغيل السريع

### Windows
```bat
run_all.bat
```

### Linux / macOS
```bash
chmod +x run_all.sh
./run_all.sh
```

### التشغيل اليدوي

#### Backend
```bash
python -m venv .venv
.venv\Scripts\activate     # Windows
# source .venv/bin/activate   # Linux/macOS

pip install -r requirements.txt
cd api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

---

## 🌐 الروابط

| العنصر | الرابط | الوصف |
|------|------|------|
| GitHub Repo | https://github.com/muzansiddig/Software-Effort-Estimation | المستودع الرسمي |
| Frontend | http://localhost:5173 | واجهة المستخدم |
| Backend | http://127.0.0.1:8000 | خادم API |
| Swagger | http://127.0.0.1:8000/docs | توثيق API |

---

## 🧩 البنية

```text
software-effort-estimation/
├── api/
│   └── main.py                  # FastAPI app
├── src/
│   ├── predictor.py             # نموذج التنبؤ
│   ├── preprocessing.py         # تجهيز المدخلات
│   └── services/
│       ├── api.ts               # طبقة الاتصال بالـ API
│       ├── firebase.ts          # Firebase config
│       └── firebaseAi.ts        # AI fallback
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── data/
├── models/
├── requirements.txt
├── package.json
├── run_all.bat
├── run_all.sh
├── README.md
└── firebase-applet-config.json
```

---

## 🔌 نقاط API الأساسية

### Health Check
```http
GET /health
```

### Prediction
```http
POST /api/predict
Content-Type: application/json
```

Example payload:
```json
{
  "projectname": "HST",
  "cat2": "scientific",
  "forg": "g",
  "center": 2,
  "year": 2026,
  "mode": "organic",
  "equivphyskloc": 40,
  "rely": "h",
  "data": "n",
  "cplx": "h",
  "time": "n",
  "stor": "n",
  "virt": "n",
  "turn": "n",
  "acap": "h",
  "aexp": "n",
  "pcap": "h",
  "vexp": "n",
  "lexp": "n",
  "modp": "h",
  "tool": "h",
  "sced": "h"
}
```

Response:
```json
{
  "estimated_effort": 951.35,
  "unit": "person-months",
  "model": "Random Forest",
  "dataset": "NASA93",
  "success": true
}
```

---

## ✅ التحقق والتجربة

تم التحقق فعليًا من:
- بناء الواجهة عبر Vite
- صحة الـ Backend
- استجابة الـ Prediction Endpoint
- استمرار النظام بعد التنظيف النهائي

أمثلة النجاح:
```json
{"status":"healthy","model_status":"loaded","dataset":"NASA93"}
```

---

## 🔧 المتطلبات

### Backend
- Python 3.11+
- FastAPI
- Uvicorn
- Pandas
- Joblib
- Scikit-learn

### Frontend
- Node.js 18+
- npm 9+
- React 19
- Vite 8

---

## 📌 ملاحظات مهمة

- هذا المشروع يعتمد على مجموعة بيانات NASA93 COCOMO.
- النموذج الحالي هو Random Forest، وقد تم التحقق من عمله من خلال طلبات حقيقية.
- Google Authentication متاح كـ تكوين لاحق، لكن لا يتم تفعيله تلقائيًا في هذا الإصدار.
- تم حذف الملفات/الملفات الوصفية غير الضرورية لتبسيط المشروع والاحتفاظ بالرمز الفعلي فقط.

---

## 🤝 الحسابات والدعم

للاستفسارات أو التعاون:
- البريد: muzansiddiv11@gmail.com
- المستودع: https://github.com/muzansiddig/Software-Effort-Estimation

---

<div align="center">

Project Status: Ready for local use and final delivery

</div>
