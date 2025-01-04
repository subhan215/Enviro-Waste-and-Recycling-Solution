"use client";
//import { getCookie } from "@/cookies/getCookie";
import pubnub from "@/pubnub/pubnub";
//import { setUserData } from "@/store/slices/userDataSlice";
//import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {  useSelector } from "react-redux";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  let chatId = useSelector((state) => state.currentChatId.value) || null;
  const userData = useSelector((state) => state.userData.value);
  let user_or_company_id = userData.user_id;
  let role = userData.role;

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
  }, [user_or_company_id , role]);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List */}
      <div className="w-1/3 bg-gray-100 text-black p-6 border-r border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-green-500">Available Chats</h2>
        {chats.length === 0 ? (
          <p className="text-gray-600">No chats available</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`cursor-pointer p-4 mb-3 rounded-md transition-colors duration-200 ease-in-out ${
                chat.chat_id === selectedChatId ? "bg-green-200" : "bg-gray-200 hover:bg-green-100"
              }`}
              onClick={() => handleChatSelect(chat.chat_id)}
            >
              <strong>{chat.name}</strong>
            </div>
          ))
        )}
      </div>

      {/* Messages Section */}
      <div className="w-2/3 flex flex-col bg-white rounded-lg shadow-lg">
        {/* Messages */}
        <div
    className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-200"
    style={{ scrollBehavior: "smooth" }} // Ensure smooth scrolling
    ref={(el) => {
      if (el) el.scrollTop = el.scrollHeight; // Auto-scroll to the bottom when new messages arrive
    }}
  >
          {messages.map((msg, index) => (
        <div
  key={index}
  className={`p-4 my-3 rounded-md text-black flex ${
    msg.sender === role && msg.sender_id === user_or_company_id
      ? "bg-green-100 ml-auto"
      : "bg-gray-200"
  }`}
  style={{
    maxWidth:
      msg.content.length < 30
        ? "30%" // Less than 30 characters
        : msg.content.length < 50
        ? "50%" // Less than 50 characters
        : "60%", // Greater than 100 characters
    wordWrap: "break-word", // Prevent overflow of long words
    whiteSpace: "pre-wrap", // Ensure wrapping for long content
    overflowWrap: "break-word", // Ensure long words break to fit
    wordBreak: "break-word", // Ensure breaking at word boundaries
    overflow: "hidden", // Prevent overflow
  }}
>

              <div className="text-gray-800">
                <strong>{msg.sender_name}:</strong> {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Section */}
        <div className="p-6 bg-gray-100 flex items-center border-t border-gray-300">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-6 py-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
          />
          <button
            onClick={sendMessage}
            className="ml-4 px-8 py-3 rounded-md bg-green-500 text-white font-medium hover:bg-green-400 transition duration-300 ease-in-out"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
