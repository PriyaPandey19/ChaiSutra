import requests
import time
import json
from typing import List, Dict, Optional

class AIBuyer:
    """ AI Buyer Agent that shops autonomously"""

    def __init__(self, name="AI Shopper Bot", budget=1000):
        self.name = name
        self.budget = budget
        self.cart = []
        self.total_spent = 0
        self.orders = []

    def search(self, query: str, max_price: Optional[int] = None) -> List[Dict]:
        """ Search for products"""
        print(f"\n {self.name}: Searching for '{query}'...")

        payload = {
            "agent_id": "buyer-bot-001",
            "intent": "search",
            "query": query,
            "max_price": max_price,
            "preferences": {}
        }

        try:
            response = requests.post(
                'http://localhost:8000/api/ai-agent/search',
                json=payload,
                timeout=10
            )

            if response is None:
                print(" No response from AI server")
                return []

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    products = data.get('products', [])
                    print(f"Found {len(products)} products:")
                    for p in products:
                        print(f"      - {p['name']} (₹{p['price']})")
                    return products
                else:
                    print(f"Search failed: {data.get('message', 'Unknown error')}")
            else:
                print(f"HTTP Error: {response.status_code}")
                print(f"   Response: {response.text}")

        except requests.exceptions.ConnectionError:
            print("Cannot connect to AI server. Is it running on port 8000?")
        except Exception as e:
            print(f"Error: {e}")

        return []

    def buy(self, product_id: str, quantity: int = 1) -> Optional[Dict]:
        """Buy a product"""
        print(f"\n{self.name}: Buying product {product_id} x{quantity}...")

        payload = {
            "agent_id": "buyer-bot-001",
            "intent": "buy",
            "product_id": product_id,
            "quantity": quantity
        }

        try:
            response = requests.post(
                'http://localhost:8000/api/ai-agent/buy',
                json=payload,
                timeout=10
            )

            if response is None:
                print(" No response from AI server")
                return None

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"Purchase successful!")
                    print(f"Order ID: {data.get('order_id')}")
                    print(f"Message: {data.get('message')}")

                    self.orders.append({
                        'order_id': data.get('order_id'),
                        'product_id': product_id,
                        'quantity': quantity,
                        'status': 'completed'
                    })

                    return data
                else:
                    print(f"Purchase failed: {data.get('message', 'Unknown error')}")
            else:
                print(f"HTTP Error: {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("Cannot connect to AI server. Is it running on port 8000?")
        except Exception as e:
            print(f" Error: {e}")

        return None

    def get_all_products(self) -> List[Dict]:
        """ Get all available products"""
        print(f"\n {self.name}: Fetching all products...")

        try:
            response = requests.get(
                'http://localhost:8000/api/ai-agent/products',
                timeout=10
            )

            if response is None:
                print(" No response from AI server")
                return []

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    products = data.get('products', [])
                    print(f"Total products: {len(products)}")
                    return products
                else:
                    print(f"Failed to get products: {data.get('message')}")
            else:
                print(f"HTTP Error: {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("Cannot connect to AI server. Is it running on port 8000?")
        except Exception as e:
            print(f"Error: {e}")

        return []

    def shop_autonomously(self):
        """ AI Agent autonomously shops"""
        print("\n" + "="*60)
        print(f"{self.name}: Starting autonomous shopping session!")
        print(f" Budget: ₹{self.budget}")
        print("="*60)

        # Step 1: Get all products
        all_products = self.get_all_products()
        if not all_products:
            print(" No products available! Exiting...")
            return

        # Step 2: Search for specific items
        print("\n" + "="*60)
        print(" PHASE 1: Searching for products...")
        print("="*60)

        spicy_products = self.search("spicy", max_price=500)
        time.sleep(1)

        winter_products = self.search("winter")
        time.sleep(1)

        # Step 3: Make purchase decisions
        print("\n" + "="*60)
        print("PHASE 2: Making purchase decisions...")
        print("="*60)

        # Decision 1: Buy spicy tea if available and within budget
        if spicy_products:
            product = spicy_products[0]
            if product['price'] <= self.budget:
                result = self.buy(product['id'], quantity=1)
                if result and result.get('success'):
                    self.total_spent += product['price']
                    self.budget -= product['price']

        time.sleep(2)

        # Decision 2: Buy winter tea if available and within budget
        if winter_products and self.budget >= 300:
            product = winter_products[0]
            if product['price'] <= self.budget:
                result = self.buy(product['id'], quantity=1)
                if result and result.get('success'):
                    self.total_spent += product['price']
                    self.budget -= product['price']

        # Step 4: Summary
        print("\n" + "="*60)
        print("PHASE 3: Shopping Summary")
        print("="*60)
        print(f"{self.name}: Shopping session complete!")
        print(f"Total spent: ₹{self.total_spent}")
        print(f"Remaining budget: ₹{self.budget}")
        print(f" Items purchased: {len(self.orders)}")
        print("="*60)


# ============================================
#  RUN THE AI BUYER (MUST BE AT THE BOTTOM!)
# ============================================
if __name__ == "__main__":
    print("""
    Autonomous Shopping Simuation
    """)

    # Create AI Buyer
    buyer = AIBuyer(name="ChaiBot Pro", budget=1000)

    # Start autonomous shopping
    buyer.shop_autonomously()

    print("\n AI Buyer session completed!")
    print("Tip: Run this script again to simulate another shopping session!")