"use client"

import { useState, useEffect } from "react"
import { Plus, X, Trash2, Check } from "lucide-react"
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useMutation } from "@apollo/client"
import { GET_ALL_CATEGORIES, DELETE_CATEGORY, CREATE_CATEGORY } from "../../graphql/mutations"
import { GetTokenFromCookie } from '../../components/getToken/GetToken';

export default function ReelsCategoriesManagement() {
    const [categories, setCategories] = useState([
        { id: uuidv4(), name: 'Travel' },
        { id: uuidv4(), name: 'Food' },
        { id: uuidv4(), name: 'Fitness' },
        { id: uuidv4(), name: 'Comedy' },
        { id: uuidv4(), name: 'Music' },
        { id: uuidv4(), name: 'DIY' },
        { id: uuidv4(), name: 'Gaming' },
        { id: uuidv4(), name: 'Art' }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
      const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch } = useQuery(GET_ALL_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY)
    const [deleteCategory] = useMutation(DELETE_CATEGORY);
    const [token,setToken] = useState();

    useEffect(() => {
        const decodedUser = GetTokenFromCookie();
        /* console.log(...) */ void 0;
        if(decodedUser?.id){
          setToken(decodedUser);
        }
      }, []);

    const handleAddCategory = async () => {
        if (newCategoryName.trim()) {
            try {
                await createCategory({
                    variables: { name: newCategoryName.trim(), userId : token?.id }
                });
                setNewCategoryName("");
                setIsAdding(false);
                refetch(); // Refresh the categories list
            } catch (error) {
                console.error("Error creating category:", error);
            }
        }
    };

    const handleRemoveCategory = async (categoryId) => {
        try {
            await deleteCategory({
                variables: { id: categoryId, userId : token?.id }
            });
            refetch(); // Refresh the categories list
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="min-h-screen bg-fuchsia-50 p-4 sm:p-6 font-sans flex flex-col">
            {/* Header with Title and Add Button */}
            <header className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-fuchsia-900">Reels Categories</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="p-2 rounded-full bg-fuchsia-600 text-white shadow-md hover:bg-fuchsia-700 transition-colors active:scale-95"
                    aria-label="Add new category"
                >
                    <Plus size={20} />
                </button>
            </header>

            {/* Categories List - Rectangular Rows */}
            <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto pb-20">
                {(categoriesData?.getAllCategories || []).map((category) => (
                    <div
                        key={category.id}
                        className="relative flex items-center justify-between bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-fuchsia-200"
                    >
                        <span className="text-sm sm:text-base font-medium text-fuchsia-800 truncate w-full pr-8">{category.name}</span>
                        <button
                            onClick={() => handleRemoveCategory(category.id)}
                            className="p-1 rounded-full text-fuchsia-400 hover:text-red-500 transition-colors absolute right-2 top-1/2 -translate-y-1/2"
                            aria-label={`Remove ${category.name}`}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Category Modal/Input */}
            {isAdding && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-end justify-center z-50 p-4">
                    <div className="w-full max-w-md bg-white rounded-xl p-4 shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-fuchsia-900">New Category</h2>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="p-1 text-fuchsia-400 hover:text-fuchsia-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-fuchsia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-300 text-fuchsia-800"
                            />
                            <button
                                onClick={handleAddCategory}
                                className="p-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
                            >
                                <Check size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}