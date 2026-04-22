import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, Send, Bot, User, ImagePlus, Mic, MicOff } from 'lucide-react';
import API_BASE_URL from '../config/api';
import '../index.css';

// Compress image to base64 — no size limit for user, we handle it
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max 1024px dimension for API efficiency
        const MAX = 1024;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG at 80% quality
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        resolve({ dataUrl: compressed, mimeType: 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

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
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Hindi + English works well

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.error('Voice error:', e.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // No size limit — we compress automatically
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    const compressed = await compressImage(file);
    setSelectedImage({
      dataUrl: compressed.dataUrl,
      mimeType: compressed.mimeType,
      originalName: file.name,
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    // Stop voice if still listening
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMessage = {
      sender: 'user',
      text: input,
      image: selectedImage ? selectedImage.dataUrl : null
    };

    const chatHistory = messages.slice(-10).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    setMessages(prev => [...prev, userMessage]);

    let payload = {
      message: input || "Describe this image",
      history: chatHistory
    };
    if (selectedImage) {
      const base64Data = selectedImage.dataUrl.split(',')[1];
      payload.image = {
        data: base64Data,
        mimeType: selectedImage.mimeType
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

      if (!response.ok) throw new Error("Server error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setMessages(prev => [...prev, { sender: 'ai', text: '' }]);

      let fullText = "";
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (firstChunk) {
          setIsLoading(false);
          firstChunk = false;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk.replace(/\\n/g, '\n');

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }

    } catch (error) {
      console.error("Chat Error:", error);
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
                {/* Hidden file input — no size restriction */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />

                {/* Image attach button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="action-btn btn-attach"
                  title="Attach Image (any size)"
                >
                  <ImagePlus size={22} />
                </button>

                {/* Voice button — only shows if browser supports it */}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`action-btn ${isListening ? 'btn-voice-active' : 'btn-attach'}`}
                    title={isListening ? 'Stop listening' : 'Speak your message'}
                  >
                    {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                )}

                <input
                  type="text"
                  placeholder={isListening ? '🎤 Bol rahe ho...' : 'Ask Gaon AI anything...'}
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
