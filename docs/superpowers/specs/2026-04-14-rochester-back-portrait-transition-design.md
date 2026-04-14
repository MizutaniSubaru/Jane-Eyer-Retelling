# Rochester Back Portrait Transition Design

## Goal

Replace Rochester's current right-edge slide-in staging with a back-portrait entrance built from the newly added root image, then switch to the existing front-facing highlighted portrait when he speaks his first line.

This change must do three things:

- stop using the current slide-in entrance for Rochester's orchard arrival
- show Rochester's back silhouette at the existing right-side portrait anchor and fade it in on the arrival beat
- when Rochester speaks `简，过来看看这家伙。`, replace the back silhouette with the existing front-facing Rochester portrait and highlight him

The new back-portrait asset must contain only the character, with the background removed.

## Source Asset

The new source image currently lives at the project root:

- `fcbd07990e282c247907af0d4b9befa2.jpg`

It is a Rochester back-view image. The implementation will derive a transparent cutout PNG from this source and add it to the portrait asset set under `src/assets/portraits/`.

The source JPEG should remain untouched. The application should render the processed transparent PNG, not the original JPEG.

## Scene Beats Affected

The staging change applies to the same early orchard segment introduced in the prior portrait-entrance update.

### Beat 1: Rochester appears in the orchard

Scene entry:

- `rochester-enters-orchard`

Current behavior:

- Rochester uses `slide-in-right`

New behavior:

- Rochester uses a back-facing portrait variant
- the entrance becomes `fade-in`
- the back portrait appears at the normal right-side anchor instead of sliding in from offscreen

### Beat 2: Rochester remains present before speaking

Scene entries:

- `rochester-wanders-at-ease`
- `jane-thinks-she-can-slip-away`
- `jane-steps-over-grass`

Behavior:

- keep Rochester visible as the back-facing portrait variant
- do not replay the entrance animation on these follow-up beats
- keep Jane's side unchanged

### Beat 3: Rochester speaks his first line

Scene entry:

- `rochester-calls-jane-to-moth`

Behavior:

- stop rendering the back-facing variant
- switch Rochester to the existing front-facing portrait asset set
- apply the existing bright highlight to Rochester because he is now the active speaker

The “turn around” effect is represented as a staged asset swap:

- back-facing cutout before speech
- front-facing highlighted portrait on the first dialogue beat

This is intentionally not a 3D rotation animation.

## Data Model

The minimal extension is to keep the current stage-slot metadata approach and add a portrait variant field.

`StageSlot` will gain:

- `variant?: "default" | "back"`

Default behavior:

- omitted means `default`

Usage in this feature:

- Rochester on `rochester-enters-orchard` through `jane-steps-over-grass` uses `variant: "back"`
- Rochester on `rochester-calls-jane-to-moth` and later uses `variant: "default"`

The existing entrance field remains in place:

- `fade-in`
- `static`

`slide-in-right` will no longer be used by this sequence.

## Asset Resolution

The portrait asset resolver will support Rochester's back variant without disturbing the existing front-facing mood/light map.

Resolution rules:

- `variant: "default"` uses the current Rochester portrait manifest exactly as today
- `variant: "back"` resolves to the new transparent back cutout asset

The back asset should ignore Rochester mood-specific front portrait differences for now. This feature only needs one back-facing cutout.

For grading:

- dim Rochester back portrait still uses the Rochester dim color treatment
- bright Rochester front portrait on the first dialogue line keeps the existing highlight styling

## Rendering Behavior

`CharacterStage` remains the only place that chooses which raster asset is rendered for a slot.

It will now combine:

- `character`
- `mood`
- `light`
- `variant`

The back-facing Rochester portrait should:

- sit at the same right-side anchor as the current Rochester portrait
- use the same overall portrait shell sizing and composition rules
- fade in on `rochester-enters-orchard`
- remain static on the following beats

When the first Rochester dialogue beat starts, `CharacterStage` should render the default front-facing Rochester portrait instead of the back-facing cutout. Since the scene key changes on that beat, the renderer can treat it as a normal beat transition rather than trying to animate a live transform between both art assets.

## Background Removal

The new back portrait must be isolated from the uploaded image before it is used in the game.

Requirements:

- output format: transparent PNG
- remove all background scenery
- preserve the silhouette, coat shape, and head/shoulder contour cleanly
- avoid leaving visible matte halos around the figure

The final cutout should be stored alongside the existing portrait assets and referenced by code as a normal imported asset.

## Testing

Tests should cover four layers.

### Asset resolution

- Rochester back variant resolves to the new transparent PNG asset
- Rochester default variant still resolves to the existing front-facing manifest

### Scene data

- `rochester-enters-orchard` now uses `entrance: "fade-in"` and `variant: "back"`
- `rochester-wanders-at-ease`, `jane-thinks-she-can-slip-away`, and `jane-steps-over-grass` keep `variant: "back"` with static presentation
- `rochester-calls-jane-to-moth` returns to `variant: "default"`

### Rendering

- `CharacterStage` marks Rochester's orchard entrance shell as `fade-in`, not `slide-in-right`
- the Rochester back variant renders the dedicated back asset
- the first Rochester dialogue beat renders the normal front portrait and bright highlight

### Integration

- the orchard-arrival narration beat shows Rochester's back silhouette on the right
- the first Rochester dialogue beat shows the existing front portrait instead of the back silhouette

## Scope Guard

This feature is intentionally limited to:

- one new Rochester back cutout asset
- one new stage-slot variant field
- replacing the earlier orchard slide-in with a fade-in back-portrait staging
- switching to the existing front portrait on Rochester's first spoken line

It does not include:

- runtime image segmentation by the app
- a generalized pose system
- 3D turning or skeletal animation
- replacing other Rochester beats with alternate back-facing art
