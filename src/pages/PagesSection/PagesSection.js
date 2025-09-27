import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaThumbsUp, FaSearch, FaEllipsisH, FaTimes, FaGlobe, FaLock, FaImage, FaUserPlus, FaShare, FaArrowLeft } from 'react-icons/fa';
import {GET_SUGGESTED_PAGES,CREATE_PAGE,GET_USER_PAGES,GET_LIKED_PAGES,LIKE_PAGE,GET_ALL_CATEGORIES_PAGES} from "../../graphql/mutations";
import {useQuery,useMutation} from "@apollo/client"
import {GetTokenFromCookie} from "../../components/getToken/GetToken"
import { toast } from 'react-toastify';
import ShareModal from '../../components/share/ShareModal';

const PagesSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('suggested'); // 'suggested', 'your', or 'liked'
  const [suggestedPages, setSuggestedPages] = useState([]);
  const [yourPages, setYourPages] = useState([]);
  const [likedPages, setLikedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pageForm, setPageForm] = useState({
    name: '',
    category: '',
    description: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPageToShare, setSelectedPageToShare] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
  

  // Facebook-like dummy data for pages
  // Load pages from localStorage on initial render
  const [allPages, setAllPages] = useState(() => {
    const savedPages = localStorage.getItem('userPages');
    return savedPages ? JSON.parse(savedPages) : [];
  });

  const [token,setToken] = useState();

  useEffect(() => {
    const tokens = GetTokenFromCookie();
    if (tokens) {
      setToken(tokens);
    }
  }, []);
    const { data: categoriesData, error: categoriesError, refetch: refetchCategories } = useQuery(GET_ALL_CATEGORIES_PAGES,{variables : {userLocation : userLocation}});
  
  const { data, loading, error } = useQuery(GET_SUGGESTED_PAGES);
  const {data:yourPagesData,loading:yourPagesLoading,error:yourPagesError} = useQuery(GET_USER_PAGES,{variables:{userId:token?.id}});
  const {data:likedPagesData,loading:likedPagesLoading,error:likedPagesError} = useQuery(GET_LIKED_PAGES,{variables:{userId:token?.id}, fetchPolicy: "no-cache"});
  const [createPage] = useMutation(CREATE_PAGE);
  const [likePage] = useMutation(LIKE_PAGE);


  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        console.log("✅ User location:", { lat, lon });
  
        setUserLocation({
          type: "Point",
          coordinates: [lon, lat]
        });
      },
      (err) => {
        console.error("❌ Location error:", err.message);
  
        // fallback Jaipur
        setUserLocation({
          type: "Point",
          coordinates: [75.8574194, 25.1737019]
        });
      }
    );
  }, []);
  
  


  const getLocationName = async (lat, lng) => {
    const apiKey = "2bf06013c4314aeeab73c663d290eb8b";
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
    const data = await response.json();
    const locationName = data?.results?.[0]?.formatted;
    return locationName;
  };


  // const handleCreatePage = async () => {
  //   if (!token) {
  //     toast.error('Please login to create a page');
  //     return;
  //   }
  //   if(!pageForm.name || !pageForm.category || !pageForm.description || !coverImage || !profileImage){
  //     toast.warning('All fields are required to create a page');
  //     return;
  //   }
    
  //   setIsCreatingPage(true); // Start loading
  //   console.log(pageForm,coverImage,profileImage);
    
  //   try {
  //     const { data } = await createPage({
  //       variables: {
  //         title: pageForm.name,
  //         category: pageForm.category,
  //         description: pageForm.description,
  //         userId: token?.id,
  //         profileImage: profileImage,
  //         coverImage: coverImage
  //       }
  //     });
      
  //     if(data?.createPage){
  //       toast.success('Page created successfully! 🎉', {
  //         position: "top-right",
  //         autoClose: 3000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //       });
  //       // Reset form
  //       setPageForm({ name: '', category: '', description: '' });
  //       setCoverImage(null);
  //       setProfileImage(null);
  //       setCoverPreview('');
  //       setProfilePreview('');
  //     }
  //     setIsCreateModalOpen(false);
  //   } catch (error) {
  //     toast.error('Error creating page. Please try again.', {
  //       position: "top-right",
  //       autoClose: 4000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //     });
  //     console.log(error);
  //   } finally {
  //     setIsCreatingPage(false); // Stop loading
  //   }
  // };





  const handleCreatePage = async () => {
    if (!token) {
      toast.error('Please login to create a page');
      return;
    }
  
    if (!pageForm.name || !pageForm.category || !pageForm.description || !coverImage || !profileImage) {
      toast.warning('All fields are required to create a page');
      return;
    }
  
    setIsCreatingPage(true); // Start loading
    console.log(pageForm, coverImage, profileImage);
  
    // ✅ Location logic start
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("✅ Coordinates obtained:", { latitude, longitude });
  
          // Step 1: Get location name
          const locationName = await getLocationName(latitude, longitude); // Make sure this function is available
  
          // Step 2: Create page with location data
          const { data } = await createPage({
            variables: {
              title: pageForm.name,
              category: pageForm.category,
              description: pageForm.description,
              userId: token?.id,
              profileImage: profileImage,
              coverImage: coverImage,
              locationName: locationName || null,
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            }
          });
  
          if (data?.createPage) {
            toast.success('Page created successfully! 🎉', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
  
            // Reset form
            setPageForm({ name: '', category: '', description: '' });
            setCoverImage(null);
            setProfileImage(null);
            setCoverPreview('');
            setProfilePreview('');
            setIsCreateModalOpen(false);
          }
  
          setIsCreatingPage(false);
        },
  
        // 🔴 Location access failed
        (error) => {
          console.error("Location error:", error);
          setIsCreatingPage(false);
          toast.error("Location access denied. Cannot get location info.");
        }
      );
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Error creating page. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsCreatingPage(false);
    }
  };

  

  // Navigate to page detail
  const handlePageClick = (pageId) => {
    if(!pageId){return alert('No page ID found');}
    navigate(`/page/${pageId}`);
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'cover') {
        setCoverImage(file);
        setCoverPreview(reader.result);
      } else {
        setProfileImage(file);
        setProfilePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save to localStorage whenever allPages changes
  useEffect(() => {
    localStorage.setItem('userPages', JSON.stringify(allPages));
  }, [allPages]);

  const handleLike = async (page, e) => {
    e.stopPropagation();
    
    if (!token) {
      toast.error('Please log in to like pages');
      return;
    }

    try {
      // Optimistically update the UI
      const updatedPage = {
        ...page,
        isLiked: !page.isLiked,
        likes: page.isLiked ? String(parseInt(page.likes) - 1) : String(parseInt(page.likes) + 1)
      };

      // Update suggested pages
      setSuggestedPages(prev => 
        prev.map(p => p.id === page.id ? updatedPage : p)
      );

      // Update your pages
      setYourPages(prev => 
        prev.map(p => p.id === page.id ? updatedPage : p)
      );

      // Update liked pages
      setLikedPages(prev => {
        if (updatedPage.isLiked && !prev.some(p => p.id === page.id)) {
          return [updatedPage, ...prev];
        } else if (!updatedPage.isLiked) {
          return prev.filter(p => p.id !== page.id);
        }
        return prev;
      });

      // Call the mutation
      await likePage({
        variables: {
          userId: token.id,
          pageId: page.id
        }
      });

    } catch (error) {
      console.error('Error liking page:', error);
      // Revert optimistic update on error
      const revertedPage = { ...page };
      
      setSuggestedPages(prev => 
        prev.map(p => p.id === page.id ? revertedPage : p)
      );
      
      setYourPages(prev => 
        prev.map(p => p.id === page.id ? revertedPage : p)
      );
      
      setLikedPages(prev => 
        prev.filter(p => p.id !== page.id)
      );
      
      toast.error('Failed to like the page. Please try again.');
    }
  };

  // const handleCreatePage = async (e) => {
  //   e.preventDefault();
    
  //   // In a real app, you would upload the images to a server here
  //   // For this example, we'll just use the preview URLs
  //   const newPage = {
  //     id: Date.now(),
  //     ...pageForm,
  //     likes: '0',
  //     coverPhoto: coverPreview || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  //     profilePhoto: profilePreview || 'https://randomuser.me/api/portraits/lego/1.jpg',
  //     isLiked: false,
  //     isYours: true,
  //     createdAt: new Date().toISOString()
  //   };

  //   const updatedPages = [newPage, ...allPages];
  //   setAllPages(updatedPages);
  //   setYourPages(updatedPages.filter(page => page.isYours));
  //   setSuggestedPages(updatedPages.filter(page => !page.isLiked && !page.isYours));
    
  //   // Reset form
  //   setPageForm({
  //     name: '',
  //     category: '',
  //     description: ''
  //   });
  //   setCoverImage(null);
  //   setProfileImage(null);
  //   setCoverPreview('');
  //   setProfilePreview('');
  //   setIsCreateModalOpen(false);
  // };

  // Update suggested pages when data is loaded from GraphQL
  useEffect(() => {
    if (data?.getSuggestedPages) {
      const formattedPages = data.getSuggestedPages.map(page => ({
        id: page.id,
        name: page.title,
        category: page.category,
        description: page.description,
        likes: '0', // Default likes count
        coverPhoto: page.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        profilePhoto: page.createdBy?.profileImage || page.profileImage || 'https://via.placeholder.com/150?text=User',
        isLiked: false,
        isYours: false,
        createdAt: page.createdAt || new Date().toISOString(),
        createdBy: page.createdBy
      }));
      
      setSuggestedPages(formattedPages);
      
      // Store suggested pages in localStorage for PageDetail component
      const existingPages = JSON.parse(localStorage.getItem('userPages') || '[]');
      const updatedPages = [...existingPages];
      
      formattedPages.forEach(newPage => {
        const existingIndex = updatedPages.findIndex(p => p.id === newPage.id);
        if (existingIndex === -1) {
          updatedPages.push(newPage);
        } else {
          updatedPages[existingIndex] = newPage;
        }
      });
      
      localStorage.setItem('userPages', JSON.stringify(updatedPages));
      setIsLoading(false);
    }
  }, [data]);

  // Update your pages when data is loaded from GraphQL
  useEffect(() => {
    if (yourPagesData?.getUserPages) {
      const formattedPages = yourPagesData.getUserPages.map(page => ({
        id: page.id,
        name: page.title,
        category: page.category,
        description: page.description,
        likes: '0', // Default likes count
        coverPhoto: page.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        profilePhoto: page.createdBy?.profileImage || page.profileImage || 'https://via.placeholder.com/150?text=User',
        isLiked: false,
        isYours: true, // These are user's own pages
        createdAt: page.createdAt || new Date().toISOString(),
        createdBy: page.createdBy
      }));
      
      setYourPages(formattedPages);
      
      // Store user pages in localStorage for PageDetail component
      const existingPages = JSON.parse(localStorage.getItem('userPages') || '[]');
      const updatedPages = [...existingPages];
      
      formattedPages.forEach(newPage => {
        const existingIndex = updatedPages.findIndex(p => p.id === newPage.id);
        if (existingIndex === -1) {
          updatedPages.push(newPage);
        } else {
          updatedPages[existingIndex] = newPage;
        }
      });
      
      localStorage.setItem('userPages', JSON.stringify(updatedPages));
      setIsLoading(false);
    }
  }, [yourPagesData]);

  // Update liked pages when data is loaded from GraphQL
  useEffect(() => {
    if (likedPagesData?.getLikedPages) {
      const formattedLikedPages = likedPagesData.getLikedPages.map(page => ({
        id: page.id,
        name: page.title,
        category: page.category,
        description: page.description,
        likes: '0', // Default likes count
        coverPhoto: page.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        profilePhoto: page.createdBy?.profileImage || page.profileImage || 'https://via.placeholder.com/150?text=User',
        isLiked: true, // These are liked pages
        isYours: false,
        createdAt: page.createdAt || new Date().toISOString(),
        createdBy: page.createdBy
      }));
      
      setLikedPages(formattedLikedPages);
      
      // Store liked pages in localStorage for PageDetail component
      const existingPages = JSON.parse(localStorage.getItem('userPages') || '[]');
      const updatedPages = [...existingPages];
      
      formattedLikedPages.forEach(newPage => {
        const existingIndex = updatedPages.findIndex(p => p.id === newPage.id);
        if (existingIndex === -1) {
          updatedPages.push(newPage);
        } else {
          updatedPages[existingIndex] = { ...updatedPages[existingIndex], ...newPage };
        }
      });
      
      localStorage.setItem('userPages', JSON.stringify(updatedPages));
      setIsLoading(false);
    }
  }, [likedPagesData]);

  const toggleLike = (pageId) => {
    const updatedPages = allPages.map(page => {
      if (page.id === pageId) {
        return { ...page, isLiked: !page.isLiked };
      }
      return page;
    });
    
    setAllPages(updatedPages);
    setSuggestedPages(updatedPages.filter(page => !page.isLiked && !page.isYours));
    setYourPages(updatedPages.filter(page => page.isYours));
    setLikedPages(updatedPages.filter(page => page.isLiked));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPageForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeModal = (e) => {
    if (e) e.stopPropagation();
    setIsCreateModalOpen(false);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleShare = (page, e) => {
    e.stopPropagation();
    setSelectedPageToShare(page);
    setShowShareModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-5 font-['Segoe_UI',sans-serif]">
      <header className="pt-4 mb-0 border-0">
        <div className="flex items-center mb-5 px-4">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600 text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        </div>
        <div className="flex px-4 gap-2.5 mb-4">
          <div className="relative flex-1 max-w-xl">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
            <input
              type="text"
              placeholder="Search pages"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-gray-900 text-sm outline-none focus:bg-gray-200 transition-colors"
            />
          </div>
          <button 
            className="bg-blue-600 text-white px-3 h-9 rounded-md text-sm font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FaPlus className="text-sm" /> 
            <span>Create Page</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['suggested', 'your', 'liked'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'suggested' 
                    ? 'Suggested For You' 
                    : tab === 'your' 
                      ? 'Your Pages' 
                      : 'Liked Pages'}
                  {activeTab === tab && (
                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {tab === 'suggested' 
                        ? suggestedPages.length 
                        : tab === 'your' 
                          ? yourPages.length 
                          : likedPages.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
        {isLoading ? (
          // Loading skeleton
          Array(6).fill().map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 mx-2 bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-20 bg-gray-200"></div>
              <div className="p-2">
                <div className="flex items-center -mt-6 mb-1">
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                <div className="flex justify-between mt-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Actual pages
          (activeTab === 'suggested' ? suggestedPages : 
           activeTab === 'your' ? yourPages : likedPages).map(page => (
            <div 
              key={page.id} 
              className="w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-80"
              onClick={() => handlePageClick(page.id)}
            >
              <div className="h-32 bg-gray-200 overflow-hidden">
                {page.coverPhoto ? (
                  <img 
                    src={page.coverPhoto} 
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center -mt-6 mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
                    <img 
                      src={page.profilePhoto || 'https://via.placeholder.com/150'} 
                      alt={page.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-gray-900">{page.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{page.category}</p>
                <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-1">
                  {page.description || 'No description available'}
                </p>
                
                {/* Like and Share Buttons */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <button 
                      className={`flex items-center justify-center space-x-1 w-1/2 py-2 text-sm rounded-l-md transition-colors ${
                        page.isLiked 
                          ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => handleLike(page, e)}
                    >
                      <FaThumbsUp className={page.isLiked ? 'fill-current' : ''} />
                      <span className={page.isLiked ? 'font-medium' : ''}>
                        {page.isLiked ? 'Liked' : 'Like'}
                      </span>
                    </button>
                    
                    <button 
                      className="flex items-center justify-center space-x-1 w-1/2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-r-md transition-colors"
                      onClick={(e) => handleShare(page, e)}
                    >
                      <FaShare className="text-gray-500" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Page Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create Page</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 p-2 -mr-2"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Page Name</label>
                <input 
                  type="text" 
                  placeholder="Page name"
                  value={pageForm.name}
                  onChange={(e) => setPageForm({...pageForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={pageForm.category}
                  onChange={(e) => setPageForm({...pageForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {(categoriesData?.getAllCategoriesPages || []).map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Describe your page"
                  value={pageForm.description}
                  onChange={(e) => setPageForm({...pageForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cover Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {coverPreview ? (
                    <div className="relative">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button 
                        type="button"
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-500"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview('');
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <FaImage className="text-3xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Upload Cover Photo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'cover')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {profilePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={profilePreview} 
                        alt="Profile preview" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                      <button 
                        type="button"
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-500"
                        onClick={() => {
                          setProfileImage(null);
                          setProfilePreview('');
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <FaImage className="text-3xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Upload Profile Picture</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'profile')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
              <button 
                className="px-4 py-2 text-gray-700 font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 rounded-md font-medium text-white flex items-center justify-center gap-2 ${
                  !pageForm.name || !pageForm.category || isCreatingPage
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleCreatePage}
                disabled={!pageForm.name || !pageForm.category || isCreatingPage}
              >
                {isCreatingPage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Page'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        contentType="page"
        contentData={selectedPageToShare ? {
          id: selectedPageToShare.id,
          title: selectedPageToShare.name,
          category: selectedPageToShare.category,
          description: selectedPageToShare.description,
          coverImage: selectedPageToShare.coverPhoto,
          profileImage: selectedPageToShare.profilePhoto,
          createdBy: selectedPageToShare.createdBy
        } : {}}
      />
    </div>
  );
};

export default PagesSection;
