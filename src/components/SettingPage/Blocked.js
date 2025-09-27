
import React, { useState, useEffect } from "react";
import PageShell from "./PageShell";
import { GET_BLOCK_USERS_LIST, GET_ALL_USERS, UNBLOCK_USER } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';
import { useQuery, useMutation } from '@apollo/client';

export default function Blocked() {
  const [menuOpen, setMenuOpen] = useState(null);
  const [blockUsers, setBlockUsers] = useState([]);
  const [token, setToken] = useState();
  const [unblock] = useMutation(UNBLOCK_USER);

  // Get user token on component mount
  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    if (decodedUser?.id) {
      setToken(decodedUser);
    }
  }, []);

  const { data: blockUsersData, error, refetch: refetchblockUsers } = useQuery(GET_BLOCK_USERS_LIST, {
    variables: { userId: token?.id?.toString() },
    skip: !token?.id,
    fetchPolicy: 'cache-and-network'
  });


  // Handle unblocking
  const unblockHandler = async (userId) => {
    try {
      await unblock({
        variables: {
          targetUserId: userId,
          userId: token?.id.toString()
        },
      });
      await refetchblockUsers();
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  // Directly update blockUsers when data is available
  useEffect(() => {
    if (blockUsersData?.getUserBlockList?.blockedUsers) {
      setBlockUsers(blockUsersData.getUserBlockList.blockedUsers);
    }
  }, [blockUsersData]);

  return (
    <PageShell title="Blocked">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {blockUsers?.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
            No users blocked.
          </div>
        )}

        {blockUsers?.map(user => (
          <div key={user.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8f8f8',
            borderRadius: 8,
            padding: 12
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ color: '#888', fontSize: 13 }}>Blocked</div>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  padding: 4
                }}
                aria-label="More options"
              >
                &#8942;
              </button>

              {menuOpen === user.id && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 28,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => { unblockHandler(user.id); setMenuOpen(null); }}
                    style={{
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#388e3c',
                      fontWeight: 500
                    }}>
                    Unblock
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
