import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { EventDisplay } from "../EventDisplay";
import {
  GridMoveEvent,
  DonutMoveEvent,
  FlagAddEvent,
  FlagRemoveEvent,
} from "../../../types/events";

describe("EventDisplay", () => {
  describe("GridMoveEvent rendering", () => {
    it("displays grid move with position labels", () => {
      const event: GridMoveEvent = {
        event_id: "test-1",
        event_type: "grid_move",
        employee_id: 1,
        employee_name: "Alice",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 1,
        new_position: 5,
        old_performance: "Low",
        new_performance: "Medium",
        old_potential: "Low",
        new_potential: "Medium",
        notes: null,
      };

      render(<EventDisplay event={event} />);

      // Should show grid move label
      expect(screen.getByText("Grid Movement")).toBeInTheDocument();

      // Should show position names
      expect(screen.getByText(/Underperformer/)).toBeInTheDocument();
      expect(screen.getByText(/Core Talent/)).toBeInTheDocument();
    });

    it("displays timestamp icon with tooltip", () => {
      const event: GridMoveEvent = {
        event_id: "test-1",
        event_type: "grid_move",
        employee_id: 1,
        employee_name: "Alice",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 1,
        new_position: 5,
        old_performance: "Low",
        new_performance: "Medium",
        old_potential: "Low",
        new_potential: "Medium",
        notes: null,
      };

      render(<EventDisplay event={event} />);

      // Timestamp icon should be present
      const timeIcon = screen.getByRole("button");
      expect(timeIcon).toBeInTheDocument();
    });

    it("displays notes field when showNotes is true", () => {
      const event: GridMoveEvent = {
        event_id: "test-1",
        event_type: "grid_move",
        employee_id: 1,
        employee_name: "Alice",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 1,
        new_position: 5,
        old_performance: "Low",
        new_performance: "Medium",
        old_potential: "Low",
        new_potential: "Medium",
        notes: "Promoted based on performance",
      };

      render(
        <EventDisplay event={event} showNotes={true} notesTestId="test-notes" />
      );

      const notesField = screen.getByTestId("test-notes");
      expect(notesField).toHaveValue("Promoted based on performance");
    });
  });

  describe("DonutMoveEvent rendering", () => {
    it("displays donut move with donut icon", () => {
      const event: DonutMoveEvent = {
        event_id: "test-2",
        event_type: "donut_move",
        employee_id: 2,
        employee_name: "Bob",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 9,
        new_position: 6,
        old_performance: "High",
        new_performance: "High",
        old_potential: "High",
        new_potential: "Medium",
        notes: null,
      };

      render(<EventDisplay event={event} />);

      // Should show donut move label
      expect(screen.getByText("Donut Movement")).toBeInTheDocument();

      // Should show position names
      expect(screen.getByText(/Star/)).toBeInTheDocument();
      expect(screen.getByText(/High Impact/)).toBeInTheDocument();
    });

    it("displays timestamp icon for donut move", () => {
      const event: DonutMoveEvent = {
        event_id: "test-2",
        event_type: "donut_move",
        employee_id: 2,
        employee_name: "Bob",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 9,
        new_position: 6,
        old_performance: "High",
        new_performance: "High",
        old_potential: "High",
        new_potential: "Medium",
        notes: null,
      };

      render(<EventDisplay event={event} />);

      // Timestamp icon should be present
      const timeIcon = screen.getByRole("button");
      expect(timeIcon).toBeInTheDocument();
    });
  });

  describe("FlagAddEvent rendering", () => {
    it("displays flag add with success styling", () => {
      const event: FlagAddEvent = {
        event_id: "test-3",
        event_type: "flag_add",
        employee_id: 3,
        employee_name: "Charlie",
        timestamp: "2025-12-24T10:30:00Z",
        flag: "promotion_ready",
        notes: null,
      };

      render(<EventDisplay event={event} />);

      // Should show flag add label
      expect(screen.getByText("Flag Added")).toBeInTheDocument();

      // Should show flag name
      expect(screen.getByText(/Promotion Ready/i)).toBeInTheDocument();
    });
  });

  describe("FlagRemoveEvent rendering", () => {
    it("displays flag remove with warning styling", () => {
      const event: FlagRemoveEvent = {
        event_id: "test-4",
        event_type: "flag_remove",
        employee_id: 4,
        employee_name: "Diana",
        timestamp: "2025-12-24T10:30:00Z",
        flag: "flight_risk",
        notes: null,
      };

      render(<EventDisplay event={event} />);

      // Should show flag remove label
      expect(screen.getByText("Flag Removed")).toBeInTheDocument();

      // Should show flag name
      expect(screen.getByText(/Flight Risk/i)).toBeInTheDocument();
    });
  });

  describe("Notes editing", () => {
    it("allows editing notes when showNotes is true", async () => {
      const mockOnNotesChange = vi.fn();
      const event: GridMoveEvent = {
        event_id: "test-1",
        event_type: "grid_move",
        employee_id: 1,
        employee_name: "Alice",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 1,
        new_position: 5,
        old_performance: "Low",
        new_performance: "Medium",
        old_potential: "Low",
        new_potential: "Medium",
        notes: "Original notes",
      };

      const { user } = render(
        <EventDisplay
          event={event}
          showNotes={true}
          onNotesChange={mockOnNotesChange}
          notesTestId="test-notes"
        />
      );

      const notesField = screen.getByTestId("test-notes");

      // Clear and type new notes
      await user.clear(notesField);
      await user.type(notesField, "Updated notes");

      // Blur should trigger save
      await user.tab();

      expect(mockOnNotesChange).toHaveBeenCalledWith("test-1", "Updated notes");
    });

    it("does not show notes field when showNotes is false", () => {
      const event: GridMoveEvent = {
        event_id: "test-1",
        event_type: "grid_move",
        employee_id: 1,
        employee_name: "Alice",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 1,
        new_position: 5,
        old_performance: "Low",
        new_performance: "Medium",
        old_potential: "Low",
        new_potential: "Medium",
        notes: "Some notes",
      };

      render(<EventDisplay event={event} showNotes={false} />);

      // Notes field should not be present
      expect(
        screen.queryByPlaceholderText("Add note...")
      ).not.toBeInTheDocument();
    });
  });
});
