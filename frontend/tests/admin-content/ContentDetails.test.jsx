import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../src/context/UserContext";
import ContentDetails from "../../src/components/admin/pages/content/ContentDetails";

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

const contentPayload = {
  _id: "content-1",
  title: "Healthy Eating",
  summary: "Simple summary",
  topic: "nutrition",
  type: "article",
  duration: "5 min read",
  body: "Detailed content body",
  sourceName: "WHO",
  sourceUrl: "https://example.com",
  isPublished: true,
  order: 1,
  createdAt: "2026-03-18T10:00:00.000Z",
  updatedAt: "2026-03-19T10:00:00.000Z",
};

const renderWithUser = () =>
  render(
    <UserContext.Provider
      value={{
        currentUser: { token: "test-token" },
        loading: false,
      }}
    >
      <MemoryRouter initialEntries={["/admin/content/content-1"]}>
        <Routes>
          <Route path="/admin/content/:id" element={<ContentDetails />} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );

describe("ContentDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fetched content details", async () => {
    axios.get.mockResolvedValueOnce({ data: { data: contentPayload } });

    renderWithUser();

    expect(await screen.findByText("Healthy Eating")).toBeInTheDocument();
    expect(screen.getByText("Simple summary")).toBeInTheDocument();
    expect(screen.getByText("Detailed content body")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
  });

  it("toggles publish status from the details page", async () => {
    axios.get.mockResolvedValueOnce({ data: { data: contentPayload } });
    axios.patch.mockResolvedValueOnce({
      data: {
        data: {
          ...contentPayload,
          isPublished: false,
        },
      },
    });

    renderWithUser();

    expect(await screen.findByText("Healthy Eating")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/content/content-1/status"),
        { isPublished: false },
        expect.any(Object)
      )
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it("edits content and saves the updated payload", async () => {
    axios.get.mockResolvedValueOnce({ data: { data: contentPayload } });
    axios.patch.mockResolvedValueOnce({
      data: {
        data: {
          ...contentPayload,
          title: "Updated Title",
        },
      },
    });

    renderWithUser();

    expect(await screen.findByText("Healthy Eating")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated Title");

    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/content/content-1"),
        expect.objectContaining({
          title: "Updated Title",
        }),
        expect.any(Object)
      )
    );
    expect(toast.success).toHaveBeenCalled();
  });
});
