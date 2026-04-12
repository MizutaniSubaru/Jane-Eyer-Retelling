# Jane Eyre Visual Novel Scene Design

Date: 2026-04-12
Project: Jane-Eyer-Retelling
Status: Ready for user review

## Summary

This spec defines how to turn the current `script.md` source text into a playable web scene inside the existing visual novel UI. The goal is to ship one polished, stable chapter experience rather than a reusable automatic parser.

The implementation will cover the full contents of `script.md`, including the early setting and atmosphere. The opening portion will use a chapter card and narration-only staging. Character portraits will appear only after the orchard encounter begins. Dialogue, narration, and inner thoughts will all be rendered inside the existing dialogue box, with inner thoughts displayed in parentheses.

The prototype currently includes placeholder chapter naming in the UI. During implementation, chapter metadata shown in the chapter card and progress header should be aligned with the `script.md` source chapter rather than the prototype placeholder copy.

## Goals

- Convert the full contents of `script.md` into a long, linear visual novel scene.
- Adapt the prose into visual-novel-friendly pacing while preserving the original meaning and emotional tone.
- Use the existing UI style and interaction model, with click-through progression and no branching choices.
- Display Jane and Rochester with bright and dim portrait variants based on who is speaking.
- Keep narration-led setup visually restrained, without forcing character portraits on screen too early.
- Launch the project locally after implementation so the web presentation can be reviewed in-browser.

## Non-Goals

- Building a general-purpose prose parser for future chapters.
- Supporting branching narrative or multiple-choice progression in this version.
- Rewriting the existing UI visual language from scratch.
- Designing a reusable scripting language beyond what this single chapter needs.

## Approved Creative Decisions

- Adaptation mode: preserve the original meaning, but split long prose into shorter visual-novel-friendly lines.
- Scope: convert the entire contents of `script.md`, including scene setup.
- Delivery strategy: create a stable, chapter-specific production script rather than a generic parser.
- Opening flow: chapter card first, then narration-only scene setup, then character stage when the encounter begins.
- Expression switching: change portraits only at clear emotional transitions, not every line.
- Narration staging: decide case by case whether to keep the characters visible or weaken them, depending on whether the line is environmental or action-continuing.

## Narrative Adaptation Rules

### Source Handling

`script.md` will be treated as the authoritative story source for this chapter. The runtime will not attempt to infer structure directly from the raw prose. Instead, the prose will be manually adapted into a structured scene data file that the frontend can render reliably.

### Scene Entry Types

The chapter scene data will use four entry types:

1. `chapter-card`
   Used for the opening title treatment before the dialogue box begins normal narrative playback.

2. `narration`
   Used for descriptive setup, scene transitions, physical actions, and literary framing.

3. `thought`
   Used for Jane's internal monologue and emotional interpretation. These lines will always render in parentheses, even if the adapted line in the data source is stored without them.

4. `dialogue`
   Used for spoken lines by Jane or Rochester.

### Adaptation Style

- Long descriptive prose should be split into short, readable beats that fit click-through visual novel pacing.
- Quoted speech becomes direct character dialogue.
- Jane's explicit fear, hesitation, longing, judgment, and emotional self-awareness should become `thought` entries when they read as inner voice rather than spoken language.
- Linking prose such as movement, pauses, gestures, weather shifts, and eye contact should remain `narration` so the emotional pacing stays coherent.
- The adaptation should stay close to the original tone and story meaning, but it should read like a staged performance rather than a block of novel text.

### Progression Model

- The scene is fully linear.
- Existing choice UI remains in the codebase but is out of scope for this chapter flow.
- The user advances one entry at a time using the existing next/previous controls.

## Visual Staging Rules

### Opening and Setup

The scene begins with a chapter card that establishes literary framing and separates the title experience from the scene playback. After that, the early orchard setup plays as narration over the background without portraits.

This phase should feel like entering the chapter rather than immediately starting a conversation.

The chapter card and any persistent chapter label in the top UI should use metadata derived from the current script source, replacing prototype placeholder chapter text where needed.

### Character Stage Activation

Portrait staging begins only when the orchard encounter becomes dramatically present, starting around Jane sensing Rochester nearby and the interaction becoming active.

Once activated:

- Jane remains fixed on one side of the stage.
- Rochester remains fixed on the opposite side.
- Characters do not swap sides mid-scene.

This keeps the layout stable and preserves the calm literary tone of the UI.

### Bright and Dim Rules

- The speaking character uses the bright portrait.
- The non-speaking character, if visible, uses the dim portrait.
- For narration and thought, visibility depends on context:
  - Environmental narration may hide or strongly soften portraits.
  - Action-continuing narration may keep both characters visible but muted.

### Expression Rules

Portrait changes happen only at clear emotional transitions. The scene should feel like stage blocking, not per-line reaction swapping.

Suggested emotional groupings:

- Early encounter and restraint: neutral/calm
- Fear of separation and emotional withdrawal: sad
- Confrontation and protest: angry/intense
- Proposal and mutual recognition: warm/joyful or softened calm

If a matching portrait is unavailable for a specific beat, the previous valid expression for that character should continue.

### Portrait Composition

Portraits should appear as character layers placed over the background, not as rectangular image panels.

Implementation should prefer cleaned or isolated character assets so the figures visually sit inside the environment. If some assets still contain solid background color, the system should use the best available fallback without breaking playback, but the resource mapping should be structured so isolated assets can replace them later without code changes.

### Atmosphere Shifts

The existing UI already includes restrained environmental animation. The scene design should continue that direction:

- quiet setup with soft motion
- subtle transition into tension
- cooler and darker tone near the storm
- restrained lightning or weather overlay near the thunder sequence

No exaggerated cinematic transitions are needed.

## Frontend Design

### High-Level Structure

The implementation should keep the current UI personality intact and replace the hard-coded prototype script with structured chapter data plus a dedicated portrait stage.

Recommended component responsibilities:

- `GameScreen`
  Orchestrates current entry playback, progress, chapter flow, and coordination between stage and dialogue box.

- `CharacterStage`
  A new component responsible for showing or hiding Jane and Rochester, applying bright/dim state, switching expressions, and softening the cast during narration.

- `DialogueBox`
  Continues handling text and navigation, but gains presentation variants for `chapter-card`, `narration`, `thought`, and `dialogue`.

- `ChoiceOverlay`
  Remains present in the codebase but is not used by the chapter data for this scene.

### Scene Data Shape

The production scene file should explicitly store presentation intent rather than forcing the UI to infer it. Each scene entry should carry enough information for the frontend to render deterministically.

Minimum data per entry:

- `id`
- `type`
- `speaker`
- `text`
- `stage`
- `atmosphere`

`stage` should describe:

- whether portraits are visible
- which characters are present
- which side each character occupies
- which portrait state each character uses
- which expression each visible character should show

`atmosphere` should describe:

- whether the scene is in opening-card mode
- whether portraits should be softened during narration
- whether weather or emotional overlays should intensify

### Example Data Direction

```ts
type SceneEntryType = "chapter-card" | "narration" | "thought" | "dialogue";

type CharacterId = "jane" | "rochester";
type PortraitMood = "neutral" | "sad" | "angry" | "warm";
type PortraitLight = "bright" | "dim";

type SceneEntry = {
  id: string;
  type: SceneEntryType;
  speaker: string;
  text: string;
  stage: {
    mode: "card" | "narration-only" | "duo-stage";
    softenCast?: boolean;
    left?: { character: CharacterId; mood: PortraitMood; light: PortraitLight };
    right?: { character: CharacterId; mood: PortraitMood; light: PortraitLight };
  };
  atmosphere?: {
    weather?: "calm" | "tense" | "storm";
  };
};
```

This is illustrative rather than mandatory field naming, but the implementation should preserve the same level of explicitness.

## Asset Mapping

The current source images use hashed filenames, so a stable lookup layer is required.

The implementation should define a single portrait mapping source that identifies:

- which files belong to Jane
- which files belong to Rochester
- which files are bright variants
- which files are dim variants
- which files represent each supported emotional state

This mapping should be separate from the scene text so portraits can be adjusted later without rewriting the adapted script.

## Error Handling and Fallbacks

The chapter must remain playable even if some portrait states are incomplete.

Required fallback behavior:

- If a requested expression is missing, reuse the previous expression for that character.
- If a portrait asset is missing entirely for an entry, render the line without breaking the scene.
- If narration does not specify visible characters, default to narration-only mode.
- If a thought line lacks explicit parentheses in the source data, the UI should still display it as parenthesized thought.

The frontend should prefer graceful degradation over empty screens or runtime errors.

## Testing and Validation

After implementation, the chapter is considered acceptable only if all of the following are true:

- Starting the story enters a chapter card before scene playback.
- Early setup lines render as narration over the background with no forced portraits.
- The full contents of `script.md` are represented in the adapted chapter flow.
- Inner thoughts display in parentheses inside the dialogue box.
- Once the encounter begins, Jane and Rochester appear in stable left/right positions.
- The current speaker is bright and the other visible character is dim.
- Expression changes happen at major emotional turns only.
- Narration can either keep or soften portraits depending on the line's dramatic function.
- The entire chapter can be played linearly without branching choices.
- The local web app can be launched successfully for review.

## Risks and Mitigations

### Risk: Overly literal adaptation produces unreadable pacing

Mitigation: favor shorter staged beats over paragraph-faithful line lengths.

### Risk: Portrait assets may not all be cleanly isolated

Mitigation: define a stable mapping and fallback strategy now; improve asset isolation without changing scene logic later.

### Risk: Narration and thought may blur together

Mitigation: keep `thought` explicit in the data model and always render it with parenthetical styling.

### Risk: Runtime logic becomes too inferential

Mitigation: store stage intent directly in the scene data instead of asking components to guess.

## Implementation Boundary

This spec covers the chapter-specific scene adaptation, staging rules, data shape, asset mapping strategy, and acceptance criteria.

It does not yet prescribe the detailed execution order of code changes. That work belongs to the implementation plan phase after this spec is reviewed.
