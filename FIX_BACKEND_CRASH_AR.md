# حل مشكلة Backend Crash

## 🔴 المشكلة
```
[nodemon] app crashed - waiting for file changes before starting...
```

## ✅ الحلول السريعة

### الحل 1: تثبيت Dependencies الناقصة

قد تكون المشكلة أن بعض الـ packages غير مثبتة:

```bash
cd backend
npm install
```

### الحل 2: فحص الأخطاء

شغّل السيرفر مباشرة لرؤية الخطأ:

```bash
cd backend
node server.js
```

ستظهر رسالة الخطأ بالتفصيل.

### الحل 3: المشاكل الشائعة وحلولها

#### أ. express-rate-limit غير مثبت

```bash
cd backend
npm install express-rate-limit
```

#### ب. web3 غير مثبت

```bash
cd backend
npm install web3
```

#### ج. خطأ في .env

تأكد أن ملف `backend/.env` موجود ويحتوي على:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OPENSEA_API_KEY=your_key_here

# Web3 (اختياري - يمكن تركها فارغة الآن)
NFT_CONTRACT_ADDRESS=
PRIVATE_KEY=
ADMIN_ADDRESS=
POLYGON_RPC_URL=https://polygon-rpc.com
```

### الحل 4: إعادة التشغيل الكاملة

```bash
# 1. أوقف جميع العمليات (Ctrl+C في كل terminal)

# 2. حذف node_modules وإعادة التثبيت
cd backend
rm -rf node_modules
npm install

# 3. شغّل Backend مرة أخرى
npm run dev
```

### الحل 5: استخدام النسخة القديمة (Backup)

إذا استمرت المشكلة، يمكنك تعطيل Web3 مؤقتاً:

افتح `backend/server.js` وعلّق السطر:

```javascript
// قبل
const web3PurchaseRoutes = require('./routes/web3Purchase');
app.use('/api/purchase', web3PurchaseRoutes);

// بعد (علّق هذين السطرين)
// const web3PurchaseRoutes = require('./routes/web3Purchase');
// app.use('/api/purchase', web3PurchaseRoutes);
```

## 🔍 تشخيص المشكلة

### خطوة 1: تحقق من Output

شغّل:
```bash
cd backend
node server.js
```

### خطوة 2: افحص الخطأ

إذا رأيت:
- **"Cannot find module 'express-rate-limit'"** → نفّذ `npm install express-rate-limit`
- **"Cannot find module 'web3'"** → نفّذ `npm install web3`
- **"Unexpected token"** → خطأ في syntax في أحد الملفات
- **خطأ متعلق بـ .env** → تأكد من وجود ملف `.env`

### خطوة 3: نفّذ الحل المناسب

## ✅ الحل الأسرع (موصى به)

```bash
# في terminal Backend
cd backend
npm install express-rate-limit web3
npm run dev
```

يجب أن يعمل الآن! 🎉

## 📝 إذا استمرت المشكلة

1. احذف `node_modules` و `package-lock.json`
2. نفّذ `npm install`
3. شغّل `npm run dev`

---

**تم الإصلاح! 🚀**
