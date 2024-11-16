"use client";
import pubnub from "@/pubnub/pubnub";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
const Chat = ({ user_id = 2 }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  let chatId = useSelector((state)=> state.currentChatId.value) || null;
  useEffect(() => {
    // Function to fetch all chats for the user
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/chat/get_chats?role=user&id=${user_id}`);
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
  }, [user_id]);

  useEffect(() => {
    if (!selectedChatId && !chatId) return;

    // Function to fetch messages for the selected chat
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

    fetchMessages(chatId ? chatId : selectedChatId);
  }, [selectedChatId]);

  useEffect(() => {
    const listener = {
      message: (event) => {
        if (event.message.chat_id === selectedChatId) {
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
  }, [selectedChatId]);

  const handleChatSelect = (chat_id) => {
    setSelectedChatId(chat_id);
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      // Send the message to the backend
      const response = await fetch("/api/messages/send_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: selectedChatId,
          content: newMessage,
          sender: "user", // or company depending on your logic
          sender_id: user_id, // assuming user_id is the current user's ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const messageData = await response.json();

      // Publish the message using PubNub
      pubnub.publish({
        channel: "chat-channel",
        message: {
          sender: "user",
          sender_id: user_id,
          content: newMessage,
          chat_id: selectedChatId,
          timestamp: new Date().toISOString(),
        },
      });

      setNewMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        <h2>Available Chats</h2>
        {chats.length === 0 ? (
          <p>No chats available</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.chat_id}
              className="chat-item"
              onClick={() => handleChatSelect(chat.chat_id)}
            >
              <strong>Chat with {chat.company_id}</strong>
            </div>
          ))
        )}
      </div>

      {(selectedChatId || chatId) && (
        <>
          <div className="chat-header">
            <h2>Chat {selectedChatId ? selectedChatId : chatId}</h2>
          </div>

          <div className="messages-container" style={{ height: "400px", overflowY: "scroll" }}>
            {messages.map((msg, index) => (
              <div key={index} className="message-item">
                <strong>{msg.sender_id}:</strong> {msg.content}
              </div>
            ))}
          </div>

          <div className="message-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button onClick={sendMessage} className="send-button">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
