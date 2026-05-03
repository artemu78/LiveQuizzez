# Ubiquitous Language

This document defines the core domain terms used in the Quiz App. Use these terms consistently in code, tests, and discussions.

- **Session**: A single instance of a live game. It has a unique join code, a creation timestamp, tracks when each question is revealed, and stores final results.
- **Admin**: The host of the Session. Responsible for starting the game, uploading the Question Bank, advancing Questions, and ending the Session.
- **User** (also referred to as **Attendee** or **Player**): A person who joins the Session to play. Identified only by a Nickname.
- **Nickname**: The chosen display name for a User. No permanent account is required.
- **Question Bank**: The collection of Questions and their correct answers, provided by the Admin as a JSON file at the start of a Session.
- **Question**: A single trivia item with multiple choices.
- **Vote**: A User's submitted choice for the current Question.
- **Score**: Points awarded for a correct Vote. Calculated dynamically based on how quickly the User answered after the Question was revealed (time-based scoring).
- **Reconnect Token**: A unique string stored in a User's browser `localStorage`. Used to silently re-identify the User if their WebSocket connection drops and reconnects.
- **Leaderboard**: The ranked list of Users by total Score, updated live after every Vote.
- **Final Result**: The persistent record of a Session saved to DynamoDB, containing the winner and timestamps.
