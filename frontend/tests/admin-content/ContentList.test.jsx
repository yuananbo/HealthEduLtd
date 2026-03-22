import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../src/context/UserContext";
import ContentList from "../../src/components/admin/pages/content/ContentList";

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

const renderWithUser = (ui) =>
  render(
    <UserContext.Provider
      value={{
        currentUser: { token: "test-token" },
        loading: false,
      }}
    >
      <MemoryRouter>{ui}</MemoryRouter>
    </UserContext.Provider>
  );

describe("ContentList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fetched content and summary cards", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            _id: "content-1",
            title: "Healthy Eating",
            summary: "Summary",
            topic: "nutrition",
            type: "article",
            sourceName: "WHO",
            isPublished: true,
            updatedAt: "2026-03-18T00:00:00.000Z",
          },
        ],
        total: 1,
        currentPage: 1,
        totalPages: 1,
      },
    });

    renderWithUser(<ContentList />);

    expect(await screen.findByText("Healthy Eating")).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getByText("WHO")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
  });

  it("refetches when filters change", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          data: [],
          total: 0,
          currentPage: 1,
          totalPages: 1,
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [],
          total: 0,
          currentPage: 1,
          totalPages: 1,
        },
      });

    renderWithUser(<ContentList />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    await userEvent.selectOptions(screen.getByLabelText("Topic"), "nutrition");

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(axios.get.mock.calls[1][1].params.topic).toBe("nutrition");
  });
});
