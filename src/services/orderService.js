import axios from "axios";
import { API_BASE_URL } from "./api";

export const getOrders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/order`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createOrder = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/order`, data);
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

export const deleteOrder = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/order/${id}`);
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