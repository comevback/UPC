import axios from 'axios';
//import { ParaContext } from '../Global';

// Get data
//const { API_URL, CENTRAL_SERVER_URL, WebSocketURL } = ParaContext._currentValue;

// Check if the backend is connected
export const checkConnection = async (API_URL) => {
    try {
        const response = await axios.get(`${API_URL}/api`);
        if(response.status === 200){
            return (response.data);
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error connecting backend:', error);
    }
};


// Get the list of services
export const getServices = async (CENTRAL_SERVER_URL) => {
    try {
        const response = await axios.get(`${CENTRAL_SERVER_URL}/list-services`);
        return response.data;
    } catch (error) {
        console.error('Error fetching services:', error);
    }
};

// Register the service
export const registerService = async (CENTRAL_SERVER_URL) => {
    try {
      const response = await axios.post(`${CENTRAL_SERVER_URL}/frontend/register-service`, {
        name: 'React Frontend Service',
        url: window.location.origin,
      });
      console.log('Service registered, Server: ', response.data);
      return (response.data);
    } catch (error) {
      console.error('Failed to register service:', error);
    }
};

// Unregister the service
export const unregisterService = async (CENTRAL_SERVER_URL) => {
    try {
      const response = await axios.delete(`${CENTRAL_SERVER_URL}/frontend/unregister-service`, {
        name: 'React Frontend Service',
        url: window.location.origin,
      });
      console.log('Service unregistered:', response.data);
      return (response.data);
    } catch (error) {
      console.error('Failed to unregister service:', error);
    }
};

export const uploadData = async (API_URL, data) => {
        try {
                const response = await axios.post(`${API_URL}/api/upload`, data);
                console.log(response.data)
                return response.data;
        } catch (error) {
                console.error(error);
        }
};

// Get the list of files
export const getFiles = async (API_URL) => {
    try {
        const response = await axios.get(`${API_URL}/api/files`);
        return response.data;
    } catch (error) {
        console.error('Error fetching files:', error);
    }
};

// Get the list of results
export const getResults = async (API_URL) => {
    try {
        const response = await axios.get(`${API_URL}/api/results`);
        return response.data;
    } catch (error) {
        console.error('Error fetching results:', error);
    }
};

//delete a file
export const deleteFile = async (API_URL, fileName) => {
    try {
        const response = await axios.delete(`${API_URL}/api/files/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

//delete a result
export const deleteResult = async (API_URL, fileName) => {
    try {
        const response = await axios.delete(`${API_URL}/api/results/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting result:', error);
    }
};

// Download a file
export const downloadFile = async (API_URL, fileName) => {
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
export const downloadResult = async (API_URL, fileName) => {
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

// Generate image
export const generateImage = async (API_URL, fileName) => {
    try {
        const response = await axios.post(`${API_URL}/api/files/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error generating image:', error);
    }
};

// Get the list of images
export const getImages = async (API_URL) => {
    try {
        const response = await axios.get(`${API_URL}/api/images`);
        return response.data;
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// View an image details
export const viewImage = async (API_URL, fileName) => {
    try {
        const response = await axios.get(`${API_URL}/api/images/${fileName}`);
        // if ressponse.status === 404, return false
        if (response.status === 404) {
            return false;
        } else {
            return response.data;
        }
    } catch (error) {
        console.error('Error viewing image:', error);
    }
};

// Delete an image
export const deleteImage = async (API_URL, fileName) => {
    try {
        const response = await axios.delete(`${API_URL}/api/images/${fileName}`);
        if (response.status === 404) {
            return false;
        } else {
            return response.data;
        }
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

// export const runImage = async () => {
//     try {
//       const response = await axios.post('${API_URL}/api/images/docker-run', { imageName, fileName });
//       console.log(response.data); // 
//     } catch (error) {
//       console.error('Error running docker:', error);
//     }
// };
