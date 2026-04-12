import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GameScreen } from "./GameScreen";

describe("GameScreen", () => {
  it("starts on the chapter card and advances into narration without showing choices", () => {
    render(<GameScreen onBack={vi.fn()} />);

    expect(screen.getByText(/第二十三章/)).toBeInTheDocument();
    expect(screen.getByText(/果园之夜/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /下一句/i }));

    expect(screen.getByText(/这个仲夏的英格兰格外明亮/)).toBeInTheDocument();
    expect(
      screen.queryByText(/停下脚步，转过身安静地看着他/),
    ).not.toBeInTheDocument();
  });
});
