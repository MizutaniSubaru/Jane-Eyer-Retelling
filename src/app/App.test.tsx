import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { HTMLAttributes, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BGM_FADE_IN_MS, BGM_FADE_OUT_MS, BGM_TARGET_VOLUME } from "./lib/backgroundMusicController";
import App from "./App";

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("./components/StartScreen", () => ({
  StartScreen: ({ onStart }: { onStart: () => void }) => (
    <div>
      <h1>Jane Eyre</h1>
      <button onClick={onStart}>开始叙事</button>
    </div>
  ),
}));

vi.mock("./components/GameScreen", () => ({
  GameScreen: ({
    onBack,
    onStoryEnd,
  }: {
    onBack: () => void;
    onStoryEnd?: () => void;
  }) => (
    <div>
      <button onClick={onBack}>返回扉页</button>
      <button onClick={() => onStoryEnd?.()}>结束剧情</button>
    </div>
  ),
}));

type MockAudioInstance = {
  currentTime: number;
  loop: boolean;
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  preload: string;
  src: string;
  volume: number;
};

const audioInstances: MockAudioInstance[] = [];
let createPlayMock: () => ReturnType<typeof vi.fn>;

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    audioInstances.length = 0;
    createPlayMock = () => vi.fn().mockResolvedValue(undefined);

    class MockAudio {
      currentTime = 0;
      loop = false;
      pause = vi.fn(() => undefined);
      play = createPlayMock();
      preload = "";
      src: string;
      volume = 1;

      constructor(src: string) {
        this.src = src;
        audioInstances.push(this as unknown as MockAudioInstance);
      }
    }

    vi.stubGlobal("Audio", MockAudio as unknown as typeof Audio);
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("starts music on the opening screen and restarts the fade-in after returning home", async () => {
    render(<App />);

    await act(async () => {});

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].loop).toBe(true);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(audioInstances[0].volume).toBe(0);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    expect(audioInstances[0].volume).toBeCloseTo(BGM_TARGET_VOLUME, 2);
    expect(screen.getByRole("heading", { name: "Jane Eyre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始叙事" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "开始叙事" }));
    await act(async () => {});

    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "返回扉页" }));
    await act(async () => {});

    expect(audioInstances[0].play).toHaveBeenCalledTimes(2);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(audioInstances[0].volume).toBe(0);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    expect(audioInstances[0].volume).toBeCloseTo(BGM_TARGET_VOLUME, 2);
  });

  it("retries playback on the first user interaction if the browser blocks initial autoplay", async () => {
    createPlayMock = () =>
      vi
        .fn()
        .mockRejectedValueOnce(new Error("NotAllowedError"))
        .mockResolvedValue(undefined);

    render(<App />);
    await act(async () => {});

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    expect(audioInstances[0].volume).toBe(0);

    fireEvent.click(window);
    await act(async () => {});

    expect(audioInstances[0].play).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    expect(audioInstances[0].volume).toBeCloseTo(BGM_TARGET_VOLUME, 2);
  });

  it("retries playback when the first user gesture happens before the autoplay rejection settles", async () => {
    createPlayMock = () =>
      vi
        .fn()
        .mockRejectedValueOnce(new Error("NotAllowedError"))
        .mockResolvedValue(undefined);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始叙事" }));
    await act(async () => {});

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].play).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    expect(audioInstances[0].volume).toBeCloseTo(BGM_TARGET_VOLUME, 2);
  });

  it("fades the music out and stops playback when the story reaches its ending", async () => {
    render(<App />);
    await act(async () => {});

    expect(audioInstances).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    fireEvent.click(screen.getByRole("button", { name: "开始叙事" }));
    fireEvent.click(screen.getByRole("button", { name: "结束剧情" }));
    await act(async () => {});

    expect(audioInstances[0].loop).toBe(false);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_OUT_MS);
    });

    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(audioInstances[0].volume).toBe(0);
  });
});
