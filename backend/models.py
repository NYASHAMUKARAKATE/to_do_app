from pydantic import BaseModel, Field

class RegisterRequest(BaseModel):
    #Registration payload. Validated on arrival, rejected if malformed.
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="Alphanumeric username, 3–50 characters",
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Password, 6–128 characters",
    )
    model_config = {"frozen": True}

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

    model_config = {"frozen": True}

class TokenResponse(BaseModel):
    #Returned on successful authentication
    access_token: str
    token_type: str = "bearer"

class MessageResponse(BaseModel):
    message: str

class ProtectedResponse(BaseModel):
    message: str
    logged_in_as: str
