from pydantic import BaseModel, EmailStr

class AdminSignup(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str