import axios from "axios";
import { API_BASE_URL } from "./api";

export const getPurchases = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/purchase`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createPurchase = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/purchase`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updatePurchase = async (data, id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/purchase/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};