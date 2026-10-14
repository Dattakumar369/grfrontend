import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("jwtToken");

// Helper to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const addAddress = async (userId, address, label = '', makeDefault = false) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/${userId}/addresses`,
      address,
      {
        params: { label, makeDefault },
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const getUserAddresses = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/users/${userId}/addresses`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
};

export const getDefaultAddress = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/users/${userId}/addresses/default`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching default address:', error);
    throw error;
  }
};

export const setDefaultAddress = async (userId, addressId) => {
  try {
    await axios.put(
      `${BASE_URL}/users/${userId}/addresses/${addressId}/set-default`,
      {},
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

export const deactivateAddress = async (userId, addressId) => {
  try {
    await axios.delete(
      `${BASE_URL}/users/${userId}/addresses/${addressId}`,
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error('Error deactivating address:', error);
    throw error;
  }
};
