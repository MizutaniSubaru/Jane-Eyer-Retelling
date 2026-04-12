# Stage and Dialogue Overlay Refinement Design

Date: 2026-04-12
Project: Jane-Eyer-Retelling
Status: Ready for user review

## Summary

This spec defines a focused visual refinement pass for the current demo scene. The goal is to stabilize the relationship between the portrait stage and the dialogue box so the screen behaves like a visual novel rather than a stacked page layout.

The refined layout keeps Jane and Rochester anchored to the left and right sides of the full scene at all times once the duo stage is active. The dialogue box becomes a bottom overlay that can grow upward without pushing portraits out of position. Portrait emphasis switches only through bright and dim states. Narration no longer shows the literal speaker label `旁白`.

## Goals

- Keep both portraits fixed to the scene instead of allowing dialogue box height to move them.
- Show both active portraits on the left and right edges of the scene with no fade-style transparency treatment.
- Highlight the current speaker by brightening that portrait and dimming the other portrait.
- Let the dialogue box expand upward as an overlay above the portraits without affecting portrait position.
- Remove the visible black seam between the portraits and the dialogue box area.
- Hide the narration speaker label so narration displays as text only.
- Preserve the current demo atmosphere, background, and general UI identity.

## Non-Goals

- Rewriting the chapter data or adapting new story content.
- Replacing the current background art or portrait assets.
- Adding new animation systems beyond the existing restrained motion.
- Building a reusable cinematic staging engine for future chapters.

## Approved Decisions

- Layout approach: overlay composition, not stacked flex layout.
- Dialogue box layering: it sits above the portraits and may cover their lower area as it grows.
- Portrait emphasis: bright/dim only, no opacity-based soften treatment.
- Narration and thought emphasis: inherit the most recent established bright/dim relationship.
- Narration naming: do not render `旁白` in the speaker area.

## Current Problems

The current scene uses a vertical flex layout where `CharacterStage` lives in the center band and `DialogueBox` lives below it. When the dialogue box grows taller, the central band shrinks, which visually pushes portraits upward. This makes the scene feel unstable.

The current composition also stacks multiple dark bottom gradients. One comes from the main background treatment and another comes from the stage itself. Together they create a visible dark cut between the portrait area and the dialogue box region, which breaks the illusion that the characters stand inside one continuous scene.

## Layout Design

### Scene Layering

The screen should be composed as stable overlapping layers:

1. Background art and atmosphere overlays.
2. Character stage as a full-scene absolute layer anchored to the bottom edge.
3. Dialogue overlay as a bottom absolute layer above the character stage.
4. Top controls above the scene as they already are.

This removes portrait placement from normal document flow. Portrait position becomes independent of dialogue box height.

### Character Stage

`CharacterStage` should occupy the full playable scene area as an absolute layer. Jane remains on the left, Rochester remains on the right, and both are anchored to the bottom of the screen when the stage mode is `duo-stage`.

The stage should no longer add a dedicated dark band intended to bridge into the dialogue area. Portraits should read as cut-out figures placed directly over the background scene. Any remaining environmental darkening should come from the shared scene atmosphere, not from a stage-local separator.

### Dialogue Overlay

`DialogueBox` should move into a bottom overlay container positioned independently from the stage. It should keep the current translucent visual language, but it should no longer participate in the flex layout that sizes the portrait region.

The box may grow upward as text length increases. This growth is expected to cover the lower part of the portraits. Portraits must remain stationary underneath.

## Portrait Emphasis Rules

### Dialogue Entries

For `dialogue` entries:

- The speaking character uses the bright portrait state.
- The non-speaking character uses the dim portrait state.
- No opacity fade effect is applied to either portrait.

### Narration and Thought Entries

For `narration` and `thought` entries shown during `duo-stage`:

- The screen inherits the most recent bright/dim pairing established by a prior `dialogue` entry.
- If no prior `dialogue` entry exists within the currently active duo stage flow, both portraits may fall back to dim as a defensive default.

This keeps non-spoken beats visually continuous instead of snapping to an artificial neutral state every time narration appears.

### Narration-Only and Card Modes

For `narration-only` and `card` stage modes:

- Portraits remain hidden.
- No inherited bright/dim state is rendered because the duo stage is not active.

## Speaker Display Rules

### Narration

Narration should render without any speaker label. The name plate area may remain structurally present for spacing if that is the simplest implementation path, but it must not display the literal text `旁白`.

### Thought

Thought entries continue using the current thought typography treatment. The speaker label may remain as the character name for thought entries unless implementation review finds a better match with the existing design language. This refinement pass does not change thought naming behavior.

### Chapter Card

Chapter card behavior remains unchanged.

## Runtime State Resolution

The existing scene data already carries stage presence and portrait moods. This refinement should avoid rewriting the chapter script solely to encode transient highlight state.

Recommended responsibility split:

- `chapter23Scene`
  Continues defining entry type, text, speaker, stage mode, portrait moods, and atmosphere.

- `GameScreen`
  Resolves the effective stage for the current entry before rendering. This includes deciding the final bright/dim pairing based on the current entry type and previously established dialogue emphasis.

- `CharacterStage`
  Becomes a presentational renderer that consumes the resolved stage and applies fixed positioning plus bright/dim styling.

- `DialogueBox`
  Renders the current text, hides narration speaker labels, and lives inside the overlay layer.

## Resolution Algorithm

For the current entry:

1. If the stage mode is not `duo-stage`, render it as-is with no portraits.
2. If the entry type is `dialogue`, derive bright/dim directly from the current speaker.
3. If the entry type is `narration` or `thought`, scan backward to find the nearest prior `dialogue` entry that also rendered a duo stage and inherit that bright/dim result.
4. If no such prior dialogue entry exists, use a safe fallback where both portraits are dim.

This algorithm keeps the data model explicit enough for mood and presence while avoiding duplicated highlight state across many entries.

## Visual Treatment Adjustments

- Remove the old softened-cast transparency treatment from portrait rendering.
- Keep brightness differences visible enough to read instantly, but avoid exaggerated bloom.
- Preserve portrait drop shadows only if they support separation from the background without recreating a hard floor line.
- Remove or reduce any bottom gradients whose main visible effect is a black seam between portraits and the dialogue region.

## Error Handling and Fallbacks

- If a requested portrait mood asset is missing, continue using the best existing fallback behavior from the portrait manifest layer.
- If resolved highlight inheritance cannot find a previous dialogue anchor, render both visible portraits dim rather than guessing a speaker.
- If narration uses an empty or placeholder speaker string, the dialogue box should still render correctly with no speaker label.
- If the overlay box becomes tall on small screens, portrait anchors still must not move.

## Testing and Validation

Implementation is acceptable only if all of the following are true:

- A tall dialogue entry does not move either portrait upward.
- The dialogue box remains visually above the portraits and can overlap their lower area.
- `dialogue` entries visibly brighten the speaker and dim the other character.
- `narration` and `thought` entries in `duo-stage` inherit the previous dialogue emphasis.
- `narration-only` and `card` entries render no portraits.
- Narration text renders without displaying `旁白`.
- The black seam between the stage and the dialogue region is removed or reduced to the point that the scene reads as continuous.

Recommended automated coverage:

- component tests for narration speaker suppression
- component tests for inherited highlight state resolution
- component tests ensuring duo-stage portraits no longer use the softened opacity class
- layout-oriented assertions on the overlay container structure where practical

Manual review should confirm desktop and narrow viewport behavior because the main defect is visual layering rather than pure logic.
