import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RatingsTab from "./RatingsTab";

describe("RatingsTab", () => {
  it("renders an empty state when there are no ratings", () => {
    render(<RatingsTab therapist={{ ratings: [] }} averageRating={0} />);

    expect(screen.getByText("Patient Feedback")).toBeTruthy();
    expect(
      screen.getByText(
        "No patient reviews yet. Ratings will appear here once patients submit feedback after their appointments."
      )
    ).toBeTruthy();
  });

  it("renders summary stats and review cards from therapist ratings", () => {
    render(
      <RatingsTab
        averageRating={4.5}
        therapist={{
          ratings: [
            {
              _id: "review-1",
              rating: 5,
              review: "Very helpful and kind.",
              createdAt: "2026-03-22T00:00:00.000Z",
              patient: { firstName: "Ada", lastName: "Li", patientId: "P123" },
            },
            {
              _id: "review-2",
              rating: 4,
              review: "",
              createdAt: "2026-03-20T00:00:00.000Z",
              patient: { firstName: "Bo", lastName: "Kim", patientId: "P456" },
            },
          ],
        }}
      />
    );

    expect(screen.getByText("4.5")).toBeTruthy();
    expect(screen.getByText("Based on 2 patient reviews")).toBeTruthy();
    expect(screen.getByText("Ada Li")).toBeTruthy();
    expect(screen.getByText("Patient ID: P123")).toBeTruthy();
    expect(screen.getByText("Very helpful and kind.")).toBeTruthy();
    expect(screen.getByText("No written comment provided.")).toBeTruthy();
  });

  it("shows Anonymous patient and hides patient ID for anonymous reviews", () => {
    render(
      <RatingsTab
        averageRating={5}
        therapist={{
          ratings: [
            {
              _id: "anon-1",
              rating: 5,
              review: "Great care.",
              isAnonymous: true,
              patient: null,
              createdAt: "2026-03-22T00:00:00.000Z",
            },
          ],
        }}
      />
    );

    expect(screen.getByText("Anonymous patient")).toBeTruthy();
    expect(screen.getByText(/Anonymous submission/)).toBeTruthy();
    expect(screen.queryByText(/Patient ID:/)).toBeNull();
  });
});
