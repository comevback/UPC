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

    // If click the checkbox, add the file to the selectedImages
    const handleCheckboxChange = (imageName) => {
        // const updatedSelectedImages = props.selectedImages.includes(imageName) 
        //     ? props.selectedImages.filter(file => file !== imageName)
        //     : [...props.selectedImages, imageName];
        
        // console.log('Updated selected files:', updatedSelectedImages);
        // props.setSelectedImages(updatedSelectedImages);    // This is the original code, set selectedImages as a Array.
        
        // if the file is already in the selectedImages, remove it from the selectedImages, otherwise add it to the selectedImages
        if (props.selectedImages === imageName) {
            props.setSelectedImages('');
        } else {
            props.setSelectedImages(imageName);
        }
        console.log('Updated selected files:', imageName);  // This is the new code, set selectedImages as a String.
    };


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
                    <li className={`image-item ${props.selectedImages.includes(image) ? 'selected' : ''}`} key={index}>
                        <div className='name-and-buttons'>
                            <input type='checkbox' className='checkbox' checked={props.selectedImages.includes(image)}
                            onChange={() => handleCheckboxChange(image)} />
                            <span>{image}</span>
                            <div className="buttons">
                                <button onClick={() => handleViewClick(image)}>View</button>
                                <button onClick={() => handleDeleteClick(image)}>delete</button>
                            </div>
                        </div>
                        {activeImageInfo && activeImageInfo.RepositoryTags.includes(image) && (
                            <div className='info'>
                                <p>WorkingDir: {activeImageInfo.WorkingDir}</p>
                                <p>Entrypoint: {activeImageInfo.Entrypoint}</p>
                                <p>Cmd: {activeImageInfo.Cmd}</p>
                                <p>Size: {activeImageInfo.Size}</p>
                                <p>Architecture: {activeImageInfo.Architecture}</p>
                                <p>Created: {new Date(activeImageInfo.Created).toLocaleDateString()}</p>
                                <p>ID: {activeImageInfo.Id}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ImagesList;
