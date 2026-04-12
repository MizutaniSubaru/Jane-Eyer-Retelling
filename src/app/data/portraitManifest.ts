import janeBrightAngry from "../../assets/portraits/jane-bright-angry.png";
import janeBrightNeutral from "../../assets/portraits/jane-bright-neutral.png";
import janeBrightSad from "../../assets/portraits/jane-bright-sad.png";
import janeBrightWarm from "../../assets/portraits/jane-bright-warm.png";
import janeDimNeutral from "../../assets/portraits/jane-dim-neutral.png";
import janeDimSad from "../../assets/portraits/jane-dim-sad.png";
import janeDimWarm from "../../assets/portraits/jane-dim-warm.png";
import rochesterBrightAngry from "../../assets/portraits/rochester-bright-angry.png";
import rochesterBrightNeutral from "../../assets/portraits/rochester-bright-neutral.png";
import rochesterBrightSad from "../../assets/portraits/rochester-bright-sad.png";
import rochesterDimAngry from "../../assets/portraits/rochester-dim-angry.png";
import rochesterDimNeutral from "../../assets/portraits/rochester-dim-neutral.png";
import rochesterDimSad from "../../assets/portraits/rochester-dim-sad.png";

type CharacterId = "jane" | "rochester";
type PortraitMood = "neutral" | "sad" | "angry" | "warm";
type PortraitLight = "bright" | "dim";

const portraitManifest = {
  jane: {
    neutral: { bright: janeBrightNeutral, dim: janeDimNeutral },
    sad: { bright: janeBrightSad, dim: janeDimSad },
    angry: { bright: janeBrightAngry, dim: janeDimNeutral },
    warm: { bright: janeBrightWarm, dim: janeDimWarm },
  },
  rochester: {
    neutral: { bright: rochesterBrightNeutral, dim: rochesterDimNeutral },
    sad: { bright: rochesterBrightSad, dim: rochesterDimSad },
    angry: { bright: rochesterBrightAngry, dim: rochesterDimAngry },
    warm: { bright: rochesterBrightNeutral, dim: rochesterDimNeutral },
  },
} as const;

export function getPortraitAsset(
  character: CharacterId,
  mood: PortraitMood,
  light: PortraitLight,
) {
  return (
    portraitManifest[character][mood]?.[light] ??
    portraitManifest[character].neutral[light]
  );
}
