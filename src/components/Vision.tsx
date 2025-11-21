import { Target, Rocket, Globe, Zap } from 'lucide-react';

export default function Vision() {
  const roadmap = [
    {
      phase: 'Phase 1',
      title: 'Genesis Launch',
      status: 'Current',
      items: ['Launch The First 100 NFT collection', 'Establish Discord community', 'Release initial lore chapters'],
    },
    {
      phase: 'Phase 2',
      title: 'Colony Expansion',
      status: 'Q1 2025',
      items: ['Secondary NFT drop: Engineers & Scientists', 'Interactive storytelling platform', 'Community governance implementation'],
    },
    {
      phase: 'Phase 3',
      title: 'Mars Marketplace',
      status: 'Q2 2025',
      items: ['Launch exclusive merchandise store', 'NFT staking & rewards system', 'Partnerships with space tech companies'],
    },
    {
      phase: 'Phase 4',
      title: 'The Red Planet',
      status: 'Q3 2025',
      items: ['Virtual Mars colony experience', 'Metaverse integration', 'Full decentralized governance'],
    },
  ];

  const teamValues = [
    {
      icon: Target,
      title: 'Mission Driven',
      description: 'Building a community united by the vision of interplanetary humanity',
    },
    {
      icon: Rocket,
      title: 'Innovation First',
      description: 'Pushing boundaries in Web3 storytelling and community engagement',
    },
    {
      icon: Globe,
      title: 'Inclusive Future',
      description: 'Creating accessible opportunities for everyone to participate in space exploration',
    },
    {
      icon: Zap,
      title: 'Action Oriented',
      description: 'Delivering value and experiences that matter to our community',
    },
  ];

  return (
    <section id="vision" className="relative py-24 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1F1F] border border-[#FF4500]/30 rounded-full mb-6">
            <Rocket className="w-4 h-4 text-[#FF4500]" />
            <span className="text-sm text-white/80 font-medium">Our Mission</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Vision & <span className="text-[#FF4500]">Roadmap</span>
          </h2>

          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            We're building more than NFTs—we're creating a movement. Join us on our journey to make humanity's Mars dreams a digital reality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {teamValues.map((value) => (
            <div
              key={value.title}
              className="bg-[#1F1F1F] rounded-xl p-6 border border-[#FF4500]/20 hover:border-[#FF4500]/50 transition-all duration-300"
            >
              <value.icon className="w-10 h-10 text-[#FF4500] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Project Roadmap</h3>
          <div className="grid lg:grid-cols-4 gap-6">
            {roadmap.map((phase, index) => (
              <div key={phase.phase} className="relative">
                {index < roadmap.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#FF4500] to-transparent"></div>
                )}
                <div className="bg-gradient-to-br from-[#1F1F1F] to-[#0D0D0D] rounded-2xl p-6 border border-[#FF4500]/30 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#FF4500] font-bold text-sm">{phase.phase}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      phase.status === 'Current'
                        ? 'bg-[#FF4500]/20 text-[#FF4500]'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {phase.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">{phase.title}</h4>
                  <ul className="space-y-3">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                        <div className="w-1.5 h-1.5 bg-[#FF4500] rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF4500]/10 via-[#1F1F1F] to-[#0D0D0D] rounded-3xl p-12 border border-[#FF4500]/30 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Be Part of History
          </h3>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            This is your invitation to join a community that believes in pushing humanity forward. Together, we're not just imagining the future—we're building it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#nft-collection"
              className="px-8 py-4 bg-gradient-to-r from-[#FF4500] to-[#FF1E56] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF4500]/20 transition-all duration-300 transform hover:scale-105"
            >
              Mint Your NFT
            </a>
            <a
              href="#community"
              className="px-8 py-4 bg-[#1F1F1F] border-2 border-[#FF4500] text-white font-bold rounded-lg hover:bg-[#FF4500]/10 transition-all duration-300"
            >
              Jon Community
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
