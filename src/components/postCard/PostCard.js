import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaShare, FaBookmark, FaEllipsisV, FaPlayCircle } from 'react-icons/fa';
import { useQuery, useMutation } from '@apollo/client';
import { PAGES_COMMENT_LIKE_REPLY, PAGES_REPLY_TO_COMMENT, LIKE_PAGE_POST, COMMENT_PAGE_POST } from '../../graphql/mutations';
import { GetTokenFromCookie } from "../../components/getToken/GetToken";
import ShareModal from '../share/ShareModal';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
    const [token,setToken] = useState();
    const [comment, setComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReplies, setShowReplies] = useState({});
  const [likePagePost] = useMutation(LIKE_PAGE_POST)
  const [commentPagePost] = useMutation(COMMENT_PAGE_POST)
  const [pagescommentLikeReply, { loading, error }] = useMutation(PAGES_COMMENT_LIKE_REPLY);
  const [pagesReplyToComment] = useMutation(PAGES_REPLY_TO_COMMENT)

  useEffect(() => {
    const tokens = GetTokenFromCookie();
    if (tokens?.id) {
      setToken(tokens);
    }
  }, []);

  // Check if this post is from a blocked user (safety check)
  const isBlockedUserPost = post?.username === "unknown_user" || 
                           post?.createdBy?.username === "unknown_user" ||
                           post?.createdBy?.name === "Unknown User";

  // Don't render posts from blocked users
  if (isBlockedUserPost) {
    return null;
  }

        const handleLikeReply = async (commentId) => {
          console.log(post?.id, commentId, token?.id)
            if(!post?.id || !commentId || !token?.id) {return alert("all field missing")}
          try {
            const { data } = await pagescommentLikeReply({
              variables: {
                pageId : post?.id,
                commentId : commentId,
                userId : token?.id,
              },
            });
            console.log(data); // success message from server
          } catch (err) {
            console.error('Like error:', err);
          }
        };  

  const handleCommentReply = async (commentId) => {
    if (!post?.id || !commentId || !token?.id || !replyText.trim()) {
      return;
    }
    
    try {
      const { data } = await pagesReplyToComment({
        variables: {
          pageId: post.id,
          commentId: commentId,
          userId: token.id,
          text: replyText.trim()
        }
      });
      
      if (data?.pagesReplyToComment) {
        setReplyText('');
        setReplyingTo(null);
        // Show the replies after adding a new one
        setShowReplies(prev => ({
          ...prev,
          [commentId]: true
        }));
        
        // You might want to update the UI with the new reply here
        // or refresh the comments list if needed
        console.log('Reply successful:', data);
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const handleLikePagePost = async (postId) => {
    try {
      const userToken = GetTokenFromCookie();
      if (!userToken?.id) {
        return alert("Please login to like this post");
      }
      
      if (!postId) {
        console.error("Post ID is missing");
        return;
      }
      
      // Optimistic UI update
      const previousIsLiked = isLiked;
      setIsLiked(!previousIsLiked);
      
      try {
        const response = await likePagePost({
          variables: {
            userId: userToken.id,
            postId: postId,
          },
        });
        
        if (!response || !response.data || !response.data.likePagePost) {
          throw new Error("Invalid response from server");
        }
        
        console.log("✅ Like successful:", response.data.likePagePost);
        
      } catch (mutationError) {
        // Revert the optimistic update on error
        setIsLiked(previousIsLiked);
        console.error("❌ Error in like mutation:", mutationError);
        
        // Check for specific error cases
        if (mutationError.networkError) {
          console.error("Network error:", mutationError.networkError);
          alert("Network error. Please check your connection and try again.");
        } else if (mutationError.graphQLErrors && mutationError.graphQLErrors.length > 0) {
          console.error("GraphQL errors:", mutationError.graphQLErrors);
          alert("Error processing your like. Please try again.");
        } else {
          console.error("Unexpected error:", mutationError);
          alert("An unexpected error occurred. Please try again.");
        }
      }
      
    } catch (err) {
      console.error("❌ Unexpected error in handleLikePagePost:", err);
      alert("An error occurred. Please try again.");
    }
  };


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    const userToken = GetTokenFromCookie();
    if (!userToken?.id) {
      return alert("Please login to comment");
    }
    
    if (!commentText.trim()) {
      alert("Comment khaali nahi ho sakta!");
      return;
    }

    try {
      const response = await commentPagePost({
        variables: {
          userId: userToken?.id,
          postId: post.id,
          comment: commentText.trim(),
        },
      });

      console.log("✅ Comment response:", response);
      setCommentText(""); // Clear input
      setShowCommentInput(false); // Hide comment input
      
      // You might want to refresh comments here or update the UI accordingly
      
    } catch (err) {
      console.error("❌ Error while commenting:", err);
      alert("Comment bhejne me error aaya. Please try again.");
    }
  };


  

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-5 relative">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2.5">
          <img 
            src={post.userAvatar} 
            alt={post.username} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{post.username}</span>
            <span className="text-xs text-gray-500">{post.timeAgo}</span>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <FaEllipsisV className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {post.caption && (
          <p className="px-4 py-3 text-sm text-gray-800">
            {post.caption}
          </p>
        )}
        
        <div className="relative group">
          {post.type === 'image' ? (
            <img 
              src={post.media} 
              alt="Post content" 
              className="w-full max-h-[700px] object-cover bg-black block transition-transform duration-300 group-hover:opacity-95" 
            />
          ) : (
            <div className="relative">
              <video 
                controls 
                className="w-full max-h-[700px] object-contain bg-black block"
              >
                <source src={post.media} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black bg-opacity-50 rounded-full p-3">
                  <FaPlayCircle className="text-white text-2xl" />
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons Overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => {handleLikePagePost(post.id)}}
              className={`flex flex-col items-center text-white bg-black bg-opacity-60 rounded-full p-3 hover:bg-opacity-80 transition-all`}
            >
              <FaHeart className={`text-xl ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} />
              <span className="text-xs mt-1">{(post.likes.length || 0)}</span>
            </button>
            
            <button 
              className="flex flex-col items-center text-white bg-black bg-opacity-60 rounded-full p-3 hover:bg-opacity-80 transition-all"
            >
              <FaShare className="text-xl" />
              <span className="text-xs mt-1">Share</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="relative">
        {/* Action Buttons */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex space-x-4">
            <button 
              className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-600'} hover:bg-gray-100`}
              onClick={() => {handleLikePagePost(post.id)}}
            >
              <FaHeart className={isLiked ? 'fill-current' : ''} />
              <span className="text-xs font-medium ml-1">{(post.likes.length || 0)}</span>
            </button>
            
            <button 
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={() => setShowCommentInput(!showCommentInput)}
            >
              <FaComment />
              <span className="text-xs font-medium ml-1">{post.comments?.length || 0}</span>
            </button>
            
            <button 
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={() => setShowShareModal(true)}
            >
              <FaShare />
            </button>
          </div>
          
          <button 
            className={`p-2 rounded-full ${isSaved ? 'text-purple-700' : 'text-gray-600'} hover:bg-gray-100`}
            onClick={() => setIsSaved(!isSaved)}
          >
            <FaBookmark />
          </button>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200">
          {/* Comment Input */}
          {showCommentInput && (
            <div className="px-4 py-3 bg-white">
              <div className="flex items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(e)}
                />
                <button 
                  onClick={handleCommentSubmit}
                  className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 max-h-48 overflow-y-auto">
              {post.comments.map((comment, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <img 
                        src={comment.userAvatar || '/default-avatar.png'} 
                        alt={comment.username} 
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="flex items-center">
                        <span className="font-semibold text-sm text-gray-900">{comment.username}</span>
                        {comment.userId === post.userId && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Author
                          </span>
                        )}
                        <span className="mx-1.5 text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                      </div>
                      <div className="mt-1 bg-gray-100 rounded-2xl px-3 py-2">
                        <p className="text-sm text-gray-800">{comment.text}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <button 
                            className="text-xs text-gray-500 hover:text-blue-500 flex items-center"
                            onClick={() => handleLikeReply(comment.id)}
                          >
                            <FaHeart className={`mr-1 ${comment.likes?.some(like => like.user?.id === token?.id) ? 'text-red-500' : ''}`} />
                            {comment.likes?.length || 0}
                          </button>
                          <button 
                            className="text-xs text-gray-500 hover:text-blue-500 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Comment replies:', comment.replies); // Debug log
                              setShowReplies(prev => ({
                                ...prev,
                                [comment.id]: !prev[comment.id]
                              }));
                            }}
                          >
                            <FaComment className="mr-1" />
                            {Array.isArray(comment.replies) ? comment.replies.length : 0}
                          </button>
                          <button 
                            className="text-xs text-gray-500 hover:text-blue-500 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingTo(replyingTo === comment.id ? null : comment.id);
                            }}
                          >
                            Reply
                          </button>
                        </div>
                        {replyingTo === comment.id && (
                          <div className="mt-2 flex space-x-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 text-sm border rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Write a reply..."
                              onKeyPress={(e) => e.key === 'Enter' && handleCommentReply(comment.id)}
                            />
                            <button
                              onClick={() => handleCommentReply(comment.id)}
                              className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-600 focus:outline-none"
                            >
                              Send
                            </button>
                          </div>
                        )}
                        
                        {/* Display Replies */}
                        {Array.isArray(comment.replies) && comment.replies.length > 0 && showReplies[comment.id] && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200">
                            {comment.replies.map((reply, replyIndex) => (
                              <div key={replyIndex} className="mb-3">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-2">
                                    <img 
                                      src={reply.user?.profileImage || '/default-avatar.png'}
                                      alt={reply.user?.username || 'User'}
                                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <span className="font-semibold text-xs text-gray-900">{reply.user?.title || 'User'}</span>
                                      <span className="mx-1.5 text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">{reply.timeAgo || 'Just now'}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-0.5 pl-0">{reply.text}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* <div className="mt-1 flex space-x-4 text-xs text-gray-500">
                        <button className="hover:text-gray-700">Like</button>
                        <button className="hover:text-gray-700">Reply</button>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        contentType="post"
        contentData={{
          id: post.id,
          imageUrl: post.media,
          videoUrl: post.type === 'video' ? post.media : null,
          caption: post.caption,
          user: post.user || { id: post.userId, name: post.username }
        }}
      />
    </div>
  );
};

export default PostCard;
