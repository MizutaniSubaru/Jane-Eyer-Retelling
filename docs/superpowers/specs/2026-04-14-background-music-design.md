# Background Music Design

## Goal

Add a single persistent background-music track that starts fading in on the opening screen, continues seamlessly into gameplay, restarts from the beginning when the player returns home, and fades out on the final line of the current scene.

## Architecture

Keep music ownership in `src/app/App.tsx` so playback does not reset when the UI swaps between the opening screen and the game screen. `App` will create one `HTMLAudioElement` instance for the root-level MP3 file and drive it through a tiny audio controller helper that handles fade timing, restart-from-beginning, and stop-after-fade behavior.

`GameScreen` remains responsible only for story progression. When its local index reaches the last entry of `chapter23Scene`, it emits a one-shot `onStoryEnd` callback to `App`. `App` then fades the music out and stops it. Returning to the home screen reuses the same audio element, resets it to time `0`, and starts a fresh fade-in.

## Behavior Notes

- Initial home screen load attempts autoplay immediately and ignores browser autoplay rejections safely.
- Transition from home screen into gameplay does not restart music.
- Transition from gameplay back to home always restarts from the beginning with a new fade-in.
- Reaching the last line disables looping before the fade-out completes so playback cannot continue past the ending.

## Testing

- `src/app/App.test.tsx` covers initial fade-in, seamless continuation into gameplay, restart-on-home, and stop-on-ending using a mocked `Audio`.
- `src/app/components/GameScreen.test.tsx` covers the one-shot story-end callback when the scene index reaches the last entry.
