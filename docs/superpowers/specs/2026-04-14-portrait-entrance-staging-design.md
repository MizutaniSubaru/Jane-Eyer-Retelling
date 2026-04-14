# Portrait Entrance Staging Design

## Goal

Refine the early Thornfield garden sequence so portrait entrances carry more narrative weight:

- Split the existing narration beat after “太阳还没落山就累得睡着了。”
- Move “简看她睡稳后，才独自走向花园。” into the next dialogue box
- When that next beat appears, fade in Jane's portrait by itself
- When “她正要去边门，却看见罗切斯特先生先一步跨了进来……” appears, slide Rochester's portrait in from the right edge back to his normal anchored position

The existing text should keep the original wording “她睡稳后”.

## Scene Data Changes

The current `adele-sleeps-early` narration entry will be split into two consecutive narration entries:

1. `adele-sleeps-early`
   Text: `施洗约翰节前夜，阿黛拉采了半天野草莓，太阳还没落山就累得睡着了。`
   Stage: no portraits shown

2. `jane-walks-to-garden-alone`
   Text: `简看她睡稳后，才独自走向花园。`
   Stage: Jane visible alone on the left, Rochester hidden
   Entrance: Jane uses a single fade-in entrance on this beat

To avoid a one-beat pop-in/pop-out, the immediately following solitary-garden narration beats should also switch to a Jane-only `duo-stage` with static presentation until Rochester enters. That applies to:

- `sweetest-hour-of-evening`
- `study-window-cigar-scent`
- `orchard-like-eden`
- `moonlight-and-warning-scent`
- `flowers-and-cigar`
- `jane-needs-to-hide`

The later `rochester-enters-orchard` narration entry will switch from portraitless staging to a two-portrait stage:

- Jane remains visible at her normal left anchor
- Rochester becomes visible at his normal right anchor
- Rochester uses a right-to-left entrance animation on this beat only
- The immediately following beats keep both portraits visible with `static` entrances so the staging remains continuous through:
  - `rochester-wanders-at-ease`
  - `jane-thinks-she-can-slip-away`
  - the existing `jane-steps-over-grass` beat and beyond

## Stage Model

The least invasive extension is to keep the existing `duo-stage` shape and add per-slot presentation metadata instead of introducing a new `solo-stage` mode.

Each stage slot will gain two optional properties:

- `visible?: boolean`
  Default `true`
  When `false`, the slot stays out of the render tree

- `entrance?: "static" | "fade-in" | "slide-in-right"`
  Default `static`
  Controls one-shot entrance animation when that beat first renders

This lets the Jane-only beat stay structurally compatible with the rest of the stage system:

- Jane slot: visible, bright, `fade-in`
- Rochester slot: hidden

It also keeps Rochester's arrival beat explicit in scene data instead of hard-coding scene IDs inside the renderer.

## Rendering Behavior

`CharacterStage` will remain the single place that renders portrait placement and motion.

For each visible slot:

- `static`: render at the existing fixed anchor with no entrance motion
- `fade-in`: start at low opacity and settle to full opacity without changing anchor position
- `slide-in-right`: start offset to the right of the normal right anchor and translate back into place while fading up

The animation should play once when the current scene beat becomes active. It should not replay repeatedly while the same beat remains on screen.

Bright/dim grading should stay intact, with one explicit exception:

- Jane's solo fade-in beat should present her as `bright`, since she is the sole visual focus
- Jane-only solitary-garden narration beats should preserve the authored light of the single visible slot instead of forcing a dim fallback
- Standard two-portrait beats continue to use the existing dialogue highlight resolution logic

## Data Flow

`GameScreen` already knows the active `chapter23Scene` entry and passes the resolved stage to `CharacterStage`.

That flow stays the same:

1. `chapter23Scene` defines which portraits are visible and whether a slot has an entrance animation
2. `resolveStagePresentation` preserves the current bright/dim highlighting behavior for standard two-portrait beats, but keeps the authored light for a lone visible slot
3. `GameScreen` passes the active entry's resolved stage plus a beat identity to `CharacterStage`
4. `CharacterStage` uses the beat identity to ensure animated slots only animate on entry to that beat

No route-level or app-level state is needed for this feature.

## Error Handling and Compatibility

- Existing entries that omit the new metadata continue to behave exactly as today
- Hidden portrait slots should not leave empty shells in the DOM
- Non-duo stages (`narration-only`, `card`) remain unchanged
- If an invalid entrance value is ever introduced later, TypeScript should reject it at compile time

## Testing

Tests should cover the behavior at two levels:

### Scene data

- `chapter23Scene` now contains the split follow-up narration beat with the original wording
- The Jane-only beat exposes Jane as visible with `fade-in`
- The solitary-garden follow-up beats keep Jane visible without replaying the entrance
- The Rochester arrival beat exposes Rochester with `slide-in-right`
- The two beats after Rochester's arrival keep both portraits visible without replaying the slide-in

### Rendering

- `CharacterStage` hides slots marked `visible: false`
- `CharacterStage` applies the expected motion attributes/classes for `fade-in`
- `CharacterStage` applies the expected motion attributes/classes for `slide-in-right`
- Existing bright/dim grading tests remain green

### Integration

- `GameScreen` advances from the first split sentence to the second in a new dialogue box
- The Jane-only beat renders Jane and not Rochester
- The Rochester arrival beat renders both portraits, with Rochester marked for the right-to-left entrance

## Scope Guard

This change is intentionally limited to:

- one sentence split
- one Jane-only fade-in beat
- one Rochester slide-in beat
- the minimal stage metadata needed to express those entrances

It does not include a generalized cinematic timeline system, reusable choreography editor, or changes to unrelated dialogue transitions.
