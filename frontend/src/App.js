import React, { useState } from 'react';
import Chat from './Chat';
import Checkout from './Checkout';
import AIAgentCheckout from './AIAgentCheckout';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [aiAgentLogs, setAiAgentLogs] = useState([]);

  //Add product to cart
  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    alert(`Added ${product.name} to cart! ${product.price}`);

  };

  //remove product from cart
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  //Add AI Agent log
  const addAiAgentLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setAiAgentLogs(prev => [...prev, {
      id: Date.now(),
      message: message,
      type: type,
      timestamp: timestamp
    }]);
  };

  const clearAiAgentLogs = () => {
    setAiAgentLogs([]);
  };

  return (
    <div className='App'>
      <header style={{
        padding: '10px 20px',
        background: '#4a3520',
        color: 'white',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          <h1 style={{ margin: 0, fontSize: '24px' }}>ChaiSutra
            <span style={{
              fontSize: '12px',
              background: '#F37254',
              padding: '2px 8px',
              borderRadius: '10px',
              marginLeft: '10px'
            }}>
              AI-Powered

            </span>
          </h1>
          <div>
            <span style={{ marginRight: '15px' }}>
              {cart.length} items {cartTotal}

            </span>
            <button onClick={() => setActiveTab('checkout')}
              style={{
                padding: '8px 20px',
                background: '#F37254',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                opacity: cart.length === 0 ? 0.5 : 1
              }}
              disabled={cart.length === 0}
            >
              Checkout

            </button>
          </div>
        </div>
        {/* bottom row toggle button */}

        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '10px'
        }}>
          <button onClick={() => setActiveTab('chat')}
            style={{
              padding: '6px 20px',
              background: activeTab === 'chat' ? '#F37254' : 'transparent',
              color: activeTab === 'chat' ? 'white' : '#ccc',
              border: activeTab === 'chat' ? 'none' : '1px solid #ccc',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'chat' ? 'bold' : 'normal'
            }}
          >
            Chat
          </button>

          <button
            onClick={() => setActiveTab('ai-agent')}
            style={{
              padding: '6px 20px',
              background: activeTab === 'ai-agent' ? '#F37254' : 'transparent',
              color: activeTab === 'ai-agent' ? 'white' : '#ccc',
              border: activeTab === 'ai-agent' ? 'none' : '1px solid #ccc',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'ai-agent' ? 'bold' : 'normal'
            }}
          >
            AI Agent
          </button>

          {cart.length > 0 && (
            <button onClick={() => setActiveTab('checkout')}
              style={{
                padding: '6px 20px',
                background: activeTab === 'checkout' ? '#F37254' : 'transparent',
                color: activeTab === 'checkout' ? 'white' : '#ccc',
                border: activeTab === 'checkout' ? 'none' : '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'checkout' ? 'bold' : 'normal'
              }}
            >
              Cart({cart.length})
            </button>
          )}

          {aiAgentLogs.length > 0 && activeTab === 'ai-agent' && (
            <button onClick={clearAiAgentLogs}
              style={{
                padding: '6px 15px',
                background: 'transparent',
                color: '#999',
                border: '1px solid #666',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                marginLeft: 'auto'
              }}
            >
              Clear Logs
            </button>
          )}
        </div>

      </header>

      {activeTab === 'ai-agent' ? (
        <AIAgentCheckout
          onSuccess={(data) => console.log('AI Agent order:', data)}
          onLog={addAiAgentLog}
          logs={aiAgentLogs}
          onClear={clearAiAgentLogs}
          onAddToCart={addToCart}
        />
      ) : activeTab === 'checkout' ? (
        <div>
          <button onClick={() => setActiveTab('chat')}

            style={{
              margin: '10px',
              padding: '8px 16px',
              backgound: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
            Back To Chat
          </button>
          <Checkout cart={cart} onRemove={removeFromCart} onClear={() => setCart([])} />
        </div>
      ) : (
        <Chat onAddToCart={addToCart} />
      )}
    </div>
  )
}
export default App;