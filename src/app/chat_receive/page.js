// ChatMessages.js
"use client" ; 
import React, { useEffect, useState } from 'react';
import pubnub from '../../pubnub/pubnub';

const ChatMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    pubnub.subscribe({ channels: ['chat-channel'] });
    pubnub.addListener({
      message: (event) => {
        setMessages((msgs) => [...msgs, event.message]);
      }
    });

    return () => {
      pubnub.unsubscribeAll();
    };
  }, []);

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>{msg.content}</div>
      ))}
    </div>
  );
};

export default ChatMessages;