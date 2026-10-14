import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const API_BASE_URL = `${API_URL}/payments`; 

/**
 * Fetch Razorpay order details for an existing order
 * @param {number|string} orderId
 * @returns {Promise<AxiosResponse<{orderId: string, amount: string, currency: string}>>}
 */
export const getPaymentDetails = (orderId) => {
  return axios.get(`${API_BASE_URL}/details`, {
    params: { orderId },
  });
};

/**
 * Check payment status for an order
 * @param {number|string} orderId
 * @returns {Promise<AxiosResponse<{status: string, payment_status: string, order_id: string}>>}
 */
export const checkPaymentStatus = (orderId) => {
  return axios.get(`${API_BASE_URL}/status`, {
    params: { orderId },
  });
};

/**
 * Verify a completed Razorpay payment
 * @param {string} paymentId      // razorpay_payment_id
 * @param {string} orderId        // razorpay_order_id
 * @param {string} signature      // razorpay_signature
 * @returns {Promise<AxiosResponse<{status: string, message: string, payment_id: string, order_id: string}>>}
 */
export const verifyPayment = (paymentId, orderId, signature) => {
  return axios.post(`${API_BASE_URL}/verify?paymentId=${paymentId}&orderId=${orderId}&signature=${signature}`);
};

/**
 * (Optional) Trigger your webhook handler manually
 * @param {Object} webhookData   // the full payload you want to send
 * @returns {Promise<AxiosResponse<string>>}
 */
export const sendWebhookEvent = (webhookData) => {
  return axios.post(`${API_BASE_URL}/webhook`, webhookData);
};