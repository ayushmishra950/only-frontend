import { gql } from "@apollo/client";

export const PAGES_COMMENT_LIKE_REPLY = gql`
  mutation PagesCommentLikeReply($pageId: ID!, $commentId: ID!, $userId: ID!) {
    pagescommentLikeReply(pageId: $pageId, commentId: $commentId, userId: $userId)
  }
`;

export const PAGES_REPLY_TO_COMMENT = gql`
  mutation PagesReplyToComment($pageId: ID!, $commentId: ID!, $userId: ID!, $text: String!) {
    pagesReplyToComment(pageId: $pageId, commentId: $commentId, userId: $userId, text: $text)
  }
`;

export const GET_ALL_PAGES = gql`
  query GetAllPages {
    getAllPages {
      id
      title
      category
      description
      profileImage
      coverImage
      createdBy {
        id
      }
      likedBy {
        id
      }
      createdAt
    }
  }
`;

export const ALL_GET_PAGE_POSTS = gql`
  query GetPagePosts($pageId: ID!) {
    getPagePosts(pageId: $pageId) {
      id
      caption
      imageUrl
      videoUrl
      createdAt
      createdBy {
        id
        title
        profileImage
      }
      likes {
       user{
       id
       }
      }
       comments {
       id
        text
        user {
          id
        }
        likes {
          user {
            id
          }
        }
          replies{
          id
          text
          user{
          id
          
}
          }
       }

    }
  }
`;


export const LIKE_PAGE_POST = gql`
  mutation LikePagePost($userId: ID!, $postId: ID!) {
    likePagePost(userId: $userId, postId: $postId)
  }
`;

export const COMMENT_PAGE_POST = gql`
mutation CommentPagePost($userId: ID!, $postId: ID!, $comment: String!) {
  commentPagePost(userId: $userId, postId: $postId, comment: $comment)
}
`;



export const ADD_CATEGORY_PAGE = gql`
  mutation AddCategoryPage($name: String!, $userId: ID!) {
    addCategoryPage(name: $name, userId: $userId) {
      id
      name
      createdAt
    }
  }
`;
export const DELETE_PAGE = gql`
  mutation DeletePage($pageId: ID!, $userId: ID!) {
    deletePage(pageId: $pageId, userId: $userId)
  }
`;

export const DELETE_CATEGORY_PAGE = gql`
  mutation DeleteCategoryPage($id: ID!, $userId: ID!) {
    deleteCategoryPage(id: $id, userId: $userId)
  }
`;

export const GET_ALL_CATEGORIES_PAGES = gql`
  query GetAllCategoriesPages {
    getAllCategoriesPages {  
      id
      name
      createdAt
      createdBy {
        id
        name
      }
    }
  }
`;

export const CREATE_PAGE = gql`
  mutation CreatePage(
    $title: String!
    $category: String!
    $description: String
    $userId: ID!
    $profileImage: Upload
    $coverImage: Upload
    $locationName: String
    $location: LocationInput
  ) {
    createPage(
      title: $title
      category: $category
      description: $description
      userId: $userId
      profileImage: $profileImage
      coverImage: $coverImage
      locationName: $locationName
      location: $location
    ) {
      id
      title
      category
      description
      profileImage
      coverImage
      createdAt
    }
  }
`;


export const CREATE_PAGE_POST = gql`
  mutation CreatePagePost(
    $caption: String!
    $image: Upload
    $video: Upload
    $thumbnail: Upload
    $pageId: ID!
  ) {
    createPagePost(
      caption: $caption
      image: $image
      video: $video
      thumbnail: $thumbnail
      pageId: $pageId
    ) {
      id
      caption
      imageUrl
      videoUrl
      thumbnailUrl
      createdAt
      createdBy {
        id
      }
     
    }
  }
`;


export const LIKE_PAGE = gql`
  mutation LikePage($userId: ID!, $pageId: ID!) {
    likePage(userId: $userId, pageId: $pageId)
  }
`;


export const GET_SUGGESTED_PAGES = gql`
  query GetSuggestedPages($userLocation: LocationInput) {
    getSuggestedPages(userLocation: $userLocation) {
      id
      title
      category
      description
      profileImage
      coverImage
      createdAt
      createdBy {
        id
        name
        username
      }
    }
  }
`;


export const GET_LIKED_PAGES = gql`
  query GetLikedPages($userId: ID!) {
    getLikedPages(userId: $userId) {
      id
      title
      category
      description
      profileImage
      coverImage
      createdAt
    }
  }
`;

export const GET_USER_PAGES = gql`
  query GetUserPages($userId: ID!) {
    getUserPages(userId: $userId) {
      id
      title
      category
      description
      profileImage
      coverImage
      createdAt
    }
  }
`;

export const GET_PAGE_BY_ID = gql`
  query GetPageById($pageId: ID!) {
    getPageById(pageId: $pageId) {
      id
      title
      category
      description
      profileImage
      coverImage
      createdAt
      createdBy {
        id
        name
        username
      }
    }
  }
`;

export const GET_PAGE_POSTS = gql`
  query GetPagePosts($pageId: ID!) {
    getPagePosts(pageId: $pageId) {
      id
      caption
      imageUrl
      videoUrl
      createdAt
      createdBy {
        id
        title
        profileImage
        name
        username
      }
    }
  }
`;

export const GET_LIKED_IMAGE_POSTS_BY_USER = gql`
  query GetLikedImagePostsByUser($userId: ID!) {
    getLikedImagePostsByUser(userId: $userId) {
      id
      caption
      imageUrl
    }
  }
`;

export const GET_COMMENTED_IMAGE_POSTS_BY_USER = gql`
  query GetCommentedImagePostsByUser($userId: ID!) {
    getCommentedImagePostsByUser(userId: $userId) {
      id
      caption
      imageUrl
      comments {
        text
      }
    }
  }
`;

export const GET_LIKED_VIDEO_POSTS_BY_USER = gql`
  query GetLikedVideoPostsByUser($userId: ID!) {
    getLikedVideoPostsByUser(userId: $userId) {
      id
      caption
      videoUrl
    }
  }
`;



export const GET_COMMENTED_VIDEO_POSTS_BY_USER = gql`
  query GetCommentedVideoPostsByUser($userId: ID!) {
    getCommentedVideoPostsByUser(userId: $userId) {
      id
      caption
      videoUrl
      comments {
        text
      }
    }
  }
`;

export const GET_LIKED_REELS_BY_USER = gql`
  query GetLikedReelsByUser($userId: ID!) {
    getLikedReelsByUser(userId: $userId) {
      id
      title
      videoUrl
    }
  }
`;

export const GET_COMMENTED_REELS_BY_USER = gql`
  query GetCommentedReelsByUser($userId: ID!) {
    getCommentedReelsByUser(userId: $userId) {
      id
      title
      videoUrl
      comments {
        text
      }
    }
  }
`;


export const GET_ALL_USERS_BY_ADMIN = gql`
  query GetAllUsersByAdmin {
    getAllUsersByAdmin {
      id
      name
      username
profileImage
      email
      isOnline
      is_blocked
      following {
        id
      }
      followers {
        id
      }
        posts{id}
    }
  }
`;

export const SEND_FOLLOW_REQUEST_MUTATION = gql`
  mutation SendFollowRequest($privateUserId: ID!, $requesterId: ID!, $requesterName: String!) {
    sendFollowRequest(privateUserId: $privateUserId, requesterId: $requesterId, requesterName: $requesterName) {
      id
      message
      success
    }
  }
`;

export const ACCEPT_FOLLOW_REQUEST_MUTATION = gql`
  mutation AcceptFollowRequest($requestId: ID!, $userId: ID!) {
    acceptFollowRequest(requestId: $requestId, userId: $userId)
  }
`;
export const GET_FOLLOW_REQUESTS_BY_USER = gql`
  query GetFollowRequestsByUser($userId: ID!) {
    getFollowRequestsByUser(userId: $userId) {
      id
      requester
      recipient
      status
      createdAt
      updatedAt
    }
  }
`;

export const REJECT_FOLLOW_REQUEST_MUTATION = gql`
  mutation RejectFollowRequest($requestId: ID!, $userId: ID!) {
    rejectFollowRequest(requestId: $requestId, userId: $userId)
  }
`;


export const GET_FOLLOWERS = gql`
  query getFollowers($userId: ID!) {
    getFollowers(userId: $userId) {
      id
      username
      profileImage
    }
  }
`;
export const GET_USER_FOLLOWING = gql`
  query GetUserFollowing($userId: ID!) {
    getUserFollowing(userId: $userId) {
      id
      name
      username
      profileImage
    }
  }
`;

export const UPDATE_USER_PRIVACY = gql`
  mutation UpdatePrivacy($userId: ID!, $isPrivate: Boolean!) {
    updateUserPrivacy(userId: $userId, isPrivate: $isPrivate)
  }
`;

export const GET_HIDDEN_FROM_STORY = gql`
  query getHiddenFromStory($userId: ID!) {
    getHiddenFromStory(userId: $userId) {
      id
      username
    }
  }
`;

export const HIDE_STORY_FROM = gql`
  mutation hideStoryFrom($userIds: [ID!]!, $currentUserId: ID!) {
    hideStoryFrom(userIds: $userIds, currentUserId: $currentUserId)
  }
`;


export const ME_QUERY = gql`
  query mySelf($userId: ID!) {
    mySelf(userId: $userId) {
      id
      username
      role
      isPrivate
    }
  }
`;

export const BLOCK_USER = gql`
  mutation Block($userId: ID!, $targetUserId: ID!) {
    block(userId: $userId, targetUserId: $targetUserId)
  }
`;

export const UNBLOCK_USER = gql`
  mutation Unblock($userId: ID!, $targetUserId: ID!) {
    unblock(userId: $userId, targetUserId: $targetUserId)
  }
`;

export const GET_ACHIVE_STORIES = gql`
  query GetStories($userId: ID!) {
    getStories(userId: $userId) {
      id
      mediaType
      mediaUrl
      caption
      createdAt
      expiresAt
      isArchived
    }
  }
`;
export const GET_ACHIVE_STORIES_BY_USERS = gql`
  query GetStoriesbyUser($userId: ID!) {
    getStoriesbyUser(userId: $userId) {
      id
      mediaType
      mediaUrl
      caption
      createdAt
      expiresAt
      isArchived
    }
  }
`;

export const GET_MY_STORIES = gql`
  query GetMyStories($userId: ID!) {
    getMyStories(userId: $userId) {
      id
      mediaType
      mediaUrl
      caption
      createdAt
    }
  }
`;

export const ALL_SAVED_REELS = gql`
  query AllSavedReels($userId: ID!) {
    allSavedReels(userId: $userId) {
      id
      title
      videoUrl
      createdAt
    }
  }
`;

export const UNSAVE_REEL = gql`
  mutation UnsaveReel($reelId: ID!, $userId: ID!) {
    unsaveReel(reelId: $reelId, userId: $userId)
  }
`;

export const SAVE_REEL = gql`
  mutation SaveReel($reelId: ID!, $userId: ID!) {
    saveReel(reelId: $reelId, userId: $userId)
  }
`;

export const GET_SAVED_POSTS = gql`
  query GetSavedPosts($userId: ID!) {
    getSavedPosts(userId: $userId) {
      id
      caption
      imageUrl
      videoUrl
    }
  }
`;



export const SAVE_POST = gql`
  mutation SavePost($userId: ID!, $postId: ID!) {
    savePost(userId: $userId, postId: $postId)
  }
`;
export const UNSAVE_POST = gql`
  mutation UnsavePost($userId: ID!, $postId: ID!) {
    unsavePost(userId: $userId, postId: $postId)
  }
`;


export const GET_ARCHIVED_POSTS = gql`
  query GetArchivedPosts($userId: ID!) {
    getArchivedPosts(userId: $userId) {
      id
      caption
      imageUrl
      videoUrl
      thumbnailUrl
      createdAt
      isArchived
    }
  }
`;

export const UNARCHIVE_POST = gql`
  mutation UnarchivePost($postId: ID!, $userId: ID!) {
    unarchivePost(postId: $postId, userId: $userId) 
  }
`;

export const ARCHIVE_POST = gql`
  mutation ArchivePost($postId: ID!, $userId: ID!) {
    archivePost(postId: $postId, userId: $userId) 
  }
`;



export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $userId: ID!) {
    createCategory(name: $name, userId: $userId) {
      id
      name
      createdAt
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!, $userId: ID!) {
    deleteCategory(id: $id, userId: $userId)
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
      createdAt
      createdBy {
        id
        name
      }
    }
  }
`;



export const BLOCK_ADMIN_BY_USER = gql`
  mutation blockUser($userId: ID!) {
    blockUser(userId: $userId) {
       id
       name
      username
      email
      profileImage
      is_blocked
      following{id}
      followers{id}
      posts{id}
       
    }
  }
`;

export const UNBLOCK_ADMIN_BY_USER = gql`
  mutation unblockUser($userId: ID!) {
    unblockUser(userId: $userId) {
       id
       name
      username
      email
      profileImage
      is_blocked
      following{id}
      followers{id}
      posts{id}
       
    }
  }
`;



export const GET_TOTAL_USERS = gql`
  query {
    allUsers
  }
`;

export const GET_TOTAL_POSTS = gql`
  query {
    totalPosts
  }
`;

export const GET_BLOCKED_COUNT = gql`
  query {
    BlockCount {
      id
      name
      email
      profileImage
      is_blocked
    }
  }
`;


export const GET_USER_LIKED_POSTS = gql`
  query GetUserLikedPosts($userId: ID!) {
    getUserLikedPosts(userId: $userId) {
       id
       caption
      imageUrl
       
    }
  }
`;

export const GET_USER_COMMENTED_POSTS = gql`
  query getUserCommentedPosts($userId: ID!) {
    getUserCommentedPosts(userId: $userId) {
       id
       caption
      imageUrl
       comments { text}
       
    }
  }
`;

export const GET_USER_LIKED_VIDEOS = gql`
  query getUserLikedVideos($userId: ID!) {
    getUserLikedVideos(userId: $userId) {
       id
       caption
      videoUrl
       
    }
  }
`;

export const GET_USER_COMMENTED_VIDEOS = gql`
  query getUserCommentedVideos($userId: ID!) {
    getUserCommentedVideos(userId: $userId) {
       id
       caption
      videoUrl
       comments { text}
       
    }
  }
`;

export const GET_USER_LIKED_REELS = gql`
  query getUserLikedReels($userId: ID!) {
    getUserLikedReels(userId: $userId) {
       id
       title
      videoUrl
       
    }
  }
`;

export const GET_USER_COMMENTED_REELS = gql`
  query getUserCommentedReels($userId: ID!) {
    getUserCommentedReels(userId: $userId) {
       id
       title
      videoUrl
      comments { text}
       
    }
  }
`;

export const CREATE_POST = gql`
  mutation(
    $id: ID!
    $caption: String!
    $image: Upload
    $video: Upload
    $thumbnail: Upload
    $locationName: String
    $location: LocationInput
  ) {
    createPost(
      id: $id
      caption: $caption
      image: $image
      video: $video
      thumbnail: $thumbnail
      locationName: $locationName
      location: $location
    ) {
      id
      caption
      imageUrl
      videoUrl
      thumbnailUrl
      isVideo
      createdAt
    }
  }
`;


export const DELETE_POST_BY_ADMIN = gql`
  mutation DeletePostByAdmin($id: ID!, $type: String!) { 
  DeletePostByAdmin(id: $id,type:$type)
   }
`;


export const GET_ALL_POSTS = gql`
  query getAllPosts($userId: ID!, $userLocation: LocationInput) {
    getAllPosts(userId: $userId, userLocation: $userLocation) {
      id
      caption
      imageUrl
      videoUrl
      thumbnailUrl
      locationName
      location {
        type
        coordinates
      }
      isVideo
      createdBy {
        id
        name
        username
        profileImage
      }
      createdAt
      likes {
        user {
          id
        }
        likedAt
      }
      comments {
        id
        text
        user {
          id
          name
          username
          profileImage
        }
        commentedAt
        likes {
          user {
            id
          }
          likedAt
        }
        replies {
          id
          text
          user {
            id
            name
            username
            profileImage
          }
          repliedAt
          likes {
            user {
              id
            }
            likedAt
          }
        }
      }
    }
  }
`;

export const GET_ALL_POSTS_SAFE = gql`
  query getAllPosts($userId: ID!) {
    getAllPosts(userId: $userId) {
      id
      caption
      imageUrl
      videoUrl
      thumbnailUrl
      isVideo
      createdBy {
        id
        name
        username
        profileImage
      }
      createdAt
      likes {
        user {
          id
        }
        likedAt
      }
      comments {
        id
        text
        commentedAt
      }
    }
  }
`;

// New query for profile page - only user's own posts
export const GET_USER_OWN_POSTS = gql`
  query getUserOwnPosts($userId: ID!) {
    getUserOwnPosts(userId: $userId) {
      id
      caption
      imageUrl
      videoUrl
      thumbnailUrl
      isVideo
      createdBy {
        id
        name
        username
        profileImage
      }
      createdAt
      likes {
        user {
          id
        }
        likedAt
      }
      comments {
        id
        text
        user {
          id
          name
          username
          profileImage
        }
        commentedAt
        likes {
          user {
            id
          }
          likedAt
        }
        replies {
          id
          text
          user {
            id
            name
            username
            profileImage
          }
          repliedAt
          likes {
            user {
              id
            }
            likedAt
          }
        }
      }
    }
  }
`;


export const GET_ME = gql`
  query {
    getMe {
      id
      name
      username
      bio
      profileImage
      is_blocked
      blockedUsers { id }
      followers { id }
      following { id }
      posts { id }
    
    }
  }
`;

export const GET_BLOCK_USERS_LIST = gql`
  query getUserBlockList($userId: ID!) {
    getUserBlockList(userId: $userId) {
      id
      name
      username
      bio
      profileImage
      is_blocked
      blockedUsers { id,name }
      followers { id }
      following { id }
      posts { id }
    }
  }
`;


export const EDIT_PROFILE = gql`
 mutation editProfile(
  $id: ID!,
  $name: String,
  $username: String,
  $caption: String,
  $image: Upload
) {
  editProfile(
    id: $id,
    name: $name,
    username: $username,
    caption: $caption,
    image: $image
  ) {
    id
    name
    username
    email
    profileImage
    bio
  }
}

`;
export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $username: String!, $email: String!, $password: String!, $phone: String) {
    register(name: $name, username: $username, email: $email, password: $password, phone: $phone) {
      id
      name
      username
      email
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
    }
  }
`;


export const LOGOUT_MUTATION = gql`
  mutation {
    logout
  }
`;

export const REPLY_TO_STORY = gql`
  mutation ReplyToStory($storyId: ID!, $userId: ID!, $message: String!) {
    replyToStory(storyId: $storyId, userId: $userId, message: $message) {
      id
      replies { id message }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers($userId: ID!) {
    users(userId: $userId) {
      id
      name
      username
      profileImage
      isOnline
      is_blocked
      lastActive
       followers { id }
      following { id }
      posts { id }
      blockedUsers {
        id
        name
        username
        profileImage
      }
    }
  }
`;

export const SEARCH_USER = gql`
  query SearchUser($name: String!) {
    searchUser(name: $name) {
      id
      name
      profileImage
      bio 
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!) {
    searchUsers(username: $searchTerm) {
      id
      name
      username
      email
      phone
      profileImage
      bio
      createTime
      followers {
        id
        name
      }
      following {
        id
        name
      }
      posts {
        id
        caption
        imageUrl
        createdAt
      }
    }
  }
`;


export const GET_USER_INFO = gql`
  query getUserInformation($id: ID!) {
    getUserInformation(id: $id) {
      id
      name
      username
      bio
      profileImage
      is_blocked
      followers {
        id
      }
      following {
        id
      }
      posts {
        id
      }
    }
  }
`;

export const FOLLOW_AND_UNFOLLOW = gql`
  mutation FollowAndUnfollow($id: ID!) {
    followAndUnfollow(id: $id) {
      id
      name
      username
      profileImage
      followers {
        id
        name
      }
      following {
        id
        name
      }
        posts {
        id
        caption
        }
    }
  }
`;

export const SUGGESTED_USERS = gql`
  query GetSuggestions($userId: ID!) {
    suggestedUsers(userId: $userId) {
      id
      name
      username
      email
      phone
      profileImage
      bio
      createTime
      suggestionScore
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($userId: ID!, $postId: ID!) {
    LikePost(userId: $userId, postId: $postId)
  }
`;

export const COMMENT_POST = gql`
  mutation CommentPost($userId: ID!, $postId: ID!, $text: String!) {
    CommentPost(userId: $userId, postId: $postId, text: $text) {
      text
      commentedAt
      user {
        name
        username
        profileImage
      }
    }
  }
`;

// Notification Queries
export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: ID!) {
    getUserNotifications(userId: $userId) {
      id
      recipient {
        id
        name
        username
        profileImage
      }
      sender {
        id
        name
        username
        profileImage
      }
      type
      message
      post {
        id
        caption
        imageUrl
        videoUrl
        thumbnailUrl
      }
      commentText
      commentId
      followRequestId
      isRead
      createdAt
    }
  }
`;

export const GET_USER_NOTIFICATIONS_SAFE = gql`
  query GetUserNotificationsSafe($userId: ID!) {
    getUserNotifications(userId: $userId) {
      id
      recipient {
        id
        name
        username
        profileImage
      }
      sender {
        id
        name
        username
        profileImage
      }
      type
      message
      post {
        id
        caption
        imageUrl
        videoUrl
        thumbnailUrl
      }
      commentText
      commentId
      followRequestId
      isRead
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount($userId: ID!) {
    getUnreadNotificationsCount(userId: $userId)
  }
`;

export const MARK_NOTIFICATIONS_AS_READ = gql`
  mutation MarkNotificationsAsRead($userId: ID!) {
    markNotificationsAsRead(userId: $userId)
  }
`;

// Video Upload Mutations
export const UPLOAD_VIDEO = gql`
  mutation UploadVideo(
    $title: String!
    $description: String
    $video: Upload!
    $thumbnail: Upload
    $tags: [String]
    $category: String
    $isPublic: Boolean
    $resolution: VideoResolutionInput
  ) {
    uploadVideo(
      title: $title
      description: $description
      video: $video
      thumbnail: $thumbnail
      tags: $tags
      category: $category
      isPublic: $isPublic
      resolution: $resolution
    ) {
      id
      title
      description
      videoUrl
      thumbnailUrl
      duration
      views
      createdBy {
        id
        name
        username
        profileImage
      }
      createdAt
      updatedAt
      likes {
        user {
          id
        }
        likedAt
      }
      comments {
        id
        text
        user {
          id
          name
          username
        }
        commentedAt
      }
      tags
      category
      isPublic
      fileSize
      resolution {
        width
        height
      }
    }
  }
`;

export const GET_ALL_VIDEOS = gql`
  query GetAllVideos {
    getAllVideos {
      id
      title
      description
      videoUrl
      thumbnailUrl
      duration
      views
      createdBy {
        id
        name
        username
        profileImage
        followers {
          id
        }
          following {
          id
          }
      
      }
      createdAt
      updatedAt
      likes {
        user {
          id
        }
        likedAt
      }
      comments {
        id
        text
        user {
          id
          name
          username
        }
        commentedAt
      }
      tags
      category
      isPublic
      fileSize
      resolution {
        width
        height
      }
    }
  }
`;



export const GET_USER_VIDEOS = gql`
  query GetUserVideos($userId: ID!) {
    getUserVideos(userId: $userId) {
      id
      title
      description
      videoUrl
      thumbnailUrl
      duration
      views
      createdBy {
        id
        name
        username
        profileImage
      }
      createdAt
      updatedAt
      likes {
        user {
          id
        }
        likedAt
      }
      comments {
        id
        text
        user {
          id
          name
          username
        }
        commentedAt
      }
      tags
      category
      isPublic
      fileSize
      resolution {
        width
        height
      }
    }
  }
`;

export const LIKE_VIDEO = gql`
  mutation LikeVideo($videoId: ID!) {
    likeVideo(videoId: $videoId)
  }
`;

export const COMMENT_ON_VIDEO = gql`
  mutation CommentOnVideo($videoId: ID!, $text: String!) {
    commentOnVideo(videoId: $videoId, text: $text) {
      id
      text
      user {
        id
        name
        username
        profileImage
      }
      commentedAt
    }
  }
`;

export const INCREMENT_VIDEO_VIEWS = gql`
  mutation IncrementVideoViews($videoId: ID!) {
    incrementVideoViews(videoId: $videoId) {
      id
      views
    }
  }
`;

export const TRACK_VIDEO_VIEW = gql`
  mutation TrackVideoView($videoId: ID!) {
    trackVideoView(videoId: $videoId) {
      id
      views
    }
  }
`;

export const DELETE_VIDEO = gql`
  mutation DeleteVideo($videoId: ID!) {
    deleteVideo(videoId: $videoId)
  }
`;

// Group Chat Mutations and Queries
export const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      _id
      name
      description
      groupImage
      members {
        id
        name
        username
        profileImage
      }
      admins {
        id
        name
        username
        profileImage
      }
      createdBy {
        id
        name
        username
        profileImage
      }
      isPrivate
      maxMembers
      memberCount
      createdAt
    }
  }
`;

export const GET_USER_GROUPS = gql`
  query GetUserGroups($userId: ID!) {
    getUserGroups(userId: $userId) {
      _id
      name
      description
      groupImage
      members {
        id
        name
        username
        profileImage
        isOnline
      }
      admins {
        id
        name
        username
        profileImage
      }
      lastMessage {
        content
        sender {
          name
          username
        }
        timestamp
      }
      memberCount
      updatedAt
    }
  }
`;


export const SEND_GROUP_MESSAGE = gql`
  mutation SendGroupMessage(
    $groupId: ID!
    $content: String
    $messageType: String
    $media: MediaInput
    $replyTo: ID
  ) {
    sendGroupMessage(
      groupId: $groupId
      content: $content
      messageType: $messageType
      media: $media
      replyTo: $replyTo
    ) {
      _id
      content
      messageType
      sender {
        id
        name
        username
        profileImage
      }
      media {
        url
        type
        filename
      }
      replyTo {
        _id
        content
        sender {
          name
        }
      }
      createdAt
    }
  }
`;

export const SEND_GROUP_MESSAGE_WITH_FILE = gql`
  mutation SendGroupMessageWithFile(
    $groupId: ID!
    $content: String
    $file: Upload!
    $replyTo: ID
  ) {
    sendGroupMessageWithFile(
      groupId: $groupId
      content: $content
      file: $file
      replyTo: $replyTo
    ) {
      _id
      content
      messageType
      sender {
        id
        name
        username
        profileImage
      }
      media {
        url
        type
        filename
        size
        duration
      }
      replyTo {
        _id
        content
        sender {
          name
        }
      }
      createdAt
    }
  }
`;

export const GET_GROUP_MESSAGES = gql`
  query GetGroupMessages($groupId: ID!, $limit: Int, $offset: Int) {
    getGroupMessages(groupId: $groupId, limit: $limit, offset: $offset) {
      _id
      content
      messageType
      sender {
        id
        name
        username
        profileImage
      }
      media {
        url
        type
        filename
      }
      replyTo {
        _id
        content
        sender {
          name
        }
      }
      createdAt
    }
  }
`;

export const DELETE_GROUP_MESSAGE = gql`
  mutation DeleteGroupMessage($messageId: ID!) {
    deleteGroupMessage(messageId: $messageId) {
      _id
      isDeleted
      deletedAt
    }
  }
`;

export const GET_GROUP_UNREAD_COUNT = gql`
  query GetGroupUnreadCount($groupId: ID!) {
    getGroupUnreadCount(groupId: $groupId)
  }
`;

export const MARK_GROUP_MESSAGE_AS_READ = gql`
  mutation MarkGroupMessageAsRead($messageId: ID!) {
    markGroupMessageAsRead(messageId: $messageId) {
      _id
      readBy {
        user {
          id
          name
        }
        readAt
      }
    }
  }
`;

export const SEARCH_USERS_FOR_GROUP = gql`
  query SearchUsers($query: String!, $userId: ID!) {
    searchUsers(username: $query, userId: $userId) {
      id
      name
      username
      profileImage
    }
  }
`;

// Chat Mutations
export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $senderId: ID!
    $receiverId: ID!
    $message: String
    $media: MediaInput
  ) {
    sendMessage(
      senderId: $senderId
      receiverId: $receiverId
      message: $message
      media: $media
    ) {
      id
      message
      media {
        url
        type
        filename
        size
        duration
      }
      sender {
        id
        name
      }
      receiver {
        id
        name
      }
      seen
      createdAt
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($senderId: ID!, $receiverId: ID!) {
    getMessages(senderId: $senderId, receiverId: $receiverId) {
      id
      message
      media {
        url
        type
        filename
        size
        duration
      }
      sender {
        id
        name
      }
      receiver {
        id
        name
      }
      seen
      isLastMessage
      createdAt
    }
  }
`;

export const GET_LAST_MESSAGES = gql`
  query GetLastMessages($userId: ID!) {
    getLastMessages(userId: $userId) {
      id
      message
      media {
        url
        type
        filename
        size
        duration
      }
      sender {
        id
        name
        profileImage
      }
      receiver {
        id
        name
        profileImage
      }
      seen
      isLastMessage
      createdAt
    }
  }
`;

export const SEND_MESSAGE_WITH_FILE = gql`
  mutation SendMessageWithFile(
    $senderId: ID!
    $receiverId: ID!
    $message: String
    $file: Upload!
  ) {
    sendMessageWithFile(
      senderId: $senderId
      receiverId: $receiverId
      message: $message
      file: $file
    ) {
      id
      message
      media {
        url
        type
        filename
        size
        duration
      }
      sender {
        id
        name
      }
      receiver {
        id
        name
      }
      seen
      createdAt
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($senderId: ID!, $receiverId: ID!) {
    getUnreadCount(senderId: $senderId, receiverId: $receiverId)
  }
`;

export const MARK_MESSAGE_AS_SEEN = gql`
  mutation MarkMessageAsSeen($messageId: ID!) {
    markMessageAsSeen(messageId: $messageId)
  }
`;

export const MARK_ALL_MESSAGES_AS_SEEN = gql`
  mutation MarkAllMessagesAsSeen($senderId: ID!, $receiverId: ID!) {
    markAllMessagesAsSeen(senderId: $senderId, receiverId: $receiverId)
  }
`;

export const CLEAR_CHAT = gql`
  mutation ClearChat($userId: ID!, $chatWithUserId: ID!) {
    clearChat(userId: $userId, chatWithUserId: $chatWithUserId)
  }
`;

export const REMOVE_GROUP_MEMBER = gql`
  mutation RemoveGroupMember($groupId: ID!, $memberId: ID!) {
    removeGroupMember(groupId: $groupId, memberId: $memberId) {
      success
      message
      group {
        _id
        name
        members {
          id
          name
          profileImage
        }
        admins {
          id
          name
        }
        memberCount
      }
    }
  }
`;

export const ADD_GROUP_MEMBERS = gql`
  mutation AddGroupMembers($groupId: ID!, $memberIds: [ID!]!) {
    addGroupMembers(groupId: $groupId, memberIds: $memberIds) {
      success
      message
      group {
        _id
        name
        members {
          id
          name
          profileImage
        }
        admins {
          id
          name
        }
        memberCount
      }
    }
  }`


export const REPLY_TO_COMMENT = gql`
  mutation ReplyToComment($userId: ID!, $postId: ID!, $commentId: ID!, $text: String!) {
    ReplyToComment(userId: $userId, postId: $postId, commentId: $commentId, text: $text) {
      id
      text
      user {
        id
        name
        username
      }
      repliedAt
    }
  }
`;

export const DELETE_REPLY = gql`
  mutation DeleteReply($userId: ID!, $postId: ID!, $commentId: ID!, $replyId: ID!) {
    DeleteReply(userId: $userId, postId: $postId, commentId: $commentId, replyId: $replyId) {
      id
      text
      user {
        id
        name
        username
        profileImage
      }
      commentedAt
      likes {
        user {
          id
        }
        likedAt
      }
      replies {
        id
        text
        user {
          id
          name
          username
          profileImage
        }
        repliedAt
        likes {
          user {
            id
            name
            username
            profileImage
          }
          likedAt
        }
      }
    }
  }
`;

export const LIKE_COMMENT = gql`
  mutation LikeComment($userId: ID!, $postId: ID!, $commentId: ID!) {
    LikeComment(userId: $userId, postId: $postId, commentId: $commentId)
  }
`;

export const LIKE_REPLY = gql`
  mutation LikeReply($userId: ID!, $postId: ID!, $commentId: ID!, $replyId: ID!) {
    LikeReply(userId: $userId, postId: $postId, commentId: $commentId, replyId: $replyId)
  }
`;

export const GET_COMMENT_DETAILS = gql`
  query GetCommentDetails($postId: ID!, $commentId: ID!) {
    getCommentDetails(postId: $postId, commentId: $commentId) {
      id
      text
      user {
        id
        name
        username
        profileImage
      }
      commentedAt
      likes {
        id
        user {
          id
          name
          username
        }
      }
      replies {
        id
        text
        user {
          id
          name
          username
          profileImage
        }
        repliedAt
        likes {
          id
          user {
            id
            name
            username
          }
        }
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($userId: ID!, $postId: ID!, $commentId: ID!) {
    DeleteComment(userId: $userId, postId: $postId, commentId: $commentId)
  }
`;

// Story GraphQL Queries and Mutations
export const GET_STORIES = gql`
  query GetStories($username: String!) {
    getStories(username: $username) {
      id
      userId
      username
      avatar
      mediaType
      mediaUrl
      caption
      createdAt
      expiresAt
      location
      viewers
    }
  }
`;

export const GET_USER_STORIES = gql`
  query GetUserStories($userId: ID!) {
    getUserStories(userId: $userId) {
      id
      userId
      username
      avatar
      mediaType
      mediaUrl
      caption
      createdAt
      expiresAt
      location
      viewers
    }
  }
`;

export const GET_STORY_BY_ID = gql`
  query GetStoryById($id: ID!) {
    getStoryById(id: $id) {
      id
      userId
      username
      avatar
      mediaType
      mediaUrl
      caption
      createdAt
      expiresAt
      location
      viewers
    }
  }
`;

export const ADD_STORY = gql`
  mutation AddStory(
    $userId: ID!
    $username: String!
    $avatar: String!
    $mediaType: String
    $mediaUrl: String
    $caption: String
    $location: String
  ) {
    addStory(
      userId: $userId
      username: $username
      avatar: $avatar
      mediaType: $mediaType
      mediaUrl: $mediaUrl
      caption: $caption
      location: $location
    ) {
      id
      userId
      username
      avatar
      mediaType
      mediaUrl
      caption
      createdAt
      expiresAt
      location
      viewers
    }
  }
`;

export const UPLOAD_STORY_MEDIA = gql`
  mutation UploadStoryMedia($file: Upload!) {
    uploadStoryMedia(file: $file)
  }
`;

export const VIEW_STORY = gql`
  mutation ViewStory($userId: ID!, $statusId: ID!) {
    viewStory(userId: $userId, statusId: $statusId) {
      id
      userId
      username
      avatar
      mediaType
      mediaUrl
      caption
      createdAt
      expiresAt
      location
      viewers
    }
  }
`;

export const DELETE_STORY = gql`
  mutation DeleteStory($userId: ID!, $statusId: ID!) {
    deleteStory(userId: $userId, statusId: $statusId)
  }
`;
