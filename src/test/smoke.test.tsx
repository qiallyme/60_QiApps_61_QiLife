import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test foundation", () => {
  it("renders React into jsdom", () => {
    render(<p>QiLife test foundation</p>);
    expect(screen.getByText("QiLife test foundation")).toBeInTheDocument();
  });
});
