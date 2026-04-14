# Portrait Entrance Staging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the Adele narration into two boxes, fade in Jane on the follow-up beat, and slide Rochester in from the right on his orchard entrance beat while keeping the surrounding stage continuity intact.

**Architecture:** Keep the existing `duo-stage` model and extend each slot with optional `visible` and `entrance` metadata. Author the new entrances directly in `chapter23Scene`, preserve lone-visible-slot lighting in `resolveStagePresentation`, and let `CharacterStage` render slot-level motion from a beat identity passed down by `GameScreen`.

**Tech Stack:** React 18, Vite, motion/react, TypeScript, Vitest, Testing Library

---

### Task 1: Lock the new story data and stage contract with tests

**Files:**
- Modify: `src/app/data/chapter23Scene.test.ts`
- Modify: `src/app/components/GameScreen.test.tsx`
- Modify: `src/app/components/CharacterStage.test.tsx`
- Modify: `src/app/lib/resolveStagePresentation.test.ts`
- Modify: `src/app/types/story.ts`

- [ ] **Step 1: Write the failing scene-data tests**

```ts
it("splits Adele's early-sleep narration into two beats and preserves the original wording", () => {
  const adeleBeat = chapter23Scene.find((entry) => entry.id === "adele-sleeps-early");
  const janeBeat = chapter23Scene.find((entry) => entry.id === "jane-walks-to-garden-alone");

  expect(adeleBeat?.text).toBe(
    "施洗约翰节前夜，阿黛拉采了半天野草莓，太阳还没落山就累得睡着了。",
  );
  expect(janeBeat?.text).toBe("简看她睡稳后，才独自走向花园。");
});

it("authors Jane's solo fade-in and Rochester's right-edge slide-in in the scene data", () => {
  const janeBeat = chapter23Scene.find((entry) => entry.id === "jane-walks-to-garden-alone");
  const rochesterBeat = chapter23Scene.find((entry) => entry.id === "rochester-enters-orchard");

  expect(janeBeat?.stage).toMatchObject({
    mode: "duo-stage",
    left: { character: "jane", visible: true, entrance: "fade-in" },
    right: { character: "rochester", visible: false },
  });
  expect(rochesterBeat?.stage).toMatchObject({
    mode: "duo-stage",
    right: { character: "rochester", visible: true, entrance: "slide-in-right" },
  });
});
```

- [ ] **Step 2: Write the failing integration test**

```tsx
it("shows Jane alone on the split follow-up beat before Rochester enters", () => {
  render(<GameScreen onBack={vi.fn()} />);

  for (let step = 0; step < 3; step += 1) {
    fireEvent.click(screen.getByTestId("dialogue-box"));
  }

  expect(screen.getByText("简看她睡稳后，才独自走向花园。")).toBeInTheDocument();
  expect(screen.getByTestId("portrait-jane")).toBeInTheDocument();
  expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Write the failing renderer and highlight tests**

```tsx
it("omits hidden slots from the DOM and annotates fade-in / slide-in entrances", () => {
  render(
    <CharacterStage
      stage={{
        mode: "duo-stage",
        left: {
          character: "jane",
          mood: "neutral",
          light: "bright",
          visible: true,
          entrance: "fade-in",
        },
        right: {
          character: "rochester",
          mood: "neutral",
          light: "dim",
          visible: false,
        },
      }}
      sceneKey="jane-walks-to-garden-alone"
    />,
  );

  expect(screen.getByTestId("portrait-shell-jane")).toHaveAttribute("data-entrance", "fade-in");
  expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
});
```

```ts
it("keeps the authored light when only one portrait slot is visible", () => {
  const resolved = resolveStagePresentation([soloVisibleJaneBeat], 0);

  expect(resolved).toMatchObject({
    mode: "duo-stage",
    left: { light: "bright", visible: true },
    right: { visible: false },
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- --run src/app/data/chapter23Scene.test.ts src/app/components/GameScreen.test.tsx src/app/components/CharacterStage.test.tsx src/app/lib/resolveStagePresentation.test.ts`
Expected: FAIL because the split scene beat, slot metadata, renderer support, and lone-slot highlight behavior do not exist yet.

- [ ] **Step 5: Commit the red tests**

```bash
git add src/app/data/chapter23Scene.test.ts src/app/components/GameScreen.test.tsx src/app/components/CharacterStage.test.tsx src/app/lib/resolveStagePresentation.test.ts
git commit -m "test: cover portrait entrance staging"
```

### Task 2: Extend the stage model and highlight resolver

**Files:**
- Modify: `src/app/types/story.ts`
- Modify: `src/app/lib/resolveStagePresentation.ts`
- Modify: `src/app/lib/resolveStagePresentation.test.ts`

- [ ] **Step 1: Add the slot metadata types**

```ts
export type PortraitEntrance = "static" | "fade-in" | "slide-in-right";

export type StageSlot = {
  character: CharacterId;
  mood: PortraitMood;
  light: PortraitLight;
  visible?: boolean;
  entrance?: PortraitEntrance;
};
```

- [ ] **Step 2: Preserve authored light for a lone visible slot**

```ts
const isVisible = (slot: StageSlot) => slot.visible !== false;

const visibleSlotCount = (stage: DuoStageState) =>
  Number(isVisible(stage.left)) + Number(isVisible(stage.right));

export const resolveStagePresentation = (entries: SceneEntry[], currentIndex: number): StageState => {
  // existing index guards...
  if (current.stage.mode !== "duo-stage") {
    return current.stage;
  }

  if (visibleSlotCount(current.stage) <= 1) {
    return current.stage;
  }

  // existing dialogue / inherited highlight logic...
};
```

- [ ] **Step 3: Run the focused resolver tests**

Run: `npm test -- --run src/app/lib/resolveStagePresentation.test.ts`
Expected: PASS

- [ ] **Step 4: Commit the type and resolver changes**

```bash
git add src/app/types/story.ts src/app/lib/resolveStagePresentation.ts src/app/lib/resolveStagePresentation.test.ts
git commit -m "feat: extend stage slot presentation metadata"
```

### Task 3: Author the split narration and entrance metadata in scene data

**Files:**
- Modify: `src/app/data/chapter23Scene.ts`
- Modify: `src/app/data/chapter23Scene.test.ts`

- [ ] **Step 1: Add reusable stage helpers for Jane-only and static duo beats**

```ts
function duoStage(
  janeMood: PortraitMood,
  rochesterMood: PortraitMood,
  active: CharacterId | "none",
  overrides?: {
    left?: Partial<StageSlot>;
    right?: Partial<StageSlot>;
  },
): DuoStageState {
  return {
    mode: "duo-stage",
    left: {
      character: "jane",
      mood: janeMood,
      light: active === "jane" ? "bright" : "dim",
      ...overrides?.left,
    },
    right: {
      character: "rochester",
      mood: rochesterMood,
      light: active === "rochester" ? "bright" : "dim",
      ...overrides?.right,
    },
  };
}
```

- [ ] **Step 2: Split the Adele beat and author the entrance beats**

```ts
{
  id: "adele-sleeps-early",
  type: "narration",
  speaker: "旁白",
  text: "施洗约翰节前夜，阿黛拉采了半天野草莓，太阳还没落山就累得睡着了。",
  stage: narrationStage,
  atmosphere: calmAtmosphere,
},
{
  id: "jane-walks-to-garden-alone",
  type: "narration",
  speaker: "旁白",
  text: "简看她睡稳后，才独自走向花园。",
  stage: duoStage("neutral", "neutral", "jane", {
    left: { visible: true, entrance: "fade-in" },
    right: { visible: false },
  }),
  atmosphere: calmAtmosphere,
},
```

```ts
{
  id: "rochester-enters-orchard",
  type: "narration",
  speaker: "旁白",
  text: "她正要去边门，却看见罗切斯特先生先一步跨了进来，只得躲进常春藤遮蔽的暗影里，希望他很快便会折返。",
  stage: duoStage("neutral", "neutral", "jane", {
    left: { visible: true },
    right: { visible: true, entrance: "slide-in-right" },
  }),
  atmosphere: calmAtmosphere,
},
```

- [ ] **Step 3: Keep the intervening and follow-up beats visually continuous**

```ts
stage: duoStage("neutral", "neutral", "jane", {
  left: { visible: true, entrance: "static" },
  right: { visible: false },
})
```

```ts
stage: duoStage("neutral", "neutral", "jane", {
  left: { visible: true, entrance: "static" },
  right: { visible: true, entrance: "static" },
})
```

- [ ] **Step 4: Run the scene-data tests**

Run: `npm test -- --run src/app/data/chapter23Scene.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the scene-data changes**

```bash
git add src/app/data/chapter23Scene.ts src/app/data/chapter23Scene.test.ts
git commit -m "feat: stage early portrait entrances in chapter 23"
```

### Task 4: Render slot visibility and entrance motion

**Files:**
- Modify: `src/app/components/CharacterStage.tsx`
- Modify: `src/app/components/CharacterStage.test.tsx`
- Modify: `src/app/components/GameScreen.tsx`
- Modify: `src/app/components/GameScreen.test.tsx`

- [ ] **Step 1: Pass a beat key into the stage renderer**

```tsx
<CharacterStage stage={resolvedStage} sceneKey={currentEntry.id} />
```

- [ ] **Step 2: Render only visible slots and annotate entrance state**

```tsx
type PortraitProps = {
  slot: StageSlot;
  align: "left" | "right";
  sceneKey: string;
};

function Portrait({ slot, align, sceneKey }: PortraitProps) {
  if (slot.visible === false) {
    return null;
  }

  const entrance = slot.entrance ?? "static";

  return (
    <motion.div
      key={`${sceneKey}:${slot.character}:${entrance}`}
      data-testid={`portrait-shell-${slot.character}`}
      data-entrance={entrance}
      initial={getPortraitInitial(align, entrance)}
      animate={{ opacity: 1, x: 0 }}
      transition={getPortraitTransition(entrance)}
      className={`absolute bottom-0 ${align === "left" ? "left-[2%] md:left-[8%]" : "right-[2%] md:right-[8%]"} flex items-end`}
    >
      {/* existing glow + img */}
    </motion.div>
  );
}
```

- [ ] **Step 3: Add deterministic motion helpers**

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

- [ ] **Step 4: Run the UI-focused tests**

Run: `npm test -- --run src/app/components/CharacterStage.test.tsx src/app/components/GameScreen.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit the renderer changes**

```bash
git add src/app/components/CharacterStage.tsx src/app/components/CharacterStage.test.tsx src/app/components/GameScreen.tsx src/app/components/GameScreen.test.tsx
git commit -m "feat: animate portrait entrances by scene beat"
```

### Task 5: Verify full project health

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
