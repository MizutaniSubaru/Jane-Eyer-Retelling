import { getPortraitAsset } from "../data/portraitManifest";
import type { StageSlot, StageState } from "../types/story";

type PortraitProps = {
  slot: StageSlot;
  align: "left" | "right";
  softenCast?: boolean;
};

function Portrait({ slot, align, softenCast = false }: PortraitProps) {
  const src = getPortraitAsset(slot.character, slot.mood, slot.light);
  const isBright = slot.light === "bright";

  return (
    <div
      className={`absolute bottom-0 ${align === "left" ? "left-[2%] md:left-[8%]" : "right-[2%] md:right-[8%]"} flex items-end`}
    >
      <div
        className={`relative transition-all duration-700 ease-out ${
          softenCast ? "opacity-65 saturate-[0.82]" : "opacity-100 saturate-100"
        } ${isBright ? "scale-100" : "scale-[0.97]"}`}
      >
        <div
          className={`absolute inset-x-[8%] bottom-0 h-24 rounded-full blur-3xl ${
            isBright ? "bg-[#f2efe9]/22" : "bg-black/30"
          }`}
        />
        <img
          src={src}
          alt=""
          aria-hidden="true"
          data-testid={`portrait-${slot.character}`}
          data-light={slot.light}
          className={`relative block h-[20rem] w-auto max-w-none select-none object-contain drop-shadow-[0_20px_42px_rgba(0,0,0,0.45)] md:h-[28rem] lg:h-[32rem] ${
            isBright ? "brightness-[1.04]" : "brightness-[0.72]"
          }`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#08060d]/70 via-[#08060d]/18 to-transparent" />
      </div>
    </div>
  );
}

export function CharacterStage({ stage }: { stage: StageState }) {
  if (stage.mode !== "duo-stage") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 top-0 overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#08060d]/70 via-[#08060d]/30 to-transparent" />
      <Portrait slot={stage.left} align="left" softenCast={stage.softenCast} />
      <Portrait slot={stage.right} align="right" softenCast={stage.softenCast} />
    </div>
  );
}
