import { useContext, useState } from "react";
import { ParaContext } from "../Global.js";
import { getServices } from "../Tools/api.js";
import './Heading.css';

const Heading = () => {
    const { API_URL, setAPI_URL, setAPI_NAME, CENTRAL_SERVER_URL, setWebSocketURL} = useContext(ParaContext);
    const [backendServices, setBackendServices] = useState([]);
    const [isShow, setIsShow] = useState(false);

    const InputHandler = async () => {
        setIsShow(!isShow);
        const response = await getServices(CENTRAL_SERVER_URL);
        if (response && Array.isArray(response)) {
            setBackendServices(response); // update the state
        }
    };

    const chooseAPIserver = (service) => {
        setAPI_URL(service.url);
        setAPI_NAME(service._id);
        // convert the http:// to ws://
        const wsURL = service.url.startsWith('https') ? service.url.replace('https', 'wss') : service.url.replace('http', 'ws');
        setWebSocketURL(wsURL);
    };

    return (
        <section className='heading'>
            <div className="server-with">
                <a href='./' title={`UPC system`} ><img className="logo" src="UPC-system.png" alt="UPC system"></img></a>
                <span className="server-title">Home</span>
            </div>
            <div className="server-with">
                <a href={CENTRAL_SERVER_URL} target="_blank" rel="noopener noreferrer" title={`The Register Server: \n ${CENTRAL_SERVER_URL}`}><img className="logo" src="Register.jpg" alt="Register Server"></img></a>
                <span className="server-title">List</span>
            </div>
            <div className="server-with">
                <a href={API_URL} target="_blank" rel="noopener noreferrer" title={`The backend APIs Documentation: \n ${API_URL}`}><img className="logo" src="Documents.png" alt="API-Server"></img></a>
                <span className="server-title">Doc</span>
            </div>
            <div className="server-with">
                <div><img title="Choose Server" className="logo" src="Change.png" alt="list all servers" onClick={InputHandler}></img></div>
                <span className="server-title">More</span>
            </div>
            <div className="divider"></div>
            

                <div className={`services ${isShow ? 'services-show' : ''}`}>
                    {backendServices.map((service, index) => (
                        <div className="server-with">
                            <a title={`Choose this Server: ${service.url}`} onClick={() => chooseAPIserver(service)}><img className="logo" src="API-server.png" alt="API-server"></img></a>
                            <span className="server-title">{index + 1}: {service._id}</span>
                        </div>
                    ))
                    }
                </div>
        </section>
    );
}

export default Heading;