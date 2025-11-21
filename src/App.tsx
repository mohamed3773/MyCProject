import Navigation from './components/Navigation';
import Hero from './components/Hero';
import NFTCollection from './components/NFTCollection';
import LoreHub from './components/LoreHub';
import Community from './components/Community';
import Vision from './components/Vision';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

import Profile from './components/Profile';
import Settings from './components/Settings';
import Support from './components/Support';
import MyNFTs from './components/MyNFTs';
import SellNFT from './components/SellNFT';
import ActivityPage from './components/ActivityPage';


// Router imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navigation />

        <Routes>

          {/* 🏠 Homepage */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <NFTCollection />
                <LoreHub />
                <Community />
                <Vision />
                <Footer />
              </>
            }
          />

          {/* 🧑‍🚀 User Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 👤 User Pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />

          {/* 📦 User NFTs */}
          <Route path="/mynfts" element={<MyNFTs />} />

          {/* 💰 Sell NFT Page */}
          <Route path="/sell" element={<SellNFT />} />

          {/* 📜 Full Recent Activity Page */}
          <Route path="/activity" element={<ActivityPage />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
