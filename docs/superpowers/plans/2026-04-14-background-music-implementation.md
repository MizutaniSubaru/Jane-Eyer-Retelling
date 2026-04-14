# Background Music Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent background music with fade-in on the opening screen, restart-on-home behavior, and fade-out stop on the scene ending.

**Architecture:** `App` owns one `HTMLAudioElement` and delegates fades/restarts to a focused helper. `GameScreen` emits a one-shot ending signal when its local story index reaches the last entry, and `App` converts that signal into a fade-out stop.

**Tech Stack:** React 18, Vite asset imports, Vitest, Testing Library

---

### Task 1: Lock the expected behavior with tests

**Files:**
- Modify: `src/app/App.test.tsx`
- Modify: `src/app/components/GameScreen.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
it("starts music on the opening screen and restarts the fade-in after returning home", () => {
  render(<App />);
  expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "开始叙事" }));
  fireEvent.click(screen.getByRole("button", { name: "返回扉页" }));
  expect(audioInstances[0].play).toHaveBeenCalledTimes(2);
});

it("notifies the app when the final line is reached", () => {
  render(<GameScreen onBack={vi.fn()} onStoryEnd={onStoryEnd} />);
  for (let step = 0; step < chapter23Scene.length - 1; step += 1) {
    fireEvent.click(screen.getByTestId("dialogue-box"));
  }
  expect(onStoryEnd).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/app/App.test.tsx src/app/components/GameScreen.test.tsx`
Expected: FAIL because the audio controller module and `GameScreen` ending callback do not exist yet.

### Task 2: Add a focused audio controller helper

**Files:**
- Create: `src/app/lib/backgroundMusicController.ts`
- Test: `src/app/App.test.tsx`

- [ ] **Step 1: Write the minimal helper implementation**

```ts
export const BGM_TARGET_VOLUME = 0.38;
export const BGM_FADE_IN_MS = 1600;
export const BGM_FADE_OUT_MS = 1400;

export function createBackgroundMusicController(audio: HTMLAudioElement) {
  // expose playFromStartWithFadeIn, stopWithFadeOut, dispose
}
```

- [ ] **Step 2: Run tests to verify App behavior passes**

Run: `npm test -- --run src/app/App.test.tsx`
Expected: PASS

### Task 3: Wire `App` and `GameScreen`

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/components/GameScreen.tsx`
- Test: `src/app/App.test.tsx`
- Test: `src/app/components/GameScreen.test.tsx`

- [ ] **Step 1: Update `App` to own the audio instance**

```tsx
const audio = new Audio(backgroundMusicUrl);
const controller = createBackgroundMusicController(audio);
```

- [ ] **Step 2: Update `GameScreen` to emit a one-shot ending callback**

```tsx
useEffect(() => {
  if (currentIndex === chapter23Scene.length - 1 && !hasAnnouncedEnding.current) {
    onStoryEnd?.();
    hasAnnouncedEnding.current = true;
  }
}, [currentIndex, onStoryEnd]);
```

- [ ] **Step 3: Run the targeted tests**

Run: `npm test -- --run src/app/App.test.tsx src/app/components/GameScreen.test.tsx`
Expected: PASS

### Task 4: Verify project health

**Files:**
- Modify: none

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: build completes successfully

- [ ] **Step 2: Run the typecheck**

Run: `npm run typecheck`
Expected: PASS
