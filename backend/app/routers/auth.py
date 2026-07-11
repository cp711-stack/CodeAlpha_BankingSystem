from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.customer import Customer
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, TokenData
from app.middleware.auth import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.schemas.customer import CustomerResponse
from app.services.banking_service import generate_customer_id
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(Customer).filter(Customer.email == request.email))
    if result.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")
        
    cust_id = await generate_customer_id(db)
    hashed_pass = hash_password(request.password)
    
    new_customer = Customer(
        id=cust_id,
        name=request.name,
        email=request.email,
        phone=request.phone,
        address=request.address,
        password_hash=hashed_pass,
        role="customer"
    )
    
    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)
    
    access_token = create_access_token({"sub": new_customer.id, "role": new_customer.role})
    refresh_token = create_refresh_token({"sub": new_customer.id, "role": new_customer.role})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        customer=new_customer # type: ignore
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer).filter(Customer.email == request.email))
    customer = result.scalars().first()
    
    if not customer or not verify_password(request.password, customer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not customer.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token({"sub": customer.id, "role": customer.role})
    refresh_token = create_refresh_token({"sub": customer.id, "role": customer.role})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        customer=customer # type: ignore
    )

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest):
    try:
        token_data = verify_token(request.refresh_token)
        access_token = create_access_token({"sub": token_data.customer_id, "role": token_data.role})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=request.refresh_token
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
