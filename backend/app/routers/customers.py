from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerResponse, CustomerUpdate
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.get("/me", response_model=CustomerResponse)
async def get_my_profile(current_user: Customer = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=CustomerResponse)
async def update_my_profile(
    update_data: CustomerUpdate, 
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if update_data.name is not None:
        current_user.name = update_data.name
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    if update_data.address is not None:
        current_user.address = update_data.address
        
    await db.commit()
    await db.refresh(current_user)
    return current_user
