import axios from "axios";

const API_BASE_URL = "https://api.bargainwale.com/api";

export const getBookings = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/booking`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createBooking = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/booking`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateOrder = async (data, id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/order/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateBillTypePartWise = async (orderId, updateData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/order/${orderId}/bill-type`, updateData);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};