# Implementation Plan

## Phase 1: Project Setup and Scaffolding
- [x] Scaffold FastAPI backend (`backend/` directory).
- [x] Scaffold React frontend using Vite (`frontend/` directory).
- [x] Initialize Python environment and install dependencies (FastAPI, Uvicorn, WebSockets, Boto3, Pytest).
- [x] Initialize Node environment and install dependencies (React Router).

## Phase 2: Backend Core (FastAPI)
- [x] Define Pydantic models for Domain (Question, User, SessionState, Actions).
- [x] Implement in-memory State Manager (thread-safe operations for active sessions).
- [x] Implement Admin REST endpoints (`POST /api/sessions` with JSON upload).
- [x] Implement User join logic (generate token, initial state).
- [x] Implement WebSocket connection handler.
- [x] Implement Scoring Logic (time-based calculations).
- [x] Write unit tests for State Manager and Scoring Logic.

## Phase 3: Frontend Core (React)
- [x] Set up React Router (routes for `/admin`, `/game/:sessionCode`).
- [x] Implement WebSocket custom hook for state synchronization.
- [x] Build Admin Interface (JSON upload, control buttons, live stats).
- [x] Build User Interface:
  - Join Screen (Nickname input).
  - Waiting Screen (Waiting for next question).
  - Active Question Screen (Voting buttons, timer).
  - Result Screen (Correct answer, leaderboard).

## Phase 4: Integration and Persistence
- [x] Integrate AWS Boto3 for DynamoDB.
- [x] Implement session end logic in backend to flush data to DynamoDB.
- [x] Write AWS SAM template (`template.yaml`) defining EC2 instance profile, security groups, and DynamoDB table.

## Phase 5: Verification and Polish
- [x] Basic functionality verified via unit tests and code review.
- [x] Simple Vanilla CSS styling applied.
