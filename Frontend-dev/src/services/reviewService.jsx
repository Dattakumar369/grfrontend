import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/reviews`;

const ReviewService = {
    addReview: async(reviewDTO) => {
        try {
            const response = await axios.post(`${BASE_URL}/add`, reviewDTO);
            return response.data;
        } catch (error) {
            console.error("Error adding review:", error);
            throw error;
        }
    },

    getReviewsById: async(id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching reviews by review ID:", error);
            throw error;
        }
    }, 

    getReviewsByProductId: async(productId) => {
        try {
            const response = await axios.get(`${BASE_URL}/product/${productId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching reviews by product ID:", error);
            throw error;
        }
    }, 

    updateReviewByReviewId: async(reviewId, reviewDTO) => {
        try {
            const response = await axios.put(`${BASE_URL}/${reviewId}`, reviewDTO);
            return response.data;
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    }, 

    deleteReviewByReviewId: async(reviewId) => {
        try {
            await axios.delete(`${BASE_URL}/${reviewId}`);
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    }
}

export default ReviewService;