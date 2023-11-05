// Desc: This file contains the ImagesList component which is used to display a list of images

import './ImagesList.css';

const ImagesList = (props) => {
    return ( 
        <div className="image-list">
            {props.images.map((image, index) => (
                <li key={index} className="image-item">
                    {image}
                    <div className="buttons">
                        {/* Example buttons for each image */}
                        <button>View</button>
                        <button>Delete</button>
                    </div>
                </li>
            ))}
        </div>
    );
};

export default ImagesList;
