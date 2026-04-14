export const BGM_TARGET_VOLUME = 0.38;
export const BGM_FADE_IN_MS = 1600;
export const BGM_FADE_OUT_MS = 1400;

const FADE_STEP_MS = 50;

function clampVolume(volume: number) {
  return Math.max(0, Math.min(BGM_TARGET_VOLUME, volume));
}

export function createBackgroundMusicController(audio: HTMLAudioElement) {
  let fadeTimer: number | null = null;
  let pendingPlaybackRetryCleanup: (() => void) | null = null;

  const clearFade = () => {
    if (fadeTimer !== null) {
      window.clearInterval(fadeTimer);
      fadeTimer = null;
    }
  };

  const clearPendingPlaybackRetry = () => {
    pendingPlaybackRetryCleanup?.();
    pendingPlaybackRetryCleanup = null;
  };

  const fadeVolume = (
    from: number,
    to: number,
    durationMs: number,
    onComplete?: () => void,
  ) => {
    clearFade();

    const totalSteps = Math.max(1, Math.ceil(durationMs / FADE_STEP_MS));
    let step = 0;

    audio.volume = clampVolume(from);

    fadeTimer = window.setInterval(() => {
      step += 1;

      const progress = Math.min(step / totalSteps, 1);
      const nextVolume = from + (to - from) * progress;

      audio.volume = clampVolume(nextVolume);

      if (progress >= 1) {
        clearFade();
        onComplete?.();
      }
    }, FADE_STEP_MS);
  };

  const armPlaybackRetry = () => {
    if (pendingPlaybackRetryCleanup !== null) {
      return;
    }

    const retryPlayback = () => {
      clearPendingPlaybackRetry();
      void startFadeInPlayback();
    };

    const playbackRetryEvents = ["click", "keydown", "pointerdown", "touchstart"] as const;

    playbackRetryEvents.forEach((eventName) => {
      window.addEventListener(eventName, retryPlayback, { once: true });
    });

    pendingPlaybackRetryCleanup = () => {
      playbackRetryEvents.forEach((eventName) => {
        window.removeEventListener(eventName, retryPlayback);
      });
    };
  };

  const startFadeInPlayback = async () => {
    clearFade();
    clearPendingPlaybackRetry();
    audio.loop = true;
    audio.currentTime = 0;
    audio.volume = 0;

    try {
      await audio.play();
    } catch {
      armPlaybackRetry();
      return;
    }

    fadeVolume(0, BGM_TARGET_VOLUME, BGM_FADE_IN_MS);
  };

  return {
    playFromStartWithFadeIn() {
      void startFadeInPlayback();
    },

    stopWithFadeOut() {
      clearFade();
      clearPendingPlaybackRetry();
      audio.loop = false;

      fadeVolume(audio.volume, 0, BGM_FADE_OUT_MS, () => {
        audio.pause();
        audio.currentTime = 0;
      });
    },

    dispose() {
      clearPendingPlaybackRetry();
      clearFade();
      audio.pause();
    },
  };
}
