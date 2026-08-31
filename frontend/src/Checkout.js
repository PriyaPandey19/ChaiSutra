import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ cart, onRemove, onClear }) => {
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // Load Razorpay script
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Handle payment
    const handlePayment = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        setLoading(true);
        try {
            // Create order
            const response = await axios.post('http://localhost:5000/api/create-order', {
                amount: total
            });

            const data = response.data;
            setOrderId(data.orderId);

            // Load Razorpay
            const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!scriptLoaded) {
                alert('Failed to load Razorpay. Please try again.');
                setLoading(false);
                return;
            }

            // Open Razorpay
            const options = {
                key: data.key,
                amount: data.amount,
                currency: 'INR',
                name: 'ChaiSutra Tea Shop',
                description: `Order #${data.orderId}`,
                order_id: data.orderId,
                handler: function (response) {
                    alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}`);
                    setLoading(false);
                    onClear(); // Clear cart after successful payment
                },
                prefill: {
                    name: 'Chai Lover',
                    email: 'customer@chaisutra.com',
                    contact: '9876543210'
                },
                theme: {
                    color: '#F37254'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Payment failed:', error);
            alert('❌ Payment failed: ' + (error.response?.data?.error || error.message));
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
            <h2> Your Cart</h2>

            {cart.length === 0 ? (
                <p style={{ color: '#666' }}>Your cart is empty. Go back to chat and add some tea!</p>
            ) : (
                <>
                    {/* Cart Items */}
                    <div style={{ marginBottom: '20px' }}>
                        {cart.map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #eee',
                                padding: '10px 0'
                            }}>
                                <div>
                                    <strong>{item.name}</strong>
                                    <span style={{ marginLeft: '10px', color: '#666' }}>₹{item.price}</span>
                                </div>
                                <button
                                    onClick={() => onRemove(index)}
                                    style={{
                                        background: 'red',
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px 10px',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        borderTop: '2px solid #ddd',
                        paddingTop: '15px',
                        marginBottom: '20px'
                    }}>
                        <span>Total:</span>
                        <span>₹{total}</span>
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '18px',
                            background: '#F37254',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Processing...' : `Pay ₹${total}`}
                    </button>

                    {orderId && (
                        <p style={{ marginTop: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                            Order ID: {orderId}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default Checkout;