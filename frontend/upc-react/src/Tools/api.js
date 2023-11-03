import axios from 'axios';

// Get data
const API_URL = 'http://localhost:3001'; // replace with your backend URL

export const uploadData = async (data) => {
        try {
                const response = await axios.post(`${API_URL}/api/upload`, data);
                console.log(response.data)
                return response.data;
        } catch (error) {
                console.error(error);
        }
};

// Get the list of files
export const getFiles = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/files`);
        return response.data;
    } catch (error) {
        console.error('Error fetching files:', error);
    }
};

// Get the list of results
export const getResults = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/results`);
        return response.data;
    } catch (error) {
        console.error('Error fetching results:', error);
    }
};

// Download a file
export const downloadFile = async (fileName) => {
    try {
        const response = await axios({
            url: `${API_URL}/api/files/${fileName}`,
            method: 'GET',
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};

// Download a result
export const downloadResult = async (fileName) => {
    try {
        const response = await axios({
            url: `${API_URL}/api/results/${fileName}`,
            method: 'GET',
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error downloading result:', error);
    }
};

