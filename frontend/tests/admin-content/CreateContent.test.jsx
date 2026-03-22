import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../src/context/UserContext";
import CreateContent from "../../src/components/admin/pages/content/CreateContent";

const navigateMock = vi.fn();

vi.mock("axios", () => {
  const create = () => ({
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  });

  return {
    default: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      create,
    },
  };
});

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderWithUser = () =>
  render(
    <UserContext.Provider
      value={{
        currentUser: { token: "test-token" },
        loading: false,
      }}
    >
      <MemoryRouter>
        <CreateContent />
      </MemoryRouter>
    </UserContext.Provider>
  );

describe("CreateContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors before submission", async () => {
    renderWithUser();

    fireEvent.submit(screen.getByRole("button", { name: "Create Content" }).closest("form"));

    expect(
      await screen.findByText("Please fix the highlighted fields before submitting.")
    ).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("submits a valid form and navigates to the detail page", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          _id: "content-9",
        },
      },
    });

    renderWithUser();

    await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "New article");
    await userEvent.type(
      screen.getByRole("textbox", { name: "Duration" }),
      "5 min read"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Summary" }),
      "A concise summary"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Source Name" }),
      "WHO"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Source URL" }),
      "https://example.com"
    );
    await userEvent.type(
      screen.getByRole("spinbutton", { name: "Display Order" }),
      "2"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Content Body" }),
      "Body copy"
    );

    await userEvent.click(screen.getByRole("button", { name: "Create Content" }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/admin/content/content-9", {
        replace: true,
      })
    );
    expect(toast.success).toHaveBeenCalled();
  });
});
