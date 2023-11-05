// Desc: This file contains the ImagesList component which is used to display a list of images
import { useState } from 'react';
import { deleteImage, viewImage } from '../Tools/api';
import './ImagesList.css';

const ImagesList = (props) => {
    const [imageInfo, setImageInfo] = useState([]);

    return ( 
        <div>
            <h1>Docker Images</h1>
                <div className="image-list">
                {props.images.map((image, index) => (
                    <li key={index} className="image-item">
                        {image}
                        <div className="buttons">
                            {/* Example buttons for each image */}
                            <button onClick={
                                async() => {
                                    const response = await viewImage(image);
                                    setImageInfo(response);
                                    props.refreshImages();
                                }
                            }>View</button>
                            <button onClick={
                                async() => {
                                    await deleteImage(image);
                                    props.refreshImages();
                                }
                            }>Delete</button>
                        </div>
                    </li>
                ))}
            </div>
        </div>
        
    );
};

export default ImagesList;
