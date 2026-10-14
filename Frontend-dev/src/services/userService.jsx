import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/groceryol`;

const userService = {
  // Authentication
  login: (credentials) => axios.post(`${BASE_URL}/login`, credentials),

  // User endpoints
  registerUser: (userData) => axios.post(`${BASE_URL}/users/register`, userData),
  updateUser: (id, updateUserDTO) => axios.put(`${BASE_URL}/users/${id}`, updateUserDTO),
  deleteUser: (id) => axios.delete(`${BASE_URL}/users/${id}`),
  getAllUsers: () => axios.get(`${BASE_URL}/users`),
  getUserByEmail: (email) => axios.get(`${BASE_URL}/users/email/${email}`),

  // Delivery Person endpoints
  registerDeliveryPerson: (dpData) =>
    axios.post(`${BASE_URL}/delivery-persons/register`, dpData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateDeliveryPerson: (id, dpDTO) =>
    axios.put(`${BASE_URL}/delivery-persons/${id}`, dpDTO, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteDeliveryPerson: (id) => axios.delete(`${BASE_URL}/delivery-persons/${id}`),
  getAllDeliveryPersons: () => axios.get(`${BASE_URL}/delivery-persons`),
  getDeliveryPersonByEmail: (email) => axios.get(`${BASE_URL}/delivery-persons/email/${email}`),
  getDeliveryPersonImages: (id) => axios.get(`${BASE_URL}/delivery-persons/${id}/images`),

  // OTP and Password Reset
  sendOtp: (email) => axios.post(`${BASE_URL}/sendotp`, { email }),
  validateOtp: (data) => axios.post(`${BASE_URL}/validateotp`, data),
  requestPasswordChange: (email) => axios.post(`${BASE_URL}/request-password-change`, { email }),
  changePasswordWithOtp: (data) => axios.post(`${BASE_URL}/change-password`, data),
};

export default userService;
