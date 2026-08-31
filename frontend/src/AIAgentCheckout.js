import React, { useState } from 'react';
import axios from 'axios';

const AIAgentCheckout = ({ onSuccess, onLog, logs, onClear, onAddToCart }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [orderDetails, setOrderDetails] = useState(null);
    const [blockedMessage, setBlockedMessage] = useState(null);


    const addLog = (message, type = 'info') => {
        if (onLog) {
            onLog(message, type);
        }
    };





    //load razorpay script
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    //open razorpay checkout
    const openRazorpayCheckout = async (orderId, amount) => {
        try {
            //load razorpay script
            const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

            if (!scriptLoaded) {
                alert('Failed to load Razorpay. Pleae try again.');
                return;
            }

            //get razorpay key from backend
            const response = await axios.get('http://localhost:5000/api/razorpay-key');
            const key = response.data.key;

            const options = {
                key: key,
                amount: amount * 100,
                currency: 'INR',
                name: 'ChaiSutra Tea Shop',
                description: `Order #${orderId}`,
                order_id: orderId,
                handler: function (response) {
                    alert(`Payment Successfull? Payment ID: ${response.razorpay_payment_id}\n Order ID: ${response.razorpay_order_id}`);
                    setLoading(false);
                },
                prefill: {
                    name: 'Chai Lover',
                    email: 'customer@chaisutra.com',
                    contact: '9848383938'
                },
                theme: {
                    color: '#F37254'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Razorpay error:', error);
            alert('Failed to open payment. Please try again.');
        }

    }


    //handle PAy now

    // const handlePayNow = async () => {
    //     if (!orderDetails || !orderDetails.order_id) {
    //         alert('No order found to pay for.');
    //         return;
    //     }

    //     const MAX_BUDGET = 1000;
    //     const total = orderDetails.products?.reduce((sum, p) => sum + p.price, 0) || orderDetails.total;

    //     addLog(`🔍 Checking payment: ₹${total} vs max budget ₹${MAX_BUDGET}`, 'info');


    //     if (total > MAX_BUDGET) {
    //         addLog(`PAYMENT BLOCKED by Money Gate!`, 'error');
    //         addLog(`Reason: Total ₹${total} exceeds maximum limit of ₹${MAX_BUDGET}`, 'error');
    //         addLog(`Maximum Limit: ₹${MAX_BUDGET}`, 'info');
    //         addLog(`Attempted: ₹${total}`, 'error');
    //         addLog(`Difference: ₹${total - MAX_BUDGET} over limit`, 'error');
    //         addLog(`No money moved - user protected!`, 'success');
    //         addLog(`Try with lower budget or fewer products`, 'info');


    //         alert(`Payment Blocked!\n\nTotal: ₹${total}\nMaximum Allowed: ₹${MAX_BUDGET}\n\nBudget exceeded by ₹${total - MAX_BUDGET}!\nPlease reduce your cart total.`);
    //         return;
    //     }


    //     addLog(`Budget check passed: ₹${total} <= ₹${MAX_BUDGET}`, 'success');
    //     addLog(`Opening payment gateway...`, 'info');

    //     await openRazorpayCheckout(
    //         orderDetails.order_id,
    //         total
    //     );
    // };

    const handlePayNow = async () => {
        if (!orderDetails || !orderDetails.order_id) {
            alert('No order found to pay for.');
            return;
        }

        const MAX_BUDGET = 1000;
        const total = orderDetails.products?.reduce((sum, p) => sum + p.price, 0) || orderDetails.total;
        addLog(`Checking payment: ${total} vs max budget ${MAX_BUDGET}`, 'info');

        if (total > MAX_BUDGET) {
            const diffrence = total - MAX_BUDGET;
            addLog(`Payment BLOCKED by MOney Gate!`, 'error');
            addLog(`Reaso: Total ${total} exceeds maximum limit of ${MAX_BUDGET}`, 'error');

            addLog(`Maximum Limit: ${MAX_BUDGET}`, 'info');
            addLog(`Attempted: ${total}`, 'error');
            addLog(`Diffrence: ${diffrence} over limit`, 'error');
            addLog(`No money moved - user protected!`, 'success');

            setBlockedMessage({
                total: total,
                maxBudget: MAX_BUDGET,
                diffrence: diffrence
            });
            return;
        }
        addLog(`Budget check passed: ₹${total} <= ₹${MAX_BUDGET}`, 'success');
        addLog(`Opening payment gateway...`, 'info');
        setBlockedMessage(null);
        await openRazorpayCheckout(orderDetails.order_id, total);
    }







    //AI Agent maximizes cart value within budget
    const maximizeCart = (products, budget) => {
        //sort by prices
        const sorted = [...products].sort((a, b) => a.price - b.price);

        let selected = [];
        let total = 0;
        let remaining = budget;

        //first pass: Try to add as many items as possible
        for (const product of sorted) {
            if (product.price <= remaining) {
                selected.push(product);
                total += product.price;
                remaining -= product.price;
            }
        }

        //try TO  Get Closer tO budGET
        let bestSelected = selected;
        let bestTotal = total;
        let bestRemaining = remaining;

        //try removing a checp item adn adding more expensivvvvvve one
        for (let i = 0; i < selected.length; i++) {
            for (const product of products) {
                if (!selected.includes(product)) {
                    const newTotal = total - selected[i].price + product.price;
                    if (newTotal <= budget && newTotal > bestTotal) {
                        bestTotal = newTotal;
                        bestSelected = [...selected];
                        bestSelected[i] = product;
                        bestRemaining = budget - bestTotal;
                    }
                }
            }
        }

        //Add one more item if possible
        for (const product of products) {
            if (!bestSelected.includes(product) && product.price <= bestRemaining) {
                bestSelected.push(product);
                bestTotal += product.price;
                bestRemaining -= product.price;
            }
        }

        return {
            products: bestSelected,
            total: bestTotal,
            remaining: bestRemaining,
            count: bestSelected.length
        };

    };






    // AI Agent searches and buys autonomously
    const handleAIAgentPurchase = async () => {
        if (!amount || amount < 100) {
            alert('Please enter an amount (min ₹100)');
            return;
        }

        const budget = parseInt(amount);

        //  REMOVED the MAX_BUDGET check - allow products to be added

        setLoading(true);
        setSelectedProducts([]);
        setOrderDetails(null);

        addLog(`Budget set to ₹${budget}`, 'info');
        addLog('AI Agent: Searching for best products...', 'info');
        addLog(`Goal: Maximize cart value within ₹${budget}`, 'info');

        try {
            const searchResponse = await axios.post('http://localhost:8000/api/ai-agent/search', {
                agent_id: 'ui-agent-001',
                intent: 'search',
                query: 'tea',
                max_price: budget
            });

            if (!searchResponse.data.success) {
                throw new Error('Search failed');
            }

            const allProducts = searchResponse.data.products;
            if (allProducts.length === 0) {
                addLog('No products found within your budget', 'error');
                setLoading(false);
                return;
            }

            addLog(`Found ${allProducts.length} products:`, 'info');
            allProducts.forEach(p => {
                addLog(`- ${p.name} (₹${p.price})`, 'info');
            });

            const result = maximizeCart(allProducts, budget);

            if (result.count === 0) {
                addLog(' No product fits within your budget', 'error');
                setLoading(false);
                return;
            }

            setSelectedProducts(result.products);

            addLog(` AI Agent selected ${result.count} products:`, 'action');
            result.products.forEach(p => {
                addLog(`   - ${p.name} (₹${p.price})`, 'info');
            });
            addLog(`Total: ₹${result.total} | Remaining: ₹${result.remaining}`, 'success');

            let totalAmount = 0;
            for (const product of result.products) {
                if (onAddToCart) {
                    onAddToCart(product);
                    addLog(`Added ${product.name} to cart!`, 'success');
                }
                totalAmount += product.price;
            }


            const orderResponse = await axios.post('http://localhost:5000/api/create-order', {
                amount: totalAmount,
                max_budget: budget
            });

            if (orderResponse.data.blocked) {
                throw new Error(orderResponse.data.error || 'Budget exceeded');
            }

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.error || 'Order creation failed');
            }

            const orderData = orderResponse.data;

            setOrderDetails({
                order_id: orderData.orderId,
                products: result.products,
                total: totalAmount,
                remaining: orderData.remaining || result.remaining,
                message: `Order created for ${result.count} items. Total: ₹${totalAmount}`
            });

            addLog(`Order created! Order ID: ${orderData.orderId}`, 'success');
            addLog(`${result.count} items purchased for ₹${totalAmount}`, 'success');
            addLog(`Remaining budget: ₹${orderData.remaining || result.remaining}`, 'info');
            addLog(`Click "Pay Now" to complete payment`, 'info');
            setLoading(false);

            if (onSuccess) {
                onSuccess(orderData);
            }

        } catch (error) {
            console.error("AI Agent error: ", error);

            if (error.response && error.response.data && error.response.data.blocked) {
                addLog(`TRANSACTION BLOCKED by Money Gate!`, 'error');
                addLog(`Reason: ${error.response.data.error}`, 'error');
                addLog(`Budget: ₹${error.response.data.max_budget}`, 'info');
                addLog(`Attempted: ₹${error.response.data.attempted_amount}`, 'error');
                addLog(`No money moved - user protected!`, 'success');
                addLog(`Try with higher budget or fewer products`, 'info');
            } else if (error.response && error.response.data && error.response.data.error) {
                addLog(`${error.response.data.error}`, 'error');
            } else {
                addLog(` Error: ${error.message}`, 'error');
            }
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px'
        }}>
            <div style={{
                background: '#f9f6f0',
                borderRadius: '10px',
                padding: '20px',
                border: '2px solid #4a3520'
            }}>
                <h2>AI Agent</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>
                    Enter your budget, and the AI Agent will autonomously find, select, and purchase the best tea for you!
                </p>

                {/* input selection */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    margin: '20px 0',
                    flexWrap: 'wrap'
                }}>
                    <label style={{ fontWeight: 'bold' }}> Budget:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder='e.g, 500'
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            flex: '1',
                            fontSize: '16px',
                            minWidth: '150px'
                        }}
                        disabled={loading}
                        onKeyPress={(e) => e.key === 'Enter' && handleAIAgentPurchase()}
                    />
                    <button
                        onClick={handleAIAgentPurchase}
                        disabled={loading}
                        style={{
                            padding: '10px 30px',
                            background: '#4a3520',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Thinking.....' : 'Let AI Shop'}
                    </button>

                </div>

                {/* Logs container */}
                <div style={{
                    background: '#2d2d2d',
                    borderRadius: '8px',
                    padding: '15px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    marginBottom: '15px'
                }}>
                    {logs && logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div key={index} style={{
                                color: log.type === 'success' ? '#4caf50' :
                                    log.type === 'error' ? '#f44336' :
                                        log.type === 'action' ? '#ff9800' : '#e0e0e0',
                                padding: '2px 0',
                                borderBottom: '1px solid #444',
                                whiteSpace: 'pre-wrap'
                            }}>
                                <span style={{ color: '#666', fontSize: '11px' }}>[{log.timestamp}]</span>{log.message}
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                            AI Agent is waiting for your command...
                            <br />
                            <span style={{ fontSize: '12px' }}>Enter a budget and click "Let AI Shop"</span>
                        </div>
                    )}

                </div>
                {/* selected product */}
                {selectedProducts.length > 0 && (
                    <div style={{
                        padding: '15px',
                        border: '2px solid #ff9800',
                        borderRadius: '8px',
                        background: '#fff3e0',
                        marginBottom: '10px'
                    }}>
                        <h4 style={{ margin: '0', color: '#e65100', }}>AI Agent</h4>
                        {selectedProducts.map((p, i) => (
                            <p key={i} style={{ margin: '5px 0' }}>
                                <strong>
                                    {p.name} - {p.price}
                                </strong>

                            </p>
                        ))}
                        <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#4a3520' }}>
                            Total: ₹{selectedProducts.reduce((sum, p) => sum + p.price, 0)}
                        </p>
                    </div>
                )}


                {/* order details */}
                {orderDetails && (
                    <div style={{
                        padding: '15px',
                        border: '2px solid #4caf50',
                        borderRadius: '8px',
                        background: '#e8f5e9'
                    }}>

                        <h4 style={{ margin: '0', color: '#2e7d32' }}>Order Placed!</h4>

                        <p style={{ margin: '5px 0' }}>
                            <strong>Order ID:</strong> {orderDetails.order_id}
                        </p>

                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            {orderDetails.message}
                        </p>
                        <button onClick={handlePayNow}

                            style={{
                                display: 'inline-block',
                                marginTop: '10px',
                                padding: '10px 30px',
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}>
                            Pay Now
                        </button>

                        {
                            blockedMessage && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '20px',
                                    border: '2px solid #ff4444',
                                    borderRadius: '12px',
                                    background: '0 4px 12px rgba(255, 68, 68,0.2)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '12px'
                                    }}>
                                        <span style={{ fontSize: '28px' }}></span>
                                        <h3 style={{ margin: 0, color: '#cc0000' }}>Payment Blocked</h3>
                                    </div>

                                    <div style={{
                                        background: 'white',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '8px 0',
                                            borderBottom: '1px solid #eee'
                                        }}>
                                            <span style={{ color: '#666' }}>Totl Amount</span>
                                            <span style={{ fontWeight: 'bold', color: '#cc0000' }}>{blockedMessage.total}</span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '8px 0',
                                            borderBottom: '1px solid #eee'
                                        }}>

                                            <span style={{ color: '#666' }}>Maximum Allowed</span>
                                            <span style={{ fontWeight: 'bold', color: '#4caf50' }}>{blockedMessage.maxBudget}</span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '8px 0'
                                        }}>
                                            <span style={{ color: '#666' }}>Exceeded By</span>
                                            <span style={{ fontWeight: 'bold', color: '#ff9800' }}>{blockedMessage.diffrence}</span>
                                        </div>
                                    </div>
                                    <p style={{
                                        margin: '0 0 12px 0',
                                        color: '#666',
                                        fontSize: '14px',
                                        textAlign: 'center'
                                    }}>
                                        No money moved - user protected!
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        justifyContent: 'center'
                                    }}>
                                        <button onClick={() => {
                                            setBlockedMessage(null);
                                            addLog('User dismissed payment block', 'info')
                                        }} style={{
                                            padding: '8px 24px',
                                            background: '#4a3520',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}>
                                            Try Again
                                        </button>
                                        <button
                                            onClick={() => {
                                                setBlockedMessage(null);
                                                setOrderDetails(null);
                                                setSelectedProducts([]);
                                                addLog(`🔄 Cart cleared - starting fresh`, 'info');
                                            }}
                                            style={{
                                                padding: '8px 24px',
                                                background: '#666',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                )}

            </div>

        </div>
    );
};

export default AIAgentCheckout;