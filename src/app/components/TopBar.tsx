import titleJaneEyre from "../../assets/ui/title-jane-eyre.png";
import chapterBar from "../../assets/ui/chapter-bar.png";
import buttonLog from "../../assets/ui/button-log.png";
import buttonAuto from "../../assets/ui/button-auto.png";
import buttonSkip from "../../assets/ui/button-skip.png";
import buttonMenu from "../../assets/ui/button-menu.png";

const decorativeButtons: { src: string; label: string }[] = [
  { src: buttonLog, label: "Log" },
  { src: buttonAuto, label: "Auto" },
  { src: buttonSkip, label: "Skip" },
];

const frameFontFamily = "'Cormorant Garamond', 'Noto Serif SC', serif";

export function TopBar({
  onBack,
  chapterLabel,
}: {
  onBack: () => void;
  chapterLabel: string;
}) {
  return (
    <div className="w-full px-6 pt-4 md:px-10 md:pt-6 flex items-center justify-between gap-6 select-none">
      {/* Left cluster — title + chapter bar */}
      <div className="flex items-center gap-3 md:gap-5">
        <img
          src={titleJaneEyre}
          alt="Jane Eyre"
          className="h-16 md:h-20 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
          draggable={false}
        />
        <div
          data-testid="chapter-frame"
          className="inline-flex items-center h-10 md:h-12 px-3 whitespace-nowrap text-[#d6b873] font-serif text-xs md:text-sm tracking-wider drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]"
          style={{
            borderStyle: "solid",
            borderColor: "transparent",
            borderWidth: "10px 36px",
            borderImageSource: `url(${chapterBar})`,
            borderImageSlice: "10 50 fill",
            borderImageWidth: "10px 36px",
            borderImageRepeat: "stretch",
            background: "transparent",
            fontFamily: frameFontFamily,
          }}
        >
          {chapterLabel}
        </div>
      </div>

      {/* Right cluster — 4 corner buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        {decorativeButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            aria-label={btn.label}
            className="h-10 md:h-12 transition-transform duration-300 hover:-translate-y-0.5 active:scale-95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]"
          >
            <img src={btn.src} alt={btn.label} className="h-full w-auto" draggable={false} />
          </button>
        ))}
        <button
          type="button"
          onClick={onBack}
          aria-label="返回章节目录"
          className="h-10 md:h-12 transition-transform duration-300 hover:-translate-y-0.5 active:scale-95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]"
        >
          <img src={buttonMenu} alt="Menu" className="h-full w-auto" draggable={false} />
        </button>
      </div>
    </div>
  );
}
