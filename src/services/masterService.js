import axios from "axios";
import { API_BASE_URL } from "./api";

// items
export const getItems = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/items`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createItem = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/items`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateItem = async (data, id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/items/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const deleteItem = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/items/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

// transport
export const getTransport = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/transports`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createTransport = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/transports`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateTransport = async (data, id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/transports/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const deleteTransport = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/transports/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

// buyer
export const getBuyer = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buyers`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createBuyer = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/buyers`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateBuyer = async (data, id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/buyers/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const deleteBuyer = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/buyers/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

// manufacturer
export const getManufacturer = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/manufacturers`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const createManufacturer = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/manufacturers`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateManufacturer = async (data, id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/manufacturers/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const deleteManufacturer = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/manufacturers/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};