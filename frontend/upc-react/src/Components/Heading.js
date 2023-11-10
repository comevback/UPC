import { useState } from "react";
import { API_URL, CENTRAL_SERVER_URL } from "../Tools/api";
import './Heading.css';

const Heading = () => {
    return (
        <section className='heading'>
            <a href={API_URL}><h1>UPC API Documentation</h1></a>
            <a href={CENTRAL_SERVER_URL}><h1>Register Server</h1></a>
        </section>
    );
}

export default Heading;