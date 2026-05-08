# To-Do App

A fast, and secure full-stack To-Do application built with a Python FastAPI backend and a React/TypeScript frontend.

## Features

- **User Authentication:** Secure sign-up and login using JWTs.
- **Task Management:** Create, view, update, and delete your daily tasks.
- **Professional UI:** A responsive, modern dark theme with glassmorphism effects.

## How to Run

You will need two terminal windows to run the frontend and backend simultaneously.

### 1. Start the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser to start organizing your tasks!

## Project Overview

- **/backend**: Handles authentication, pure business logic, and local JSON data persistence.
- **/frontend**: Handles the user interface, routing, and API communication using custom hooks and strict TypeScript types.
