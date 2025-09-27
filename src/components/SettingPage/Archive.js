import React, { useEffect, useState, useRef } from "react";
import PageShell from "./PageShell";
import { GET_ARCHIVED_POSTS, GET_ACHIVE_STORIES } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';
import { useQuery } from '@apollo/client';
import { FaHeart, FaComment, FaBookmark, FaEllipsisV, FaTimes } from 'react-icons/fa';
import ArchivePreview from './ArchivePreview';


export default function Archive() {
  const [token, setToken] = useState();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const modalRef = useRef(null);

	 useEffect(() => {
		  const decodedUser = GetTokenFromCookie();
		  /* console.log(...) */ void 0;
		  if(decodedUser?.id){
			setToken(decodedUser);
		  }
		}, []);


	  const { data: archivePostsData, refetch: refetchArchivedPosts } = useQuery(GET_ARCHIVED_POSTS, {
		variables: { userId: token?.id?.toString() },
		skip: !token?.id,
		fetchPolicy: 'cache-and-network'
	  });
       /* console.log(...) */ void 0;


	     const { data: archiveStoryData, refetch: refetchArchivedStory } = useQuery(GET_ACHIVE_STORIES, {
		variables: { userId: token?.id?.toString() },
		skip: !token?.id,
		fetchPolicy: 'cache-and-network'
	  });
	   
	const [category, setCategory] = useState("posts");

	return (
		<PageShell title="Archive">
			<div style={{ display: 'flex', gap: 0, marginBottom: 24, width: '100%' }}>
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
						fontSize: 16,
						marginRight: 8
					}}
				>
					Posts
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
						fontSize: 16,
						marginLeft: 8
					}}
				>
					Stories
				</button>
			</div>

			{/* Content area */}
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
				{/* Posts Section */}
				{category === "posts" && (
					archivePostsData?.getArchivedPosts?.length > 0 ? (
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
							{archivePostsData.getArchivedPosts.map(post => (
								<div 
							  key={post.id} 
							  style={{ 
								borderRadius: '12px', 
								overflow: 'hidden',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								display: 'flex',
								flexDirection: 'column',
								backgroundColor: '#fff',
								position: 'relative',
								cursor: 'pointer',
								transition: 'transform 0.2s',
								':hover': {
									transform: 'scale(1.02)'
								}
							  }}
							  onClick={() => {
								const postIndex = archivePostsData.getArchivedPosts.findIndex(p => p.id === post.id);
								setCurrentPostIndex(postIndex);
								setViewerOpen(true);
								document.body.style.overflow = 'hidden';
							  }}
							>
									<div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
										{post.imageUrl ? (
											<img 
												src={post.imageUrl} 
												alt={post.title || "Archived Post"} 
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
												alt={post.title || "Archived Post"}
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
									<div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
										<div style={{ 
											display: 'flex', 
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: '8px'
										}}>
											<span style={{ fontWeight: '600', fontSize: '14px' }}>Archived Post</span>
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
						<div style={{ width: '100%', textAlign: 'center', padding: '40px 20px', color: '#666' }}>
							<div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
							<div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>No archived posts yet</div>
							<div style={{ fontSize: '14px', color: '#8e8e8e' }}>
								When you archive posts, they'll appear here
							</div>
						</div>
					)
				)}

				{/* Stories Section */}
				{category === "stories" && (
					archiveStoryData?.getStories?.length > 0 ? (
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
							{archiveStoryData.getStories.map(story => (
								<div 
							  key={story.id} 
							  style={{ 
								borderRadius: '12px', 
								overflow: 'hidden',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								display: 'flex',
								flexDirection: 'column',
								backgroundColor: '#fff',
								position: 'relative',
								cursor: 'pointer',
								transition: 'transform 0.2s',
								':hover': {
									transform: 'scale(1.02)'
								}
							  }}
							  onClick={() => {
								const storyIndex = archiveStoryData.getStories.findIndex(s => s.id === story.id);
								setCurrentPostIndex(storyIndex);
								setViewerOpen(true);
								document.body.style.overflow = 'hidden';
							  }}
							>
								<div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
									{story.mediaType === "image" ? (
										<img 
											src={story.mediaUrl || "https://via.placeholder.com/150"} 
											alt="Archived Story"
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												width: '100%',
												height: '100%',
												objectFit: 'cover'
											}}
										/>
									) : story.mediaType === "video" ? (
										<video 
											src={story.mediaUrl || "https://via.placeholder.com/150"} 
											alt="Archived Story"
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												width: '100%',
												height: '100%',
												objectFit: 'cover'
											}}
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
								<div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
									<div style={{ 
										display: 'flex', 
										justifyContent: 'space-between',
										alignItems: 'center',
										marginBottom: '8px'
									}}>
										<span style={{ fontWeight: '600', fontSize: '14px' }}>Archived Story</span>
										<FaEllipsisV style={{ color: '#8e8e8e', cursor: 'pointer' }} />
									</div>
									{story.caption && (
										<div style={{ 
											fontSize: '14px', 
											color: '#262626',
											marginBottom: '8px',
											wordBreak: 'break-word'
										}}>
											{story.caption.length > 100 
												? `${story.caption.substring(0, 100)}...` 
												: story.caption}
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
												<span style={{ fontSize: '12px' }}>{story.likes?.length || 0}</span>
											</span>
											<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
												<FaComment style={{ color: '#8e8e8e' }} />
												<span style={{ fontSize: '12px' }}>{story.comments?.length || 0}</span>
											</span>
										</div>
										<FaBookmark style={{ color: '#262626' }} />
									</div>
								</div>
							</div>
							))}
						</div>
						) : (
							<div style={{ width: '100%', textAlign: 'center', padding: '40px 20px', color: '#666' }}>
								<div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
								<div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>No archived stories yet</div>
								<div style={{ fontSize: '14px', color: '#8e8e8e' }}>
									When you archive stories, they'll appear here
								</div>
							</div>
						)
				)}
			</div>
		{viewerOpen && category === 'posts' && archivePostsData?.getArchivedPosts?.length > 0 && (
		  <ArchivePreview 
			posts={archivePostsData.getArchivedPosts}
			initialIndex={currentPostIndex}
			onClose={() => {
			  setViewerOpen(false);
			  document.body.style.overflow = 'auto';
			}}
		  />
		)}

		{viewerOpen && category === 'stories' && archiveStoryData?.getStories?.length > 0 && (
		  <ArchivePreview 
			posts={archiveStoryData.getStories}
			initialIndex={currentPostIndex}
			onClose={() => {
			  setViewerOpen(false);
			  document.body.style.overflow = 'auto';
			}}
		  />
		)}
		</PageShell>
	);
}