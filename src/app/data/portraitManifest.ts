import janeBrightAngry from "../../assets/portraits/jane-bright-angry.png";
import janeBrightNeutral from "../../assets/portraits/jane-bright-neutral.png";
import janeBrightSad from "../../assets/portraits/jane-bright-sad.png";
import janeDimNeutral from "../../assets/portraits/jane-dim-neutral.png";
import janeDimSad from "../../assets/portraits/jane-dim-sad.png";
import rochesterBrightAngry from "../../assets/portraits/rochester-bright-angry.png";
import rochesterBack from "../../assets/portraits/rochester-back.png";
import rochesterBrightNeutral from "../../assets/portraits/rochester-bright-neutral.png";
import rochesterBrightSad from "../../assets/portraits/rochester-bright-sad.png";
import rochesterDimAngry from "../../assets/portraits/rochester-dim-angry.png";
import rochesterDimNeutral from "../../assets/portraits/rochester-dim-neutral.png";
import rochesterDimSad from "../../assets/portraits/rochester-dim-sad.png";
import type {
  CharacterId,
  PortraitLight,
  PortraitMood,
  PortraitVariant,
} from "../types/story";

const portraitManifest = {
  jane: {
    neutral: { bright: janeBrightNeutral, dim: janeDimNeutral },
    sad: { bright: janeBrightSad, dim: janeDimSad },
    angry: {
      bright: janeBrightAngry,
      // Intentional alias: there is no dedicated Jane dim-angry portrait yet.
      dim: janeDimNeutral,
    },
    warm: {
      // Intentional alias: smiling art is disabled, so warm falls back to neutral.
      bright: janeBrightNeutral,
      dim: janeDimNeutral,
    },
  },
  rochester: {
    neutral: { bright: rochesterBrightNeutral, dim: rochesterDimNeutral },
    sad: { bright: rochesterBrightSad, dim: rochesterDimSad },
    angry: { bright: rochesterBrightAngry, dim: rochesterDimAngry },
    warm: {
      // Intentional aliases: Rochester warm currently reuses the neutral portraits.
      bright: rochesterBrightNeutral,
      dim: rochesterDimNeutral,
    },
  },
} satisfies Record<CharacterId, Record<PortraitMood, Record<PortraitLight, string>>>;

export function getPortraitAsset(
  character: CharacterId,
  mood: PortraitMood,
  light: PortraitLight,
  variant: PortraitVariant = "default",
) {
  if (character === "rochester" && variant === "back") {
    return rochesterBack;
  }

  return (
    portraitManifest[character][mood]?.[light] ??
    portraitManifest[character].neutral[light]
  );
}
