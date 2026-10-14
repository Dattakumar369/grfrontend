import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/orders`; 

// ====================== USER APIs ====================== //

// Create order using a new address (with optional saveAddress and label)
export const createOrder = async (userId, address, saveAddress = false, addressLabel = "") => {
  return axios.post(`${API_BASE_URL}/create/${userId}`, null, {
    params: {
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      saveAddress,
      addressLabel,
    },
    
  });
};

// ✅ New: Create order with saved address
export const createOrderWithSavedAddress = async (userId, addressId) => {
  return axios.post(`${API_BASE_URL}/create-with-saved-address/${userId}`, null, {
    params: { addressId },
  });
};

// ✅ New: Get user's saved addresses
export const getUserAddresses = async (userId) => {
  return axios.get(`${API_BASE_URL}/${userId}/addresses`);
};

export const getOrderById = async (orderId) => {
  return axios.get(`${API_BASE_URL}/${orderId}`);
};

export const getOrdersByUser = async (userId) => {
  return axios.get(`${API_BASE_URL}/user/${userId}`);
};

export const cancelOrder = async (orderId) => {
  return axios.post(`${API_BASE_URL}/${orderId}/cancel`);
};

// ====================== ADMIN APIs ====================== //

export const getAllOrderHistory = async () => {
  return axios.get(`${API_BASE_URL}/history/all`);
};

export const processOrder = async (orderId) => {
  return axios.post(`${API_BASE_URL}/${orderId}/process`);
};

export const getOrderHistory = async (orderId) => {
  return axios.get(`${API_BASE_URL}/${orderId}/history`);
};

export const getTotalOrderCount = async () => {
  return axios.get(`${API_BASE_URL}/count`);
};

export const getTotalCompletedPaymentAmount = async () => {
  return axios.get(`${API_BASE_URL}/completed-payments-total`);
};

export const getPendingPaymentOrderCount = async () => {
  return axios.get(`${API_BASE_URL}/pending-payments/count`);
};

export const getPendingPaymentAmount = async () => {
  return axios.get(`${API_BASE_URL}/pending-payments/amount`);
};

export const getPendingPaymentOrders = async () => {
  return axios.get(`${API_BASE_URL}/pending-payments/orders`);
};

export const getPendingDeliveryStatus = async () => {
  return axios.get(`${API_BASE_URL}/pending-delivery`)
};

export const getCompletedDeliveries = async () => {
  return axios.get(`${API_BASE_URL}/completed`)
}


// ====================== DELIVERY PERSON APIs ====================== //

export const getAvailableOrdersForDelivery = async () => {
  return axios.get(`${API_BASE_URL}/available`);
};

export const acceptOrderByDeliveryPerson = async (orderId, deliveryPersonId) => {
  return axios.post(`${API_BASE_URL}/${orderId}/accept/${deliveryPersonId}`);
};

export const rejectOrderByDeliveryPerson = async (orderId, deliveryPersonId, reason) => {
  return axios.post(`${API_BASE_URL}/${orderId}/reject/${deliveryPersonId}`, null, {
    params: { reason },
  });
};

export const getOrdersByDeliveryPerson = async (deliveryPersonId) => {
  return axios.get(`${API_BASE_URL}/delivery/${deliveryPersonId}`);
};

export const updateOrderStatus = async (orderId, status, notes = "") => {
  return axios.post(`${API_BASE_URL}/${orderId}/status`, null, {
    params: { status, notes },
  });
};
