import { useState } from "react";
import { API_URL, CENTRAL_SERVER_URL } from "../Tools/api";
import './Heading.css';

const Heading = () => {
    return (
        <section className='heading'>
            <a href="./" title="UPC-system" ><img className="logo" src="UPC-system.png"></img></a>
            <a href={CENTRAL_SERVER_URL} title="The Register Server"><img className="logo" src="Regi.png"></img></a>
            <a href={API_URL} title="The backend APIs Documentation"><img className="logo" src="API-server.png"></img></a>
        </section>
    );
}

export default Heading;