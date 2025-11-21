import { useState } from 'react';
import { Users, Award, Zap, X } from 'lucide-react';

interface NFT {
  id: number;
  title: string;
  role: string;
  rarity: string;
  status: string;
}

export default function NFTCollection() {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const nfts: NFT[] = [
    { id: 1, title: 'Commander #001', role: 'Mission Leader', rarity: 'Legendary', status: 'Available' },
    { id: 2, title: 'Engineer #002', role: 'Chief Engineer', rarity: 'Epic', status: 'Available' },
    { id: 3, title: 'Scientist #003', role: 'Lead Researcher', rarity: 'Epic', status: 'Minted' },
    { id: 4, title: 'Pilot #004', role: 'Transport Specialist', rarity: 'Rare', status: 'Available' },
    { id: 5, title: 'Medic #005', role: 'Medical Officer', rarity: 'Rare', status: 'Available' },
    { id: 6, title: 'Navigator #006', role: 'Navigation Expert', rarity: 'Rare', status: 'Available' },
  ];

  const rarityColors = {
    Legendary: 'from-[#FFD700] to-[#FF4500]',
    Epic: 'from-[#FF1E56] to-[#FF4500]',
    Rare: 'from-[#FF4500] to-[#FF6347]',
  };

  return (
    <section id="nft-collection" className="relative py-24 bg-gradient-to-b from-[#0D0D0D] to-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1F1F] border border-[#FF4500]/30 rounded-full mb-6">
            <Users className="w-4 h-4 text-[#FF4500]" />
            <span className="text-sm text-white/80 font-medium">Exclusive NFT Collection</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The First <span className="text-[#FF4500]">100 Colonists</span>
          </h2>

          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Each NFT represents a unique colonist with specific roles, skills, and backstories. Own a piece of Mars history and gain exclusive community benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              onClick={() => setSelectedNFT(nft)}
              className="group relative bg-[#1F1F1F] rounded-2xl overflow-hidden border border-[#FF4500]/20 hover:border-[#FF4500] transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg hover:shadow-[#FF4500]/15"
            >
              <div className="aspect-square bg-gradient-to-br from-[#1F1F1F] via-[#2A2A2A] to-[#1F1F1F] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${rarityColors[nft.rarity as keyof typeof rarityColors]} opacity-20 blur-3xl`}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold text-white/10">#{nft.id.toString().padStart(3, '0')}</div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white text-xs font-bold rounded-full`}>
                    {nft.rarity}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 ${nft.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'} text-xs font-semibold rounded-full`}>
                    {nft.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{nft.title}</h3>
                <p className="text-[#FF4500] font-medium mb-4">{nft.role}</p>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    nft.status === 'Available'
                      ? 'bg-gradient-to-r from-[#FF4500] to-[#FF1E56] text-white hover:shadow-md hover:shadow-[#FF4500]/20'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                  disabled={nft.status !== 'Available'}
                >
                  {nft.status === 'Available' ? 'Mint Now' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 bg-[#1F1F1F] rounded-2xl border border-[#FF4500]/20">
            <Award className="w-12 h-12 text-[#FF4500] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Exclusive Access</h3>
            <p className="text-white/60">Members-only events, Discord channels, and governance rights</p>
          </div>
          <div className="text-center p-8 bg-[#1F1F1F] rounded-2xl border border-[#FF4500]/20">
            <Zap className="w-12 h-12 text-[#FF4500] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Utility NFTs</h3>
            <p className="text-white/60">Unlock merchandise, airdrops, and future collection benefits</p>
          </div>
          <div className="text-center p-8 bg-[#1F1F1F] rounded-2xl border border-[#FF4500]/20">
            <Users className="w-12 h-12 text-[#FF4500] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
            <p className="text-white/60">Shape the Mars colony narrative and participate in storytelling</p>
          </div>
        </div>
      </div>

      {selectedNFT && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNFT(null)}>
          <div className="bg-[#1F1F1F] rounded-2xl max-w-2xl w-full p-8 relative border border-[#FF4500]/30" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedNFT(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold text-white mb-4">{selectedNFT.title}</h2>
            <p className="text-[#FF4500] font-semibold mb-6">{selectedNFT.role}</p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-white/60">Rarity:</span>
                <span className={`px-3 py-1 bg-gradient-to-r ${rarityColors[selectedNFT.rarity as keyof typeof rarityColors]} text-white text-xs font-bold rounded-full`}>
                  {selectedNFT.rarity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Status:</span>
                <span className="text-white font-semibold">{selectedNFT.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Token ID:</span>
                <span className="text-white font-semibold">#{selectedNFT.id.toString().padStart(3, '0')}</span>
              </div>
            </div>

            <button
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                selectedNFT.status === 'Available'
                  ? 'bg-gradient-to-r from-[#FF4500] to-[#FF1E56] text-white hover:shadow-lg hover:shadow-[#FF4500]/20'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
              disabled={selectedNFT.status !== 'Available'}
            >
              {selectedNFT.status === 'Available' ? 'Mint This Colonist' : 'Already Minted'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
