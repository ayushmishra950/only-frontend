// import React from "react";
// import PageShell from "./PageShell";
// import { GET_FOLLOWERS,HIDE_STORY_FROM,GET_HIDDEN_FROM_STORY } from '../../graphql/mutations';
// import { GetTokenFromCookie } from '../getToken/GetToken';
// import {useQuery,useMutation } from '@apollo/client';

// export default function HideYourStory() {
//   return (
//     <PageShell title="Hide Your Story">
//       <p className="text-gray-600">0 people hidden from your story</p>
//     </PageShell>
//   );
// }



import React, { useEffect, useState } from "react";
import PageShell from "./PageShell";
import {
  GET_FOLLOWERS,
  GET_HIDDEN_FROM_STORY,
  HIDE_STORY_FROM,
} from "../../graphql/mutations";
import { GetTokenFromCookie } from "../getToken/GetToken";
import { useQuery, useMutation } from "@apollo/client";

export default function HideYourStory() {
  const token = GetTokenFromCookie(); // Assuming token contains user ID
  const currentUserId = token?.id;

  const [selectedUsers, setSelectedUsers] = useState([]);

  const { data: followersData, loading: followersLoading } = useQuery(
    GET_FOLLOWERS,
    {
      variables: { userId: currentUserId },
      skip: !currentUserId,
    }
  );

  const { data: hiddenData, loading: hiddenLoading, refetch: refetchHidden } = useQuery(
    GET_HIDDEN_FROM_STORY,
    {
      variables: { userId: currentUserId },
      skip: !currentUserId,
    }
  );

  const [hideStoryFrom, { loading: saving }] = useMutation(HIDE_STORY_FROM, {
    onCompleted: () => {
      refetchHidden();
    },
  });

  useEffect(() => {
    if (hiddenData?.getHiddenFromStory) {
      const hiddenIds = hiddenData.getHiddenFromStory.map((user) => user.id);
      setSelectedUsers(hiddenIds);
    }
  }, [hiddenData]);

  const handleToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    hideStoryFrom({
      variables: {
        userIds: selectedUsers,
        currentUserId, // if backend requires it; remove if auth context used
      },
    });
  };

  if (followersLoading || hiddenLoading) {
    return (
      <PageShell title="Hide Your Story">
        <p className="text-gray-500">Loading...</p>
      </PageShell>
    );
  }

  const followers = followersData?.getFollowers || [];

  return (
    <PageShell title="Hide Your Story">
      <div className="mb-4 text-gray-600">
        {selectedUsers.length} people hidden from your story
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-2">
        {followers.map((user) => (
          <label key={user.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleToggle(user.id)}
            />
            <div className="flex items-center space-x-2">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{user.username}</span>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </PageShell>
  );
}
