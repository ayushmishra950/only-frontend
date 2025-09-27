import React, { useEffect, useState } from "react";
import PageShell from "./PageShell";
import { useQuery } from "@apollo/client";
import { GET_LIKED_IMAGE_POSTS_BY_USER, GET_LIKED_VIDEO_POSTS_BY_USER, GET_LIKED_REELS_BY_USER } from "../../graphql/mutations";
import { GET_COMMENTED_IMAGE_POSTS_BY_USER, GET_COMMENTED_VIDEO_POSTS_BY_USER, GET_COMMENTED_REELS_BY_USER } from "../../graphql/mutations";
import { GetTokenFromCookie } from '../getToken/GetToken';
import { FaHeart, FaComment, FaBookmark } from 'react-icons/fa';

export default function YourActivity() {
  const [category, setCategory] = useState("likes");
  const [subCategory, setSubCategory] = useState("reel");
  const [likesMenu, setLikesMenu] = useState(false);
  const [commentsMenu, setCommentsMenu] = useState(false);
      const [token, setToken] = useState();

      useEffect(() => {
            const decodedUser = GetTokenFromCookie();
            if(decodedUser?.id){
            setToken(decodedUser);
            }
          }, []);
      


          const { data: reelLikeData } = useQuery(GET_LIKED_REELS_BY_USER, { variables: { userId: token?.id } })
          const { data: videoLikeData } = useQuery(GET_LIKED_VIDEO_POSTS_BY_USER, { variables: { userId: token?.id } })
          const { data: postLikeData } = useQuery(GET_LIKED_IMAGE_POSTS_BY_USER, { variables: { userId: token?.id } })
  // Fetch commented data
  const { data: postCommentData } = useQuery(GET_COMMENTED_IMAGE_POSTS_BY_USER, {
    variables: { userId: token?.id },
    skip: category !== 'comments' || subCategory !== 'post'
  });

  const { data: videoCommentData } = useQuery(GET_COMMENTED_VIDEO_POSTS_BY_USER, {
    variables: { userId: token?.id },
    skip: category !== 'comments' || subCategory !== 'video'
  });

  const { data: reelCommentData } = useQuery(GET_COMMENTED_REELS_BY_USER, {
    variables: { userId: token?.id },
    skip: category !== 'comments' || subCategory !== 'reel'
  });

  // Helper function to get comment count
  const getCommentCount = (comments) => {
    if (!comments) return 0;
    if (Array.isArray(comments)) return comments.length;
    if (typeof comments === 'object' && comments !== null) {
      // Handle case where comments is an object with a text property
      return comments.text ? 1 : 0;
    }
    return 0;
  };

  // Helper function to get comment text
  const getCommentText = (comments) => {
    if (!comments) return '';
    if (Array.isArray(comments) && comments.length > 0) {
      return comments[0].text || '';
    }
    if (typeof comments === 'object' && comments !== null && comments.text) {
      return comments.text;
    }
    return '';
  };

  const handleTab = (tab) => {
    setCategory(tab);
    setSubCategory("reel"); // Reset to reel when switching tabs
    setLikesMenu(false);
    setCommentsMenu(false);
  };

  // Ek time par ek hi menu khule
  const handleLikesMenu = () => {
    setLikesMenu(!likesMenu);
    setCommentsMenu(false);
  };
  const handleCommentsMenu = () => {
    setCommentsMenu(!commentsMenu);
    setLikesMenu(false);
  };

  return (
    <PageShell title="Your Activity" noBorder>
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, width: '100%', background: 'none', boxShadow: 'none', border: 'none', outline: 'none' }}>
        <style>{`
          .activity-tab-btn {
            flex: 1;
            padding: 12px 0;
            border-radius: 20px 0 0 20px;
            border: none;
            background: none;
            color: #333;
            font-weight: 600;
            cursor: pointer;
            font-size: 16px;
            margin-right: 8px;
            transition: background 0.2s, color 0.2s;
          }
          .activity-tab-btn.selected {
            background: #007bff;
            color: #fff;
          }
          .activity-tab-btn:last-child {
            border-radius: 0 20px 20px 0;
            margin-right: 0;
            margin-left: 8px;
          }
        `}</style>
        <button
          onClick={() => handleTab("likes")}
          className={`activity-tab-btn${category === "likes" ? " selected" : ""}`}
        >
          Your Likes
        </button>
        <button
          onClick={() => handleTab("comments")}
          className={`activity-tab-btn${category === "comments" ? " selected" : ""}`}
        >
          Your Comments
        </button>
      </div>
      {/* Like/Comment options just below tabs */}
      {category === "likes" && (
        <div style={{ width: '100%', display: 'flex', gap: 32, margin: '0 0 24px 0', justifyContent: 'flex-start', background: 'none', boxShadow: 'none', border: 'none', outline: 'none' }}>
          <style>{`
            .activity-type-btn {
              padding: 12px 22px;
              border-radius: 18px;
              border: none;
              background: #f0f4ff;
              color: #2563eb;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.06);
              cursor: pointer;
              transition: background 0.2s, color 0.2s;
              outline: none;
            }
            .activity-type-btn:hover {
              background: #2563eb;
              color: #fff;
            }
            .activity-type-btn.selected {
              background: #2563eb;
              color: #fff;
            }
          `}</style>
          <button 
            className={`activity-type-btn ${subCategory === "reel" ? "selected" : ""}`}
            onClick={() => setSubCategory("reel")}
          >
            Reel
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "post" ? "selected" : ""}`}
            onClick={() => setSubCategory("post")}
          >
            Post
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "video" ? "selected" : ""}`}
            onClick={() => setSubCategory("video")}
          >
            Video
          </button>
        </div>
      )}
      {category === "comments" && (
        <div style={{ width: '100%', display: 'flex', gap: 32, margin: '0 0 24px 0', justifyContent: 'flex-start', background: 'none', boxShadow: 'none', border: 'none', outline: 'none' }}>
          <style>{`
            .activity-type-btn {
              padding: 12px 22px;
              border-radius: 18px;
              border: none;
              background: #f0f4ff;
              color: #2563eb;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.06);
              cursor: pointer;
              transition: background 0.2s, color 0.2s;
              outline: none;
            }
            .activity-type-btn:hover {
              background: #2563eb;
              color: #fff;
            }
            .activity-type-btn.selected {
              background: #2563eb;
              color: #fff;
            }
          `}</style>
          <button 
            className={`activity-type-btn ${subCategory === "reel" ? "selected" : ""}`}
            onClick={() => setSubCategory("reel")}
          >
            Reel
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "post" ? "selected" : ""}`}
            onClick={() => setSubCategory("post")}
          >
            Post
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "video" ? "selected" : ""}`}
            onClick={() => setSubCategory("video")}
          >
            Video
          </button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%', padding: '0 20px' }}>
        {/* Likes Section Data */}
        {category === "likes" && (
          <>
            {subCategory === "reel" && reelLikeData?.getLikedReelsByUser && (
              reelLikeData.getLikedReelsByUser.map(reel => (
                <div 
                  key={reel.id} 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  {/* Reel Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '133.33%' }}>
                    {reel.videoUrl || reel.thumbnailUrl ? (
                      <>
                        <img 
                          src={reel.thumbnailUrl || reel.videoUrl} 
                          alt={reel.title || "Liked Reel"} 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px'
                        }}>
                          ▶
                        </div>
                      </>
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No media available
                      </div>
                    )}
                  </div>
                  
                  {/* Reel Info */}
                  <div style={{ 
                    padding: '12px', 
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {reel.title || reel.caption || 'Liked Reel'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span><FaHeart style={{ marginRight: '4px' }} /> {reel.likes || 0}</span>
                        <span><FaComment style={{ marginRight: '4px' }} /> {getCommentCount(reel.comments)}</span>
                      </div>
                    </div>
                    <div style={{ color: '#666' }}>
                      <FaBookmark />
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "post" && postLikeData?.getLikedImagePostsByUser && (
              postLikeData.getLikedImagePostsByUser.map(post => (
                <div 
                  key={post.id} 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  {/* Post Image */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.caption || "Liked Post"} 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} 
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No image available
                      </div>
                    )}
                  </div>
                  
                  {/* Post Info */}
                  <div style={{ 
                    padding: '12px', 
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {post.caption || 'Liked Post'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span><FaHeart style={{ marginRight: '4px' }} /> {post.likes || 0}</span>
                        <span><FaComment style={{ marginRight: '4px' }} /> {getCommentCount(post.comments)}</span>
                      </div>
                    </div>
                    <div style={{ color: '#666' }}>
                      <FaBookmark />
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "video" && videoLikeData?.getLikedVideoPostsByUser && (
              videoLikeData.getLikedVideoPostsByUser.map(video => (
                <div 
                  key={video.id} 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  {/* Video Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '133.33%' }}>
                    {video.videoUrl || video.thumbnailUrl ? (
                      <>
                        <img 
                          src={video.thumbnailUrl || video.videoUrl} 
                          alt={video.title || "Liked Video"} 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px'
                        }}>
                          ▶
                        </div>
                      </>
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No video available
                      </div>
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div style={{ 
                    padding: '12px', 
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {video.title || video.caption || 'Liked Video'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span><FaHeart style={{ marginRight: '4px' }} /> {video.likes || 0}</span>
                        <span><FaComment style={{ marginRight: '4px' }} /> {getCommentCount(video.comments)}</span>
                      </div>
                    </div>
                    <div style={{ color: '#666' }}>
                      <FaBookmark />
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Comments Section Data */}
        {category === "comments" && (
          <>
            {subCategory === "reel" && reelCommentData?.getCommentedReelsByUser && (
              reelCommentData.getCommentedReelsByUser.map(reel => (
                <div 
                  key={reel.id} 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  {/* Reel Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '133.33%' }}>
                    {reel.videoUrl || reel.thumbnailUrl ? (
                      <>
                        <img 
                          src={reel.thumbnailUrl || reel.videoUrl} 
                          alt={reel.title || "Commented Reel"} 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px'
                        }}>
                          ▶
                        </div>
                      </>
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No media available
                      </div>
                    )}
                  </div>
                  
                  {/* Reel Info */}
                  <div style={{ 
                    padding: '12px', 
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {reel.title || reel.caption || getCommentText(reel.comments) || 'Commented Reel'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span><FaHeart style={{ marginRight: '4px' }} /> {reel.likes || 0}</span>
                        <span><FaComment style={{ marginRight: '4px' }} /> {getCommentCount(reel.comments)}</span>
                      </div>
                    </div>
                    <div style={{ color: '#666' }}>
                      <FaBookmark />
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "post" && postCommentData?.getCommentedImagePostsByUser && (
              postCommentData.getCommentedImagePostsByUser.map(post => (
                <div 
                  key={post.id} 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  {/* Post Image */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.caption || "Commented Post"} 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} 
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No image available
                      </div>
                    )}
                  </div>
                  
                  {/* Post Info */}
                  <div style={{ 
                    padding: '12px', 
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {post.caption || getCommentText(post.comments) || 'Commented Post'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span><FaHeart style={{ marginRight: '4px' }} /> {post.likes || 0}</span>
                        <span><FaComment style={{ marginRight: '4px' }} /> {getCommentCount(post.comments)}</span>
                      </div>
                    </div>
                    <div style={{ color: '#666' }}>
                      <FaBookmark />
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "video" && videoCommentData?.getCommentedVideoPostsByUser && (
              videoCommentData.getCommentedVideoPostsByUser.map(video => (
                <div 
                  key={video.id} 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  {/* Video Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '133.33%' }}>
                    {video.videoUrl || video.thumbnailUrl ? (
                      <>
                        <img 
                          src={video.thumbnailUrl || video.videoUrl} 
                          alt={video.title || "Commented Video"} 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px'
                        }}>
                          ▶
                        </div>
                      </>
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No video available
                      </div>
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div style={{ 
                    padding: '12px', 
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {video.title || video.caption || getCommentText(video.comments) || 'Commented Video'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span><FaHeart style={{ marginRight: '4px' }} /> {video.likes || 0}</span>
                        <span><FaComment style={{ marginRight: '4px' }} /> {getCommentCount(video.comments)}</span>
                      </div>
                    </div>
                    <div style={{ color: '#666' }}>
                      <FaBookmark />
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}