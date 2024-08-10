import { useSocket } from "../context/SocketContext";
import ChatBar from "../components/ChatBar";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import SideBar from "../components/SideBar";
import { set } from "mongoose";
import { format, isToday } from "date-fns";
import "./stylesheets/Chat.css";

function Chat({ username, room, messages, setMessages }) {
  const socket = useSocket(); // Use custom hook to get the socket object from the context
  const [message, setMessage] = useState(""); // State for the message
  const [users, setUsers] = useState([]); // State for the users
  const [showScrollToBottom, setShowScrollToBottom] = useState(false); // State for the scroll to bottom button
  const [atBottom, setAtBottom] = useState(true); // State for the scroll position
  const [sendAnimation, setSendAnimation] = useState(false); // State for the send animation
  const [emptyMessageAnimation, setEmptyMessageAnimation] = useState(false); // State for the empty message animation

  const bottomRef = useRef(); // Reference to the bottom of the chat

  const [scrollPosition, setScrollPosition] = useState(0);

  // Track if the user is at the bottom of the chat using observer for the scroll down button
  useEffect(() => {
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
      });

      // Listen for previous messages
      socket.on("recieve_previous_messages", (previousMessages) => {
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

      if (socket) {
        socket.off("recieve_message");
        socket.off("recieve_previous_messages");
      }
    };
  }, [socket, room.name, username, setMessages]);

  const onType = (e) => {
    let message = e.target.value;
    setMessage(message); // Update the message state
  };

  const send = () => {
    if (!message) {
      setEmptyMessageAnimation(true); // Set the empty message animation to true
      setTimeout(() => {
        setEmptyMessageAnimation(false); // Reset the empty message animation
      }, 500);
      return; // If the message is empty, do nothing
    } // If the message is empty, do nothing
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
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => {
      return {
        ...prevMessages,
        [room.name]: [...(prevMessages[room.name] || []), messageContent], // Update the messages state for this dm
      };
    });
    socket.emit("dm", message, room.id, room.name, username, room.is_group); // Emit a message, FOR NOW ROOM IS JUST A USER
    setMessage(""); // Clear the message input

    setSendAnimation(true); // Set the send animation to true
    setTimeout(() => {
      setSendAnimation(false); // Reset the send animation
    }, 2000);
  };

  const getTimeStamp = (timestamp) => {
    const date = new Date(timestamp);

    if (isToday(date)) {
      return format(date, "hh:mm a"); // Format the timestamp to human-readable time
    } else {
      return format(date, "MMM d, yyyy - hh:mm a"); // Include the date if the message is not from today
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen">
      {room ? ( // Check if the room (recipient) is selected
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatBar room={room} /> {/* Display the chat bar */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Check if there are messages for the selected recipient */}
            {messages[room.name] ? (
              messages[room.name].map((msg, index) =>
                msg.sender === username ? (
                  // Message from the current user
                  <div className="flex justify-end mt-5" key={index}>
                    <div>
                      <div className="bg-gradient-to-r from-purple-600 from-10% to-indigo-500 ps-4 pe-5 pb-4 pt-2 inline-block max-w-[400px] border-gray-200 text-white rounded-s-xl rounded-se-xl">
                        <p className="font-bold">{msg.sender}</p>
                        <p>{msg.content}</p>
                      </div>
                      <div className="text-sm text-right pe-1">
                        {getTimeStamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Message from the recipient
                  <div className="flex justify-start mt-5" key={index}>
                    <div>
                      <div className="ps-4 pe-24 pb-4 pt-2 inline-block max-w-[320px] border-gray-200 bg-gray-100 rounded-e-xl rounded-t-xl">
                        <div style={{ fontWeight: "bold" }}>
                          <p>{msg.sender}</p>
                        </div>
                        <p style={{ fontWeight: "400" }}>{msg.content}</p>
                      </div>
                      <div className="text-sm ps-1">
                        {getTimeStamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              // If no messages, display a message
              <p className="flex justify-center my-10">
                No messages in this conversation
              </p>
            )}

            {/* Scroll to bottom button */}
            {showScrollToBottom && (
              <div className="flex justify-center">
                <button
                  className="scroll-to-bottom fixed bottom-28 text-purple-500 border-2 border-purple-500 px-2 animate-bounce 
                  transition ease-in-out delay-3 hover:bg-purple-500 hover:text-white duration-300"
                  style={{ fontSize: "1.5rem", borderRadius: "50%" }}
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
              className="bg-purple-500 text-white rounded-md px-2 h-12 ms-5 hover:bg-purple-400 overflow-hidden relative"
              onClick={send}
            >
              <img
                src="./send_icon.png"
                alt=""
                className={`h-auto w-8 mx-2 ${
                  sendAnimation ? "send-animation" : ""
                } ${emptyMessageAnimation ? "empty-message-animation" : ""}`}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-10">
          <h1>Hi {username}!</h1>
        </div>
      )}
    </div>
  );
}

export default Chat;
