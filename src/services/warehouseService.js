import axios from "axios";

const API_BASE_URL = "https://finance-o02q.onrender.com/api";

export const getWarehouses = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/warehouse`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const getWarehouseById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/warehouse/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createWarehouse = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/warehouse`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const fetchWarehouse = async (state, city) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/warehouse/filter?state=${state}&city=${city}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

