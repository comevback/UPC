import React, { useState, useEffect } from 'react';
import './ImagesList.css';

const ImagesList = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/images')
            .then(response => response.json())
            .then(data => {
                setImages(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return ( 
        <div className="image-list">
            {images.map((image, index) => (
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
