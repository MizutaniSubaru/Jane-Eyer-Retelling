import { getPortraitAsset } from "../data/portraitManifest";
import type { StageSlot, StageState } from "../types/story";

type PortraitProps = {
  slot: StageSlot;
  align: "left" | "right";
};

function Portrait({ slot, align }: PortraitProps) {
  const src = getPortraitAsset(slot.character, slot.mood, slot.light);
  const isBright = slot.light === "bright";

  return (
    <div
      data-testid={`portrait-shell-${slot.character}`}
      className={`absolute bottom-0 ${align === "left" ? "left-[2%] md:left-[8%]" : "right-[2%] md:right-[8%]"} flex items-end`}
    >
      <div className={`relative transition-all duration-700 ease-out ${isBright ? "scale-100" : "scale-[0.97]"}`}>
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
      data-testid="character-stage-layer"
      className="pointer-events-none relative h-full w-full overflow-hidden"
    >
      <Portrait slot={stage.left} align="left" />
      <Portrait slot={stage.right} align="right" />
    </div>
  );
}
