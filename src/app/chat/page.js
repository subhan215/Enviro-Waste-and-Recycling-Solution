"use client";
//import { getCookie } from "@/cookies/getCookie";
import pubnub from "@/pubnub/pubnub";
//import { setUserData } from "@/store/slices/userDataSlice";
//import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {  useSelector } from "react-redux";

const Chat = () => {
  const [isChatListVisible, setIsChatListVisible] = useState(false);

  const toggleChatList = () => {
    setIsChatListVisible(!isChatListVisible);
  };
  const closeChatList = () => {
    setIsChatListVisible(false);
  };
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
<div className="flex flex-col lg:flex-row justify-end h-screen lg:bg-gray-50">
  {/* Toggle Button for Smaller Screens */}
  <button
    onClick={toggleChatList}
    className={`fixed z-30 left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-custom-green text-white flex items-center justify-center rounded-r-full shadow-lg lg:hidden ${
      isChatListVisible ? "hidden" : "block"
    }`}
  >
    →
  </button>

  {/* Chat List for smaller screens */}
  <div
    className={`lg:hidden absolute top-20 inset-0 bg-gray-100 z-50 p-6 border-b border-gray-300 rounded-lg shadow-lg transition-all duration-300 transform ${
      isChatListVisible ? "translate-x-0" : "-translate-x-full"
    }`}
    style={{ width: "250px" }} // Set width to 250px when visible
  >
    {/* Cross Button to close chat list */}
    <button
      onClick={closeChatList}
      className="absolute top-2 right-4 text-2xl text-gray-600"
    >
      ×
    </button>

    {/* Available Chats */}
    <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-green-500">Available Chats</h2>
    {chats.length === 0 ? (
      <p className="text-sm sm:text-base text-gray-600">No chats available</p>
    ) : (
      chats.map((chat) => (
        <div
          key={chat.chat_id}
          className={`cursor-pointer p-4 mb-3 rounded-md transition-colors duration-200 ease-in-out ${
            chat.chat_id === selectedChatId
              ? "bg-green-200"
              : "bg-gray-200 hover:bg-green-100"
          }`}
          onClick={() => handleChatSelect(chat.chat_id)}
        >
          <strong className="text-sm sm:text-base text-custom-black">{chat.name}</strong>
        </div>
      ))
    )}
  </div>

  {/* Chat List for larger screens */}
  <div className="w-full lg:w-1/3 bg-gray-100 text-black p-6 border-b lg:border-r border-gray-300 rounded-lg shadow-lg lg:block hidden">
    <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-green-500">Available Chats</h2>
    {chats.length === 0 ? (
      <p className="text-sm sm:text-base text-gray-600">No chats available</p>
    ) : (
      chats.map((chat) => (
        <div
          key={chat.chat_id}
          className={`cursor-pointer p-4 mb-3 rounded-md transition-colors duration-200 ease-in-out ${
            chat.chat_id === selectedChatId
              ? "bg-green-200"
              : "bg-gray-200 hover:bg-green-100"
          }`}
          onClick={() => handleChatSelect(chat.chat_id)}
        >
          <strong className="text-sm sm:text-base">{chat.name}</strong>
        </div>
      ))
    )}
  </div>

  {/* Messages Section */}
  <div className="w-full lg:w-2/3 flex flex-col lg:bg-white rounded-lg shadow-lg">
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
          className={`p-4 my-3 rounded-md text-black flex w-full sm:w-auto lg:w-auto ${
            msg.sender === role && msg.sender_id === user_or_company_id
              ? "bg-green-100 ml-auto"
              : "bg-gray-200"
          }`}
          style={{
            wordWrap: "break-word", // Prevent overflow of long words
            whiteSpace: "pre-wrap", // Ensure wrapping for long content
            overflowWrap: "break-word", // Ensure long words break to fit
            wordBreak: "break-word", // Ensure breaking at word boundaries
            overflow: "hidden", // Prevent overflow
          }}
        >
          <div className="text-gray-800 text-xs md:text-sm">
            <strong>{msg.sender_name}:</strong> {msg.content}
          </div>
        </div>
      ))}
    </div>

    {/* Input Section */}
    <div className="p-6 lg:bg-gray-100 flex items-center lg:border-t">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-6 py-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md text-sm sm:text-base text-custom-black"
      />
      <button
        onClick={sendMessage}
        className="ml-2 px-8 py-3 rounded-md bg-green-500 text-white font-medium hover:bg-green-400 transition duration-300 ease-in-out text-sm sm:text-base"
      >
        Send
      </button>
    </div>
  </div>
</div>

  );
};

export default Chat;
