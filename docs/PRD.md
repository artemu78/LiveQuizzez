# Quiz App - Product Requirements Document

## Problem Statement

Educators and webinar hosts struggle to maintain audience engagement during presentations. Existing solutions can be overly complex or require significant setup time. There is a need for a lightweight, interactive quiz tool that can be seamlessly integrated into webinars to provide cognitive load in a fun format, allowing hosts to quickly switch from presenting to a live game and back.

## Solution

A real-time, online quiz application (similar to Kahoot). The application allows an admin to start a session by uploading a predefined JSON question bank. Users join via a direct URL link, enter a nickname, and participate in a live, synchronized game. The admin controls the flow (switching questions), users vote in real-time, and a live leaderboard updates instantly. The game features time-based scoring to drive engagement, and final results are saved for later review.

## User Stories

1. As an admin, I want to authenticate using a secure token so that I can access the session creation interface.
2. As an admin, I want to upload a JSON file containing my questions and answers so that I can quickly populate the quiz content.
3. As an admin, I want to generate a unique session link so that I can easily share it with webinar attendees.
4. As an admin, I want to manually trigger the display of the next question so that I control the pace of the game.
5. As an admin, I want to see a live view of how many users are connected and have voted so that I know when to proceed.
6. As an admin, I want to manually end the session so that the final winner is declared and data is saved.
7. As a user, I want to click a direct link and only enter my nickname so that I can join the game instantly without creating an account.
8. As a user, I want to see the current question synchronized with the admin's screen so that we are all playing at the same time.
9. As a user, I want to submit my answer quickly so that I can maximize my time-based score.
10. As a user, I want to see my score and rank update immediately after every vote so that I feel the competitive nature of the game.
11. As a user, I want the system to remember my session locally (reconnect token) so that if my connection drops briefly, I don't lose my score or identity.
12. As a user, I want to see the correct answer highlighted after the voting period ends so that I can learn from my mistakes.
13. As a user, I want to see the final winner and my overall rank at the end of the session so that I know how I performed.

## Implementation Decisions

- **Tech Stack:**
  - **Frontend:** React (for reactive UI and WebSocket state mapping).
  - **Backend:** Python with FastAPI (for async performance and WebSockets).
  - **Deployment:** Single Server (e.g., AWS EC2) for MVP simplicity and avoiding complex distributed WebSocket state.
- **State Management:**
  - **Live State:** Stored in FastAPI memory (Python dicts) for zero-latency read/writes during the high-throughput live game.
  - **Persistent State:** Final session results and timestamps written to AWS DynamoDB upon session completion.
- **Real-time Communication:**
  - WebSockets will be used for bidirectional, low-latency communication between clients and the server.
  - The server will broadcast score and rank updates instantly upon receiving a vote.
- **Authentication & Join Flow:**
  - MVP Admin Auth: Hardcoded environment variable token.
  - User Join: Direct URL routing (e.g., `/game/{session_code}`) that auto-fills the room code, requiring only a nickname input.
- **Scoring:** Time-based scoring logic applied server-side. Fast correct answers yield more points.
- **Resilience:** The frontend will store a session token in `localStorage`. Upon WebSocket reconnection, it will transmit this token to reclaim the user's state.
- **Content:** Question banks are externalized as JSON files uploaded by the admin at session start, rather than relying on a complex pre-built database schema.

## Testing Decisions

- **External Behavior Focus:** Tests will focus on the public interfaces of modules (e.g., API endpoints, WebSocket event handlers) rather than internal implementation details.
- **Modules to Test:**
  - **Scoring Logic:** Unit tests to verify time-based point degradation and correct answer validation.
  - **Session Management:** Unit/Integration tests ensuring users can join, drop, and reconnect without state loss.
  - **WebSocket Broadcasting:** Integration tests verifying that a vote from User A correctly triggers a broadcast to User B and Admin.
- **Prior Art:** We will establish standard Pytest structures for the FastAPI backend and Jest/React Testing Library for the frontend components.

## Out of Scope

- User accounts, registration, or profiles for attendees.
- A built-in WYSIWYG editor for creating quizzes (relying on JSON upload for MVP).
- Horizontal scaling across multiple servers (single server MVP).
- Complex admin dashboards for historical data review (saving to DynamoDB is in scope, but a UI to view past games is not for MVP).
- Audio/Video streaming (this is a companion app to a webinar, not a replacement).

## Further Notes

- The system must handle "bursty" traffic well, as 100+ users may vote within a 1-second window. In-memory state processing is critical to surviving this without DB throttling.
