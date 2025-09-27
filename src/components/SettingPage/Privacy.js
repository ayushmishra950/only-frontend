// import React, { useState,useEffect } from "react";
// import PageShell from "./PageShell";
// import { useMutation } from '@apollo/client';
// import { UPDATE_USER_PRIVACY } from '../../graphql/mutations';
// import { GetTokenFromCookie } from '../getToken/GetToken';

// export default function Privacy() {
//   const [enabled, setEnabled] = useState(false);
//   const [updateUserPrivacy] = useMutation(UPDATE_USER_PRIVACY);
//   const [token, setToken] = useState();

//   useEffect(() => {
//           const decodedUser = GetTokenFromCookie();
//           if(decodedUser?.id){
//             setToken(decodedUser);
//           }
//         }, []);
  

//   const handleUpdatePrivacy = async () => {
//       if(!token?.id){
//         alert('Please login first');
//         return;
//       }

//       else{
//         setEnabled((v)=> !v );
//       }
//     try {
//       await updateUserPrivacy({
//         variables: { isPrivate: enabled, userId: token?.id },
//       });
//       /* console.log(...) */ void 0;
//     } catch (error) {
//       console.error(error);
//     }
//   }

//           // onClick={() => setEnabled((v) => !v)}

//   return (
//     <PageShell title="Privacy">
//       <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
//         <span className="text-gray-800">Privacy</span>
//         {/* Right-aligned toggle */}
//         <button
//           type="button"
//           aria-pressed={enabled}
//           onClick={handleUpdatePrivacy}
//           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
//             enabled ? "bg-blue-500" : "bg-gray-300"
//           }`}
//         >
//           <span
//             className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
//               enabled ? "translate-x-5" : "translate-x-1"
//             }`}
//           />
//         </button>
//       </div>
//     </PageShell>
//   );
// }








import React, { useState, useEffect } from "react";
import PageShell from "./PageShell";
import { useMutation,useQuery } from '@apollo/client';
import { UPDATE_USER_PRIVACY, ME_QUERY } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';

export default function Privacy() {
  const [enabled, setEnabled] = useState(false);
  const [updateUserPrivacy] = useMutation(UPDATE_USER_PRIVACY);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    /* console.log(...) */ void 0;
    if (decodedUser?.id) {
      setToken(decodedUser);
    }
  }, []);


  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
        variables: {userId : token?.id.toString()}
      });  
      /* console.log(...) */ void 0

      useEffect(()=>{
        if(data?.mySelf?.isPrivate){
          setEnabled(data?.mySelf?.isPrivate)
        }
      },[data?.mySelf?.isPrivate])

  const handleUpdatePrivacy = async () => {
    if (!token?.id) {
      alert('Please login first');
      return;
    }

    // Calculate next value for privacy
    const nextValue = !enabled;
    setEnabled(nextValue); // Update UI state immediately

    try {
      const { data } = await updateUserPrivacy({
        variables: {
          userId: token.id,
          isPrivate: nextValue,
        },
      });
      /* console.log(...) */ void 0;
    } catch (error) {
      console.error("Failed to update privacy:", error.message);
    }
  };

  return (
    <PageShell title="Privacy">
      <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
        <span className="text-gray-800">Privacy</span>
        
        {/* Toggle Switch */}
        <button
          type="button"
          aria-pressed={enabled}
          onClick={handleUpdatePrivacy}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            enabled ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
              enabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </PageShell>
  );
}
