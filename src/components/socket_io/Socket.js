// socket.js
import { io } from "socket.io-client";
import { GetTokenFromCookie } from "../getToken/GetToken"

let socket;

try {
  const usr = GetTokenFromCookie();
  
  // Create connection options
  const options = {
    withCredentials: true
  };
  
  // Only add userId to query if user is logged in
  if (usr && usr.id) {
    options.query = { userId: usr.id.toString() };
  } else {
  }
  
  // Create socket with reconnection options
  socket = io("http://localhost:5000", {
    ...options,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });
  
  // Log connection status for debugging
  socket.on("connect", () => {
    
    // Re-join room on reconnection if user is logged in
    const user = GetTokenFromCookie();
    if (user && user.id) {
      socket.emit("join", user.id.toString());
    }
  });

  // Group Chat Socket Events
  socket.joinGroup = (groupId) => {
    if (groupId) {
      socket.emit("joinGroup", groupId);
      /* console.log(...) */ void 0;
    }
  };

  socket.leaveGroup = (groupId) => {
    if (groupId) {
      socket.emit("leaveGroup", groupId);
      /* console.log(...) */ void 0;
    }
  };

  socket.sendGroupTyping = (groupId, isTyping, userName) => {
    if (groupId) {
      socket.emit("groupTyping", { groupId, isTyping, userName });
    }
  };

  // 1-on-1 Chat Typing Events
  socket.sendUserTyping = (receiverId, isTyping, userName) => {
    if (receiverId) {
      socket.emit("userTyping", { receiverId, isTyping, userName });
    }
  };

  // 1-on-1 Chat Typing Events
  socket.sendUserTyping = (receiverId, isTyping, userName) => {
    if (receiverId) {
      socket.emit("userTyping", { receiverId, isTyping, userName });
    }
  };

  socket.markGroupMessageRead = (messageId, groupId) => {
    if (messageId && groupId) {
      socket.emit("markGroupMessageRead", { messageId, groupId });
    }
  };
  
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  
  socket.on("reconnect", (attemptNumber) => {
    /* console.log(...) */ void 0;
  });
  
  socket.on('disconnect', (reason) => {
    /* console.log(...) */ void 0;
    
    // Attempt to reconnect
    setTimeout(() => {
      /* console.log(...) */ void 0;
      socket.connect();
      
      // Re-join room after reconnection if user is logged in
      const user = GetTokenFromCookie();
      if (user && user.id && socket.connected) {
        socket.emit("join", user.id.toString());
        
        // Request updated online users list
        socket.emit("getOnlineUsers");
      }
    }, 1000);
  });
  
  // Keep-alive ping and status update
  setInterval(() => {
    if (socket.connected) {
      socket.emit('ping');
      
      // Request updated online users with each ping
      const user = GetTokenFromCookie();
      if (user && user.id) {
        // Re-emit join to ensure user is marked as online
        socket.emit("join", user.id.toString());
        
        // Request updated online users list
        socket.emit("getOnlineUsers");
      }
    } else {
      // Try to reconnect if disconnected
      socket.connect();
    }
  }, 10000);
  
} catch (error) {
  console.error("Error initializing socket:", error);
  // Provide a fallback socket-like object to prevent app crashes
  socket = {
    on: () => {},
    off: () => {},
    emit: () => {},
    connect: () => {},
    disconnect: () => {}
  };
}

export default socket;
