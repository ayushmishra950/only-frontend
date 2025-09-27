// Backend Example: How to add blocked user checks in GraphQL resolvers

// Example middleware function to check if user is blocked
const checkUserBlocked = (user) => {
  if (user && user.is_blocked === true) {
    throw new Error("User is blocked");
  }
};

// Example GraphQL resolvers with blocked user checks

const resolvers = {
  Query: {
    // GET_ME resolver
    getMe: async (parent, args, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        // Get fresh user data from database
        const userData = await User.findById(user.id);
        
        // ✅ Double check from database
        if (userData && userData.is_blocked === true) {
          throw new Error("User is blocked");
        }
        
        return userData;
      } catch (error) {
        throw error;
      }
    },

    // GET_USER_INFO resolver
    getUserInformation: async (parent, { id }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if current user is blocked
        checkUserBlocked(user);
        
        // Get target user data
        const targetUser = await User.findById(id);
        
        if (!targetUser) {
          throw new Error("User not found");
        }
        
        return targetUser;
      } catch (error) {
        throw error;
      }
    },

    // GET_POSTS resolver
    getPosts: async (parent, args, { user }) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        const posts = await Post.find().populate('author');
        return posts;
      } catch (error) {
        throw error;
      }
    },

    // GET_MESSAGES resolver
    getMessages: async (parent, { receiverId }, { user }) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        const messages = await Message.find({
          $or: [
            { sender: user.id, receiver: receiverId },
            { sender: receiverId, receiver: user.id }
          ]
        }).sort({ createdAt: 1 });
        
        return messages;
      } catch (error) {
        throw error;
      }
    },

    // GET_USER_NOTIFICATIONS resolver
    getUserNotifications: async (parent, args, { user }) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        const notifications = await Notification.find({ 
          recipient: user.id 
        }).sort({ createdAt: -1 });
        
        return notifications;
      } catch (error) {
        throw error;
      }
    }
  },

  Mutation: {
    // CREATE_POST resolver
    createPost: async (parent, { content, image }, { user }) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        const newPost = new Post({
          content,
          image,
          author: user.id,
          createdAt: new Date()
        });
        
        await newPost.save();
        return newPost;
      } catch (error) {
        throw error;
      }
    },

    // SEND_MESSAGE resolver
    sendMessage: async (parent, { receiverId, content }, { user }) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        const newMessage = new Message({
          sender: user.id,
          receiver: receiverId,
          content,
          createdAt: new Date()
        });
        
        await newMessage.save();
        return newMessage;
      } catch (error) {
        throw error;
      }
    },

    // LIKE_POST resolver
    likePost: async (parent, { postId }, { user }) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        const post = await Post.findById(postId);
        
        if (!post) {
          throw new Error("Post not found");
        }
        
        // Toggle like logic here
        // ...
        
        return post;
      } catch (error) {
        throw error;
      }
    },

    // FOLLOW_USER resolver
    followAndUnfollow: async (parent, { id }, { user }) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }
        
        // ✅ Check if user is blocked
        checkUserBlocked(user);
        
        const targetUser = await User.findById(id);
        
        if (!targetUser) {
          throw new Error("User not found");
        }
        
        // Follow/unfollow logic here
        // ...
        
        return targetUser;
      } catch (error) {
        throw error;
      }
    }
  }
};

// Example authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return next(); // No token, continue without user
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      // Clear invalid cookie
      res.clearCookie('token');
      return next();
    }
    
    // ✅ Check if user is blocked at middleware level
    if (user.is_blocked === true) {
      // Clear cookie for blocked user
      res.clearCookie('token');
      throw new Error("User is blocked");
    }
    
    // Add user to request context
    req.user = user;
    next();
    
  } catch (error) {
    // Clear cookie on any auth error
    res.clearCookie('token');
    throw error;
  }
};

module.exports = {
  resolvers,
  authMiddleware,
  checkUserBlocked
};