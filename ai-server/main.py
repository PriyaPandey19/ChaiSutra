from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
import json
import requests

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Products
PRODUCTS = [
    # Tea Blends
    {"id": "CHAI-001", "name": "Masala Chai Kit", "price": 499, 
     "tags": ["spicy", "winter", "masala"], 
     "description": "Premium blend with cardamom, cinnamon, and ginger"},
    {"id": "CHAI-002", "name": "Kashmiri Kahwa", "price": 299, 
     "tags": ["saffron", "almond", "winter"], 
     "description": "Traditional Kashmiri tea with saffron and almonds"},
    {"id": "CHAI-003", "name": "English Breakfast", "price": 399, 
     "tags": ["strong", "morning", "classic"], 
     "description": "Classic English Breakfast tea for a perfect morning"},
    {"id": "CHAI-004", "name": "Earl Grey", "price": 349, 
     "tags": ["bergamot", "citrus", "elegant"], 
     "description": "Sophisticated black tea with natural bergamot oil"},
    {"id": "CHAI-005", "name": "Green Tea - Jasmine", "price": 299, 
     "tags": ["green", "jasmine", "floral", "healthy"], 
     "description": "Light green tea infused with delicate jasmine flowers"},
    {"id": "CHAI-006", "name": "Herbal Chamomile", "price": 249, 
     "tags": ["herbal", "chamomile", "calming", "caffeine-free"], 
     "description": "Soothing caffeine-free herbal tea for relaxation"},
    
    # Add-ons
    {"id": "ADD-001", "name": "Ginger Concentrate", "price": 199, 
     "tags": ["ginger", "add-on", "spicy"], 
     "description": "Fresh ginger concentrate to add to any tea"},
    {"id": "ADD-002", "name": "Organic Honey", "price": 149, 
     "tags": ["honey", "sweet", "add-on", "natural"], 
     "description": "Pure organic honey from Himalayan forests"},
    {"id": "ADD-003", "name": "Spice Blend", "price": 99, 
     "tags": ["spices", "add-on", "masala"], 
     "description": "Traditional masala spice blend for chai"},
    
    # Accessories
    {"id": "ACCESS-001", "name": "Wooden Infuser", "price": 349, 
     "tags": ["accessory", "infuser", "brewing", "gift"], 
     "description": "Handcrafted wooden tea infuser for loose leaf tea"},
    {"id": "ACCESS-002", "name": "Ceramic Tea Set", "price": 599, 
     "tags": ["accessory", "ceramic", "gift", "premium"], 
     "description": "Elegant handcrafted ceramic tea set with 4 cups"},
    {"id": "ACCESS-003", "name": "Travel Flask", "price": 249, 
     "tags": ["accessory", "travel", "flask", "insulated"], 
     "description": "Insulated travel flask to keep your tea hot"},
]

# AI to AI Communication Models
class AIBuyerRequest(BaseModel):
    agent_id: str
    intent: str
    query: Optional[str] = None
    product_id: Optional[str] = None
    quantity: Optional[int] = 1
    max_price: Optional[int] = None
    max_budget: Optional[int] = None
    preferences: Optional[dict] = {}

class AIBuyerResponse(BaseModel):
    success: bool
    products: Optional[List[dict]] = None
    order_id: Optional[str] = None
    payment_link: Optional[str] = None
    message: Optional[str] = None
    blocked: Optional[bool] = None
    max_budget: Optional[int] = None
    attempted_amount: Optional[int] = None
    remaaining: Optional[int] = None


# Human Chat Models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    products: list = []

def search_products(query):
    query = query.lower()
    matched = []
    for product in PRODUCTS:
        if (query in product["name"].lower() or 
            query in product["description"].lower() or
            any(query in tag.lower() for tag in product["tags"])):
            matched.append(product)
    if not matched:
        return PRODUCTS
    return matched



# HUMAN CHAT ENDPOINT


@app.post("/api/chat")
async def chat(request: ChatRequest):
    user_message = request.message.lower()
    products = search_products(user_message)
    
    if "spicy" in user_message or "masala" in user_message:
        reply = " I recommend **Masala Chai Kit** (₹499)! It has cardamom, cinnamon, and ginger for a perfect spicy kick!"
    elif "winter" in user_message or "kashmiri" in user_message:
        reply = " Try **Kashmiri Kahwa** (₹299)! Saffron and almonds make it perfect for winter!"
    elif "ginger" in user_message:
        reply = " **Ginger Concentrate** (₹199) adds a fresh, spicy flavor to any tea!"
    elif "breakfast" in user_message or "morning" in user_message:
        reply = " **English Breakfast** (₹399) - a classic strong tea for the perfect morning!"
    else:
        reply = " Welcome to ChaiSutra! We have Masala Chai Kit (₹499), Kashmiri Kahwa (₹299), English Breakfast (₹399), and Ginger Concentrate (₹199). And many more... What do u like?"
    
    return ChatResponse(
        reply=reply,
        products=products if products else PRODUCTS
    )



#  AI-TO-AI ENDPOINTS


# 1. AI Agent: Search Products
@app.post("/api/ai-agent/search")
async def ai_search(request: AIBuyerRequest):
    """AI agent searches for products"""
    print(f"\n AI Buyer ({request.agent_id}): Searching for '{request.query}'")

    # Search products
    products = search_products(request.query or "")

    # Filter by price
    if request.max_price:
        products = [p for p in products if p['price'] <= request.max_price]

    # Filter by preferences
    if request.preferences:
        if 'category' in request.preferences:
            products = [p for p in products if request.preferences['category'].lower() in ' '.join(p['tags'])]

    print(f"Found {len(products[:5])} products")
    

    return AIBuyerResponse(
        success=True,
        products=products[:5],
        message=f"Found {len(products[:5])} products matching '{request.query}'"
    )


# 2. AI Agent: Buy Product
@app.post("/api/ai-agent/buy")
async def ai_buy(request: AIBuyerRequest):
    """AI agent buys a product"""
    print(f"\n AI Buyer ({request.agent_id}): Buying product {request.product_id} x{request.quantity}")

    # Find product
    product = None
    for p in PRODUCTS:
        if p['id'] == request.product_id:
            product = p
            break

    if not product:
        return AIBuyerResponse(
            success=False,
            message=f"Product {request.product_id} not found"
        )

    # Check stock (simulated)
    if request.quantity > 10:
        return AIBuyerResponse(
            success=False,
            message=f"Only 10 units available for {product['name']}"
        )

    # Calculate total
    total = product['price'] * request.quantity

    if request.max_budget and total > request.max_budget:
        print(f" BUDGET EXCEEDED! {total} > {request.max_budget}")
        return AIBuyerResponse(
          success= False,
          blocked = True,
          message = f"Budget exceeded! {total} > {request.max_budget}",
          max_budget= request.max_budget,
          attempted_amount = total

        )

    if not request.max_budget:
         return AIBuyerResponse(
            success=False,
            blocked=True,
            message=" max_budget is required for security"
        )


    # Create Razorpay order via backend
    try:
        
        import requests
        order_response = requests.post(
            'http://localhost:5000/api/create-order',
            json={'amount': total,
            'max_budget': request.max_budget
            }
        )

        if order_response.status_code != 200:
            return AIBuyerResponse(
                success=False,
                message="Payment creation failed"
            )

        order_data = order_response.json()
        real_order_id = order_data['orderId']

        print(f"Order created! Order ID: {real_order_id}")

        return AIBuyerResponse(
            success=True,
            order_id=real_order_id,
            payment_link=f"https://checkout.razorpay.com/{real_order_id}",
            message=f"Order created for {product['name']} x{request.quantity}. Total: ₹{total}"
        )

    except Exception as e:
        print(f"Error: {e}")
        return AIBuyerResponse(
            success=False,
            message=f"Error creating order: {str(e)}"
        )


# 3. AI Agent: Get All Products
@app.get("/api/ai-agent/products")
async def ai_get_products():
    """AI Agent gets all products"""
    return {
        "success": True,
        "products": PRODUCTS,
        "count": len(PRODUCTS)
    }


# 4. AI Agent: Get Product by ID
@app.get("/api/ai-agent/product/{product_id}")
async def ai_get_product(product_id: str):
    """AI Agent gets a specific product"""
    for p in PRODUCTS:
        if p['id'] == product_id:
            return {"success": True, "product": p}
    
    return {"success": False, "message": f"Product {product_id} not found"}




@app.get("/")
async def root():
    return {
        "message": "ChaiSutra AI Server is running!",
        "endpoints": {
            "human_chat": "/api/chat",
            "ai_search": "/api/ai-agent/search",
            "ai_buy": "/api/ai-agent/buy",
            "ai_products": "/api/ai-agent/products",
            "ai_product": "/api/ai-agent/product/{id}"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)