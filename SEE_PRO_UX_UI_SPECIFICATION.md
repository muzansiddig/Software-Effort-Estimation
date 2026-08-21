# الوثيقة الهندسية الدقيقة لتصميم تجربة المستخدم والواجهة البصرية (UX / UI Design Specification)

## منصة التقدير البرمجي الهندسي SEE Pro
### (NASA93 & COCOMO II)

---

## 1. الفلسفة التصميمية والنمط البصري (Design Philosophy & Visual Paradigm)

تم بناء تجربة المستخدم (UX) والهوية البصرية (UI) لمنصة SEE Pro وفق فلسفة **"الهندسة الدقيقة والموثوقية الفضائية"** (Precision Engineering & Mission-Critical Reliability) المستوحاة من لوحات التحكم وأنظمة الملاحة في وكالة ناسا (NASA Control Rooms & Flight Avionics).

### المبادئ التصميمية الأساسية:

#### الوضوح الحسابي الفوري (Immediate Cognitive Legibility)
تقديم أكثر من 15 معياراً رياضياً معقداً في مصفوفات تفاعلية دون إرهاق بصري للمستخدم (No Cognitive Overload).

#### محاربة القوالب الجاهزة المبتذلة (Anti-AI Slop Craftsmanship)
- خلو تام من التدرجات اللونية الفاقعة (لا تدرجات بنفسجية إلى زرقاء، ولا تأثيرات زجاجية مبهرجة غير وظيفية)
- اعتماد التباين المريح والعالي (High-Contrast Neutral Surfaces) بدرجات رمادية دقيقة (slate-50 إلى slate-950)
- هندسة حواف وزوايا مدروسة رياضياً مع تثبيت أنصاف الأقطار (rounded-xl و rounded-2xl للأطر الكبرى، و rounded-lg للأزرار والمدخلات)

#### الدعم الأصيل ثنائي اللغة والاتجاه (Native Bi-directional RTL / LTR Architecture)
انتقال طبيعي وسلس بين التخطيط العربي من اليمين لليسار (dir="rtl") والتخطيط الإنجليزي (dir="ltr") دون انكسار في المحاذاة أو الأيقونات.

---

## 2. لوحة الألوان والطباعة (Color Palette & Typography System)

### 2.1 نظام الألوان الوظيفي (Functional Color Palette)

تم اختيار الألوان لتتوافق بدقة مع معايير الوصول العالمية WCAG 2.1 AA (بنسبة تباين تفوق 4.5:1 للنصوص الأساسية و 7:1 للعناوين):

| الرمز اللوني / الفئة | القيمة السداسية (Hex) | الاستخدام الهندسي والوظيفي |
|---|---|---|
| Canvas Background | #F8FAFC (slate-50) | الخلفية العامة الهادئة لكامل مساحة العمل |
| Surface & Cards | #FFFFFF (pure-white) | الحاويات والبطاقات التفاعلية مع حدود دقيقة |
| Structural Borders | #E2E8F0 (slate-200) | خطوط الفصل والحدود الهيكلية الهادئة |
| Primary Brand / CTA | #0F172A (slate-900) | أزرار الإجراءات الرئيسية وشريط التنقل الأساسي |
| Active Accent (Blue) | #2563EB (blue-600) | مؤشرات التحديد اللحظي، درجات التقييم النشطة |
| Success & Nominal (Emerald) | #059669 (emerald-600) | شارات التأكيد، الجاهزية الحية للذكاء الاصطناعي |
| Warning & Risk (Amber) | #D97706 (amber-600) | تنبيهات الضغط الزمني والانحراف الإحصائي |
| Critical & Alert (Red) | #DC2626 (red-600) | أزرار الحذف، مؤشرات الأخطاء وتجاوز الحدود |

### 2.2 نظام الخطوط والتدرج الطباعي (Typographic Hierarchy)

- **خط الواجهة الإنجليزية**: Plus Jakarta Sans مدعوماً بخط أحادي المسافة JetBrains Mono / font-mono لعرض الأرقام والمعرفات والكود
- **خط الواجهة العربية**: Cairo / IBM Plex Sans Arabic لضمان وضوح الأرقام والمصطلحات التقنية

#### مقياس الأحجام الرياضي:
- **H1 / Display**: text-xl إلى text-2xl (24px - 28px) بخط عريض font-bold للعناوين البارزة
- **Section Headers**: text-sm إلى text-base (14px - 16px) بخط شبه عريض font-semibold
- **Body & Data Labels**: text-xs إلى text-sm (12px - 14px) مع ارتفاع سطر leading-relaxed (1.5 - 1.6)
- **Technical Badges & Chips**: text-[10px] إلى text-[11px] بخط font-mono مع مسافات أحرف منضبطة

---

## 3. هندسة وتخطيط الواجهة الواحدة (Layout & Structural Hierarchy)

تعتمد المنصة تخطيط **Single-Screen Focused Studio** المقسم إلى 3 مناطق تفاعلية رئيسية:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MAIN APPLICATION VIEWPORT                           │
├────────────────────────────┬────────────────────────────────────────────────────┤
│                            │  TOP ACTION BAR (Breadcrumb, Mode, Language)       │
│                            ├────────────────────────────────────────────────────┤
│   SIDEBAR NAVIGATION       │                                                    │
│   • Studio (Estimate Tab)  │  WORKSPACE AREA                                    │
│   • Repository (History)   │  ┌──────────────────────────────────────────────┐  │
│   • Estimator Profile      │  │ RESULT DISPLAY (If Estimate active):         │  │
│   • Copilot Trigger        │  │ [ Effort ] [ Schedule ] [ Staff ] [ Hours ]  │  │
│   • System Pulse Badge     │  │ [ Confidence 95% Bar ] [ SVR Comparison ]    │  │
│                            │  └──────────────────────────────────────────────┘  │
│                            │  ┌──────────────────────────────────────────────┐  │
│                            │  │ ESTIMATION FORM (Inputs & NASA93 Sliders):   │  │
│                            │  │ 1. Project Identity & Application Category   │  │
│                            │  │ 2. KLOC Size & Development Mode             │  │
│                            │  │ 3. 15 Cost Drivers Matrix                    │  │
│                            │  └──────────────────────────────────────────────┘  │
├────────────────────────────┴────────────────────────────────────────────────────┤
│   MODAL & DRAWER LAYERS:                                                        │
│   • AI Chatbot Copilot Drawer (Slide-in Right / Left for RTL)                   │
│   • User Profile & Google Auth Modal (Backdrop blur)                            │
│   • Historical Record Deep Inspection Modal                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. التشريح الدقيق لعناصر واجهة وتجربة المستخدم (Deep Component Breakdown)

### 4.1 القائمة الجانبية الموحدة (Sidebar Navigation)

**الموقع البصري**: مثبتة على الجانب الأيمن (في الواجهة العربية) أو الأيسر (في الواجهة الإنجليزية) على الشاشات الكبيرة، وتتحول إلى درج علوي متجاوب على الهواتف والأجهزة اللوحية.

**عناصر التفاعل (UX Micro-interactions)**:
- **زر التقدير المباشر (Studio Tab)**: يعرض أيقونة حاسبة هندسية مع مؤشر لون أسود صلب bg-slate-900 عند التفعيل
- **زر السجل والمستودع (History Tab)**: يعرض شارة رقمية دائرية خضراء (Badge) تبين العدد الإجمالي للمشاريع المحفوظة
- **زر المساعد الذكي (AI Copilot Button)**: يحتوي على نبضات بصرية حية (animate-ping) مع إشعار بجاهزية نموذج Llama/Gemini
- **زر الحساب والملف الشخصي (User Profile Area)**: يعرض الصورة الشخصية أو حروف اسم المستخدم
- **زر تبديل اللغة (Language Toggle)**: تبديل بنقرة واحدة بين العربية و English

### 4.2 نموذج إدخال المعايير (Estimation Form Matrix)

**تصميم خطوة بخطوة مدمج (Progressive Matrix Layout)**:

#### القسم الأول: الهوية والمجال التطبيقي (Project Identity)
- قوائم منسدلة حديثة تتيح الاختيار السريع من مشاريع ناسا الموثقة
- حقل اختيار المركز البحثي (GSFC, JPL, JSC, KSC, MSFC)

#### القسم الثاني: الحجم ونمط التطوير (Size & Mode Selector)
- حقل إدخال KLOC: حقل رقمي كبير وواضح مع وحدة قياس ملحقة
- أزرار الأنماط الثلاثية (Segmented Mode Cards): Organic, Semi-Detached, Embedded

#### القسم الثالث: مصفوفة محركات التكلفة الـ 15 (Cost Drivers Tabs)
- **تبويب Product**: RELY, DATA, CPLX
- **تبويب Computer**: TIME, STOR, VIRT, TURN
- **تبويب Personnel**: ACAP, AEXP, PCAP, VEXP, LEXP
- **تبويب Project**: MODP, TOOL, SCED

### 4.3 لوحة عرض النتائج والمؤشرات (Analytical Result Display)

- **بطاقات KPI الأربع**:
  - الجهد التقديري (Estimated Effort) - Person-Months
  - الجدول الزمني (Delivery Schedule) - Months
  - ساعات العمل الإجمالية (Engineering Hours)
  - حجم الفريق الموصى به (Staff Allocation)

- **شريط مجال الثقة 95%** (Visual Confidence Interval)
- **بطاقة مقارنة النموذج المقارن** (SVR-RBF Comparison Card)
- **زر الحفظ السحابي** (Cloud Sync CTA)

### 4.4 مستودع وسجل التقديرات (History & Repository View)

- **جدول عالي الكثافة** (Dense Table)
- **شريط البحث والتصفية** (Search & Filter Toolbar)
- **زر التصدير** (Export CSV)
- **أزرار الإجراءات لكل صف**: Restore, Inspect Modal, Delete

### 4.5 درج المساعد الذكي (AI Copilot Sliding Drawer)

- درج جانبي ينزلق فوق المحتوى مع خلفية معتمة
- فقاعات حوار متباينة بين المستخدم والمساعد
- أزرار الأسئلة السريعة (Quick Prompt Chips)
- ميزة الاستخراج الفوري للمدخلات من اللغة الطبيعية

### 4.6 نافذة المصادقة وإدارة الحساب (Auth & Identity Modal)

- زر الدخول بحساب Google
- نموذج الدخول المخصص وتحديد الرتبة
- بطاقة المستخدم المسجل

---

## 5. مصفوفة حالات التفاعل والتجاوب (Interactive States & Feedback Matrix)

| العنصر | الحالة الافتراضية | حالة التحويم | حالة التركيز | حالة التحميل |
|---|---|---|---|---|
| أزرار CTA الرئيسية | bg-slate-900 text-white | bg-slate-800 | ring-2 ring-slate-400 | Spinner |
| أزرار تقييم المعايير | bg-slate-100 | bg-slate-200 | bg-slate-900 text-white | فوري |
| حقول الإدخال | bg-slate-50 border-slate-200 | border-slate-300 | bg-white border-slate-900 | تعطيل |
| بطاقات النتائج | خلفية بيضاء | ظل خفيف | إبراز المعيار | وميض هيكلي |

---

## 6. استجابة التصميم لمختلف الأجهزة والشاشات (Responsive Viewports)

### الشاشات الكبيرة والمكتبية (≥1280px)
- القائمة الجانبية ثابتة ومفتوحة بالكامل
- عرض مصفوفة محركات التكلفة في شبكة أفقية رحبة

### الشاشات المتوسطة والأجهزة اللوحية (768px - 1279px)
- تتحول بطاقات النتائج إلى شبكة من عمودين
- مصفوفة المعايير تتكيف أوتوماتيكياً

### الهواتف الذكية والأجهزة المحمولة (<768px)
- القائمة الجانبية تتحول إلى درج علوي منبثق
- أزرار التقييم الـ 6 تصبح أزرار لمس مريحة (48px minimum)
- بطاقات النتائج تتكدس رأسياً في عمود واحد

---

**تم إعداد هذا التوصيف الشامل ليكون المرجع الفني والهندسي الدقيق لتصميم واجهة وتجربة المستخدم (UI/UX) لمنصة SEE Pro.**
