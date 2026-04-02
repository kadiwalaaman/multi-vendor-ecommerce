from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.routers.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

# Platform stats
@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    total_users = db.query(User).count()
    total_sellers = db.query(User).filter(User.role == "seller").count()
    total_buyers = db.query(User).filter(User.role == "buyer").count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(
        func.sum(Order.total_amount)
    ).scalar() or 0

    return {
        "total_users": total_users,
        "total_sellers": total_sellers,
        "total_buyers": total_buyers,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2)
    }

# Get all users
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

# Ban or activate a user
@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    status = "activated" if is_active else "banned"
    return {"message": f"User {user.name} has been {status}"}

# Change user role
@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    if role not in ["buyer", "seller", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"message": f"User {user.name} role updated to {role}"}

# Get all orders
@router.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    orders = db.query(Order).all()
    return [
        {
            "id": o.id,
            "buyer_id": o.buyer_id,
            "total_amount": o.total_amount,
            "status": o.status,
            "created_at": o.created_at
        }
        for o in orders
    ]

# Get all products
@router.get("/products")
def get_all_products(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    return db.query(Product).all()

# Delete any product
@router.delete("/products/{product_id}")
def admin_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted by admin"}