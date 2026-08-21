# 🚀 البدء السريع

## ✅ ملخص سريع

| المكون | الحالة | الملاحظات |
|------|-------|---------|
| **Backend API** | ✅ جاهز | FastAPI + Model loaded |
| **Frontend** | ✅ جاهز | React + Vite |
| **Database** | ✅ جاهز | Model: Pipeline |
| **CORS** | ✅ مفعل | يسمح بأي مصدر |

---

## 🎯 البدء في 30 ثانية

### **Windows - نقرة واحدة:**
```powershell
cd c:\Users\muzan\software-effort-estimation
run_all.bat
```

### **Windows - يدوياً (Terminal 1):**
```powershell
.venv\Scripts\activate
pip install -r requirements.txt
cd api
uvicorn main:app --reload --port 8000
```

### **Windows - يدوياً (Terminal 2):**
```powershell
cd frontend
npm run dev
```

### **Linux/Mac:**
```bash
./run_all.sh
```

---

## 🌐 الدخول للتطبيق

بعد التشغيل، افتح المتصفح:

| الرابط | الوصف |
|------|-------|
| http://localhost:5173 | 🎨 الواجهة الرسومية |
| http://127.0.0.1:8000 | 🔗 Backend API |
| http://127.0.0.1:8000/docs | 📚 API Documentation |

---

## 💻 مثال على الاستخدام

### **1. ملأ النموذج (Frontend)**
- اختر نوع المشروع
- ادخل المعايير المختلفة
- اضغط **"Predict Effort"**

### **2. الاستجابة (Backend)**
- البيانات تُرسل إلى API
- Model يقوم بالتنبؤ
- النتيجة تُعرض فوراً

---

## 📝 المتطلبات المثبتة

```
✅ Python 3.11.9
✅ FastAPI 0.104.1
✅ Uvicorn 0.24.0
✅ Pandas 2.1.3
✅ Joblib 1.3.2
✅ React 19.2.8
✅ Vite 8.2.1
```

---

## 🔍 اختبار الاتصال

```bash
# اختبر Backend
curl http://127.0.0.1:8000

# النتيجة المتوقعة:
# {"message": "Software Effort Estimation API is running"}
```

---

## 📞 في حالة المشاكل

| المشكلة | الحل |
|-------|-----|
| **"Port already in use"** | غير المنفذ: `--port 9000` |
| **"Module not found"** | ثبّت: `pip install -r requirements.txt` |
| **"Model not found"** | تأكد: `models/random_forest_effort_model.joblib` |
| **CORS Error** | Backend يجب أن يعمل على `127.0.0.1:8000` |

---

## 📚 للمزيد من المعلومات

- 📖 اقرأ: `INTEGRATION_GUIDE.md`
- 📊 اقرأ: `PROJECT_STATUS.md`
- 🔗 اقرأ: `frontend/README.md`

---

**أنت الآن جاهز للعمل!** 🎉

**استمتع بالمشروع! 🚀**
