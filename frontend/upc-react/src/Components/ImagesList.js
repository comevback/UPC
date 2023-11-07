import { useState } from 'react';
import { deleteImage, viewImage, runImage } from '../Tools/api';
import './ImagesList.css';

const ImagesList = (props) => {
    const [activeImageInfo, setActiveImageInfo] = useState(null); // Store the active image info object

    const handleViewClick = async (image) => {
        // Check if the activeImageInfo is already set to the clicked image
        if (activeImageInfo && activeImageInfo.RepositoryTags.includes(image)) {
            // If so, set it back to null to 'deselect' it
            setActiveImageInfo(null);
        } else {
            // If not, fetch the new image info and set it as the active info
            const response = await viewImage(image);
            setActiveImageInfo(response[0]); // Set the active image info to the first object in the response array
        }
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
                            <span>{image}</span>
                            <div className="buttons">
                                <button onClick={() => handleViewClick(image)}>View</button>
                                <button onClick={() => handleDeleteClick(image)}>Delete</button>
                                <button onClick={() => handleRunClick(image)}>Run</button>
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
