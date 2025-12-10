# 🚀 Quick Test Guide - Email Verification

## Test Email
**📧 ahhw7276@outlook.com**

---

## ✅ Quick Test Steps

### 1️⃣ Send Code (30 seconds)
```
Navigate to: /auth/email
Enter: ahhw7276@outlook.com
Click: "Send Verification Code"
Expected: Redirect to /auth/code
Check: Email inbox for 6-digit code
```

### 2️⃣ Verify Code (15 seconds)
```
On: /auth/code page
Enter: [6-digit code from email]
Expected: Success animation → Redirect to /dashboard
```

### 3️⃣ Check Profile (10 seconds)
```
Navigate to: /profile
Check: Email field shows "ahhw7276@outlook.com"
Check: Green checkmark next to email (verified)
```

---

## 🐛 If Something Breaks

### Check Console (F12 → Console)
Look for these logs:

**✅ Successful Flow:**
```
[authApi] Sending verification code to: ahhw7276@outlook.com
[authApi] Response status: 200
[authApi] Verifying code for: ahhw7276@outlook.com, code: 123456
[authApi] Verify response status: 200
[authApi] Verification successful, data stored
[authApi] User profile email updated: ahhw7276@outlook.com
```

**❌ If You See Errors:**
- `Response status: 404` → Edge functions not deployed
- `Response status: 401` → Wrong auth key
- `Response status: 500` → Backend error (check Supabase logs)
- `Network error` → Internet connection issue

### Check Network Tab (F12 → Network)
1. Filter by: `Fetch/XHR`
2. Look for:
   - `send-verification-code` → Should be 200 OK
   - `verify-code` → Should be 200 OK
3. Click on request → Preview tab → See response

---

## 🔧 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **Email not arriving** | Check spam folder, verify Brevo API key in Supabase |
| **"Invalid code" error** | Code expires in 5 minutes, request new one |
| **Network error** | Check browser console for details, verify edge functions deployed |
| **Wrong redirect** | Check browser console logs, may need to clear localStorage |
| **Profile not updating** | Check console for `[authApi] User profile email updated` log |

---

## 📋 Files Changed

Only **LOGIC** was changed (no UI/design):

1. ✅ `src/utils/authApi.ts` - Fixed API endpoint + error handling
2. ✅ `src/components/auth/AuthCode.tsx` - Enhanced verification logic
3. ✅ `src/components/auth/AuthEmail.tsx` - Improved email validation

---

## 🎯 What Should Happen

1. **Email sent** → Code arrives in inbox within 30 seconds
2. **Code entered** → Validates format, sends to backend
3. **Verification success** → Token saved, email saved to profile, redirect
4. **Profile updated** → Email visible in profile page with verified status

---

## 💡 Pro Tips

- **Auto-submit:** Just type 6 digits, no need to click button
- **Resend:** Wait 60 seconds, then click "Resend Code"
- **Debug:** Keep console open (F12) to see what's happening
- **Clear data:** If stuck, clear localStorage and try again

---

**For detailed info, see: `VERIFICATION_FIX_SUMMARY.md`**


