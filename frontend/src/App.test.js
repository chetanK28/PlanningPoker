import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Mock socket.io-client to prevent real socket connection during tests
jest.mock("socket.io-client", () => {
  return () => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  });
});

describe("🃏 Planning Poker App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders the Planning Poker game title", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/Planning Poker Game/i)).toBeInTheDocument();
  });

  test("allows Scrum Master to create a room", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const roomNameInput = screen.getByPlaceholderText("Enter Room Name");
    fireEvent.change(roomNameInput, { target: { value: "My Poker Room" } });

    const createRoomButton = screen.getByText(/Create New Room/i);
    fireEvent.click(createRoomButton);

    // After creating, user is redirected to join screen with their name input
    expect(screen.getByPlaceholderText("Enter Name")).toBeInTheDocument();
  });

  test("allows user to enter name and join a room", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const joinInput = screen.getByPlaceholderText("Enter Name");
    fireEvent.change(joinInput, { target: { value: "John Doe" } });

    const joinBtn = screen.getByText(/Join Room/i);
    fireEvent.click(joinBtn);

    expect(localStorage.getItem("username")).toBe("John Doe");
  });

  test("persists username across refreshes", () => {
    localStorage.setItem("username", "Jane Doe");

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
  });

  test("disables join button when no name is entered", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const joinButton = screen.getByText(/Join Room/i);
    expect(joinButton).toBeDisabled();
  });
});
