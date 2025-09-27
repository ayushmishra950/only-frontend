import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_CATEGORIES, DELETE_CATEGORY, CREATE_CATEGORY } from "../../graphql/mutations";
import { GetTokenFromCookie } from '../../components/getToken/GetToken';
import { useToast } from '../hooks/use-toast';

const Pages = () => {
  // Category Management State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState([
    { id: uuidv4(), name: 'General' },
    { id: uuidv4(), name: 'Information' },
    { id: uuidv4(), name: 'Legal' },
    { id: uuidv4(), name: 'Support' }
  ]);
  
  const { data: categoriesData, error: categoriesError, refetch: refetchCategories } = useQuery(GET_ALL_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
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
        await createCategory({
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
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    // Show confirmation toast
    toast({
      title: "Delete Category",
      description: `Are you sure you want to delete "${category.name}"?`,
      variant: "destructive",
      action: (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await deleteCategory({
                  variables: { id: categoryId, userId: token?.id }
                });
                refetchCategories();
                
                // Show success toast
                toast({
                  title: "Success",
                  description: `Category "${category.name}" has been deleted.`,
                  variant: "success"
                });
              } catch (error) {
                console.error("Error deleting category:", error);
                toast({
                  title: "Error",
                  description: error.message || "Failed to delete category",
                  variant: "destructive"
                });
              }
            }}
            className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      ),
    });
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
            {categories.map((category) => (
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
