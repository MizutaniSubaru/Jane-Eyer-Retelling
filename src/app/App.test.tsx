import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { HTMLAttributes, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BGM_FADE_IN_MS, BGM_FADE_OUT_MS, BGM_TARGET_VOLUME } from "./lib/backgroundMusicController";
import App from "./App";

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get:
        () =>
        ({ children, ...props }: HTMLAttributes<HTMLElement> & { children?: ReactNode }) => (
          <div {...props}>{children}</div>
        ),
    },
  ),
}));

vi.mock("./components/Bookshelf", () => ({
  Bookshelf: ({ onSelectBook }: { onSelectBook: (id: string) => void }) => (
    <div>
      <h1>Library of Stories</h1>
      <button onClick={() => onSelectBook("jane-eyre")}>选择简爱</button>
    </div>
  ),
}));

vi.mock("./components/ConstellationDirectory", () => ({
  ConstellationDirectory: ({
    onBack,
    onSelectChapter,
  }: {
    onBack: () => void;
    onSelectChapter: (id: string) => void;
  }) => (
    <div>
      <button onClick={onBack}>返回书架</button>
      <button onClick={() => onSelectChapter("thornfield")}>选择章节</button>
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
      <button onClick={onBack}>返回章节目录</button>
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

const enterGame = async () => {
  fireEvent.click(screen.getByRole("button", { name: "选择简爱" }));
  await act(async () => {});
  fireEvent.click(screen.getByRole("button", { name: "选择章节" }));
  await act(async () => {});
};

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

  it("only plays music after entering the game, and fades it out on leaving", async () => {
    render(<App />);

    await act(async () => {});

    expect(audioInstances).toHaveLength(1);
    // No autoplay on the bookshelf or directory.
    expect(audioInstances[0].play).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "选择简爱" }));
    await act(async () => {});
    expect(audioInstances[0].play).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "选择章节" }));
    await act(async () => {});

    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].loop).toBe(true);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(audioInstances[0].volume).toBe(0);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    expect(audioInstances[0].volume).toBeCloseTo(BGM_TARGET_VOLUME, 2);

    // Leaving the game fades the music back down to silence.
    fireEvent.click(screen.getByRole("button", { name: "返回章节目录" }));
    await act(async () => {});

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_OUT_MS);
    });

    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].volume).toBe(0);
  });

  it("re-enters the game and restarts playback from the beginning", async () => {
    render(<App />);
    await act(async () => {});

    await enterGame();
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "返回章节目录" }));
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "选择章节" }));
    await act(async () => {});

    expect(audioInstances[0].play).toHaveBeenCalledTimes(2);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(audioInstances[0].volume).toBe(0);

    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

    expect(audioInstances[0].volume).toBeCloseTo(BGM_TARGET_VOLUME, 2);
  });

  it("retries playback on the next user gesture if the browser blocks the game-entry play", async () => {
    createPlayMock = () =>
      vi
        .fn()
        .mockRejectedValueOnce(new Error("NotAllowedError"))
        .mockResolvedValue(undefined);

    render(<App />);
    await act(async () => {});

    await enterGame();

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

  it("fades the music out and stops playback when the story reaches its ending", async () => {
    render(<App />);
    await act(async () => {});

    await enterGame();
    act(() => {
      vi.advanceTimersByTime(BGM_FADE_IN_MS);
    });

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
