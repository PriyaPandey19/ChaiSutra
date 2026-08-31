const express = require('express');
//const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.log('MongoDB Error:', err));

//Razorpay Setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

//Test Route
app.get('/', (req, res) => {
    res.json({ message: 'ChaiSutra API is running!' });
});

//Razor pay key
app.get('/api/razorpay-key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
})

//create order endpoint
// backend/server.js
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, max_budget } = req.body;


        if (max_budget && amount > max_budget) {
            console.log(`BUDGET EXCEEDED! Amount: ₹${amount}, Max: ₹${max_budget}`);
            return res.status(400).json({
                success: false,
                blocked: true,
                error: `Budget exceeded! ₹${amount} > ₹${max_budget}`,
                max_budget: max_budget,
                attempted_amount: amount
            });
        }

        // If no max_budget provided, use a default or allow
        // For security, always require max_budget
        if (!max_budget) {
            return res.status(400).json({
                success: false,
                blocked: true,
                error: "max_budget is required for security"
            });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `order_${Date.now()}`
        });

        console.log(`Order created: ${order.id} (₹${amount} <= ₹${max_budget})`);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID,
            max_budget: max_budget,
            remaining: max_budget - amount
        });

    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Razorpay key: ${process.env.RAZORPAY_KEY_ID}`);
})