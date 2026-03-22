import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssistiveDevice from "../AssistiveDevice";

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

const openDeviceDetails = async (deviceName) => {
  await userEvent.click(screen.getByAltText(deviceName));
  expect(screen.getByRole("heading", { name: deviceName })).toBeInTheDocument();
};

describe("AssistiveDevice basic flows", () => {
  test("add to cart and request assessment from details", async () => {
    render(<AssistiveDevice />);

    await openDeviceDetails("Knee Support Brace");
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    await userEvent.click(screen.getByRole("button", { name: "Request Assessment" }));
    await userEvent.click(screen.getByRole("button", { name: /back to devices/i }));

    expect(screen.getByRole("heading", { name: /cart \(1\)/i })).toBeInTheDocument();
    expect(screen.getAllByText("Knee Support Brace").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /assessment requests \(1\)/i })).toBeInTheDocument();
  });

  test("increase and decrease item quantity updates total and removes item", async () => {
    render(<AssistiveDevice />);

    await openDeviceDetails("Bath Safety Chair");
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    await userEvent.click(screen.getByRole("button", { name: /back to devices/i }));

    expect(screen.getByText("Total: $35.00")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/increase bath safety chair quantity/i));
    expect(screen.getByText("Total: $70.00")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/decrease bath safety chair quantity/i));
    expect(screen.getByText("Total: $35.00")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/decrease bath safety chair quantity/i));
    expect(screen.getByText("No items in cart yet.")).toBeInTheDocument();
  });

  test("removeFromCart removes a specific item from cart", async () => {
    render(<AssistiveDevice />);

    await openDeviceDetails("Bath Safety Chair");
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    await userEvent.click(screen.getByRole("button", { name: /back to devices/i }));

    expect(screen.getAllByText("Bath Safety Chair").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByText("No items in cart yet.")).toBeInTheDocument();
    expect(screen.getByText("Bath Safety Chair removed from cart.")).toBeInTheDocument();
  });

  test("simulated payment clears cart and shows receipt", async () => {
    const user = userEvent.setup();
    render(<AssistiveDevice />);

    await user.click(screen.getByAltText("Foldable Walker"));
    await user.click(screen.getByRole("button", { name: "Add to Cart" }));
    await user.click(screen.getByRole("button", { name: /back to devices/i }));

    await user.click(screen.getByRole("button", { name: /proceed to payment/i }));
    expect(screen.getByRole("heading", { name: "Confirm Payment" })).toBeInTheDocument();
    expect(screen.getByText("Items: 1")).toBeInTheDocument();
    expect(screen.getAllByText("Total: $65.00").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /confirm payment/i }));

    expect(
      await screen.findByText(/payment successful \(simulation\)/i, {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.getByText(/simulated payment receipt/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /cart \(0\)/i })).toBeInTheDocument();
  });
});
