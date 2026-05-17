import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubbleEllipsesSharp, IoSend, IoClose, IoRemove } from 'react-icons/io5';
import api from '../../services/api';
import './ChatWidget.css';

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi 👋 I am your AgriSouk DZ assistant, how can I help you?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const lastRequestRef = useRef({ time: 0, text: '' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const now = Date.now();
    const cleanInput = inputValue.trim().toLowerCase();

    // 1. Debounce (500ms) & Duplicate Check
    if (now - lastRequestRef.current.time < 500) return;
    if (cleanInput === lastRequestRef.current.text) {
      // Allow if user is persistent but maybe nudge? 
      // For now, let's just let the cache handle it but block rapid clicks
    }

    lastRequestRef.current = { time: now, text: cleanInput };

    const userMessage = {
      id: now,
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const history = messages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const response = await api.post('chat/', { 
        message: userMessage.text,
        history: history 
      });
      
      // 3. Update messages with bot response
      let botResponse = response.data.response;
      
      try {
        // Try to parse as JSON for special guest_info or other structured types
        const parsed = JSON.parse(botResponse);
        
        if (parsed.type === 'guest_info' || parsed.type === 'market_insights' || parsed.type === 'order_details' || parsed.type === 'top_orders') {
          const botMsg = {
            id: Date.now() + 1,
            text: parsed.message,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            buttons: parsed.buttons
          };
          setMessages(prev => [...prev, botMsg]);
        } else {
          // Fallback if JSON but not special type
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: parsed.message || botResponse,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } catch (e) {
        // Not JSON - treat as plain text (conversational AI response)
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "⚠️ System busy. Please try again in a few moments.",
        sender: 'bot'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <IoChatbubbleEllipsesSharp size={20} />
            <span className="chat-header-title">AgriSouk DZ Assistant 🤖</span>
          </div>
          <div className="chat-header-actions">
            <button className="chat-header-btn" onClick={handleToggle} title="Minimize">
              <IoRemove size={18} />
            </button>
            <button className="chat-header-btn" onClick={handleToggle} title="Close">
              <IoClose size={18} />
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-container ${msg.sender}`}>
              <div className={`message ${msg.sender}`} style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="message-buttons">
                  {msg.buttons.map((btn, bIdx) => (
                    <button 
                      key={bIdx} 
                      className="chat-btn"
                      onClick={() => {
                        // Handle specific actions for navigation
                        const action = btn.action || '';
                        const label = btn.label.toLowerCase();
                        
                        if (action === 'browse_products' || action === 'market_prices' || label.includes('browse') || label.includes('price') || label.includes('shop')) {
                          navigate('/buyer/products');
                        } else if (action === 'register' || action === 'register_farmer' || label.includes('account') || label.includes('register')) {
                          navigate('/register');
                        } else if (action === 'login' || label.includes('login')) {
                          navigate('/login');
                        } else if (action === 'contact_page' || label.includes('contact')) {
                          navigate('/contact');
                        } else if (action === 'how_it_works' || action === 'learn_more' || action === 'about_us' || label.includes('learn') || label.includes('how it works')) {
                          navigate('/about');
                        } else {
                          // Default behavior: put text in input and submit
                          setInputValue(btn.label);
                        }
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-container" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder={isTyping ? "Assistant is thinking..." : "Type your message..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputValue.trim() || isTyping}>
            <IoSend size={18} />
          </button>
        </form>
      </div>

      {/* Trigger Button */}
      <button 
        className={`chat-trigger ${isOpen ? 'active' : ''}`} 
        onClick={handleToggle}
        aria-label="Open Chat"
      >
        {isOpen ? <IoClose /> : <IoChatbubbleEllipsesSharp />}
      </button>
    </div>
  );
};

export default ChatWidget;
