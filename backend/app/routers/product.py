from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db, cache_get, cache_set, cache_delete
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.routers.deps import get_current_user, get_current_seller

router = APIRouter(prefix="/products", tags=["Products"])

# Anyone can browse products
@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    cache_key = f"products:{skip}:{limit}:{category}:{search}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    query = db.query(Product).filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category == category)
    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))
    products = query.offset(skip).limit(limit).all()
    result = [ProductResponse.model_validate(p).model_dump() for p in products]
    cache_set(cache_key, result, expire=120)
    return products

# Get single product
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    cache_key = f"product:{product_id}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cache_set(cache_key, ProductResponse.model_validate(product).model_dump(), expire=120)
    return product

# Only sellers can create products
@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    new_product = Product(**product.model_dump(), seller_id=current_user.id)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    cache_delete("products:*")
    return new_product

# Only the seller who owns the product can update it
@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your product")
    for key, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    cache_delete(f"product:{product_id}")
    return product

# Only the seller who owns the product can delete it
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your product")
    db.delete(product)
    db.commit()
    cache_delete(f"product:{product_id}")
    return {"message": "Product deleted successfully"}