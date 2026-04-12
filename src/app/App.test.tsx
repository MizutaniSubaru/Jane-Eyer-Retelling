import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the opening screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Jane Eyre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始叙事" })).toBeInTheDocument();
  });
});
