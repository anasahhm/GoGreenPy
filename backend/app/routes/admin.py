from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.auth.dependencies import get_current_admin
from app.database import get_database
from bson import ObjectId
from typing import List

router = APIRouter()

@router.get("/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin)
):
    db = await get_database()
    
    total = await db.users.count_documents({})
    skip = (page - 1) * page_size
    
    cursor = db.users.find({}, {"password": 0}) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(page_size)
    
    users = await cursor.to_list(length=page_size)
    
    data = [
        {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "created_at": user["created_at"]
        }
        for user in users
    ]
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": data
    }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    db = await get_database()
    
    # Prevent admin from deleting themselves
    if user_id == current_admin["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete user's impact logs
    await db.impact_logs.delete_many({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

@router.get("/logs")
async def get_all_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin)
):
    db = await get_database()
    
    total = await db.impact_logs.count_documents({})
    skip = (page - 1) * page_size
    
    cursor = db.impact_logs.find({}) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(page_size)
    
    logs = await cursor.to_list(length=page_size)
    
    # Fetch user info for each log
    data = []
    for log in logs:
        user = await db.users.find_one({"_id": ObjectId(log["user_id"])})
        data.append({
            "id": str(log["_id"]),
            "user_email": user["email"] if user else "Unknown",
            "user_name": user["full_name"] if user else "Unknown",
            "carbon_score": log["carbon_score"],
            "water_score": log["water_score"],
            "energy_score": log["energy_score"],
            "waste_score": log["waste_score"],
            "overall_rating": log["overall_rating"],
            "created_at": log["created_at"]
        })
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": data
    }