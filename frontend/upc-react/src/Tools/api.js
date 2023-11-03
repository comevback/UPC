import axios from 'axios';

// Get data
const API_URL = 'http://localhost:3001'; // replace with your backend URL

export const getData = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/data`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

export const uploadData = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/api/upload`, data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};
