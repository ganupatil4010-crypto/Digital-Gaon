import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, Send, Bot, User, ImagePlus } from 'lucide-react';
import API_BASE_URL from '../config/api';
import '../index.css';

const FarmerChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! Main Digital Gaon ka AI sahayak, Gaon AI hoon. Main aapki education, general knowledge, kheti-baadi aur kisi bhi vichar ya sawaal mein madad karne ke liye yahaan hoon. Bataiye, main aapki kaise madad karoon?'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          dataUrl: reader.result,
          file: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage = { 
      sender: 'user', 
      text: input,
      image: selectedImage ? selectedImage.dataUrl : null
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    let payload = { message: input || "Describe this image" };
    if (selectedImage) {
      const base64Data = selectedImage.dataUrl.split(',')[1];
      payload.image = {
        data: base64Data,
        mimeType: selectedImage.file.type
      };
    }

    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${data.error || 'Server error'}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Network connection error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        className={`chatbot-toggle-btn ${isOpen ? 'hidden' : ''}`}
        title="Gaon AI Chat Assistant"
      >
        <MessageCircle size={28} color="white" />
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="chat-avatar" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <Bot size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Gaon AI</h3>
                <div className="status-indicator">
                  <span className="pulse-dot"></span>
                  <span>Online Support</span>
                </div>
              </div>
            </div>
            <button onClick={toggleChat} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '12px' }}>
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="chat-bubble">
                  {msg.image && (
                    <div style={{ marginBottom: msg.text ? '12px' : '0' }}>
                      <img src={msg.image} alt="User upload" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '16px', display: 'block', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  )}
                  {msg.text && (
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message ai">
                <div className="chat-avatar">
                  <Bot size={18} />
                </div>
                <div className="chat-bubble" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '1rem' }}>
                  <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typing 1.4s infinite' }}></div>
                  <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typing 1.4s infinite 0.2s' }}></div>
                  <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typing 1.4s infinite 0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <form onSubmit={sendMessage} className="chatbot-input-wrapper">
              {selectedImage && (
                <div style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={selectedImage.dataUrl} alt="Preview" style={{ height: '50px', width: '50px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--glass-border)' }} />
                    <button 
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--error)', borderRadius: '50%', border: 'none', color: 'white', cursor: 'pointer', padding: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                    >
                       <X size={12} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Image ready to send</span>
                </div>
              )}
              <div className="input-actions">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  style={{ display: 'none' }} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="action-btn btn-attach"
                  title="Attach Image"
                >
                  <ImagePlus size={22} />
                </button>
                <input 
                  type="text" 
                  placeholder="Ask Gaon AI anything..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button type="submit" className="action-btn btn-send" disabled={isLoading || (!input.trim() && !selectedImage)}>
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FarmerChatbot;
