import { useContext, useState, useEffect } from 'react';
import { deleteImage, viewImage } from '../Tools/api';
import { ParaContext } from '../Global.js';
import './ImagesList.css';

const ImagesList = (props) => {
    const [activeImageInfo, setActiveImageInfo] = useState(null); // Store the active image info object
    const { API_URL } = useContext(ParaContext);

    useEffect(() => {
        props.refreshImages();
    }, [API_URL]);

    const handleViewClick = async (image) => {

        // Check if the activeImageInfo is already set to the clicked image
        if (activeImageInfo && activeImageInfo.RepositoryTags.includes(image)) {
            // If so, set it back to null to 'deselect' it
            setActiveImageInfo(null);
        } else {
            // If not, fetch the new image info and set it as the active info
            const response = await viewImage(API_URL, image);
            // If the response is undefined, the image was not found
            if (response === undefined || response.length === 0 || response === false) {
                alert('Image Cannot be viewed');
                return;
            } else {
            setActiveImageInfo(response[0]); // Set the active image info to the first object in the response array
            }
        }
        props.refreshImages();
    };
    

    const handleDeleteClick = async (image) => {
        const response = await deleteImage(API_URL, image);
        if (response === undefined || response.length === 0 || response === false) {
            alert('Image Cannot be deleted');
            return;
        }
        props.refreshImages();
        // If the deleted image was the active image, clear the active image info
        if (activeImageInfo && activeImageInfo.RepositoryTags.includes(image)) {
            setActiveImageInfo(null);
        }
    };
    

    return (
        <div>
            <h1>Docker Images</h1>
            <ul className="image-list">
                {props.images.map((image, index) => (
                    <li key={index} className="image-item">
                        <div className='name-and-buttons'>
                            <span>{image}</span>
                            <div className="buttons">
                                <button onClick={() => handleViewClick(image)}>View</button>
                                <button onClick={() => handleDeleteClick(image)}>Delete</button>
                                <button >Run</button>
                            </div>
                        </div>
                        {activeImageInfo && activeImageInfo.RepositoryTags.includes(image) && (
                            <div className='info'>
                                <p>ID: {activeImageInfo.Id}</p>
                                <p>Created: {new Date(activeImageInfo.Created).toLocaleDateString()}</p>
                                <p>Size: {activeImageInfo.Size}</p>
                                <p>Architecture: {activeImageInfo.Architecture}</p>
                                <p>OS: {activeImageInfo.Os}</p>
                                <p>Docker Version: {activeImageInfo.DockerVersion || 'Unknown'}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ImagesList;
