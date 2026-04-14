# Rochester Back Portrait Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Rochester's orchard slide-in with a background-removed back-portrait fade-in, then switch to the existing front-facing highlighted portrait on his first spoken line.

**Architecture:** Add one new Rochester portrait asset variant and keep the existing front-facing portrait map intact. Extend `StageSlot` with a `variant` field, resolve the back cutout in `portraitManifest`, author the orchard beats to use `variant: "back"` plus `fade-in`, and let `CharacterStage` render the correct asset per beat without introducing a new pose system.

**Tech Stack:** React 18, motion/react, TypeScript, Vitest, Testing Library, Pillow via `python3`, existing `scripts/prepare_portraits.py`

---

### Task 1: Lock the new back-portrait behavior with failing tests

**Files:**
- Modify: `src/app/data/portraitManifest.test.ts`
- Modify: `src/app/data/chapter23Scene.test.ts`
- Modify: `src/app/components/CharacterStage.test.tsx`
- Modify: `src/app/components/GameScreen.test.tsx`
- Modify: `src/app/types/story.ts`

- [ ] **Step 1: Write the failing asset-resolution tests**

```ts
it("resolves Rochester's back variant to the dedicated cutout asset", () => {
  expect(getPortraitAsset("rochester", "neutral", "dim", "back")).toMatch(
    /rochester-back\.png$/,
  );
  expect(getPortraitAsset("rochester", "neutral", "bright", "back")).toMatch(
    /rochester-back\.png$/,
  );
});

it("keeps Rochester's default variant on the existing front-facing manifest", () => {
  expect(getPortraitAsset("rochester", "neutral", "bright", "default")).toMatch(
    /rochester-bright-neutral\.png$/,
  );
});
```

- [ ] **Step 2: Write the failing scene-data tests**

```ts
it("authors Rochester's orchard arrival as a back-portrait fade-in", () => {
  const entry = chapter23Scene.find((scene) => scene.id === "rochester-enters-orchard");

  expect(entry?.stage).toMatchObject({
    mode: "duo-stage",
    right: {
      character: "rochester",
      variant: "back",
      entrance: "fade-in",
      visible: true,
    },
  });
});

it("switches Rochester back to the default front-facing portrait on his first line", () => {
  const preSpeech = chapter23Scene.find((scene) => scene.id === "jane-steps-over-grass");
  const firstLine = chapter23Scene.find((scene) => scene.id === "rochester-calls-jane-to-moth");

  expect(preSpeech?.stage).toMatchObject({
    mode: "duo-stage",
    right: { variant: "back" },
  });
  expect(firstLine?.stage).toMatchObject({
    mode: "duo-stage",
    right: { variant: "default" },
  });
});
```

- [ ] **Step 3: Write the failing renderer and integration tests**

```tsx
it("renders Rochester's back variant with fade-in metadata", () => {
  render(
    <CharacterStage
      sceneKey="rochester-enters-orchard"
      stage={{
        mode: "duo-stage",
        left: { character: "jane", mood: "neutral", light: "dim", visible: true, entrance: "static" },
        right: {
          character: "rochester",
          mood: "neutral",
          light: "dim",
          visible: true,
          entrance: "fade-in",
          variant: "back",
        },
      }}
    />,
  );

  expect(screen.getByTestId("portrait-shell-rochester")).toHaveAttribute("data-entrance", "fade-in");
  expect(screen.getByTestId("portrait-rochester")).toHaveAttribute(
    "src",
    expect.stringMatching(/rochester-back\.png$/),
  );
});
```

```tsx
it("shows Rochester's back portrait before his first line and the default bright portrait when he speaks", () => {
  render(<GameScreen onBack={vi.fn()} />);

  for (let step = 0; step < 10; step += 1) {
    fireEvent.click(screen.getByTestId("dialogue-box"));
  }

  expect(screen.getByTestId("portrait-rochester")).toHaveAttribute(
    "src",
    expect.stringMatching(/rochester-back\.png$/),
  );

  fireEvent.click(screen.getByTestId("dialogue-box"));

  expect(screen.getByText("简，过来看看这家伙。")).toBeInTheDocument();
  expect(screen.getByTestId("portrait-rochester")).toHaveAttribute(
    "src",
    expect.stringMatching(/rochester-bright-neutral\.png$/),
  );
  expect(screen.getByTestId("portrait-rochester")).toHaveAttribute("data-light", "bright");
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- --run src/app/data/portraitManifest.test.ts src/app/data/chapter23Scene.test.ts src/app/components/CharacterStage.test.tsx src/app/components/GameScreen.test.tsx`
Expected: FAIL because the back variant, cutout asset, and orchard beat data have not been implemented yet.

- [ ] **Step 5: Commit the red tests**

```bash
git add src/app/data/portraitManifest.test.ts src/app/data/chapter23Scene.test.ts src/app/components/CharacterStage.test.tsx src/app/components/GameScreen.test.tsx
git commit -m "test: cover rochester back portrait transition"
```

### Task 2: Produce the transparent Rochester back cutout asset

**Files:**
- Modify: `scripts/prepare_portraits.py`
- Create: `src/assets/portraits/rochester-back.png`
- Source only: `fcbd07990e282c247907af0d4b9befa2.jpg`

- [ ] **Step 1: Extend the portrait-prep script to include the new root source image**

```python
EXTRA_ASSETS = {
    "rochester-back": ROOT / "fcbd07990e282c247907af0d4b9befa2.jpg",
}
```

```python
def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for name, filename in ASSETS.items():
        convert_to_png(SOURCE / filename, TARGET / f"{name}.png")
    for name, source_path in EXTRA_ASSETS.items():
        convert_to_png(source_path, TARGET / f"{name}.png")
```

- [ ] **Step 2: Generate the back cutout PNG**

Run: `python3 scripts/prepare_portraits.py`
Expected: `src/assets/portraits/rochester-back.png` is created or refreshed.

- [ ] **Step 3: Verify the generated file exists and is a transparent PNG**

Run: `file src/assets/portraits/rochester-back.png`
Expected: output includes `PNG image data`

- [ ] **Step 4: Commit the script and generated asset**

```bash
git add scripts/prepare_portraits.py src/assets/portraits/rochester-back.png
git commit -m "feat: add rochester back portrait asset"
```

### Task 3: Add the portrait variant type and resolver support

**Files:**
- Modify: `src/app/types/story.ts`
- Modify: `src/app/data/portraitManifest.ts`
- Modify: `src/app/data/portraitManifest.test.ts`

- [ ] **Step 1: Add the variant type to `StageSlot`**

```ts
export type PortraitVariant = "default" | "back";

export type StageSlot = {
  character: CharacterId;
  mood: PortraitMood;
  light: PortraitLight;
  visible?: boolean;
  entrance?: PortraitEntrance;
  variant?: PortraitVariant;
};
```

- [ ] **Step 2: Teach `getPortraitAsset` to resolve Rochester's back cutout**

```ts
import rochesterBack from "../../assets/portraits/rochester-back.png";
import type { CharacterId, PortraitLight, PortraitMood, PortraitVariant } from "../types/story";
```

```ts
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
```

- [ ] **Step 3: Run the portrait-manifest tests**

Run: `npm test -- --run src/app/data/portraitManifest.test.ts`
Expected: PASS

- [ ] **Step 4: Commit the variant plumbing**

```bash
git add src/app/types/story.ts src/app/data/portraitManifest.ts src/app/data/portraitManifest.test.ts
git commit -m "feat: resolve rochester back portrait variant"
```

### Task 4: Replace slide-in staging with back-portrait fade-in scene data

**Files:**
- Modify: `src/app/data/chapter23Scene.ts`
- Modify: `src/app/data/chapter23Scene.test.ts`

- [ ] **Step 1: Change the orchard arrival beat to back-portrait fade-in**

```ts
{
  id: "rochester-enters-orchard",
  type: "narration",
  speaker: "旁白",
  text: "她正要去边门，却看见罗切斯特先生先一步跨了进来，只得躲进常春藤遮蔽的暗影里，希望他很快便会折返。",
  stage: calmDuoStage("none", {
    right: { visible: true, entrance: "fade-in", variant: "back" },
  }),
  atmosphere: calmAtmosphere,
},
```

- [ ] **Step 2: Keep Rochester's back variant through the pre-speech beats**

```ts
stage: calmDuoStage("none", {
  right: { visible: true, entrance: "static", variant: "back" },
})
```

Apply that shape to:
- `rochester-wanders-at-ease`
- `jane-thinks-she-can-slip-away`
- `jane-steps-over-grass`

- [ ] **Step 3: Restore Rochester to the default front-facing variant on his first line**

```ts
{
  id: "rochester-calls-jane-to-moth",
  type: "dialogue",
  speaker: "罗切斯特",
  text: "简，过来看看这家伙。",
  stage: duoStage("neutral", "neutral", "rochester", {
    right: { variant: "default" },
  }),
  atmosphere: calmAtmosphere,
},
```

- [ ] **Step 4: Run the chapter-scene tests**

Run: `npm test -- --run src/app/data/chapter23Scene.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the scene-data swap**

```bash
git add src/app/data/chapter23Scene.ts src/app/data/chapter23Scene.test.ts
git commit -m "feat: stage rochester orchard arrival as back portrait"
```

### Task 5: Render the back variant in `CharacterStage`

**Files:**
- Modify: `src/app/components/CharacterStage.tsx`
- Modify: `src/app/components/CharacterStage.test.tsx`
- Modify: `src/app/components/GameScreen.test.tsx`

- [ ] **Step 1: Pass `slot.variant` into asset resolution**

```tsx
const src = getPortraitAsset(
  slot.character,
  slot.mood,
  "bright",
  slot.variant ?? "default",
);
```

- [ ] **Step 2: Keep fade-in but remove sequence-level dependence on slide-in**

```ts
function getPortraitInitial(align: "left" | "right", entrance: PortraitEntrance) {
  switch (entrance) {
    case "fade-in":
      return { opacity: 0 };
    case "slide-in-right":
      return { opacity: 0, x: align === "right" ? 120 : 0 };
    default:
      return false;
  }
}
```

The orchard sequence will no longer author `slide-in-right`, but the renderer can keep the helper branch for compatibility with older authored data.

- [ ] **Step 3: Run the UI-focused tests**

Run: `npm test -- --run src/app/components/CharacterStage.test.tsx src/app/components/GameScreen.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit the renderer update**

```bash
git add src/app/components/CharacterStage.tsx src/app/components/CharacterStage.test.tsx src/app/components/GameScreen.test.tsx
git commit -m "feat: render rochester back portrait variant"
```

### Task 6: Verify the complete project

**Files:**
- Modify: none

- [ ] **Step 1: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 2: Run the typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS
