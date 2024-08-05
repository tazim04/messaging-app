import { useSocket } from "../context/SocketContext";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import SideBar from "../components/SideBar";
import { set } from "mongoose";

function Chat({ username, room, messages, setMessages }) {
  const socket = useSocket(); // Use custom hook to get the socket object from the context
  const [message, setMessage] = useState(""); // State for the message
  const [users, setUsers] = useState([]); // State for the users
  const [showScrollToBottom, setShowScrollToBottom] = useState(false); // State for the scroll to bottom button
  const [atBottom, setAtBottom] = useState(true); // State for the scroll position

  const chatRef = useRef(); // Reference to the chat container
  const bottomRef = useRef(); // Reference to the bottom of the chat

  const [scrollPosition, setScrollPosition] = useState(0);

  // Track if the user is at the bottom of the chat using observer
  useEffect(() => {
    console.log("showScrollToBottom:", showScrollToBottom);

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setShowScrollToBottom(!entry.isIntersecting); // Update the atBottom state
    });
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    return () => {
      observer.disconnect();
    };
  });

  // Scroll to the bottom of the chat when the room is opened or a new message is sent
  useEffect(() => {
    if (bottomRef.current) {
      console.log("Scrolling to the bottom of the chat...", bottomRef.current);
      bottomRef.current.scrollIntoView({ behavior: "auto" });
    } else {
      console.log("bottomRef.current is null");
    }
  }, [messages, room.name]);

  // Listen for events when the component mounts
  useEffect(() => {
    if (socket && socket.connected) {
      console.log("Chat component mounted. Socket:", socket);

      // Listen for received messages -  NEED TO IMPLEMENT GROUP CHAT FUNCTIONALITY
      socket.on("recieve_message", (messageData) => {
        console.log("Message received:", messageData); // Log the received message
        let content = messageData.content;
        let sender = messageData.sender;
        let timestamp = messageData.timestamp;

        let messageContent = {
          sender: sender,
          content: content,
          timestamp: timestamp,
        };

        setMessages((prevMessages) => {
          return {
            ...prevMessages,
            [sender]: [...(prevMessages[sender] || []), messageContent], // Update the messages state for this dm
          };
        });
        console.log("Messages:", messages[room.name]);
      });

      // Listen for previous messages
      socket.on("recieve_previous_messages", (previousMessages) => {
        console.log("Previous messages:", previousMessages); // Log the previous messages
        setMessages((prevMessages) => {
          return {
            ...prevMessages,
            [room.name]: [...previousMessages], // Update the messages state for this dm
          };
        });
      });
    }
    return () => {
      // Clean up the event listeners
      socket.off("recieve_message");
      socket.off("recieve_previous_messages");
    };
  }, [socket, room.name, username, setMessages]);

  const onType = (e) => {
    let message = e.target.value;
    console.log("Typing message...", message);
    setMessage(message); // Update the message state
    console.log("room.name:", room.name);
  };

  const send = () => {
    if (!message) return; // If the message is empty, do nothing
    console.log(
      "Sending message: " +
        message +
        " to room: " +
        room.name +
        " from user: " +
        username
    );

    let messageContent = {
      content: message,
      sender: username,
    };
    setMessages((prevMessages) => {
      return {
        ...prevMessages,
        [room.name]: [...(prevMessages[room.name] || []), messageContent], // Update the messages state for this dm
      };
    });
    socket.emit("dm", message, room.id, room.name, username, room.is_group); // Emit a message, FOR NOW ROOM IS JUST A USER
    setMessage(""); // Clear the message input
  };

  return (
    <div className="flex flex-col flex-1 h-screen" ref={chatRef}>
      {room ? ( // Check if the room (recipient) is selected
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Check if there are messages for the selected recipient */}
            {messages[room.name] ? (
              messages[room.name].map((msg, index) =>
                // If message from user align right, else align left
                msg.sender === username ? (
                  <div key={index} className="p-4 text-right">
                    <b>
                      <p>{msg.sender}</p>
                    </b>
                    <p>{msg.content}</p>
                  </div>
                ) : (
                  <div key={index} className="p-4 text-left">
                    <b>
                      <p>{msg.sender}</p>
                    </b>
                    <p>{msg.content}</p>
                  </div>
                )
              )
            ) : (
              // If no messages, display a message
              <p>No messages in this conversation</p>
            )}

            {showScrollToBottom && (
              <div className="flex justify-center">
                <button
                  className="scroll-to-bottom fixed bottom-28 text-indigo-500 border-2 border-indigo-500 px-4 py-auto animate-bounce 
                  transition ease-in-out delay-3 hover:bg-indigo-500 hover:text-white duration-300"
                  style={{ fontSize: "2rem", borderRadius: "50%" }}
                  onClick={() => {
                    bottomRef.current.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ↓
                </button>
              </div>
            )}

            {/* Reference to the bottom of the chat */}
            <div ref={bottomRef}></div>
          </div>

          <div className="p-4 pb-8 bg-gray-200 flex">
            <input
              type="text"
              placeholder={`Message ${room.name}`}
              className="w-full h-12 focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-4 bg-white rounded-md py-2"
              value={message}
              onChange={onType}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              className="bg-indigo-500 text-white rounded-md px-8 h-12 ms-5"
              onClick={send}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="justify-center">
          <h1>Welcome to Tazim's Chatting app!</h1>
        </div>
      )}
    </div>
  );
}

export default Chat;
