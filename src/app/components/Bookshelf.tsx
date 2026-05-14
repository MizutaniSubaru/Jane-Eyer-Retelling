import { motion } from "motion/react";

import janeCover from "../../assets/portal/jane-eyre-cover.jpg";
import wutheringCover from "../../assets/portal/wuthering-heights-cover.jpg";
import pridePrejudiceCover from "../../assets/portal/pride-prejudice-cover.jpg";

interface BookshelfProps {
  onSelectBook: (id: string) => void;
}

const books = [
  {
    id: "dummy-1",
    title: "Wuthering Heights",
    cover: wutheringCover,
    interactive: false,
  },
  {
    id: "jane-eyre",
    title: "Jane Eyre",
    cover: janeCover,
    interactive: true,
  },
  {
    id: "dummy-2",
    title: "Pride & Prejudice",
    cover: pridePrejudiceCover,
    interactive: false,
  },
];

export function Bookshelf({ onSelectBook }: BookshelfProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full flex flex-col items-center justify-center min-h-screen relative py-20 bg-[#FDFDFD] text-neutral-900"
    >
      <div className="text-center mb-16 space-y-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-serif text-neutral-800 tracking-tight">
          Textopia
        </h1>
        <p className="text-neutral-500 max-w-md mx-auto font-light tracking-wide">
          Select a volume from the shelf to begin your journey.
        </p>
      </div>

      <div className="relative w-full max-w-5xl px-8" style={{ perspective: "1000px" }}>
        <div className="flex items-end justify-center gap-6 sm:gap-12 lg:gap-16 z-10 relative pb-4">
          {books.map((book) => (
            <motion.div
              key={book.id}
              whileHover={book.interactive ? { y: -16, scale: 1.05, rotateY: -5 } : { y: -8 }}
              whileTap={book.interactive ? { scale: 0.95 } : {}}
              onClick={() => book.interactive && onSelectBook(book.id)}
              className={`
                group relative w-32 sm:w-44 md:w-56 aspect-[2/3] rounded-sm sm:rounded-md shadow-2xl
                transition-all duration-500 ease-out
                ${
                  book.interactive
                    ? "cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ring-1 ring-white/20"
                    : "opacity-70 cursor-default"
                }
              `}
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "bottom center",
              }}
            >
              {/* Spine effect */}
              <div className="absolute inset-y-0 left-0 w-2 sm:w-3 bg-gradient-to-r from-black/40 to-transparent z-20 rounded-l-sm sm:rounded-l-md mix-blend-multiply pointer-events-none" />

              {/* Cover image */}
              <div className="absolute inset-0 overflow-hidden rounded-sm sm:rounded-md bg-neutral-200">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />

                {/* Title overlay */}
                <div className="absolute inset-0 bg-black/10 text-center">
                  <span className="absolute left-1/2 top-[22%] -translate-x-1/2 text-white font-serif text-sm md:text-lg border-b border-white/40 pb-2 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {book.title}
                  </span>
                </div>
              </div>

              {book.interactive && (
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-sm sm:rounded-md pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Shelf plank */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-neutral-200 to-neutral-300 rounded-sm shadow-[0_20px_30px_rgba(0,0,0,0.1)] z-0 transform translate-y-2">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-400/30" />
        </div>
        {/* Soft floor shadow */}
        <div className="absolute -bottom-8 left-10 right-10 h-8 bg-black/5 blur-xl z-0 rounded-full" />
      </div>
    </motion.div>
  );
}
