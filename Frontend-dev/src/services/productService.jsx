const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/products`;

let productsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const getAllProducts = async () => {
  if (productsCache && Date.now() - lastFetchTime < CACHE_DURATION) {
    return productsCache;
  }

  const res = await fetch(`${API_BASE_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  
  // Update cache
  productsCache = data;
  lastFetchTime = Date.now();
  
  return data;
};

export const getProductById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

export const addProduct = async (productData) => {
  const res = await fetch(`${API_BASE_URL}/add`, {
    method: "POST",
    body: productData,
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: productData,
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.text();
};

export const getProductsByCategory = async (categoryId) => {
  const res = await fetch(`${API_BASE_URL}/category/${categoryId}`);
  if (!res.ok) throw new Error("Failed to fetch by category");
  return res.json();
};

export const bulkUploadProducts = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/bulk-upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload products in bulk");
  return res.json();
};

export const getAllSubCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/subcategories`);
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return res.json();
}

export const getAllProductsBySubCategory = async (subCategory) => {
  const res = await fetch(`${API_BASE_URL}/by-subcategory/${subCategory}`);
  if (!res.ok) throw new Error("Failed to fetch products by subcategory");
  return res.json();
};

// export const searchProducts = async (query) => {
//   try {
//     const allProducts = await getAllProducts();
//     const lowerCaseQuery = query.toLowerCase();
    
//     return allProducts.filter(product => 
//       product.name.toLowerCase().includes(lowerCaseQuery) ||
//       (product.description && product.description.toLowerCase().includes(lowerCaseQuery)) ||
//       (product.category && product.category.mainCategory.toLowerCase().includes(lowerCaseQuery))
//     );
//   } catch (error) {
//     console.error('Error searching products:', error);
//     throw error;
//   }


export const searchProducts = async (query, filters = {}) => {
  try {
    const allProducts = await getAllProducts();
    const lowerCaseQuery = query.toLowerCase();
    
    // Initial filtering by search query
    let filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      (product.description && product.description.toLowerCase().includes(lowerCaseQuery)) ||
      (product.category && product.category.mainCategory.toLowerCase().includes(lowerCaseQuery))
    );

    // Apply filters
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(filters.maxPrice));
    }
    
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        p => p.category && p.category.id === filters.category
      );
    }
    
    if (filters.rating) {
      filteredProducts = filteredProducts.filter(
        p => p.averageRating >= Number(filters.rating)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default: // relevant - already sorted by search relevance
        break;
    }

    return filteredProducts;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getProductsByCategoryId = async (categoryId, filters = {}) => {
  try {
    const allProducts = await getAllProducts();
    
    // Filter by category first
    let filteredProducts = allProducts.filter(
      p => p.category && p.category.id === categoryId
    );

    // Apply filters
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(filters.maxPrice));
    }
    
    if (filters.rating) {
      filteredProducts = filteredProducts.filter(
        p => p.averageRating >= Number(filters.rating)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default: // relevant - sort by some default (maybe popularity)
        filteredProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
    }

    return filteredProducts;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};
