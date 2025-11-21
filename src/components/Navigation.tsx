import { useState, useEffect } from 'react';
import { Menu, X, Rocket, Bell } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { supabase } from '../supabaseClient';
import { Link } from "react-router-dom";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'The First 100', href: '#nft-collection' },
    { label: 'Lore', href: '#lore' },
    { label: 'Community', href: '#community' },
    { label: 'Vision', href: '#vision' },
    { label: 'Marketplace', href: '#marketplace' },
  ];

  const isUserConnected = isConnected || !!supabaseUser;

  const handleWeb3Login = () => {
    if (isConnected) {
      disconnect();
      return;
    }
    openConnectModal?.();
  };

  useEffect(() => {
    const saveUser = async () => {
      if (!isConnected || !address) return;

      try {
        const message =
          "Welcome to MarsPioneers 2040!\nSign this message to verify wallet ownership.";

        const signature = await signMessageAsync({ message });

        await supabase.from("users").upsert({
          wallet_address: address,
          signature,
        });

        console.log("User saved in Supabase:", address);
      } catch (error) {
        console.error("Error saving user:", error);
      }
    };

    saveUser();
  }, [isConnected, address]);

  useEffect(() => {
    const fetchSupabaseUser = async () => {
      const { data } = await supabase.auth.getUser();
      setSupabaseUser(data.user ?? null);
    };

    fetchSupabaseUser();
  }, []);

  useEffect(() => {
    if (!isUserConnected) {
      setUsername('');
      return;
    }

    const supabaseName =
      supabaseUser?.user_metadata?.username ||
      supabaseUser?.user_metadata?.name ||
      supabaseUser?.email;

    if (supabaseName) {
      setUsername(supabaseName);
      return;
    }

    if (address) {
      setUsername(`${address.slice(0, 6)}...${address.slice(-4)}`);
      return;
    }

    setUsername('Pioneer');
  }, [supabaseUser, address, isUserConnected]);

  const avatarInitial = username ? username.charAt(0).toUpperCase() : 'M';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#FF4500]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <Rocket className="w-7 h-7 text-[#FF4500]/80" />
            <span className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-1">
              Mars<span className="text-[#FF4500]">Pioneers</span>
              <span className="text-[#FF4500] text-sm font-semibold">2040</span>
            </span>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  window.location.href = '/' + link.href;

                }}
                className="text-white/80 hover:text-[#FF4500] transition-colors duration-300 text-sm font-medium tracking-wide"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CONNECT BUTTON / USER INFO */}
          <div className="flex items-center gap-4">
            {!isUserConnected && (
              <button
                onClick={handleWeb3Login}
                className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-[#FF4500] to-[#FF1E56] text-white font-semibold rounded-lg hover:shadow-md hover:shadow-[#FF4500]/20 transition-all duration-300 transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}

            {isUserConnected && (
              <div className="hidden md:flex items-center gap-4">
                <button
                  className="p-2 rounded-full hover:bg-white/5 transition-colors duration-300 text-white"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>

                <Link to="/dashboard" replace className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF1E56] text-white font-semibold flex items-center justify-center shadow-lg shadow-[#FF4500]/20">
                    {avatarInitial}
                  </div>
                  <span className="max-w-[140px] truncate text-white/90 text-sm font-semibold">
                    {username}
                  </span>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="fixed top-20 left-0 right-0 z-[9999] bg-[#1A1A1A] border-t border-[#FF4500]/20 shadow-xl animate-slideDown">
          <div className="px-4 py-6 space-y-4">

            {isUserConnected && (
              <div className="flex items-center gap-3">
                <button
                  className="p-2 rounded-full hover:bg-white/5 transition-colors duration-300 text-white"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <Link
                  to="/dashboard"
                  replace
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF1E56] text-white font-semibold flex items-center justify-center shadow-lg shadow-[#FF4500]/20">
                    {avatarInitial}
                  </div>
                  <span className="max-w-[140px] truncate text-white/90 text-sm font-semibold">
                    {username}
                  </span>
                </Link>
              </div>
            )}

            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  window.location.href = '/' + link.href;

                  setIsMenuOpen(false);
                }}
                className="block text-white/80 hover:text-[#FF4500] transition-colors duration-300 py-2 text-left"
              >
                {link.label}
              </button>
            ))}

            {!isUserConnected && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleWeb3Login();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#FF4500] to-[#FF1E56] text-white font-semibold rounded-lg hover:shadow-md hover:shadow-[#FF4500]/20 transition-all duration-300"
              >
                Connect Wallet
              </button>
            )}

            {isConnected && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleWeb3Login();
                }}
                className="w-full px-6 py-3 bg-[#1A1A1A] border border-[#FF4500]/40 text-white/90 rounded-lg hover:bg-[#FF4500]/10 transition-all duration-300"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}