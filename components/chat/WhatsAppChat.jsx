// WhatsappChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Send, Mic, Check, Clock, ArrowLeft, Phone, Video, User } from 'lucide-react';

const WhatsAppChat = ({ currentUser }) => {
  const [chats, setChats] = useState([
    {
      id: '1',
      participantId: 'user1',
      participantName: 'Prof. Sarah Johnson',
      lastMessage: {
        id: 'm1',
        text: 'The assignment deadline has been extended to Friday',
        senderId: 'user1',
        recipientId: 'currentUser',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
        type: 'text'
      },
      unreadCount: 0,
      isOnline: true,
      isPinned: true
    }
  ]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const sampleMessages = {
    '1': [
      {
        id: 'msg1',
        text: 'Good morning class!',
        senderId: 'user1',
        recipientId: 'currentUser',
        timestamp: new Date(Date.now() - 86400000),
        status: 'read',
        type: 'text'
      }
    ]
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(sampleMessages[selectedChat.id] || []);
    }
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      const newMessage = {
        id: `msg${Date.now()}`,
        text: messageText,
        senderId: 'currentUser',
        recipientId: selectedChat.participantId,
        timestamp: new Date(),
        status: 'sending',
        type: 'text'
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const MessageStatus = ({ status }) => {
    if (status === 'sending') return <Clock className="w-3 h-3 text-gray-400" />;
    if (status === 'sent') return <Check className="w-3 h-3 text-gray-400" />;
    if (status === 'delivered') return (
      <div className="flex">
        <Check className="w-3 h-3 text-gray-400" />
        <Check className="w-3 h-3 text-gray-400 -ml-2" />
      </div>
    );
    if (status === 'read') return (
      <div className="flex">
        <Check className="w-3 h-3 text-blue-500" />
        <Check className="w-3 h-3 text-blue-500 -ml-2" />
      </div>
    );
    return null;
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Chat List */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 bg-white border-r border-gray-200`}>
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <span className="font-semibold">School Chat</span>
            </div>
            <MoreVertical className="w-5 h-5 cursor-pointer hover:opacity-80" />
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 rounded-full text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors
                ${selectedChat?.id === chat.id ? 'bg-gray-50' : ''}
              `}
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {chat.participantName.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900 truncate">
                    {chat.participantName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">
                    {chat.lastMessage?.text || 'No messages yet'}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center ml-2">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowLeft
                  className="w-5 h-5 mr-3 cursor-pointer md:hidden"
                  onClick={() => setSelectedChat(null)}
                />
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {selectedChat.participantName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedChat.participantName}</div>
                  <div className="text-xs text-gray-500">
                    {selectedChat.isOnline ? 'online' : 'last seen recently'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Video className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
                <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
                <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === 'currentUser';
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm
                    ${isCurrentUser 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none'
                    }
                  `}>
                    <p className="text-sm">{message.text}</p>
                    
                    <div className={`flex items-center justify-end mt-1 space-x-1
                      ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}
                    `}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {isCurrentUser && <MessageStatus status={message.status} />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <Smile className="w-5 h-5" />
              </button>
              
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {messageText ? (
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button className="text-gray-500 hover:text-gray-700 p-2">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to School Chat</h2>
            <p className="text-gray-600">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat;