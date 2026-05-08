import logging
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import auth
import logic
import store
from models import (
    LoginRequest,
    MessageResponse,
    ProtectedResponse,
    RegisterRequest,
    TokenResponse,
    CreateTodoRequest,
    UpdateTodoRequest,
    TodoResponse,
)
import uuid

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler("app.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("todo-app")

app = FastAPI(
    title="Todo App API",
    version="1.0.0",
    description="Full-stack To-Do application backend — Prism Pattern architecture.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Absorb  → Extract token from Authorization header.
    Refract → Decode and validate the JWT (pure check).
    Emit    → Return username or raise 401.
    """
    # ABSORB
    token = credentials.credentials

    # REFRACT
    username = auth.decode_access_token(token)

    # EMIT
    if username is None:
        logger.warning("Rejected request: invalid or expired token")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if not store.user_exists(username):
        logger.warning("Rejected request: token references non-existent user '%s'", username)
        raise HTTPException(status_code=401, detail="User no longer exists")

    return username

@app.post("/register", response_model=MessageResponse, status_code=201)
async def register(request: RegisterRequest):
    username = request.username
    already_exists = store.user_exists(username)

    result = logic.evaluate_registration(
        user_exists=already_exists,
        password=request.password,
    )
    if not result.success:
        logger.info("Registration rejected for '%s': %s", username, result.error)
        raise HTTPException(status_code=409, detail=result.error)

    store.save_user(username, result.hashed_password)
    logger.info("User registered: %s", username)
    return MessageResponse(message="User registered successfully")

@app.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    username = request.username
    user = store.get_user(username)
    stored_hash = user["hashed_password"] if user else None
    result = logic.evaluate_login(
        stored_hash=stored_hash,
        plain_password=request.password,
    )
    if not result.success:
        logger.info("Login failed for '%s': %s", username, result.error)
        raise HTTPException(status_code=401, detail=result.error)
    access_token = auth.create_access_token(subject=username)
    logger.info("User logged in: %s", username)
    return TokenResponse(access_token=access_token)

@app.get("/protected", response_model=ProtectedResponse)
async def protected_route(current_user: str = Depends(get_current_user)):
    username = current_user
    message = f"Welcome, {username}! You have access to the protected route."

    logger.info("Protected route accessed by: %s", username)
    return ProtectedResponse(message=message, logged_in_as=username)


@app.get("/todos", response_model=list[TodoResponse])
async def get_todos(current_user: str = Depends(get_current_user)):
    todos = store.get_todos_for_user(current_user)
    return todos

@app.post("/todos", response_model=TodoResponse, status_code=201)
async def create_todo(request: CreateTodoRequest, current_user: str = Depends(get_current_user)):
    todo_id = str(uuid.uuid4())
    todo = {
        "id": todo_id,
        "title": request.title,
        "description": request.description,
        "completed": False,
        "owner": current_user
    }
    store.save_todo(current_user, todo)
    return todo

@app.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: str, request: UpdateTodoRequest, current_user: str = Depends(get_current_user)):
    updates = request.model_dump(exclude_unset=True)
    updated = store.update_todo(current_user, todo_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated

@app.delete("/todos/{todo_id}", status_code=204)
async def delete_todo(todo_id: str, current_user: str = Depends(get_current_user)):
    deleted = store.delete_todo(current_user, todo_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Todo not found")
    return None
