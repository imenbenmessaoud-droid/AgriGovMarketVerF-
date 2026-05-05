import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../services/messagingService';
import { 
  FaSearch, FaPhone, FaVideo, FaEllipsisH, FaPaperclip, 
  FaPaperPlane, FaUserCircle, FaCheckDouble, FaCircle
} from 'react-icons/fa';
import './MessagingPage.css';

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll conversations
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id_conversation);
      const interval = setInterval(() => fetchMessages(activeConversation.id_conversation), 3000); // Poll messages
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await messagingService.getConversations();
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const data = await messagingService.getMessages(id);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await messagingService.sendMessage(activeConversation.id_conversation, newMessage);
      setNewMessage('');
      fetchMessages(activeConversation.id_conversation);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.other_participant?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messaging-center">
      {/* Left Sidebar: Contact List */}
      <div className="contacts-sidebar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="contacts-list">
          {filteredConversations.map(conv => (
            <div 
              key={conv.id_conversation} 
              className={`contact-item ${activeConversation?.id_conversation === conv.id_conversation ? 'active' : ''}`}
              onClick={() => setActiveConversation(conv)}
            >
              <div className="avatar-wrapper">
                {conv.other_participant?.avatar ? (
                  <img src={conv.other_participant.avatar} alt="" className="contact-avatar" />
                ) : (
                  <FaUserCircle className="contact-avatar-placeholder" />
                )}
                <span className="online-indicator"></span>
              </div>
              <div className="contact-info">
                <div className="contact-header">
                  <span className="contact-name">{conv.other_participant?.name}</span>
                  <span className="last-time">
                    {conv.last_message ? new Date(conv.last_message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </span>
                </div>
                <div className="last-message">
                  {conv.last_message?.content || 'No messages yet'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Chat Window */}
      <div className="chat-window">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="active-contact-info">
                <span className="active-name">{activeConversation.other_participant?.name}</span>
                <span className="active-status"><FaCircle className="status-dot" /> Online</span>
              </div>
              <div className="header-actions">
                <FaPhone className="header-icon" />
                <FaVideo className="header-icon" />
                <FaSearch className="header-icon" />
                <FaEllipsisH className="header-icon" />
              </div>
            </div>
            
            <div className="messages-container">
              {messages.map(msg => {
                const isMe = msg.sender === currentUser?.id_user;
                return (
                  <div key={msg.id_message} className={`message-row ${isMe ? 'me' : 'them'}`}>
                    {!isMe && (
                      <div className="msg-avatar">
                        {activeConversation.other_participant?.avatar ? (
                          <img src={activeConversation.other_participant.avatar} alt="" />
                        ) : (
                          <FaUserCircle />
                        )}
                      </div>
                    )}
                    <div className="message-content-wrapper">
                      <div className="message-bubble">
                        {msg.content}
                      </div>
                      <div className="message-footer">
                        <span className="msg-time">
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {isMe && <FaCheckDouble className="read-receipt" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="input-area" onSubmit={handleSendMessage}>
              <button type="button" className="input-icon-btn"><FaUserCircle /></button>
              <input 
                type="text" 
                placeholder="Enter message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="button" className="input-icon-btn"><FaPaperclip /></button>
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a conversation to start messaging</h3>
          </div>
        )}
      </div>

      {/* Right Sidebar: User Info */}
      <div className="info-sidebar">
        <h3 className="sidebar-title">Information</h3>
        {activeConversation ? (
          <div className="user-profile-info">
            <div className="profile-card">
              <div className="large-avatar-wrapper">
                {activeConversation.other_participant?.avatar ? (
                  <img src={activeConversation.other_participant.avatar} alt="" className="large-avatar" />
                ) : (
                  <FaUserCircle className="large-avatar-placeholder" />
                )}
              </div>
              <h4 className="info-name">{activeConversation.other_participant?.name}</h4>
              <p className="info-role">{activeConversation.other_participant?.user_type.toUpperCase()}</p>
            </div>
            
            <div className="info-details">
              <div className="info-row">
                <FaPhone className="info-icon" />
                <span>{activeConversation.other_participant?.phone || 'N/A'}</span>
              </div>
              <div className="info-row">
                <FaUserCircle className="info-icon" />
                <span>{activeConversation.other_participant?.email}</span>
              </div>
              <div className="info-row">
                <FaSearch className="info-icon" />
                <span>{activeConversation.other_participant?.wilaya || 'N/A'}</span>
              </div>
              <div className="info-row">
                <FaEllipsisH className="info-icon" />
                <span>Non renseigné</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="no-info-text">Select a contact to view details</p>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
