from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderResponse, PaymentCreate
from app.routers.deps import get_current_user
import stripe
import os

router = APIRouter(prefix="/orders", tags=["Orders"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Create order
@router.post("/", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total = 0
    order_items = []

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.title}")
        total += product.price * item.quantity
        order_items.append({"product": product, "quantity": item.quantity, "price": product.price})

    # Create order
    new_order = Order(buyer_id=current_user.id, total_amount=total)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Create order items and reduce stock
    for item in order_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price=item["price"]
        )
        db.add(order_item)
        item["product"].stock -= item["quantity"]

    db.commit()
    db.refresh(new_order)
    return new_order

# Get my orders (buyer)
@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Order).filter(Order.buyer_id == current_user.id).all()

# Get single order
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return order

# Create Stripe payment
@router.post("/pay")
def pay_order(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    if order.status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")

    # Create Stripe payment intent
    intent = stripe.PaymentIntent.create(
        amount=int(order.total_amount * 100),  # Stripe uses cents
        currency="inr",
        metadata={"order_id": order.id}
    )

    order.stripe_payment_id = intent["id"]
    db.commit()

    return {
        "client_secret": intent["client_secret"],
        "order_id": order.id,
        "amount": order.total_amount
    }

# Update order status (seller)
@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"message": f"Order status updated to {status}"}