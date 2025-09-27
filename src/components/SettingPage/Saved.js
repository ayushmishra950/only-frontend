import React, { useState, useEffect } from "react";
import PageShell from "./PageShell";
import { GET_SAVED_POSTS, ALL_SAVED_REELS, GET_USER_LIKED_VIDEOS } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';
import { useQuery, useMutation } from '@apollo/client';
import { FaHeart, FaComment, FaBookmark, FaEllipsisV } from 'react-icons/fa';

export default function Saved() {
  const [category, setCategory] = useState("posts");
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [token, setToken] = useState();

   useEffect(() => {
        const decodedUser = GetTokenFromCookie();
        /* console.log(...) */ void 0;
        if(decodedUser?.id){
          setToken(decodedUser);
        }
      }, []);

    const { data, loading, error, refetch } = useQuery(GET_SAVED_POSTS, {
      variables: {userId : token?.id.toString()}
    });  
  
      const { data: videoData } = useQuery(GET_SAVED_POSTS, { variables: { userId: token?.id } })
       /* console.log(...) */ void 0;

        const { data: savedReelsData, refetch: refetchSavedReels } = useQuery(ALL_SAVED_REELS, {
           variables: { userId: token?.id?.toString() },
         });
       
         /* console.log(...) */ void 0;

  // Update saved posts when data is received
  useEffect(() => {
    if (data?.getSavedPosts) {
      setSavedPosts(data.getSavedPosts);
    }
  }, [data]);

  // Update saved reels when data is received
  useEffect(() => {
    if (savedReelsData?.allSavedReels) {
      setSavedReels(savedReelsData.allSavedReels);
    }
  }, [savedReelsData]);

  // Update saved stories (Videos tab) using data from line 27
  useEffect(() => {
    if (videoData?.getSavedPosts) {
      setSavedStories(videoData.getSavedPosts);
    }
  }, [videoData]);

  return (
    <PageShell title="Saved">
      {/* Three category buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, width: '100%' }}>
        <button
          onClick={() => setCategory("posts")}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: '20px 0 0 20px',
            border: 'none',
            background: category === "posts" ? '#007bff' : '#f0f0f0',
            color: category === "posts" ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Posts
        </button>
        <button
          onClick={() => setCategory("reels")}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: '0',
            border: 'none',
            background: category === "reels" ? '#007bff' : '#f0f0f0',
            color: category === "reels" ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Reels
        </button>
        <button
          onClick={() => setCategory("stories")}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: '0 20px 20px 0',
            border: 'none',
            background: category === "stories" ? '#007bff' : '#f0f0f0',
            color: category === "stories" ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Videos
        </button>
      </div>

      {/* Content area */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {/* Posts Section */}
        {/* {category === "posts" && (
          savedPosts.length > 0 ? (
            savedPosts.map(post => (
              <div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                {post.imageUrl ? (
                  <img 
                    src={post.imageUrl} 
                    alt={post.caption || "Saved Post"} 
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                  />
                ) 
                :
                 post.videoUrl ? (
                  <video 
                    src={post.videoUrl} 
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    controls
                    muted
                  />
                  
                ) : (
                  <img 
                    src="https://via.placeholder.com/150" 
                    alt={post.caption || "Saved Post"} 
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                  />
                )}
                <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.caption || "No caption"}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                  {post.savedAt ? new Date(post.savedAt).toLocaleDateString() : 'Recently saved'}
                </div>
                
              </div>

            ))
          )
           : (
            <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>📝</div>
              <div>No saved posts yet</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                Bookmark posts to see them here
              </div>
            </div>
          )
        )} */}





          {/* {category === "posts" && (
          savedPosts.length > 0 ? (
            savedPosts.map(post => (
              <div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                <img 
                  src={post.imageUrl} 
                  alt={post.title || "Saved Reel"} 
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                />
                <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.title || post.description || "No title"}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                  {new Date(post.savedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>🎬</div>
              <div>No saved reels yet</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                Bookmark reels to see them here
              </div>
            </div>
          )
        )} */}



        {/* Posts Section */}
        {category === "posts" && (
          savedPosts?.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '24px', 
              width: '100%',
              padding: '0 20px'
            }}>
              {savedPosts.map(post => (
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
                  {/* Media Container */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.caption || "Saved Post"} 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} 
                      />
                    ) : post.videoUrl ? (
                      <video 
                        src={post.videoUrl} 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} 
                        controls
                        muted
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No media available
                      </div>
                    )}
                  </div>

                  {/* Post Info */}
                  <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>Saved Post</span>
                      <FaEllipsisV style={{ color: '#8e8e8e', cursor: 'pointer' }} />
                    </div>
                    
                    {post.caption && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#262626',
                        marginBottom: '8px',
                        wordBreak: 'break-word'
                      }}>
                        {post.caption.length > 100 
                          ? `${post.caption.substring(0, 100)}...` 
                          : post.caption}
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaHeart style={{ color: '#ed4956' }} />
                          <span style={{ fontSize: '12px' }}>{post.likes?.length || 0}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaComment style={{ color: '#8e8e8e' }} />
                          <span style={{ fontSize: '12px' }}>{post.comments?.length || 0}</span>
                        </span>
                      </div>
                      <FaBookmark style={{ color: '#262626' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#666' 
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px' 
              }}>
                📦
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                No saved posts yet
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#8e8e8e' 
              }}>
                When you save posts, they'll appear here
              </div>
            </div>
          )
        )}

        {/* Reels Section */}
        {category === "reels" && (
          savedReels?.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '24px', 
              width: '100%',
              padding: '0 20px'
            }}>
              {savedReels.map(reel => (
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
                    {reel.thumbnailUrl || reel.videoUrl ? (
                      <>
                        <img 
                          src={reel.thumbnailUrl || reel.videoUrl} 
                          alt={reel.title || "Saved Reel"} 
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No thumbnail available
                      </div>
                    )}
                  </div>

                  {/* Reel Info */}
                  <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>Saved Reel</span>
                      <FaEllipsisV style={{ color: '#8e8e8e', cursor: 'pointer' }} />
                    </div>
                    
                    {reel.title && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#262626',
                        marginBottom: '8px',
                        wordBreak: 'break-word'
                      }}>
                        {reel.title.length > 100 
                          ? `${reel.title.substring(0, 100)}...` 
                          : reel.title}
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaHeart style={{ color: '#ed4956' }} />
                          <span style={{ fontSize: '12px' }}>{reel.likes?.length || 0}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaComment style={{ color: '#8e8e8e' }} />
                          <span style={{ fontSize: '12px' }}>{reel.comments?.length || 0}</span>
                        </span>
                      </div>
                      <FaBookmark style={{ color: '#262626' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#666' 
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px' 
              }}>
                🎬
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                No saved reels yet
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#8e8e8e' 
              }}>
                When you save reels, they'll appear here
              </div>
            </div>
          )
        )}

      </div>
    </PageShell>
  );
}