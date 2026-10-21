# ChaiSutra — Agentic Commerce Platform

ChaiSutra is an AI-powered commerce application that enables conversational shopping and autonomous, budget-aware purchasing through integrated AI services and Razorpay test-mode payments.

The platform combines a React storefront, a FastAPI-based AI service, and a Node.js backend to support product discovery, cart optimization, agent-driven purchasing, and server-side payment authorization.

## Core Features

- **Conversational Shopping:** Browse the tea catalog, discover products, and manage purchases through a natural-language chat interface.
- **Structured Product API:** Exposes product information through machine-readable endpoints, enabling AI clients to retrieve and evaluate products programmatically.
- **Autonomous Purchasing Agent:** Implements an AI buyer (`ai-buyer.py`) that searches the catalog, evaluates product options, and initiates purchases within a configured spending budget.
- **Context-Aware Recommendations:** Suggests complementary products and relevant upgrades based on cart contents to support cross-selling and upselling.
- **Server-Side Budget Enforcement:** Validates order totals against authorized spending limits before allowing payment processing to proceed.
- **Decision Audit Logging:** Records agent activities, including product searches, selections, purchase attempts, and blocked transactions, with timestamps and decision context.
- **Failure Handling:** Rejects purchases that exceed authorized limits and provides actionable feedback, allowing users to modify their cart and retry.

## System Architecture

```text
┌──────────────────────────────────┐
│          React Frontend          │
│ Chat · Catalog · Cart · Checkout │
│          Agent Dashboard         │
└────────────────┬─────────────────┘
                 │ HTTP / REST APIs
                 ▼
┌──────────────────────────────────┐
│         FastAPI AI Service       │
│ Product Discovery · Chat Logic   │
│ Buyer Agent APIs · Recommendations│
└────────────────┬─────────────────┘
                 │ HTTP / REST APIs
                 ▼
┌──────────────────────────────────┐
│        Node.js / Express         │
│ Order Creation · Budget Checks   │
│       Razorpay Integration       │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│        Razorpay Test Mode        │
│        Payment Order Flow        │
└──────────────────────────────────┘
```

## Project Structure

- **`frontend/`** — React-based shopping interface with conversational checkout, product browsing, cart management, and an AI agent dashboard.
- **`ai-server/`** — Python/FastAPI service responsible for conversational interactions, product discovery, AI-to-AI commerce endpoints, and recommendation logic.
- **`backend/`** — Node.js/Express service responsible for order creation, Razorpay integration, and server-side spending-limit enforcement.

## Transaction Safety and Auditability

ChaiSutra implements a server-enforced authorization boundary for agent-initiated purchases.

Before a payment can proceed, the backend validates the order amount against the configured spending limit. This check does not depend on frontend validation, preventing a modified client interface from bypassing the budget restriction.

When a purchase exceeds the authorized limit, the system:

- Blocks the payment flow before initiating the corresponding payment transaction.
- Reports the order total, configured limit, and excess amount.
- Records the blocked attempt for audit and debugging.
- Allows the customer to adjust the cart and submit a new purchase request.

This design keeps autonomous purchasing within explicit spending constraints while maintaining visibility into agent decisions and transaction outcomes.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| AI Service | Python, FastAPI |
| Backend | Node.js, Express |
| Payment Integration | Razorpay Test Mode |
| API Communication | HTTP / REST |

## Local Development

### Prerequisites

- Node.js and npm
- Python 3
- Razorpay test-mode API credentials

### 1. Start the AI Service

```bash
cd ai-server
pip install -r requirements.txt
python main.py
```

Runs on `http://localhost:8000`.

### 2. Start the Backend

```bash
cd backend
npm install
npm start
```

Runs on `http://localhost:5000`.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`.

### Environment Configuration

Create `.env` files in `ai-server/` and `backend/` and configure the required environment variables.

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Use Razorpay test-mode credentials and never commit secret keys to version control.
