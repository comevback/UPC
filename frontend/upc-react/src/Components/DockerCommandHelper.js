import React, { useState, useContext } from 'react';
import { ParaContext } from '../Global.js';
import fs from 'fs';
import OpenAI from 'openai';

const DockerCommandHelper = () => {
    const [file, setFile] = useState(null);
    const [dockerInstructions, setDockerInstructions] = useState('');
    const { CHATGPT_API } = useContext(ParaContext);

    const openai = new OpenAI(CHATGPT_API);

    const upload = async (file_input) => { 
        const file_upload = await openai.files.create({
          file: fs.createReadStream(file_input),
          purpose: "assistants",
        });
        console.log(file_upload);
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }  

    return (
        <div>
            <form onSubmit={upload}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default DockerCommandHelper;
