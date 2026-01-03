"use client";

import pubnub from "@/pubnub/pubnub";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

// SVG Icons
const Icons = {
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  EmptyChat: () => (
    <svg className="w-24 h-24 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
};

const Chat = () => {
  const [isChatListVisible, setIsChatListVisible] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  let chatId = useSelector((state) => state.currentChatId.value) || null;
  const userData = useSelector((state) => state.userData.value);
  let user_or_company_id = userData.user_id;
  let role = userData.role;

  const toggleChatList = () => setIsChatListVisible(!isChatListVisible);
  const closeChatList = () => setIsChatListVisible(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/chat/get_chats?role=${role}&id=${user_or_company_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error loading chats:", error);
      }
    };
    fetchChats();
  }, [user_or_company_id, role]);

  useEffect(() => {
    const activeChatId = selectedChatId || chatId;
    if (!activeChatId) return;

    const fetchMessages = async (chat_id) => {
      try {
        const response = await fetch(`/api/chat/${chat_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        setMessages(data.data);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    fetchMessages(activeChatId);
  }, [selectedChatId, chatId]);

  useEffect(() => {
    const activeChatId = selectedChatId || chatId;

    const listener = {
      message: (event) => {
        if (event.message.chat_id === activeChatId) {
          setMessages((prevMessages) => {
            const messageExists = prevMessages.some(
              (msg) => msg.timestamp === event.message.timestamp
            );
            if (!messageExists) {
              return [...prevMessages, event.message];
            }
            return prevMessages;
          });
        }
      },
    };

    pubnub.subscribe({ channels: ["chat-channel"] });
    pubnub.addListener(listener);

    return () => {
      pubnub.removeListener(listener);
      pubnub.unsubscribe({ channels: ["chat-channel"] });
    };
  }, [selectedChatId, chatId]);

  const handleChatSelect = (chat_id) => {
    setSelectedChatId(chat_id);
    closeChatList();
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const response = await fetch("/api/messages/send_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: selectedChatId ? selectedChatId : chatId,
          content: newMessage,
          sender: role,
          sender_id: user_or_company_id,
          sender_name: userData.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      pubnub.publish({
        channel: "chat-channel",
        message: {
          sender: role,
          sender_id: user_or_company_id,
          content: newMessage,
          chat_id: selectedChatId ? selectedChatId : chatId,
          timestamp: new Date().toISOString(),
          sender_name: userData.name,
        },
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const activeChatId = selectedChatId || chatId;
  const activeChat = chats.find((chat) => chat.chat_id === activeChatId);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleChatList}
        className={`fixed z-30 left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex items-center justify-center rounded-r-xl shadow-lg lg:hidden transition-all duration-300 hover:w-14 ${
          isChatListVisible ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Icons.Menu />
      </button>

      {/* Mobile Overlay */}
      {isChatListVisible && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeChatList}
        />
      )}

      {/* Chat List Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full w-80 bg-white border-r border-gray-100 shadow-xl lg:shadow-none z-40 transform transition-transform duration-300 ease-in-out ${
          isChatListVisible ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Icons.Chat />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Messages</h2>
                <p className="text-xs text-gray-500">{chats.length} conversations</p>
              </div>
            </div>
            <button
              onClick={closeChatList}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.Close />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icons.Search />
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Icons.Chat />
              </div>
              <p className="text-gray-500 text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.chat_id}
                  onClick={() => handleChatSelect(chat.chat_id)}
                  className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    chat.chat_id === activeChatId
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm ${
                      chat.chat_id === activeChatId
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-200"
                    }`}
                  >
                    {getInitials(chat.name)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold truncate">{chat.name}</p>
                    <p
                      className={`text-xs truncate ${
                        chat.chat_id === activeChatId ? "text-emerald-100" : "text-gray-500"
                      }`}
                    >
                      Click to view messages
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeChatId ? (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-emerald-200">
                {getInitials(activeChat?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{activeChat?.name || "Chat"}</h3>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Icons.EmptyChat />
                  <p className="text-gray-400 mt-4">No messages yet</p>
                  <p className="text-gray-300 text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.sender === role && msg.sender_id === user_or_company_id;
                  return (
                    <div
                      key={index}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                          isOwn ? "order-2" : "order-1"
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_name}</p>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwn
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-br-md shadow-lg shadow-emerald-200"
                              : "bg-white text-gray-800 rounded-bl-md shadow-md border border-gray-100"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? "text-right text-gray-400 mr-1" : "text-gray-400 ml-1"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Icons.Send />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mb-6">
              <Icons.EmptyChat />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Messages</h3>
            <p className="text-gray-500 text-center max-w-sm">
              Select a conversation from the sidebar to start chatting
            </p>
            <button
              onClick={toggleChatList}
              className="mt-6 lg:hidden px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-200 flex items-center gap-2"
            >
              <Icons.Menu />
              View Conversations
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
