import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useMutation } from "@apollo/client";
import { ADD_CATEGORY_PAGE,DELETE_CATEGORY_PAGE,GET_ALL_CATEGORIES_PAGES} from "../../graphql/mutations";
import { GetTokenFromCookie } from '../../components/getToken/GetToken';
import { useToast } from '../hooks/use-toast';

const Pages = () => {
  // Category Management State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const { data: categoriesData, error: categoriesError, refetch: refetchCategories } = useQuery(GET_ALL_CATEGORIES_PAGES);
  const [addCategoryPage] = useMutation(ADD_CATEGORY_PAGE);
  const [deleteCategoryPage] = useMutation(DELETE_CATEGORY_PAGE);
  const [token, setToken] = useState();
  const { toast } = useToast();
  
  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    if (decodedUser?.id) {
      setToken(decodedUser);
    }
  }, []);

  // Category Management Functions
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await addCategoryPage({
          variables: { name: newCategoryName.trim(), userId: token?.id }
        });
        setNewCategoryName('');
        setIsAddingCategory(false);
        refetchCategories();
        
        // Show success toast
        toast({
          title: "Success",
          description: `Category "${newCategoryName}" has been added.`,
          variant: "success"
        });
      } catch (error) {
        console.error("Error creating category:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to add category",
          variant: "destructive"
        });
      }
    }
  };


  const handleDeleteCategory = async (categoryId) => {
  // Find the category from list
  const categories = categoriesData?.getAllCategoriesPages || [];
  const category = categories.find(c => c.id === categoryId.toString());
  if (!category) return alert("Category not found");

  // Check for user token
  if (!token?.id) return alert("User token not found. Please login again.");

  // Optional confirm dialog (for safety)
  const confirmDelete = window.confirm(`Are you sure you want to delete "${category.name}"?`);
  if (!confirmDelete) return;

  try {
    // Make GraphQL mutation call
    const response = await deleteCategoryPage({
      variables: { id: categoryId, userId: token.id }
    });


    // Refetch or update UI
    refetchCategories();

    // Show success
    alert(`Category "${category.name}" has been deleted successfully.`);
  } catch (error) {
    console.error("Error deleting category:", error);
    alert(`Failed to delete category: ${error.message}`);
  }
};


  return (
    <div className="min-h-screen bg-fuchsia-50 p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Categories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-fuchsia-900">Page Categories</h1>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="p-2 rounded-full bg-fuchsia-600 text-white shadow-md hover:bg-fuchsia-700 transition-colors active:scale-95"
              aria-label="Add new category"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* Categories List */}
          <div className="space-y-3 sm:space-y-4">
            {(categoriesData?.getAllCategoriesPages || []).map((category) => (
              <div
                key={category.id}
                className="relative flex items-center justify-between bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-fuchsia-200"
              >
                <span className="text-sm sm:text-base font-medium text-fuchsia-800 truncate w-full pr-8">
                  {category.name}
                </span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1 rounded-full text-fuchsia-400 hover:text-red-500 transition-colors absolute right-2 top-1/2 -translate-y-1/2"
                  aria-label={`Remove ${category.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {isAddingCategory && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-end justify-center z-50 p-4">
              <div className="w-full max-w-md bg-white rounded-xl p-4 shadow-2xl animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-fuchsia-900">New Category</h2>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full p-3 border border-fuchsia-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCategory();
                      if (e.key === 'Escape') {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }
                    }}
                  />
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-fuchsia-800 hover:bg-fuchsia-50 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                        newCategoryName.trim()
                          ? 'bg-fuchsia-600 hover:bg-fuchsia-700'
                          : 'bg-fuchsia-300 cursor-not-allowed'
                      }`}
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pages;
