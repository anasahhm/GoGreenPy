from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse