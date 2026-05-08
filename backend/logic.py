from dataclasses import dataclass
from typing import Optional

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@dataclass(frozen=True)
class RegistrationResult:
    #Immutable result of registration logic
    success: bool
    hashed_password: str = ""
    error: str = ""


@dataclass(frozen=True)
class AuthenticationResult:
    #Immutable result of login logic
    success: bool
    error: str = ""

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def evaluate_registration(user_exists: bool, password: str) -> RegistrationResult:
    if user_exists:
        return RegistrationResult(success=False, error="Username already taken")

    hashed = hash_password(password)
    return RegistrationResult(success=True, hashed_password=hashed)


def evaluate_login(
    stored_hash: Optional[str],
    plain_password: str,
) -> AuthenticationResult:
    if stored_hash is None:
        return AuthenticationResult(success=False, error="Invalid credentials")

    if not verify_password(plain_password, stored_hash):
        return AuthenticationResult(success=False, error="Invalid credentials")

    return AuthenticationResult(success=True)
