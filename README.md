# ChaiSutra — AI Agentic Commerce Demo

Built for **Razorpay AI Buildathon — Track 1: AI Growth & Agentic Commerce**

ChaiSutra is a tea shop demo showing how AI agents can shop, negotiate budgets, and transact autonomously — with every money action bounded, gated, and auditable.

## What it does

- **Conversational checkout** — customers chat naturally to browse and buy tea
- **Agent-readable catalog** — structured API so other AI agents can query products without parsing chat
- **AI-to-AI commerce** — an autonomous buyer agent (`ai-buyer.py`) searches, selects, and purchases within a budget, with no human in the loop
- **Upsell & cross-sell** — contextual product suggestions based on what's in the cart
- **Bounded & gated payments** — every order is checked against a spending limit server-side, before any payment can complete
- **Audit trail** — every agent decision (search, selection, purchase, block) is logged with reasoning and timestamp
- **Graceful failure handling** — if an order exceeds the allowed budget, payment is blocked with a clear reason — no money moves, and the user can retry or clear the cart

## Architecture
Frontend (React) ──────► AI Server (FastAPI) ──────► Backend (Node/Express)

Chat UI - Product catalog - Razorpay order creation
AI Agent UI - Chat logic - Budget validation
Cart/Checkout - AI-to-AI endpoints - Payment gating
- Upsell logic

  
- **`frontend/`** — React app (chat, AI agent dashboard, cart, checkout)
- **`ai-server/`** — FastAPI service: product catalog, chat, AI-to-AI endpoints, upsell logic
- **`backend/`** — Express service: Razorpay integration, order creation, budget enforcement

## Safety & governance

Every purchase attempt is checked against a maximum budget **at the server level**, independent of the frontend. If an order exceeds the limit:
- The payment is blocked before any charge is created
- The reason and amounts (total, max allowed, exceeded by) are shown
- The user can retry with a smaller cart or clear it

This ensures the AI agent can never move money outside its authorized bounds.

## Tech stack

React · FastAPI (Python) · Express (Node.js) · Razorpay (test mode)

## Running locally

```bash
# AI Server
cd ai-server
pip install -r requirements.txt
python main.py          # runs on :8000

# Backend
cd backend
npm install
npm start                # runs on :5000

# Frontend
cd frontend
npm install
npm start                 # runs on :3000
```

Add a `.env` file in `ai-server/` and `backend/` with your Razorpay test-mode keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).

## Demo video

Submitted separately as part of the application form.

## Track & problem statement

**Track 1: AI Growth & Agentic Commerce** — build an agent that grows merchant revenue or makes a merchant transactable by an AI buyer, end to end, on Razorpay test-mode APIs.
