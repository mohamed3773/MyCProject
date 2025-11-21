import React, { useMemo, useState } from "react";

const fees = {
  platform: 2.5,
  royalty: 5,
};

const SellNFT: React.FC = () => {
  const [price, setPrice] = useState<string>("1.20");

  const { receive, totalFees } = useMemo(() => {
    const parsed = parseFloat(price || "0");
    const feeAmount = (parsed * (fees.platform + fees.royalty)) / 100;
    const receiveAmount = Math.max(parsed - feeAmount, 0);
    return {
      totalFees: feeAmount,
      receive: receiveAmount,
    };
  }, [price]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100 p-6 space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-gray-400">List an NFT you already own</p>
        <h1 className="text-2xl font-semibold text-white">Sell NFT</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-[#121212] border border-[rgba(255,69,0,0.25)]/50 rounded-xl overflow-hidden shadow-lg shadow-black/30">
          <div className="relative h-72 w-full">
            <img
              src="https://images.unsplash.com/photo-1473923377535-0002805f57b2?auto=format&fit=crop&w=1200&q=80"
              alt="Ares Scout #214"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Frontier Pilots</p>
                <h3 className="text-lg font-semibold text-white">Ares Scout #214</h3>
              </div>
              <div className="px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-200 text-sm font-semibold">
                Owned
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#1f1f1f] bg-[#141414]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Current floor</p>
                <p className="text-base font-semibold text-white">0.44 ETH</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Last sale</p>
                <p className="text-base font-semibold text-white">0.48 ETH</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[rgba(255,69,0,0.25)]/50 rounded-xl p-6 shadow-lg shadow-black/30 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-300" htmlFor="price">
              Listing price (ETH)
            </label>
            <div className="flex items-center gap-3 rounded-xl bg-[#0D0D0D] border border-[#1f1f1f] px-4 py-3 focus-within:border-orange-500/50">
              <span className="text-orange-400 font-semibold">Ξ</span>
              <input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
                placeholder="Set your price"
              />
              <span className="text-xs text-gray-500">ETH</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[#0D0D0D] border border-[#1f1f1f] rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-400">Platform Fee</p>
              <p className="text-sm font-semibold text-white">{fees.platform}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Creator Royalty</p>
              <p className="text-sm font-semibold text-white">{fees.royalty}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total fees</p>
              <p className="text-sm font-semibold text-white">{totalFees.toFixed(3)} ETH</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">You will receive</p>
              <p className="text-sm font-semibold text-emerald-400">{receive.toFixed(3)} ETH</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex-1 bg-orange-500/80 hover:bg-orange-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors shadow-lg shadow-orange-500/20">
              Confirm Listing
            </button>
            <button className="flex-1 border border-[#1f1f1f] hover:border-orange-500/40 text-gray-200 rounded-lg px-4 py-3 bg-[#141414] transition-colors">
              Cancel
            </button>
          </div>

          <div className="text-sm text-gray-400 bg-[#0D0D0D] border border-[#1f1f1f] rounded-xl p-4 leading-relaxed">
            Listings stay active for 30 days. You can cancel anytime before the sale. Once sold, funds will be sent directly to your connected wallet.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellNFT;