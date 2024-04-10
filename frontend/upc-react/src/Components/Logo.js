import { useContext } from "react";
import "./Logo.css";
import { ParaContext } from "../Global";


const Logo = (props) => {
    const { API_URL } = useContext(ParaContext);
    
    return(
        <div className={`logo-and-title ${props.termShown ? 'hidden' : ''}`}>
            <a href='./' rel="noopener noreferrer"><img src='UPC-logo-rm.png' alt='UPC logo' width='300px' height='300px'/></a>
            <div>
                <h1 className='title'>UPC - Generate and Process</h1>
                <h2>Current Worker: <a className={`Serverlink ${props.connected ? '' : 'notConnected'}`} href={props.connected? API_URL : "./"} target="_blank" rel="noopener noreferrer">{props.connected? API_URL : "Not connected"}</a></h2>
            </div>
        </div>
    )
}


export default Logo;