from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.routers.deps import get_current_seller

router = APIRouter(prefix="/seller", tags=["Seller Dashboard"])

# Seller stats overview
@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    # Total products
    total_products = db.query(Product).filter(
        Product.seller_id == current_user.id
    ).count()

    # Total orders containing seller's products
    total_orders = db.query(OrderItem).join(Product).filter(
        Product.seller_id == current_user.id
    ).count()

    # Total earnings
    total_earnings = db.query(
        func.sum(OrderItem.price * OrderItem.quantity)
    ).join(Product).filter(
        Product.seller_id == current_user.id
    ).scalar() or 0

    # Low stock products (less than 5)
    low_stock = db.query(Product).filter(
        Product.seller_id == current_user.id,
        Product.stock < 5
    ).all()

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_earnings": round(total_earnings, 2),
        "low_stock_products": [
            {"id": p.id, "title": p.title, "stock": p.stock}
            for p in low_stock
        ]
    }

# Get all seller's products
@router.get("/products")
def get_seller_products(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    products = db.query(Product).filter(
        Product.seller_id == current_user.id
    ).all()
    return products

# Get all orders for seller's products
@router.get("/orders")
def get_seller_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    order_items = db.query(OrderItem).join(Product).filter(
        Product.seller_id == current_user.id
    ).all()

    return [
        {
            "order_item_id": item.id,
            "order_id": item.order_id,
            "product": item.product.title,
            "quantity": item.quantity,
            "price": item.price,
            "total": item.price * item.quantity,
            "order_status": item.order.status
        }
        for item in order_items
    ]