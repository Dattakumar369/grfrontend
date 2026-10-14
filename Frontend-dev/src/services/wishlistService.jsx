import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL

export const addToWishlist = async (wishlistRequestDTO) => {
  try {
    const response = await axios.post(`${BASE_URL}/wishlist`, wishlistRequestDTO);
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};


export const getWishlistByUser = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/wishlist/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};


export const removeProductFromWishlist = async (userId, productId) => {
  try {
    await axios.delete(`${BASE_URL}/wishlist/user/${userId}/product/${productId}`);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};


export const moveToCart = async (userId, productId, quantity = 1) => {
  try {
    await axios.post(`${BASE_URL}/wishlist/move-to-cart/user/${userId}/product/${productId}`, null, {
      params: { quantity }
    });
  } catch (error) {
    console.error('Error moving item to cart:', error);
    throw error;
  }
};
