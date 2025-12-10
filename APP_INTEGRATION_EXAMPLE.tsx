// EXAMPLE: How to integrate auth routes into your App.tsx
// This is NOT a file to use directly - it's just an example showing the changes needed

import Navigation from './components/Navigation';
import Hero from './components/Hero';
import NFTCollection from './components/NFTCollection';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
// ... your other existing imports

// Router imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ============================================
// NEW IMPORT: Add this line for auth routes
// ============================================
import AuthRoutes from './components/auth/AuthRoutes';

// Optional: If you want to protect routes
// import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navigation />

        <Routes>
          {/* Your existing routes - DON'T MODIFY THESE */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <NFTCollection />
                {/* ... other homepage components */}
              </>
            }
          />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          {/* ... other existing routes */}

          {/* ============================================ */}
          {/* NEW: Add this ONE line for auth routes      */}
          {/* ============================================ */}
          <Route path="/auth/*" element={<AuthRoutes />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

// ============================================
// OPTIONAL: Protect specific routes
// ============================================
// If you want certain routes to require authentication, wrap them like this:
/*
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
*/

// That's it! This adds authentication to your app without modifying any existing code.
// The auth routes will be available at:
// - /auth/email  (email entry)
// - /auth/code   (code verification)

