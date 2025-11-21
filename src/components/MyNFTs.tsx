import React, { useMemo, useState } from "react";

interface NFT {
  id: number;
  name: string;
  image: string;
  floor: number;
  listed: boolean;
}

const nftData: NFT[] = [
  {
    id: 1,
    name: "Ares Scout #214",
    image:
      "https://images.unsplash.com/photo-1473923377535-0002805f57b2?auto=format&fit=crop&w=900&q=80",
    floor: 0.44,
    listed: true,
  },
  {
    id: 2,
    name: "Olympus Rover #88",
    image:
      "https://images.unsplash.com/photo-1447433909565-04a1f734203d?auto=format&fit=crop&w=900&q=80",
    floor: 1.02,
    listed: false,
  },
  {
    id: 3,
    name: "Dust Runner #12",
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80",
    floor: 0.73,
    listed: true,
  },
  {
    id: 4,
    name: "Helios Patch #7",
    image:
      "https://images.unsplash.com/photo-1524328918845-92ba0c37a162?auto=format&fit=crop&w=900&q=80",
    floor: 0.28,
    listed: false,
  },
  {
    id: 5,
    name: "Redline Nomad #331",
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80",
    floor: 0.65,
    listed: false,
  },
  {
    id: 6,
    name: "Frontier Pilot #042",
    image:
      "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=900&q=80",
    floor: 0.51,
    listed: true,
  },
];

const filters = [
  { key: "all", label: "All" },
  { key: "listed", label: "Listed" },
  { key: "unlisted", label: "Unlisted" },
] as const;

type FilterKey = typeof filters[number]["key"];

const MyNFTs: React.FC = () => {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredNFTs = useMemo(() => {
    if (filter === "listed") return nftData.filter((nft) => nft.listed);
    if (filter === "unlisted") return nftData.filter((nft) => !nft.listed);
    return nftData;
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100 p-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-400">Your personal vault</p>
          <h1 className="text-2xl font-semibold text-white">My NFTs</h1>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl bg-[#121212] border border-[rgba(255,69,0,0.25)]/50 p-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border border-transparent ${
                filter === key
                  ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                  : "text-gray-300 hover:text-white hover:border-orange-500/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredNFTs.map((nft) => (
          <div
            key={nft.id}
            className="group bg-[#121212] border border-[rgba(255,69,0,0.25)]/50 rounded-xl overflow-hidden shadow-lg shadow-black/30"
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src={nft.image}
                alt={nft.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span
                className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                  nft.listed
                    ? "bg-orange-500/20 text-orange-200 border border-orange-400/40"
                    : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                }`}
              >
                {nft.listed ? "Listed" : "Owned"}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{nft.name}</h3>
                  <p className="text-sm text-gray-400">Floor {nft.floor} ETH</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#141414] border border-[#1f1f1f] flex items-center justify-center text-orange-400 font-semibold">
                  Ξ
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className="col-span-1 text-sm font-medium text-orange-200 bg-orange-500/15 border border-orange-500/40 rounded-lg px-3 py-2 hover:bg-orange-500/20 transition-colors">
                  Sell NFT
                </button>
                {nft.listed ? (
                  <>
                    <button className="text-sm font-medium text-white bg-[#141414] border border-orange-500/30 rounded-lg px-3 py-2 hover:border-orange-400/60 transition-colors">
                      Edit Price
                    </button>
                    <button className="text-sm font-medium text-gray-200 bg-[#141414] border border-[#1f1f1f] rounded-lg px-3 py-2 hover:border-orange-400/40 transition-colors">
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="col-span-2 text-sm text-gray-400 bg-[#141414] border border-[#1f1f1f] rounded-lg px-3 py-2 text-center">
                    Not listed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default MyNFTs;