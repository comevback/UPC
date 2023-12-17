import React, { useContext } from "react";
import { ParaContext } from "../Global.js";
import "./processing.css";

const Processing = (props) => {
    const { API_URL } = useContext(ParaContext);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const command = event.target.commandInput.value;
        console.log(command);
    }


    return(
        <div className="processing">
            <form className="processing-form" onSubmit={handleSubmit}>
                <textarea name="commandInput" placeholder="Enter your 'docker run' command" />
                <button className="processing-button">Submit</button>
            </form>
            <div className="processing-selection">
                <h2>Selection</h2>
                <label>Process Files?</label>
                <input type="checkbox" />
            </div>
        </div>
    )
};

export default Processing;