import React, { useState } from 'react';
import axios from 'axios';

//UPSELL MAPPING

const UPSELL_MAP = {
    'Masala Chai Kit': {
        suggestion: 'Wooden Infuser',
        price: 349,
        message: " Since you're getting Masala Chai Kit, want to add a Wooden Infuser (₹349) to brew it right?"
    },
    'English Breakfast': {
        suggestion: 'Ceramic Tea Set',
        price: 599,
        message: "Perfect choice! A Ceramic Tea Set (₹599) would make your English Breakfast even more special!"
    },
    'Kashmiri Kahwa': {
        suggestion: 'Ginger Concentrate',
        price: 199,
        message: "Kashmiri Kahwa with Ginger Concentrate (₹199) is a match made in heaven!"
    },
    'Herbal Chamomile': {
        suggestion: 'Organic Honey',
        price: 149,
        message: "Add some Organic Honey (₹149) to your Herbal Chamomile for extra sweetness!"
    },
    'Earl Grey': {
        suggestion: 'Travel Flask',
        price: 249,
        message: "Enjoy your Earl Grey on the go with this Travel Flask (₹249)!"
    },
    'Green Tea - Jasmine': {
        suggestion: 'Travel Flask',
        price: 249,
        message: "Take your Jasmine Green Tea anywhere with this Travel Flask (₹249)!"
    }
};

const DEFAULT_UPSELL = {
    suggestion: 'Travel Flask',
    price: 249,
    message: "Don't forget to grab a Travel Flask (₹249) to enjoy your tea anywhere!"
};

const UPSELL_PRODUCTS = {
    'Wooden Infuser': { id: 'ACCESS-001', name: 'Wooden Infuser', price: 349 },
    'Ceramic Tea Set': { id: 'ACCESS-002', name: 'Ceramic Tea Set', price: 599 },
    'Ginger Concentrate': { id: 'ADD-001', name: 'Ginger Concentrate', price: 199 },
    'Organic Honey': { id: 'ADD-002', name: 'Organic Honey', price: 149 },
    'Travel Flask': { id: 'ACCESS-003', name: 'Travel Flask', price: 249 },
};

const Chat = ({ onAddToCart }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Welcome to ChaiSutra! \nWhat kind of tea are you looking for?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/chat', {
                message: input
            });

            const { reply, products } = response.data;

            // Add bot reply
            setMessages(prev => [...prev, { role: 'bot', text: reply }]);

            // Store products from backend
            if (products && products.length > 0) {
                setRecommendedProducts(products);
            } else {
                // Fallback products if backend returns nothing
                const fallbackProducts = [
                    { "id": "CHAI-001", "name": "Masala Chai Kit", "price": 499 },
                    { "id": "CHAI-002", "name": "Kashmiri Kahwa", "price": 299 },
                    { "id": "CHAI-003", "name": "English Breakfast", "price": 399 },
                    { "id": "CHAI-004", "name": "Earl Grey", "price": 349 },
                    { "id": "CHAI-005", "name": "Green Tea - Jasmine", "price": 299 },
                    { "id": "CHAI-006", "name": "Herbal Chamomile", "price": 249 },
                    { "id": "ADD-001", "name": "Ginger Concentrate", "price": 199 },
                    { "id": "ADD-002", "name": "Organic Honey", "price": 149 },
                    { "id": "ADD-003", "name": "Spice Blend", "price": 99 },
                    { "id": "ACCESS-001", "name": "Wooden Infuser", "price": 349 },
                    { "id": "ACCESS-002", "name": "Ceramic Tea Set", "price": 599 },
                    { "id": "ACCESS-003", "name": "Travel Flask", "price": 249 },
                ];
                setRecommendedProducts(fallbackProducts);
            }


            //  UPSELL DETECTION - WITH FALLBACK

            const userMessage = input.toLowerCase();
            let upsellMessage = null;
            let upsellProduct = null;

            for (const [productName, upsellData] of Object.entries(UPSELL_MAP)) {
                if (userMessage.includes(productName.toLowerCase())) {

                    upsellProduct = products?.find(p => p.name === upsellData.suggestion);


                    if (!upsellProduct) {
                        upsellProduct = UPSELL_PRODUCTS[upsellData.suggestion];
                    }

                    if (upsellProduct) {
                        upsellMessage = {
                            text: upsellData.message,
                            product: upsellProduct,
                            type: 'upsell'
                        };
                    }
                    break;
                }
            }


            if (!upsellMessage && products && products.length > 0) {
                const defaultProduct = products.find(p => p.name === DEFAULT_UPSELL.suggestion);
                if (!defaultProduct) {
                    // Use fallback default product
                    upsellProduct = UPSELL_PRODUCTS[DEFAULT_UPSELL.suggestion];
                    if (upsellProduct) {
                        upsellMessage = {
                            text: DEFAULT_UPSELL.message,
                            product: upsellProduct,
                            type: 'upsell'
                        };
                    }
                } else {
                    upsellMessage = {
                        text: DEFAULT_UPSELL.message,
                        product: defaultProduct,
                        type: 'upsell'
                    };
                }
            }

            if (upsellMessage) {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    text: upsellMessage.text,
                    isUpsell: true,
                    product: upsellMessage.product
                }]);
            }

        } catch (error) {
            console.error('Chat error: ', error);
            setMessages(prev => [...prev, {
                role: 'bot',
                text: 'Sorry, I\'m having trouble right now. Please try again! '
            }]);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Chat with ChaiSutra AI</h2>

            {/* Messages Container */}
            <div style={{
                height: '300px',
                overflowY: 'scroll',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '15px',
                background: '#f9f6f0'
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        textAlign: msg.role === 'user' ? 'right' : 'left',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            background: msg.role === 'user' ? '#F37254' :
                                msg.isUpsell ? '#fff3e0' : '#e0d6c8',
                            color: msg.role === 'user' ? 'white' : 'black',
                            padding: '10px 15px',
                            borderRadius: '15px',
                            maxWidth: '80%',
                            whiteSpace: 'pre-wrap',
                            border: msg.isUpsell ? '2px solid #ff9800' : 'none'
                        }}>
                            {msg.text}

                            {msg.isUpsell && msg.product && (
                                <button
                                    onClick={() => {
                                        console.log('🛒 Upsell clicked:', msg.product);
                                        onAddToCart(msg.product);
                                    }}
                                    style={{
                                        display: 'block',
                                        marginTop: '8px',
                                        padding: '6px 15px',
                                        background: '#ff9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Add {msg.product.name} (₹{msg.product.price})
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ textAlign: 'left' }}>
                        <div style={{
                            display: 'inline-block',
                            background: '#e0d6c8',
                            padding: '10px 15px',
                            borderRadius: '15px'
                        }}>
                            Typing...
                        </div>
                    </div>
                )}
            </div>

            {/* Recommended Products Section */}
            {recommendedProducts.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <h3> Recommended for you:</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {recommendedProducts.map((product) => (
                            <div key={product.id} style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '10px',
                                width: '150px',
                                background: 'white'
                            }}>
                                <h4 style={{ margin: '0', fontSize: '14px' }}>{product.name}</h4>
                                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                                    ₹{product.price}
                                </p>
                                <button
                                    onClick={() => {
                                        console.log('🛒 Recommended clicked:', product);
                                        onAddToCart(product);
                                    }}
                                    style={{
                                        background: '#F37254',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        width: '100%'
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type='text'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder='Ask about tea...'
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '16px'
                    }}
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: '#F37254',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default Chat;