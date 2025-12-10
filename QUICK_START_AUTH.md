# Quick Start: Email Authentication System

## 🚀 5-Minute Integration

### **Step 1: Database (2 minutes)**
```bash
# Copy contents of: supabase/migrations/001_email_verification.sql
# Paste in Supabase SQL Editor → Run
```

### **Step 2: Secrets (1 minute)**
```bash
# Using Supabase CLI:
supabase secrets set BREVO_API_KEY="your-brevo-api-key"
supabase secrets set JWT_SECRET="$(openssl rand -base64 32)"

# Or add manually in Supabase Dashboard → Project Settings → Edge Functions → Secrets
```

### **Step 3: Deploy Functions (1 minute)**
```bash
supabase functions deploy send-verification-code
supabase functions deploy verify-code
```

### **Step 4: Add Routes (1 minute)**

**In your `App.tsx`, add ONE line:**

```typescript
import AuthRoutes from './components/auth/AuthRoutes';

// Inside <Routes>, add:
<Route path="/auth/*" element={<AuthRoutes />} />
```

**That's it!** ✅

---

## 🎯 Usage

### **Direct users to login:**
```typescript
navigate('/auth/email')
```

### **Protect routes:**
```typescript
import ProtectedRoute from './components/auth/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
/>
```

### **Check auth status:**
```typescript
import { isAuthenticated, getAuthEmail, clearAuth } from './utils/authApi';

if (isAuthenticated()) {
  console.log('Logged in as:', getAuthEmail());
}

// Logout
clearAuth();
navigate('/');
```

---

## 📧 Email Template

Users receive this beautiful Mars-themed email with their 6-digit code:

```
🚀 Mars Pioneers 2040

Verification Code
━━━━━━━━━━━━━━━━━━━

  123456

━━━━━━━━━━━━━━━━━━━
Expires in 5 minutes
```

---

## ✅ URLs

- `/auth/email` - Email entry page
- `/auth/code` - Code verification page
- After login → Redirects to `/dashboard`

---

## 🔑 Environment Variables

Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🎨 Design

All components match your Mars Pioneers theme:
- ✅ Orange/Red gradients (#FF4500, #FF1E56)
- ✅ Dark backgrounds
- ✅ Consistent styling with existing UI
- ✅ Lucide icons
- ✅ Smooth animations

---

## 📁 New Files (No Existing Files Modified)

**Backend:**
- `supabase/functions/send-verification-code/index.ts`
- `supabase/functions/verify-code/index.ts`
- `supabase/migrations/001_email_verification.sql`

**Frontend:**
- `src/components/auth/AuthEmail.tsx`
- `src/components/auth/AuthCode.tsx`
- `src/components/auth/AuthRoutes.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/utils/authApi.ts`

---

## 🔒 Security

- ✅ 6-digit codes expire in 5 minutes
- ✅ One-time use (deleted after verification)
- ✅ JWT tokens valid for 7 days
- ✅ Rate limiting on resend (60 seconds)
- ✅ Supabase RLS policies enabled

---

## 🐛 Troubleshooting

**Emails not sending?**
1. Check Brevo API key is set
2. Verify sender email in Brevo
3. Check function logs: `supabase functions logs send-verification-code`

**Can't verify code?**
1. Check code hasn't expired
2. Ensure JWT_SECRET is set
3. Check function logs: `supabase functions logs verify-code`

**Frontend not working?**
1. Verify `.env` has correct values
2. Check routes are added to `App.tsx`
3. Ensure functions are deployed

---

## 📞 API Reference

```typescript
// Send code
const result = await sendVerificationCode('user@example.com');
// → { success: true }

// Verify code
const result = await verifyCode('user@example.com', '123456');
// → { verified: true, token: 'jwt...' }

// Check auth
isAuthenticated() // → boolean

// Get user
getAuthEmail() // → 'user@example.com'

// Logout
clearAuth()
```

---

## 🎉 Done!

Your authentication system is ready. Zero modifications to existing files required.

**Test it:** Navigate to `/auth/email` and try logging in! 🚀

