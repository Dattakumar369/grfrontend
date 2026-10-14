import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/cart`;

const CartService = {
  addToCart: async (cartDTO, sessionId = null) => {
    const headers = sessionId ? { 'X-Session-ID': sessionId } : {};
    const response = await axios.post(`${BASE_URL}/add`, cartDTO, { headers });
    return response.data;
  },

  getCartByUserId: async (userId) => {
    const response = await axios.get(`${BASE_URL}/user/${userId}`);
    return response.data;
  },

  getGuestCart: async (sessionId) => {
    try {
      const response = await axios.get(`${BASE_URL}/guest`, {
        headers: { 'X-Session-ID': sessionId }
      });
      return response.data;
    } catch (error) {
      console.error("Guest cart error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  updateCartItem: async (cartId, quantity, sessionId = null) => {
    const headers = sessionId ? { 'X-Session-ID': sessionId } : {};
    const response = await axios.put(`${BASE_URL}/${cartId}`, null, {
      params: { quantity },
      headers,
    });
    return response.data;
  },

  removeFromCart: async (cartId, sessionId = null) => {
    const headers = sessionId ? { 'X-Session-ID': sessionId } : {};
    await axios.delete(`${BASE_URL}/${cartId}`, { headers });
  },

  // In your CartService.js, add debug logs:
clearUserCart: async (userId) => {
  console.log(`Attempting to clear user cart for ${userId}`); // Debug
  try {
    const response = await axios.delete(`${BASE_URL}/clear/user/${userId}`);
    console.log('Clear user cart response:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error("Error clearing user cart:", error.response?.data || error.message);
    throw error;
  }
},

clearGuestCart: async (sessionId) => {
  console.log(`Attempting to clear guest cart for session ${sessionId}`); // Debug
  try {
    const response = await axios.delete(`${BASE_URL}/clear/guest`, {
      headers: { 'X-Session-ID': sessionId },
    });
    console.log('Clear guest cart response:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error("Error clearing guest cart:", error.response?.data || error.message);
    throw error;
  }
},

  mergeGuestCartWithUserCart: async (sessionId, userId) => {
    try {
      const response = await axios.post(`${BASE_URL}/merge/${sessionId}/${userId}`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Merge error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  createNewSession: async () => {
    const response = await axios.get(`${BASE_URL}/session/new`);
    return response.data;
  },
};

export default CartService;