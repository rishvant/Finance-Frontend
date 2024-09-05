import axios from "axios";
import { API_BASE_URL } from "./api";

export const getSales = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/sale`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createSales = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/sale`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateSales = async (data, id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/sale/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};