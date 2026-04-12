# Jane Eyre Orchard Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `script.md` into a fully playable chapter in the existing Jane Eyre UI, with a chapter card, narration/thought/dialogue pacing, and portrait-based staging for Jane and Rochester.

**Architecture:** First restore a runnable Vite + React shell around the exported UI. Then move the prototype's hard-coded scene into typed chapter data plus a portrait manifest, add a dedicated `CharacterStage` renderer, and drive the scene from explicit per-line stage metadata instead of runtime inference.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, Motion, Tailwind CSS v4, Lucide React, Python 3 + Pillow for portrait cleanup.

---

## File Structure

### Create

- `.gitignore`
- `package.json`
- `index.html`
- `vite.config.ts`
- `vitest.setup.ts`
- `src/main.tsx`
- `src/vite-env.d.ts`
- `scripts/prepare_portraits.py`
- `src/assets/portraits/`
- `src/app/types/story.ts`
- `src/app/lib/storyText.ts`
- `src/app/lib/storyText.test.ts`
- `src/app/data/portraitManifest.ts`
- `src/app/data/portraitManifest.test.ts`
- `src/app/data/chapter23Scene.ts`
- `src/app/data/chapter23Scene.test.ts`
- `src/app/components/CharacterStage.tsx`
- `src/app/components/CharacterStage.test.tsx`
- `src/app/components/GameScreen.test.tsx`

### Modify

- `src/app/components/GameScreen.tsx`
- `src/app/components/DialogueBox.tsx`
- `src/app/components/TopBar.tsx`
- `src/app/components/StartScreen.tsx`

### Responsibilities

- Runtime bootstrap lives at the repo root and in `src/main.tsx`.
- Portrait cleanup is a one-off script in `scripts/prepare_portraits.py`, with generated transparent PNGs stored in `src/assets/portraits/`.
- Story data and lookup tables live under `src/app/data/`.
- Shared scene types and formatting helpers live in `src/app/types/` and `src/app/lib/`.
- Rendering logic stays in `src/app/components/`, with `GameScreen` orchestrating playback and `CharacterStage` handling all portrait display rules.

## Task 1: Bootstrap a runnable app shell and smoke-test the current UI

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Create: `src/app/App.test.tsx`

- [ ] **Step 1: Add the runtime manifest and ignore rules**

```json
{
  "name": "jane-eyer-retelling",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "lucide-react": "^0.511.0",
    "motion": "^12.15.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.4",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.1.4",
    "tw-animate-css": "^1.3.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

```gitignore
node_modules
dist
.DS_Store
.superpowers
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `added ... packages` and a new `package-lock.json`.

- [ ] **Step 3: Add the Vite entrypoint, test setup, and a smoke test for the title screen**

```html
<!-- index.html -->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jane Eyre</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    css: true,
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

```ts
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./app/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
```

```tsx
// src/app/App.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the opening screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Jane Eyre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始叙事" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the smoke test and build the prototype**

Run: `npm test -- --run src/app/App.test.tsx`

Expected: `1 passed`

Run: `npm run build`

Expected: Vite writes `dist/index.html` and completes without errors.

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json package-lock.json index.html vite.config.ts vitest.setup.ts src/main.tsx src/vite-env.d.ts src/app/App.test.tsx
git commit -m "build: bootstrap the Jane Eyre web app"
```

## Task 2: Prepare portrait assets and create a stable portrait manifest

**Files:**
- Create: `scripts/prepare_portraits.py`
- Create: `src/assets/portraits/`
- Create: `src/app/data/portraitManifest.ts`
- Create: `src/app/data/portraitManifest.test.ts`

- [ ] **Step 1: Write a failing manifest test for direct lookups and fallbacks**

```ts
// src/app/data/portraitManifest.test.ts
import { describe, expect, it } from "vitest";
import { getPortraitAsset } from "./portraitManifest";

describe("getPortraitAsset", () => {
  it("returns the requested bright portrait when the exact mood exists", () => {
    expect(getPortraitAsset("jane", "angry", "bright")).toMatch(/jane-bright-angry\.png$/);
  });

  it("falls back to neutral when a warm portrait is unavailable", () => {
    expect(getPortraitAsset("rochester", "warm", "dim")).toMatch(/rochester-dim-neutral\.png$/);
  });
});
```

- [ ] **Step 2: Run the manifest test to verify it fails**

Run: `npm test -- --run src/app/data/portraitManifest.test.ts`

Expected: FAIL with `Cannot find module './portraitManifest'`.

- [ ] **Step 3: Add the portrait cleanup script and generate transparent PNGs**

```py
# scripts/prepare_portraits.py
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
TARGET = ROOT / "src" / "assets" / "portraits"

ASSETS = {
    "jane-bright-neutral": "a3960cf66d2af49f2d7cebd9556241c1.jpg",
    "jane-bright-warm": "54600352304f761f0a44f73eccd0ef1d.jpg",
    "jane-bright-sad": "fc433f2c43f64adc1ffa48278913d8c6.jpg",
    "jane-bright-angry": "b509ad9165916e48ab5e73a64d73215a.jpg",
    "jane-dim-neutral": "ba729e916aab413fd78ebbea1f43ca46.jpg",
    "jane-dim-warm": "0765a5de6d038d6eda0cbc01b05e5a1d.jpg",
    "jane-dim-sad": "9fa20ba27cc803da1f0e723834e39aaa.jpg",
    "rochester-bright-neutral": "5322ddb19aca8aa31820d7dfcf7a3858.jpg",
    "rochester-bright-sad": "60a76bf81d4b5ad1cc87095d5468db52.jpg",
    "rochester-bright-angry": "2dc3a4290940b1e43e0ca80287edf8fa.jpg",
    "rochester-dim-neutral": "8fd6f8a7b2c9d5496449cc5ddb10147b.jpg",
    "rochester-dim-sad": "c2a48acfcfc30fd072e8464b0250f72c.jpg",
    "rochester-dim-angry": "f61f3c8089de105065df85a67928084d.jpg",
}


def is_background(r: int, g: int, b: int) -> bool:
    return max(r, g, b) < 18 or min(r, g, b) > 245


def convert_to_png(source_path: Path, target_path: Path) -> None:
    image = Image.open(source_path).convert("RGBA")
    pixels = []
    for r, g, b, a in image.getdata():
        pixels.append((r, g, b, 0 if is_background(r, g, b) else a))
    image.putdata(pixels)
    image.save(target_path)


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for name, filename in ASSETS.items():
        convert_to_png(SOURCE / filename, TARGET / f"{name}.png")


if __name__ == "__main__":
    main()
```

Run: `python3 scripts/prepare_portraits.py`

Expected files:

```text
src/assets/portraits/jane-bright-neutral.png
src/assets/portraits/jane-bright-warm.png
src/assets/portraits/jane-bright-sad.png
src/assets/portraits/jane-bright-angry.png
src/assets/portraits/jane-dim-neutral.png
src/assets/portraits/jane-dim-warm.png
src/assets/portraits/jane-dim-sad.png
src/assets/portraits/rochester-bright-neutral.png
src/assets/portraits/rochester-bright-sad.png
src/assets/portraits/rochester-bright-angry.png
src/assets/portraits/rochester-dim-neutral.png
src/assets/portraits/rochester-dim-sad.png
src/assets/portraits/rochester-dim-angry.png
```

- [ ] **Step 4: Create the manifest with warm-to-neutral fallback**

```ts
// src/app/data/portraitManifest.ts
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
  return portraitManifest[character][mood]?.[light] ?? portraitManifest[character].neutral[light];
}
```

- [ ] **Step 5: Run the test again and commit**

Run: `npm test -- --run src/app/data/portraitManifest.test.ts`

Expected: `2 passed`

```bash
git add scripts/prepare_portraits.py src/assets/portraits src/app/data/portraitManifest.ts src/app/data/portraitManifest.test.ts
git commit -m "feat: add portrait assets and manifest"
```

## Task 3: Add scene types, text helpers, and the full adapted chapter data

**Files:**
- Create: `src/app/types/story.ts`
- Create: `src/app/lib/storyText.ts`
- Create: `src/app/lib/storyText.test.ts`
- Create: `src/app/data/chapter23Scene.ts`
- Create: `src/app/data/chapter23Scene.test.ts`

- [ ] **Step 1: Write failing tests for thought formatting and chapter invariants**

```ts
// src/app/lib/storyText.test.ts
import { describe, expect, it } from "vitest";
import { formatEntryText } from "./storyText";

describe("formatEntryText", () => {
  it("wraps thought text in Chinese parentheses", () => {
    expect(formatEntryText({ type: "thought", text: "我得赶紧躲开。" })).toBe("（我得赶紧躲开。）");
  });

  it("leaves narration untouched", () => {
    expect(formatEntryText({ type: "narration", text: "夜色变得更深了。" })).toBe("夜色变得更深了。");
  });
});
```

```ts
// src/app/data/chapter23Scene.test.ts
import { describe, expect, it } from "vitest";
import { chapter23Meta, chapter23Scene } from "./chapter23Scene";

describe("chapter23Scene", () => {
  it("starts with a chapter card and ends with Adele's storm report", () => {
    expect(chapter23Scene[0]?.type).toBe("chapter-card");
    expect(chapter23Scene.at(-1)?.text).toContain("大七叶树昨夜遭了雷击");
  });

  it("covers the full story as a long linear scene", () => {
    expect(chapter23Meta.chapterLabel).toContain("第二十三章");
    expect(chapter23Scene.length).toBeGreaterThan(30);
    expect(chapter23Scene.some((entry) => entry.type === "thought")).toBe(true);
    expect(chapter23Scene.some((entry) => entry.speaker === "简·爱")).toBe(true);
    expect(chapter23Scene.some((entry) => entry.speaker === "罗切斯特")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/app/lib/storyText.test.ts src/app/data/chapter23Scene.test.ts`

Expected: FAIL with missing module errors for `storyText` and `chapter23Scene`.

- [ ] **Step 3: Create the shared scene types and formatting helper**

```ts
// src/app/types/story.ts
export type SceneEntryType = "chapter-card" | "narration" | "thought" | "dialogue";
export type CharacterId = "jane" | "rochester";
export type PortraitMood = "neutral" | "sad" | "angry" | "warm";
export type PortraitLight = "bright" | "dim";

export type StageSlot = {
  character: CharacterId;
  mood: PortraitMood;
  light: PortraitLight;
};

export type StageState = {
  mode: "card" | "narration-only" | "duo-stage";
  softenCast?: boolean;
  left?: StageSlot;
  right?: StageSlot;
};

export type AtmosphereState = {
  weather?: "calm" | "tense" | "storm";
};

export type SceneEntry = {
  id: string;
  type: SceneEntryType;
  speaker: string;
  text: string;
  stage: StageState;
  atmosphere?: AtmosphereState;
};

export type ChapterMeta = {
  title: string;
  chapterLabel: string;
  progressLabel: string;
  introCard: string[];
};
```

```ts
// src/app/lib/storyText.ts
import type { SceneEntryType } from "../types/story";

export function formatEntryText(entry: Pick<{ type: SceneEntryType; text: string }, "type" | "text">) {
  if (entry.type !== "thought") {
    return entry.text;
  }

  const trimmed = entry.text.replace(/^（|）$/g, "");
  return `（${trimmed}）`;
}
```

- [ ] **Step 4: Author the first half of the adapted chapter data**

```ts
// src/app/data/chapter23Scene.ts
import type { ChapterMeta, SceneEntry } from "../types/story";

export const chapter23Meta: ChapterMeta = {
  title: "Jane Eyre",
  chapterLabel: "第二十三章 · 果园之夜",
  progressLabel: "第二十三章 · 仲夏夜之秘",
  introCard: ["第二十三章", "果园之夜"],
};

export const chapter23Scene: SceneEntry[] = [
  {
    id: "card-01",
    type: "chapter-card",
    speaker: "",
    text: "第二十三章\n果园之夜",
    stage: { mode: "card" },
    atmosphere: { weather: "calm" },
  },
  {
    id: "n-01",
    type: "narration",
    speaker: "旁白",
    text: "那个仲夏在英格兰格外明亮，桑菲尔德周围的田野刚收割过，空气里还留着白昼的热意。",
    stage: { mode: "narration-only" },
    atmosphere: { weather: "calm" },
  },
  {
    id: "n-02",
    type: "narration",
    speaker: "旁白",
    text: "施洗约翰节前夜，阿黛拉早早睡下。简独自离开房间，向花园深处走去。",
    stage: { mode: "narration-only" },
    atmosphere: { weather: "calm" },
  },
  {
    id: "n-03",
    type: "narration",
    speaker: "旁白",
    text: "果园树影浓密，花香与露气交错，月亮还没有升高，夜莺正在远处试着鸣唱。",
    stage: { mode: "narration-only" },
    atmosphere: { weather: "calm" },
  },
  {
    id: "t-01",
    type: "thought",
    speaker: "简·爱",
    text: "这种时候，我本可以独自在这里流连很久。",
    stage: { mode: "narration-only" },
    atmosphere: { weather: "calm" },
  },
  {
    id: "t-02",
    type: "thought",
    speaker: "简·爱",
    text: "可那股熟悉的雪茄味又飘来了，我得赶紧躲开。",
    stage: {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "n-04",
    type: "narration",
    speaker: "旁白",
    text: "简刚要退到灌木边门后面，罗切斯特已经从那儿走了进来。",
    stage: {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "n-05",
    type: "narration",
    speaker: "旁白",
    text: "他在果树和花丛间慢慢踱步，低头看飞蛾，看樱桃，也像在享受这片暮色。",
    stage: {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "t-03",
    type: "thought",
    speaker: "简·爱",
    text: "如果我脚步再轻一点，也许就能从他身后悄悄溜走。",
    stage: {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-01",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "简，过来看看这家伙。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "n-06",
    type: "narration",
    speaker: "旁白",
    text: "飞蛾很快飞走了，简也想退开，可罗切斯特叫住了她。",
    stage: {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-02",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "回来吧，这么可爱的夜晚，待在屋里多可惜。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "t-04",
    type: "thought",
    speaker: "简·爱",
    text: "我不想单独同他留在这儿，可越想找借口，越发一个字也说不出来。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-03",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "夏天的桑菲尔德，是个很可爱的地方，是吗？",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-04",
    type: "dialogue",
    speaker: "简·爱",
    text: "是的，先生。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "neutral", light: "bright" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-05",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "可惜呀，人总是在刚依恋一个地方的时候，就被命运催着继续往前走。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "dim" },
      right: { character: "rochester", mood: "sad", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-06",
    type: "dialogue",
    speaker: "简·爱",
    text: "我必须离开桑菲尔德吗？",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "sad", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-07",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "我想是的，简。我认为你必须离开。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "dim" },
      right: { character: "rochester", mood: "sad", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
```

- [ ] **Step 5: Finish the second half of the chapter, including the confession, proposal, storm, and final line**

```ts
  {
    id: "d-08",
    type: "dialogue",
    speaker: "简·爱",
    text: "所以，先生，您是要结婚了？",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "sad", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-09",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "不错，大家都以为我要娶英格拉姆小姐，所以我也得替你找一份新工作。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "dim" },
      right: { character: "rochester", mood: "neutral", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "t-05",
    type: "thought",
    speaker: "简·爱",
    text: "爱尔兰、海洋、远离英格兰，连同远离他，一起压得我透不过气。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-10",
    type: "dialogue",
    speaker: "简·爱",
    text: "离这儿太远了。和英格兰、和桑菲尔德，还有……和您，先生，都太远了。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "neutral", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-11",
    type: "dialogue",
    speaker: "简·爱",
    text: "离开桑菲尔德，我很伤心；必须永远同您分离，更让我恐惧。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "sad", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-12",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "你说的结果长什么样？",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "dim" },
      right: { character: "rochester", mood: "angry", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-13",
    type: "dialogue",
    speaker: "简·爱",
    text: "英格拉姆小姐。一个高贵美丽的女人，您的新娘。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "angry", light: "dim" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-14",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "我的新娘？我没有新娘。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "dim" },
      right: { character: "rochester", mood: "angry", light: "bright" },
    },
    atmosphere: { weather: "tense" },
  },
  {
    id: "d-15",
    type: "dialogue",
    speaker: "简·爱",
    text: "您以为我贫穷、卑微、朴素、渺小，所以就没有灵魂、没有心吗？",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "angry", light: "bright" },
      right: { character: "rochester", mood: "angry", light: "dim" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-16",
    type: "dialogue",
    speaker: "简·爱",
    text: "我和您一样，有完整的灵魂与完整的心。站在上帝脚下，我们本来就是平等的。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "angry", light: "bright" },
      right: { character: "rochester", mood: "angry", light: "dim" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-17",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "所以就是这样吗，简？那你就听清楚：我爱的是你。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "angry", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "bright" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-18",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "我绝不会娶英格拉姆小姐。简，我请求你，让我做你的丈夫。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "bright" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "t-06",
    type: "thought",
    speaker: "简·爱",
    text: "我仍不敢相信，只能逼自己看清他的神情。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "warm", light: "dim" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-19",
    type: "dialogue",
    speaker: "简·爱",
    text: "您是认真的吗？您真的爱我，真心希望我成为您的妻子？",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "sad", light: "bright" },
      right: { character: "rochester", mood: "warm", light: "dim" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-20",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "是真的。简，说你愿意。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "warm", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "bright" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-21",
    type: "dialogue",
    speaker: "简·爱",
    text: "那么，先生，我愿意嫁给您。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "warm", light: "bright" },
      right: { character: "rochester", mood: "warm", light: "dim" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-22",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "亲爱的简，到我身边来。让我使你幸福。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "warm", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "bright" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "n-07",
    type: "narration",
    speaker: "旁白",
    text: "月亮忽然被乌云吞没，狂风穿过月桂小径，第一道闪电把夜色劈成青白色。",
    stage: {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "warm", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "dim" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "d-23",
    type: "dialogue",
    speaker: "罗切斯特",
    text: "我们进屋去，简。要不是变天了，我真想和你坐到天亮。",
    stage: {
      mode: "duo-stage",
      left: { character: "jane", mood: "warm", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "bright" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "n-08",
    type: "narration",
    speaker: "旁白",
    text: "他们冒雨冲回屋里，钟声正好敲响十二点，费尔法克斯太太站在灯下，惊讶地看见这一幕。",
    stage: {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "warm", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "dim" },
    },
    atmosphere: { weather: "storm" },
  },
  {
    id: "n-09",
    type: "narration",
    speaker: "旁白",
    text: "这一夜风雷大作，可简一点也不害怕。罗切斯特三次来到门外问她是否平安。",
    stage: { mode: "narration-only" },
    atmosphere: { weather: "storm" },
  },
  {
    id: "n-10",
    type: "narration",
    speaker: "旁白",
    text: "第二天清晨，阿黛拉跑来报告：果园尽头的大七叶树昨夜遭了雷击，被劈成了两半。",
    stage: { mode: "narration-only" },
    atmosphere: { weather: "calm" },
  },
];
```

- [ ] **Step 6: Run the tests and commit the scene model**

Run: `npm test -- --run src/app/lib/storyText.test.ts src/app/data/chapter23Scene.test.ts`

Expected: all tests pass.

```bash
git add src/app/types/story.ts src/app/lib/storyText.ts src/app/lib/storyText.test.ts src/app/data/chapter23Scene.ts src/app/data/chapter23Scene.test.ts
git commit -m "feat: add the orchard chapter scene data"
```

## Task 4: Build the portrait stage and dialogue-box variants

**Files:**
- Create: `src/app/components/CharacterStage.tsx`
- Create: `src/app/components/CharacterStage.test.tsx`
- Modify: `src/app/components/DialogueBox.tsx`

- [ ] **Step 1: Write a failing component test for portrait emphasis and narration hiding**

```tsx
// src/app/components/CharacterStage.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharacterStage } from "./CharacterStage";

describe("CharacterStage", () => {
  it("marks the speaking portrait as bright", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "neutral", light: "bright" },
          right: { character: "rochester", mood: "neutral", light: "dim" },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-jane")).toHaveAttribute("data-light", "bright");
    expect(screen.getByTestId("portrait-rochester")).toHaveAttribute("data-light", "dim");
  });

  it("renders no portrait images during narration-only setup", () => {
    render(<CharacterStage stage={{ mode: "narration-only" }} />);
    expect(screen.queryByTestId("portrait-jane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the component test to verify it fails**

Run: `npm test -- --run src/app/components/CharacterStage.test.tsx`

Expected: FAIL with `Cannot find module './CharacterStage'`.

- [ ] **Step 3: Implement the new stage renderer**

```tsx
// src/app/components/CharacterStage.tsx
import { motion } from "motion/react";
import { getPortraitAsset } from "../data/portraitManifest";
import type { StageState, StageSlot } from "../types/story";

function Portrait({
  slot,
  side,
}: {
  slot: StageSlot;
  side: "left" | "right";
}) {
  const src = getPortraitAsset(slot.character, slot.mood, slot.light);

  return (
    <motion.img
      key={`${slot.character}-${slot.mood}-${slot.light}`}
      data-testid={`portrait-${slot.character}`}
      data-light={slot.light}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: slot.light === "bright" ? 1 : 0.42, y: 0, scale: slot.light === "bright" ? 1 : 0.98 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      src={src}
      alt={slot.character}
      className={`absolute bottom-0 h-[72vh] max-h-[900px] w-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] ${
        side === "left" ? "left-[-2%]" : "right-[-2%]"
      }`}
    />
  );
}

export function CharacterStage({ stage }: { stage: StageState }) {
  if (stage.mode === "card" || stage.mode === "narration-only") {
    return <div className="pointer-events-none absolute inset-0" />;
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${stage.softenCast ? "opacity-60" : "opacity-100"}`}>
      {stage.left ? <Portrait slot={stage.left} side="left" /> : null}
      {stage.right ? <Portrait slot={stage.right} side="right" /> : null}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#1f1b24]/80 to-transparent" />
    </div>
  );
}
```

- [ ] **Step 4: Update the dialogue box so chapter cards and thoughts render differently**

```tsx
// src/app/components/DialogueBox.tsx
import { motion } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { SceneEntryType } from "../types/story";

export function DialogueBox({
  entryType,
  speaker,
  text,
  onNext,
  onPrev,
  canNext,
  canPrev,
}: {
  entryType: SceneEntryType;
  speaker: string;
  text: string;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
}) {
  const isCard = entryType === "chapter-card";
  const isThought = entryType === "thought";

  return (
    <div className="w-full max-w-5xl mx-auto rounded-md overflow-hidden relative backdrop-blur-md">
      <div className="absolute inset-0 bg-[#1f1b24]/70" />
      <div className="absolute inset-0 border-[0.5px] border-[#a3b5c6]/10 rounded-md pointer-events-none" />

      <div className={`relative z-10 p-8 md:p-10 text-[#f2efe9] ${isCard ? "text-center" : "flex flex-col md:flex-row gap-6 md:gap-12"}`}>
        {isCard ? null : (
          <div className="w-32 md:w-40 flex-shrink-0 flex items-start pt-2">
            <motion.h3 key={speaker} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-serif text-[#a3b5c6] tracking-widest">
              {speaker}
            </motion.h3>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between min-h-[120px]">
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isCard ? "text-4xl md:text-5xl whitespace-pre-line leading-[1.4]" : "text-xl md:text-[22px] leading-relaxed"} ${isThought ? "italic text-[#d9d3ca]" : ""}`}
          >
            {text}
          </motion.p>

          <div className="flex justify-end gap-6 mt-6 pt-4 border-t border-[#a3b5c6]/10">
            <button onClick={onPrev} disabled={!canPrev} className={canPrev ? "flex items-center gap-2 text-[#a3b5c6]/60 hover:text-[#f2efe9]" : "opacity-0 pointer-events-none"}>
              <ChevronLeft size={16} strokeWidth={1} />
              <span className="text-sm tracking-widest font-serif hidden md:inline">上一句</span>
            </button>
            <button onClick={onNext} disabled={!canNext} className={canNext ? "group flex items-center gap-2 text-[#a3b5c6]/90 hover:text-[#f2efe9]" : "opacity-0 pointer-events-none"}>
              <span className="text-sm tracking-widest font-serif hidden md:inline">下一句</span>
              <ChevronRight size={16} strokeWidth={1} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run the tests and commit**

Run: `npm test -- --run src/app/components/CharacterStage.test.tsx`

Expected: all tests pass.

```bash
git add src/app/components/CharacterStage.tsx src/app/components/CharacterStage.test.tsx src/app/components/DialogueBox.tsx
git commit -m "feat: add portrait stage and dialogue variants"
```

## Task 5: Wire the chapter into the app and verify the full web flow

**Files:**
- Create: `src/app/components/GameScreen.test.tsx`
- Modify: `src/app/components/GameScreen.tsx`
- Modify: `src/app/components/TopBar.tsx`
- Modify: `src/app/components/StartScreen.tsx`

- [ ] **Step 1: Write a failing integration test for scene progression without choices**

```tsx
// src/app/components/GameScreen.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GameScreen } from "./GameScreen";

describe("GameScreen", () => {
  it("starts on the chapter card and advances into narration without showing choices", () => {
    render(<GameScreen onBack={vi.fn()} />);

    expect(screen.getByText("第二十三章")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /下一句/ }));

    expect(screen.getByText(/那个仲夏在英格兰格外明亮/)).toBeInTheDocument();
    expect(screen.queryByText(/停下脚步，转过身安静地看着他/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the integration test to verify it fails**

Run: `npm test -- --run src/app/components/GameScreen.test.tsx`

Expected: FAIL because `GameScreen` still renders the prototype script and old choice flow.

- [ ] **Step 3: Replace the prototype script with the typed chapter data and new stage**

```tsx
// src/app/components/GameScreen.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TopBar } from "./TopBar";
import { DialogueBox } from "./DialogueBox";
import { CharacterStage } from "./CharacterStage";
import { chapter23Meta, chapter23Scene } from "../data/chapter23Scene";
import { formatEntryText } from "../lib/storyText";
import bgImg from "../../imports/4164942f3bb1b952ba1877846b4d95a5.png";

export function GameScreen({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentEntry = chapter23Scene[currentIndex];
  const progress = (currentIndex / (chapter23Scene.length - 1)) * 100;

  const handleNext = () => {
    if (currentIndex < chapter23Scene.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col justify-between overflow-hidden bg-[#1f1b24]">
      <motion.div
        key="game-bg"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        <div className="absolute inset-0 bg-[#2b2533]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b24] via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 w-full h-full flex flex-col">
        <TopBar onBack={onBack} progress={progress} chapterLabel={chapter23Meta.progressLabel} />

        <div className="flex-1 relative px-4">
          <CharacterStage stage={currentEntry.stage} />
          <AnimatePresence>
            {currentEntry.atmosphere?.weather === "storm" ? (
              <motion.div
                key="storm-ambient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="absolute inset-0 pointer-events-none bg-[rgba(163,181,198,0.2)] mix-blend-overlay"
              />
            ) : null}
          </AnimatePresence>
        </div>

        <div className="relative w-full max-w-5xl mx-auto px-8 pb-12">
          <DialogueBox
            entryType={currentEntry.type}
            speaker={currentEntry.speaker}
            text={currentEntry.type === "chapter-card" ? chapter23Meta.introCard.join("\n") : formatEntryText(currentEntry)}
            onNext={handleNext}
            onPrev={handlePrev}
            canNext={currentIndex < chapter23Scene.length - 1}
            canPrev={currentIndex > 0}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update the title screen and top bar metadata so they match the script**

```tsx
// src/app/components/TopBar.tsx
import { motion } from "motion/react";
import { ArrowLeft, X, Settings2, Volume2, BookOpen } from "lucide-react";

export function TopBar({
  onBack,
  progress,
  chapterLabel,
}: {
  onBack: () => void;
  progress: number;
  chapterLabel: string;
}) {
  return (
    <div className="w-full px-8 py-6 flex items-center justify-between text-[#a3b5c6]/80 font-serif">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="group flex items-center gap-2 hover:text-[#f2efe9] transition-colors duration-500">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm tracking-widest hidden sm:block">返回扉页</span>
        </button>
        <button className="hover:text-[#f2efe9] transition-colors duration-500">
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-col items-center flex-1 mx-16 max-w-sm">
        <div className="flex items-center gap-4 text-xs tracking-[0.2em] mb-3 text-[#a3b5c6]/60">
          <BookOpen size={14} strokeWidth={1} />
          <span>{chapterLabel}</span>
        </div>
        <div className="w-full h-[1px] bg-[#a3b5c6]/20 relative overflow-hidden rounded-full">
          <motion.div className="absolute left-0 top-0 bottom-0 bg-[#a3b5c6]/80" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeInOut" }} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="hover:text-[#f2efe9] transition-colors duration-500">
          <Volume2 size={18} strokeWidth={1.5} />
        </button>
        <button className="hover:text-[#f2efe9] transition-colors duration-500">
          <Settings2 size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
```

```tsx
// src/app/components/StartScreen.tsx
<h2
  className="text-xl md:text-2xl tracking-[0.3em] text-[#a3b5c6] uppercase font-light"
  style={{ fontFamily: "'Cormorant Garamond', serif" }}
>
  第二十三章 · 果园之夜
</h2>
```

- [ ] **Step 5: Run the tests, launch the app, and commit**

Run: `npm test -- --run src/app/components/GameScreen.test.tsx src/app/components/CharacterStage.test.tsx src/app/data/chapter23Scene.test.ts src/app/data/portraitManifest.test.ts src/app/lib/storyText.test.ts`

Expected: all listed tests pass.

Run: `npm run build`

Expected: Vite completes successfully.

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

Manual verification checklist:

- Start button enters the chapter card.
- Opening lines show only the background and narration.
- After the orchard encounter begins, Jane and Rochester appear in fixed left/right positions.
- The speaking character is bright and the other visible character is dim.
- Thought lines display with parentheses.
- No choice overlay appears at any point.
- The final storm line about the split chestnut tree is reachable by normal progression.

```bash
git add src/app/components/GameScreen.tsx src/app/components/GameScreen.test.tsx src/app/components/TopBar.tsx src/app/components/StartScreen.tsx
git commit -m "feat: wire the orchard chapter into the web scene"
```

## Self-Review Checklist

- Spec coverage:
  - full `script.md` coverage is implemented in Task 3
  - chapter card and corrected chapter metadata are implemented in Task 3 and Task 5
  - narration/thought/dialogue formatting is implemented in Task 3 and Task 4
  - bright/dim portraits and case-by-case narration staging are implemented in Task 2 and Task 4
  - launchable web review flow is implemented in Task 1 and Task 5
- Placeholder scan:
  - no `TODO`, `TBD`, or "similar to above" instructions remain
  - every changed file appears in a task
  - every task has exact commands and a commit message
- Type consistency:
  - `SceneEntry`, `StageState`, `PortraitMood`, and `formatEntryText` names are used consistently across data, tests, and components

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-12-jane-eyre-orchard-scene-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
