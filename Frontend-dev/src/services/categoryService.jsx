const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/categories`;

export const getAllCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/all`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return await response.json();
};

export const addCategory = async (categoryData) => {
  const response = await fetch(`${API_BASE_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) throw new Error("Failed to add category");
  return await response.json();
};

export const getCategoryById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Category not found");
  return await response.json();
};

export const updateCategory = async (id, categoryData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) throw new Error("Failed to update category");
  return await response.json();
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete category");
};

export const getCategoryBySubCategory = async (subcategory) => {
  const response = await fetch(`${API_BASE_URL}/by-sub-category/${subcategory}`);
  if (!response.ok) throw new Error("Failed to fetch category by subcategory");
  return await response.json();
}