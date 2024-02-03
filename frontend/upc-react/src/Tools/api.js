import axios from 'axios';
import os from 'os';

// Get the Public frontend IP
const response = await axios.get('https://api.ipify.org?format=json');
const publicFrontUrl = `http://${response.data.ip}:3000`;
console.log('Frontend IP:', publicFrontUrl);

// Get the Local frontend IP
const getLocalIPAddress = () =>{
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
  
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
    return '0.0.0.0';
  }
  
  const localIP = getLocalIPAddress();
  const localFrontURL = `http://${localIP}:4000`;
  console.log(`Frontend Local IP Address: ${localIP}`);

// With Central Server ----------------------------------------------------------------------------------------

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
        _id: 'React Frontend Service',
        url: localFrontURL,
        publicUrl: publicFrontUrl,
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
        _id: 'React Frontend Service',
        url: localFrontURL,
        publicUrl: publicFrontUrl,
      });
      console.log('Service unregistered:', response.data);
      return (response.data);
    } catch (error) {
      console.error('Failed to unregister service:', error);
    }
};

// Send a heartbeat to the central server
export const sendHeartbeat = async (CENTRAL_SERVER_URL) => {
    try {
        await axios.post(`${CENTRAL_SERVER_URL}/frontend/service-heartbeat`, {
            _id: 'React Frontend Service',
            url: localFrontURL,
            publicUrl: publicFrontUrl,
        });
        console.log('Heartbeat sent: ————' + new Date(Date.now()).toLocaleString());
    } catch (error) {
        console.error('Failed to send heartbeat');
    }
};

// With API server --------------------------------------------------------------------------------------------

// Check if the backend is connected
export const checkConnection = async (API_URL) => {
    try {
        const response = await axios.get(`${API_URL}/api`);
        if(response.status >= 200 && response.status < 300){
            return (true);
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error connecting backend:', error);
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
        return [];
    }
};

// Get the list of results
export const getResults = async (API_URL) => {
    try {
        const response = await axios.get(`${API_URL}/api/results`);
        return response.data;
    } catch (error) {
        console.error('Error fetching results:', error);
        return [];
    }
};

// Get the list of temps
export const getTemps = async (API_URL) => {
    try {
        const response = await axios.get(`${API_URL}/api/temps`);
        return response.data;
    } catch (error) {
        console.error('Error fetching temps:', error);
        return [];
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

//delete a temp
export const deleteTemp = async (API_URL, fileName) => {
    try {
        const response = await axios.delete(`${API_URL}/api/temps/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting temp:', error);
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

// Download all files one by one
export const downloadAllFiles = async (API_URL, fileNames) => {
    try {
        // use Promise.all to download all files
        await Promise.all(fileNames.map(async (fileName) => {
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
        }));
    } catch (error) {
        console.error('Error downloading files:', error);
    }
}

// Download all files in a zip file
export const downloadAllFilesZip = async (API_URL, fileNames) => {
    try {
        const response = await axios({
            url: `${API_URL}/api/files/download`,
            method: 'POST',
            responseType: 'blob',
            data: { fileNames },
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const FileName = 'Files-' + Date.now()+ '.zip';
        link.setAttribute('download', FileName);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error downloading files:', error);
    }
}

// Delete all selected files
export const deleteAllFiles = async (API_URL, fileNames) => {
    try {
        const response = await axios.delete(`${API_URL}/api/files`, { data: { files: { fileNames } }});
        console.log(response.data);
    } catch (error) {
        console.error('Error deleting files:', error);
    }
}

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

// Download all results one by one
export const downloadAllResult = async (API_URL, fileNames) => {
    try {
        // use Promise.all to download all results
        await Promise.all(fileNames.map(async (fileName) => {
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
        }));
    } catch (error) {
        console.error('Error downloading results:', error);
    }
}

// Download all results in a zip file
export const downloadAllResultZip = async (API_URL, fileNames) => {
    try {
        const response = await axios({
            url: `${API_URL}/api/results/download`,
            method: 'POST',
            responseType: 'blob',
            data: { fileNames },
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const resultFileName = 'Result-' + Date.now()+ '.zip';
        link.setAttribute('download', resultFileName);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error downloading results:', error);
    }
}

// Delete all selected results
export const deleteAllResult = async (API_URL, fileNames) => {
    try {
        const response = await axios.delete(`${API_URL}/api/results`, { data: { files: { fileNames } }});
        console.log(response.data);
    } catch (error) {
        console.error('Error deleting results:', error);
    }
}

// Download a temp
export const downloadTemp = async (API_URL, fileName) => {
    try {
        const response = await axios({
            url: `${API_URL}/api/temps/${fileName}`,
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
        console.error('Error downloading temp:', error);
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
        return [];
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

// send a command to the backend
export const sendCommand = async (API_URL, command) => {
    try {
        const response = await axios.post(`${API_URL}/api/command`, { command });
        console.log(response.data);
    } catch (error) {
        console.error('Error sending command:', error);
    }
};

// // Process the images
// export const process = async (API_URL, imageName, additionalParams = {} ) => {
//     try {
//         const requestBody = { imageName, additionalParams:{...additionalParams} };
//         console.log(requestBody);
//         const response = await axios.post(`${API_URL}/api/process`, requestBody);
//         console.log(response.data);
//     } catch (error) {
//         console.error('Error running docker:', error);
//     }
// };

// // Process the images directly by command
// export const processByCommand = async (API_URL, command) => {
//     try {
//         const response = await axios.post(`${API_URL}/api/process-by-command`, { command });
//         console.log(response.data);
//     } catch (error) {
//         console.error('Error running docker:', error);
//     }
// };

// process this file with OpenAI, backend is :
// app.post('/api/openai/:fileName', async(req, res) => {
//     const { fileName } = req.params;
//     const filePath = path.join(__dirname, 'uploads', fileName);
//     const result = await AI_input(filePath);
//     console.log(result);
//     res.status(200).send(result);
// });
export const processFile = async (API_URL, fileName) => {
    try {
        const response = await axios.post(`${API_URL}/api/openai/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error processing file:', error);
    }
};


