import { describe, expect, it } from "vitest";
import { getPortraitAsset } from "./portraitManifest";

describe("getPortraitAsset", () => {
  it("resolves both light modes for a representative mood", () => {
    expect(getPortraitAsset("jane", "sad", "bright")).toMatch(
      /jane-bright-sad\.png$/,
    );
    expect(getPortraitAsset("jane", "sad", "dim")).toMatch(
      /jane-dim-sad\.png$/,
    );
    expect(getPortraitAsset("rochester", "sad", "bright")).toMatch(
      /rochester-bright-sad\.png$/,
    );
    expect(getPortraitAsset("rochester", "sad", "dim")).toMatch(
      /rochester-dim-sad\.png$/,
    );
  });

  it("uses the neutral dim asset for Jane angry dim", () => {
    expect(getPortraitAsset("jane", "angry", "dim")).toMatch(
      /jane-dim-neutral\.png$/,
    );
  });

  it("falls back to neutral when a warm portrait is unavailable", () => {
    expect(getPortraitAsset("rochester", "warm", "bright")).toMatch(
      /rochester-bright-neutral\.png$/,
    );
    expect(getPortraitAsset("rochester", "warm", "dim")).toMatch(
      /rochester-dim-neutral\.png$/,
    );
  });

  it("returns stable string paths with the expected filenames", () => {
    expect(getPortraitAsset("jane", "neutral", "bright")).toEqual(
      expect.stringMatching(/jane-bright-neutral\.png$/),
    );
    expect(getPortraitAsset("jane", "warm", "dim")).toEqual(
      expect.stringMatching(/jane-dim-warm\.png$/),
    );
    expect(getPortraitAsset("rochester", "angry", "bright")).toEqual(
      expect.stringMatching(/rochester-bright-angry\.png$/),
    );
    expect(getPortraitAsset("rochester", "neutral", "dim")).toEqual(
      expect.stringMatching(/rochester-dim-neutral\.png$/),
    );
  });
});
