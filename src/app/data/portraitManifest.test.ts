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

  it("uses dedicated angry art for Jane in both light modes", () => {
    expect(getPortraitAsset("jane", "angry", "bright")).toMatch(
      /jane-bright-angry\.png$/,
    );
    expect(getPortraitAsset("jane", "angry", "dim")).toMatch(
      /jane-dim-angry\.png$/,
    );
  });

  it("uses dedicated warm portraits for both characters", () => {
    expect(getPortraitAsset("jane", "warm", "bright")).toMatch(
      /jane-bright-warm\.png$/,
    );
    expect(getPortraitAsset("jane", "warm", "dim")).toMatch(
      /jane-dim-warm\.png$/,
    );
    expect(getPortraitAsset("rochester", "warm", "bright")).toMatch(
      /rochester-bright-warm\.png$/,
    );
    expect(getPortraitAsset("rochester", "warm", "dim")).toMatch(
      /rochester-dim-warm\.png$/,
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
    expect(getPortraitAsset("rochester", "warm", "dim")).toEqual(
      expect.stringMatching(/rochester-dim-warm\.png$/),
    );
  });

  it("resolves Rochester's back variant to the dedicated cutout asset", () => {
    expect(
      getPortraitAsset("rochester", "neutral", "dim", "back" as never),
    ).toMatch(/rochester-back\.png$/);
    expect(
      getPortraitAsset("rochester", "neutral", "bright", "back" as never),
    ).toMatch(/rochester-back\.png$/);
  });

  it("keeps Rochester's default variant on the existing front-facing manifest", () => {
    expect(
      getPortraitAsset("rochester", "neutral", "bright", "default" as never),
    ).toMatch(/rochester-bright-neutral\.png$/);
  });
});
