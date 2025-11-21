import { BookOpen, MapPin, Calendar, ChevronRight } from 'lucide-react';

export default function LoreHub() {
  const loreChapters = [
    {
      id: 1,
      title: 'The Journey Begins',
      date: '2040-01-15',
      location: 'Earth Orbit',
      excerpt: 'One hundred pioneers gather at the orbital station, their eyes fixed on the red dot in the distance. This is humanity\'s boldest leap into the unknown.',
    },
    {
      id: 2,
      title: 'Seven Months of Silence',
      date: '2040-08-20',
      location: 'Deep Space',
      excerpt: 'The void between worlds tests the colonists\' resolve. In the darkness, they forge bonds that will define the first Martian society.',
    },
    {
      id: 3,
      title: 'Red Horizon',
      date: '2040-08-25',
      location: 'Mars Approach',
      excerpt: 'As the rust-colored planet fills their viewports, the pioneers prepare for landing. Tomorrow, they become the first permanent residents of another world.',
    },
  ];

  return (
    <section id="lore" className="relative py-24 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1F1F] border border-[#FF4500]/30 rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-[#FF4500]" />
            <span className="text-sm text-white/80 font-medium">Interactive Storytelling</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The <span className="text-[#FF4500]">Mars Chronicles</span>
          </h2>

          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Dive deep into the rich narrative of humanity's first Mars colony. Every NFT holder contributes to the evolving story of the MarsPioneers universe.
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto mb-16">
          {loreChapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="group relative bg-gradient-to-br from-[#1F1F1F] to-[#0D0D0D] rounded-2xl p-8 border border-[#FF4500]/20 hover:border-[#FF4500] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 text-[120px] font-bold text-white/5 leading-none pr-8">
                {index + 1}
              </div>

              <div className="relative z-10">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-[#FF4500] text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{chapter.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#FF4500] text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{chapter.location}</span>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#FF4500] transition-colors">
                  {chapter.title}
                </h3>

                <p className="text-white/70 leading-relaxed mb-6">
                  {chapter.excerpt}
                </p>

                <button className="flex items-center gap-2 text-[#FF4500] font-semibold group-hover:gap-4 transition-all">
                  Read Full Chapter
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#1F1F1F] to-[#0D0D0D] rounded-2xl p-12 border border-[#FF4500]/30 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Shape the Narrative
          </h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            NFT holders gain exclusive access to contribute story arcs, character development, and key decisions that influence the Mars colony's future.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-[#FF4500] to-[#FF1E56] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#FF4500]/20 transition-all duration-300 transform hover:scale-105">
            Join the Writers' Room
          </button>
        </div>
      </div>
    </section>
  );
}
