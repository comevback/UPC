import { useState } from 'react';
import { deleteImage, viewImage } from '../Tools/api';
import './ImagesList.css';

const ImagesList = (props) => {
    const [activeImageInfo, setActiveImageInfo] = useState(null); // Store the active image info object

    const handleViewClick = async (image) => {
        const response = await viewImage(image);
        // Assuming 'response' will be an array of objects and we want the first one.
        setActiveImageInfo(response[0]); // Set the active image info to the first object in the response array
        props.refreshImages();
    };

    const handleDeleteClick = async (image) => {
        await deleteImage(image);
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
                            {image}
                            <div className="buttons">
                                <button onClick={() => handleViewClick(image)}>View</button>
                                <button onClick={() => handleDeleteClick(image)}>Delete</button>
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
