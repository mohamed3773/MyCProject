# Email Verification Authentication System
## Complete Setup Instructions

## 🎯 Overview

This authentication system provides email-based login using:
- **Supabase Edge Functions** for backend logic
- **Brevo SMTP** for sending verification emails
- **JWT tokens** for session management
- **React components** for the frontend UI

**IMPORTANT:** All files are NEW additions. No existing files were modified.

---

## 📁 New Files Created

### **Backend (Supabase)**
```
supabase/
├── functions/
│   ├── send-verification-code/
│   │   └── index.ts
│   └── verify-code/
│       └── index.ts
└── migrations/
    └── 001_email_verification.sql
```

### **Frontend (React)**
```
src/
├── components/
│   └── auth/
│       ├── AuthEmail.tsx
│       ├── AuthCode.tsx
│       ├── AuthRoutes.tsx
│       └── ProtectedRoute.tsx
└── utils/
    └── authApi.ts
```

---

## 🚀 Setup Instructions

### **Step 1: Database Setup**

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Create a new query

2. **Run the migration**
   ```bash
   # Copy the contents of supabase/migrations/001_email_verification.sql
   # Paste into Supabase SQL Editor
   # Click "Run"
   ```

This creates:
- `email_verification` table
- `user_sessions` table
- Indexes for performance
- RLS policies for security
- Cleanup functions

---

### **Step 2: Configure Supabase Secrets**

1. **Get Brevo API Key**
   - Sign up at https://www.brevo.com
   - Go to SMTP & API → API Keys
   - Create a new API key
   - Copy the key

2. **Add Secrets to Supabase**
   
   **Option A: Using Supabase CLI**
   ```bash
   # Install Supabase CLI if you haven't
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Set secrets
   supabase secrets set BREVO_API_KEY="your-brevo-api-key-here"
   supabase secrets set JWT_SECRET="your-secure-random-string-here"
   ```

   **Option B: Using Supabase Dashboard**
   - Go to Project Settings → Edge Functions
   - Scroll to Secrets
   - Add:
     - `BREVO_API_KEY` = your Brevo API key
     - `JWT_SECRET` = a secure random string (generate with: `openssl rand -base64 32`)

3. **Update Sender Email**
   - Edit `supabase/functions/send-verification-code/index.ts`
   - Find line: `email: 'noreply@marspioneers.com'`
   - Replace with your verified Brevo sender email

---

### **Step 3: Deploy Edge Functions**

**Using Supabase CLI:**
```bash
# Deploy send-verification-code function
supabase functions deploy send-verification-code

# Deploy verify-code function
supabase functions deploy verify-code
```

**Verify deployment:**
```bash
# List all functions
supabase functions list

# Test locally (optional)
supabase functions serve send-verification-code --no-verify-jwt
```

---

### **Step 4: Frontend Configuration**

1. **Create Environment Variables**
   
   Create `.env` file in your project root (if it doesn't exist):
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Get these from: Supabase Dashboard → Project Settings → API

2. **Update `authApi.ts`**
   - The file already reads from environment variables
   - No manual changes needed if `.env` is set up

---

### **Step 5: Add Routes to App.tsx**

**OPTION 1: Using AuthRoutes Component (Recommended)**

Add this to your `App.tsx` without modifying existing routes:

```typescript
// At the top, add import
import AuthRoutes from './components/auth/AuthRoutes';

// Inside your <Routes> component, add this line:
<Route path="/auth/*" element={<AuthRoutes />} />
```

**Complete example:**
```typescript
import AuthRoutes from './components/auth/AuthRoutes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navigation />
        
        <Routes>
          {/* Your existing routes */}
          <Route path="/" element={<><Hero /><NFTCollection />...</>} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* NEW: Add auth routes */}
          <Route path="/auth/*" element={<AuthRoutes />} />
        </Routes>
      </div>
    </Router>
  );
}
```

**OPTION 2: Add Routes Directly**

```typescript
import AuthEmail from './components/auth/AuthEmail';
import AuthCode from './components/auth/AuthCode';

// Inside <Routes>
<Route path="/auth/email" element={<AuthEmail />} />
<Route path="/auth/code" element={<AuthCode />} />
```

---

### **Step 6: Protect Routes (Optional)**

To require authentication for certain pages:

```typescript
import ProtectedRoute from './components/auth/ProtectedRoute';

// Wrap protected routes
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

---

## 🔐 Authentication Flow

### **User Journey:**

1. **Email Entry** (`/auth/email`)
   - User enters email
   - Click "Send Verification Code"
   - API calls `send-verification-code` edge function
   - Code sent via Brevo SMTP
   - Redirects to `/auth/code`

2. **Code Verification** (`/auth/code`)
   - User enters 6-digit code
   - Auto-submits when 6 digits entered
   - API calls `verify-code` edge function
   - On success:
     - JWT token stored in localStorage
     - User redirected to `/dashboard`

3. **Session Management**
   - Token valid for 7 days
   - Stored in localStorage as `mars_auth_token`
   - Check with `isAuthenticated()` from `authApi.ts`

---

## 🧪 Testing

### **Test Edge Functions Locally**

```bash
# Start local functions server
supabase functions serve

# Test send-verification-code
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-verification-code' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com"}'

# Check database for code
# Go to Supabase Dashboard → Table Editor → email_verification
```

### **Test Frontend Flow**

1. Run your dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/auth/email`
3. Enter your email
4. Check your inbox for verification code
5. Check console logs (code is also logged in development)
6. Enter code at `/auth/code`
7. Should redirect to `/dashboard` on success

---

## 📊 Database Tables

### **email_verification**
```sql
id          | uuid     | Primary key
email       | text     | User's email
code        | text     | 6-digit verification code
expires_at  | timestamp| Expiration time (+5 minutes)
created_at  | timestamp| Creation time
```

### **user_sessions**
```sql
id          | uuid     | Primary key
email       | text     | Verified email
token       | text     | JWT session token
expires_at  | timestamp| Session expiration (+7 days)
created_at  | timestamp| Creation time
```

---

## 🎨 UI Components

All components match your Mars Pioneers theme:
- **Color Scheme:** Orange/Red gradients (#FF4500, #FF1E56)
- **Background:** Dark gray gradients
- **Icons:** Lucide React icons
- **Styling:** Tailwind CSS (consistent with your existing components)

### **AuthEmail.tsx**
- Email input form
- Loading states
- Error handling
- Mars themed design

### **AuthCode.tsx**
- 6-digit code input (monospace, centered)
- Auto-submit on 6 digits
- Resend code functionality (60s cooldown)
- Success animation
- Email display

---

## 🔧 API Functions

### **sendVerificationCode(email)**
```typescript
const result = await sendVerificationCode('user@example.com');
// Returns: { success: true, message: '...' }
```

### **verifyCode(email, code)**
```typescript
const result = await verifyCode('user@example.com', '123456');
// Returns: { verified: true, token: 'jwt...', email: '...' }
```

### **isAuthenticated()**
```typescript
if (isAuthenticated()) {
  // User is logged in
}
```

### **getAuthToken()**
```typescript
const token = getAuthToken();
// Use for API calls requiring authentication
```

### **clearAuth()**
```typescript
clearAuth(); // Logout user
```

---

## 🛡️ Security Features

✅ **Code Expiration:** 5 minutes  
✅ **One-time Use:** Codes deleted after verification  
✅ **Session Expiration:** 7 days  
✅ **Rate Limiting:** 60s between resend requests  
✅ **JWT Signing:** HMAC SHA-256  
✅ **RLS Policies:** Service role only access  
✅ **Input Validation:** Email format, code format  
✅ **CORS Headers:** Configured for browser requests  

---

## 🔄 Maintenance

### **Cleanup Expired Codes**

Run periodically (can be automated):
```sql
SELECT cleanup_expired_verification_codes();
SELECT cleanup_expired_sessions();
```

Or set up a cron job in Supabase (if available):
```sql
-- Run every hour
SELECT cron.schedule(
  'cleanup-expired-codes',
  '0 * * * *',
  $$SELECT cleanup_expired_verification_codes()$$
);
```

---

## 🚨 Troubleshooting

### **Emails not sending:**
1. Check Brevo API key in Supabase secrets
2. Verify sender email is validated in Brevo
3. Check Brevo dashboard for sending errors
4. Review edge function logs: `supabase functions logs send-verification-code`

### **Verification fails:**
1. Check code hasn't expired (5 minutes)
2. Verify JWT_SECRET is set in Supabase secrets
3. Check edge function logs: `supabase functions logs verify-code`
4. Ensure database tables exist

### **Frontend errors:**
1. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env`
2. Verify edge functions are deployed
3. Check browser console for API errors
4. Ensure routes are added to App.tsx

---

## 📝 Notes

- **No existing files modified:** All authentication logic is in new files
- **Styling matches your theme:** Orange/red Mars theme throughout
- **Production ready:** JWT tokens, expiration, security policies
- **Scalable:** Edge functions handle high traffic
- **Cost effective:** Pay-per-use Supabase functions + free Brevo tier

---

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Set up Brevo account and get API key
3. ✅ Add secrets to Supabase
4. ✅ Deploy edge functions
5. ✅ Add routes to App.tsx
6. ✅ Test the complete flow
7. ✅ (Optional) Add protected routes
8. ✅ (Optional) Set up cleanup cron jobs

---

## 🆘 Support

If you encounter issues:
1. Check Supabase function logs
2. Review browser console errors
3. Verify all environment variables are set
4. Ensure database tables were created
5. Check Brevo dashboard for email delivery status

---

## ✅ Verification Checklist

- [ ] Database tables created (`email_verification`, `user_sessions`)
- [ ] Brevo API key added to Supabase secrets
- [ ] JWT_SECRET added to Supabase secrets
- [ ] Sender email updated and verified in Brevo
- [ ] Edge functions deployed successfully
- [ ] Environment variables set in `.env`
- [ ] Routes added to `App.tsx`
- [ ] Tested email sending
- [ ] Tested code verification
- [ ] Tested successful login flow

---

**Authentication system is ready! No modifications to your existing codebase required.** 🚀

