import { MessageCircle, Trophy, Calendar, Users } from 'lucide-react';

export default function Community() {
  const benefits = [
    {
      icon: MessageCircle,
      title: 'Exclusive Discord',
      description: 'Access members-only channels, AMA sessions with the team, and collaborate with fellow pioneers',
    },
    {
      icon: Trophy,
      title: 'Rewards & Airdrops',
      description: 'Early access to new drops, exclusive merchandise, and special rewards for active community members',
    },
    {
      icon: Calendar,
      title: 'Virtual Events',
      description: 'Join live storytelling sessions, community votes, and virtual Mars colony simulations',
    },
    {
      icon: Users,
      title: 'Governance Rights',
      description: 'Vote on key decisions, propose new initiatives, and shape the future of the MarsPioneers ecosystem',
    },
  ];

  const upcomingEvents = [
    { date: 'Nov 5', title: 'Community Town Hall', time: '7:00 PM UTC' },
    { date: 'Nov 12', title: 'Lore Writing Workshop', time: '6:00 PM UTC' },
    { date: 'Nov 20', title: 'NFT Reveal Event', time: '8:00 PM UTC' },
  ];

  return (
    <section id="community" className="relative py-24 bg-gradient-to-b from-[#1F1F1F] to-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1F1F] border border-[#FF4500]/30 rounded-full mb-6">
            <Users className="w-4 h-4 text-[#FF4500]" />
            <span className="text-sm text-white/80 font-medium">Join the Colony</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Community <span className="text-[#FF4500]">Portal</span>
          </h2>

          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Connect with visionaries, creators, and space enthusiasts building the future of Mars together. Your voice matters in shaping our shared destiny.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group bg-[#1F1F1F] rounded-2xl p-8 border border-[#FF4500]/20 hover:border-[#FF4500] transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="relative mb-6">
                <benefit.icon className="w-12 h-12 text-[#FF4500]" />
                <div className="absolute inset-0 blur-xl bg-[#FF4500]/20 group-hover:bg-[#FF4500]/40 transition-all"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-white/60 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#1F1F1F] to-[#0D0D0D] rounded-2xl p-8 border border-[#FF4500]/30">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-[#FF4500]" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="flex items-center justify-between p-4 bg-[#0D0D0D]/50 rounded-xl border border-[#FF4500]/10 hover:border-[#FF4500]/30 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white mb-1">{event.title}</div>
                    <div className="text-sm text-white/60">{event.time}</div>
                  </div>
                  <div className="text-[#FF4500] font-bold text-xl">{event.date}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 px-6 py-3 bg-[#FF4500]/10 border border-[#FF4500] text-[#FF4500] font-semibold rounded-lg hover:bg-[#FF4500]/20 transition-all">
              View Full Calendar
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#FF4500]/10 to-transparent rounded-2xl p-8 border border-[#FF4500]/30 flex flex-col justify-between">
            <div>
              <MessageCircle className="w-12 h-12 text-[#FF4500] mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Join Our Discord
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Connect with thousands of Mars enthusiasts, share ideas, participate in discussions, and get the latest updates directly from the team.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 bg-[#FF4500] rounded-full"></div>
                  24/7 Active Community
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 bg-[#FF4500] rounded-full"></div>
                  Exclusive NFT Holder Channels
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 bg-[#FF4500] rounded-full"></div>
                  Direct Team Access
                </li>
              </ul>
            </div>
            <button className="w-full px-8 py-4 bg-gradient-to-r from-[#FF4500] to-[#FF1E56] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF4500]/20 transition-all duration-300 transform hover:scale-105">
              Join Discord Server
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
