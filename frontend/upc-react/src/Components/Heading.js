import { useContext, useState } from "react";
import { ParaContext } from "../Global.js";
import { getServices } from "../Tools/api.js";
import './Heading.css';

const Heading = () => {
    const { API_URL, setAPI_URL, CENTRAL_SERVER_URL, setCENTRAL_SERVER_URL, WebSocketURL, setWebSocketURL} = useContext(ParaContext);
    const [backendURLs, setBackendURLs] = useState([]);

    const InputHandler = async () => {
        const response = await getServices(CENTRAL_SERVER_URL);
        console.log(response);
        if (response && Array.isArray(response)) {
            if (response && Array.isArray(response)) {
                // Get the list of URLs
                const newUrls = response.map(service => service.url);
                setBackendURLs(newUrls); // update the state
            }
        }
    };

    const chooseAPIserver = (url) => {
        setAPI_URL(url);
        // convert the http:// to ws://
        const wsURL = url.startsWith('https') ? url.replace('https', 'wss') : url.replace('http', 'ws');
        setWebSocketURL(wsURL);
    }

    return (
        <section className='heading'>
            <a href="./" title={`UPC system`} ><img className="logo" src="UPC-system.png"></img></a>
            <a href={CENTRAL_SERVER_URL} title={`The Register Server: \n ${CENTRAL_SERVER_URL}`}><img className="logo" src="Regi.png"></img></a>
            <a href={API_URL} title={`The backend APIs Documentation: \n ${API_URL}`}><img className="logo" src="API-server.png"></img></a>
            <button className="button" onClick={InputHandler}>Show the list of backend services</button>
            <div className="services">
                {backendURLs.map((url, index) => (
                    <div>
                        <a title={`Choose this Server: ${url}`} onClick={() => chooseAPIserver(url)}><img className="logo" src="API-server.png"></img></a>
                        <span>{url}</span>
                    </div>
                    
                ))   
                }
            </div>
        </section>
    );
}

export default Heading;