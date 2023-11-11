import { useState } from "react";
import { API_URL, CENTRAL_SERVER_URL, getServices } from "../Tools/api";
import './Heading.css';

const Heading = () => {
    let backendURLs = [];
    const InputHandler = async () => {
        const response = await getServices();
        console.log(response);
        if (response && Array.isArray(response)) {
            // Iterate over the list of services
            response.forEach(service => {
                // add the backend service URL to the list
                backendURLs.push(service.url);
            });
        }
        console.log(backendURLs);
    };

    return (
        <section className='heading'>
            <a href="./" title="UPC-system" ><img className="logo" src="UPC-system.png"></img></a>
            <a href={CENTRAL_SERVER_URL} title="The Register Server"><img className="logo" src="Regi.png"></img></a>
            <a href={API_URL} title="The backend APIs Documentation"><img className="logo" src="API-server.png"></img></a>
            <button className="button" onClick={InputHandler}>Show the list of backend services</button>
            <div className="services">
                {backendURLs.map((url, index) => (
                    <a>{url}</a> 
                ))   
                }
            </div>
        </section>
    );
}

export default Heading;