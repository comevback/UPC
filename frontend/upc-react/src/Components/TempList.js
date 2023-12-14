import { downloadTemp, deleteTemp } from "../Tools/api";
import { useContext, useEffect, useState } from "react";
import { ParaContext } from "../Global.js";
import './TempList.css';


const TempList = (props) => {
    const { API_URL } = useContext(ParaContext);

    useEffect(() => {
        props.refreshTemps();
    }, [API_URL]);

    return (
        <div>
            <h1>Temps</h1>
            <ul className="temp-list">
                {props.temps.map(temp => (
                    <li className="temp-item" key={temp}>
                        <div className='name-and-buttons'>
                            <span>{temp}</span>
                            <div className='buttons'>
                                <button onClick={() => downloadTemp(API_URL, temp)}>Download</button>
                                <button onClick={async() => {
                                    await deleteTemp(API_URL, temp);
                                    props.refreshTemps();
                                }}>Delete</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TempList;


{/* <TempList temps={temps} refreshTemps={refreshTemps} refreshAll={refresh}/> */}