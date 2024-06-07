import { useContext, useState, useEffect } from 'react';
import { deleteImage, viewImage, pullImage } from '../Tools/api';
import { ParaContext } from '../Global.js';
import Swal from 'sweetalert2';
import './ImagesList.css';

const ImagesList = (props) => {
    const [activeImageInfo, setActiveImageInfo] = useState(null); // 被选中的镜像
    const [searchValue, setSearchValue] = useState(''); // 搜索框的值
    const [isLoading, setIsLoading] = useState(false); // 是否正在加载
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

    // 搜索框
    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    }

    // 拉取镜像按钮
    const handlePullSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await pullImage(API_URL, searchValue);
            if (response === undefined || response.length === 0 || response === false) {
                alert('Image Cannot be pulled');
                return;
            } else {
                // 通过 SweetAlert2 显示信息
                Swal.fire({
                    title: `Pull Image`,
                    html: `Image ${searchValue} has been pulled successfully.`,
                    customClass: {
                        popup: 'formatted-alert'
                    },
                    width: '600px',
                    confirmButtonText: 'Close'
                });
            }
            props.refreshImages();
        } finally {
            setIsLoading(false);
            setSearchValue('');
        }
    }


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
                Swal.fire({
                    title: `Error`,
                    html: `Image can not be viewed.`,
                    customClass: {
                        popup: 'formatted-alert'
                    },
                    width: '600px',
                    confirmButtonText: 'Close'
                });
                return;
            } else {
                // 分解response[0]，将其各个属性显示出来
                const info = {
                    "WorkingDir": response[0].WorkingDir,
                    "Entrypoint": response[0].Entrypoint,
                    "Cmd": response[0].Cmd,
                    "Size": response[0].Size,
                    "Architecture": response[0].Architecture,
                    "Os": response[0].Os,
                    "Created": response[0].Created,
                    "Id": response[0].Id,
                }

                // 格式化 JSON 信息为 HTML 表格
                const infoHtml = `
                    <table class="info-table">
                        <tr><th>WorkingDir:</th><td>${info.WorkingDir}</td></tr>
                        <tr><th>Entrypoint:</th><td>${info.Entrypoint}</td></tr>
                        <tr><th>Cmd:</th><td>${info.Cmd}</td></tr>
                        <tr><th>Size:</th><td>${info.Size}</td></tr>
                        <tr><th>Architecture:</th><td>${info.Architecture}</td></tr>
                        <tr><th>Os:</th><td>${info.Os}</td></tr>
                        <tr><th>Created:</th><td>${info.Created}</td></tr>
                        <tr><th>ID:</th><td>${info.Id}</td></tr>
                    </table>
                `;

                // 通过 SweetAlert2 显示信息
                Swal.fire({
                    title: `${image}`,
                    html: `<pre>${infoHtml}</pre>`,
                    customClass: {
                        popup: 'formatted-alert',
                        header: 'formatted-alert-header',
                    },
                    width: '800px',
                    confirmButtonText: 'Close'
                });
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
                <form className="pull-form" onSubmit={handlePullSubmit}>
                    <input className='pull-input' type="text" placeholder="Input Image Name..." value={searchValue} onChange={handleSearchChange} />
                    <button className='pull-button' type="submit" >
                        {isLoading ? <div className="spinner"></div> : 'Pull Image'}
                    </button>
                </form>

                {props.images.map((image, index) => (
                    <li className={`image-item ${props.selectedImages.includes(image) ? 'selected' : ''}`} key={index}>
                        <div className='name-and-buttons'>
                            <input type='checkbox' className='checkbox' checked={props.selectedImages.includes(image)}
                            onChange={() => handleCheckboxChange(image)} />
                            <span>{image}</span>
                            <div className="buttons">
                                <button onClick={() => handleViewClick(image)}>View</button>
                                <button onClick={() => handleDeleteClick(image)}>&#10007;</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ImagesList;
