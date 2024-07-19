import React, { useContext, useState, useEffect, useRef } from "react";
import { ParaContext } from "../Global.js";
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Term.css';
import "./ProcessForm.css";

const ProcessFormWS = (props) => {
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const fitAddon = useRef(new FitAddon());
    const socket = useRef(null);
    const { API_URL } = useContext(ParaContext);

    const [formWidth, setFormWidth] = useState('45%');
    const [terminalWidth, setTerminalWidth] = useState('55%');

    const [Language, setLanguage] = useState(["bash", "python", "c", "c++", "java", "javascript", "go", "ruby", "rust", "php", "perl", "r", "swift", "kotlin", "scala", "haskell", "clojure", "elixir", "typescript", "julia", "ocaml", "racket", "commonlisp", "fortran", "erlang", "lua", "groovy", "dart"]);
    const [reliancesFiles, setReliancesFiles] = useState([]);
    const [portMappings, setPortMappings] = useState([{ Port_Host: null, Port_Container: null }]);
    const [envVariables, setEnvVariables] = useState([{ EnvKey: "", EnvValue: "" }]);
    const [volumeMappings, setVolumeMappings] = useState([{ Volume_Host: null, Volume_Container: null }]);
    const [dockerCommand, setDockerCommand] = useState("");
    const [formDatas, setFormDatas] = useState(
        {
            DockerImages: props.selectedImages,
            Interactive: false,
            Remove: false,
            Background: false,
            files: props.selectedFiles,
            reliancesFiles: [],
            portMappings: [],
            envVariables: [],
            volumeMappings: [],
            WorkDir: "",
            AdditionalParams: "",
            Execute: false,
        }
    );

    const atomOneLightTheme = {
        background: '#f9f9f9',
        foreground: '#383a42',
        cursor: '#d0d0d0',
        cursorAccent: '#000000',
        selectionBackground: '#E4EFE7',
        selectionForeground: '#000000',
    };

    useEffect(() => {
        const handleResize = (e) => {
            const containerWidth = document.querySelector('.processing').clientWidth;
            const newFormWidth = e.clientX / containerWidth * 100;
            const newTerminalWidth = 100 - newFormWidth;

            setFormWidth(`${newFormWidth}%`);
            setTerminalWidth(`${newTerminalWidth}%`);
        };

        const resizer = document.querySelector('.resizer');
        resizer.addEventListener('mousedown', () => {
            document.addEventListener('mousemove', handleResize);
        });

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', handleResize);
        });

        requestAnimationFrame(() => {
            console.log(`Terminal is being rendered`)
            let url = API_URL.replace('http', 'ws');
            socket.current = new WebSocket(url + '/ws');


            terminal.current = new Terminal({
                cursorBlink: true,
                cursorStyle: 'block',
                cursorInactiveStyle: 'block',
                fontSize: 15,
                fontFamily: 'monospace',
                cols: 200,
                rows: 40,
                // theme: atomOneLightTheme,
            });

            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            setTimeout(() => { fitAddon.current.fit() }, 100);

            const end_style = '\x1b[0m';
            const demoColor = '\x1b[1;37m';
            const darkgreen_style = '\x1b[0;32m';

            terminal.current.writeln('\x1b[2J\x1b[0;0H');
            terminal.current.writeln(`${demoColor}---------------------------------------------------------------------------------------${end_style}`);
            terminal.current.writeln(`${demoColor}|                                Docker command execute                                |${end_style}`);
            terminal.current.writeln(`${demoColor}|-------------------------------------------------------------------------------------|${end_style}`);

            terminal.current.writeln(`${demoColor}|                              ██╗   ██╗██████╗  ██████╗                              |${end_style}`);
            terminal.current.writeln(`${demoColor}|                              ██║   ██║██╔══██╗██╔════╝                              |${end_style}`);
            terminal.current.writeln(`${demoColor}|                              ██║   ██║██████╔╝██║                                   |${end_style}`);
            terminal.current.writeln(`${demoColor}|                              ██║   ██║██╔═══╝ ██║                                   |${end_style}`);
            terminal.current.writeln(`${demoColor}|                              ╚██████╔╝██║     ╚██████╗                              |${end_style}`);
            terminal.current.writeln(`${demoColor}|                               ╚═════╝ ╚═╝      ╚═════╝                              |${end_style}`);

            terminal.current.writeln(`${demoColor}|-------------------------------------------------------------------------------------|${end_style}`);
            terminal.current.writeln(`${darkgreen_style}                                 ${API_URL}                                            ${end_style}`);
            terminal.current.writeln(`${demoColor}---------------------------------------------------------------------------------------${end_style}`);

            socket.current.onopen = () => {
                console.log('WebSocket connection opened');
            };

            socket.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'geneMessage') {
                        terminal.current.write(message.message);
                    } else if (message.type === 'geneError') {
                        terminal.current.write(`\x1b[31m${message.message}\x1b[0m`);
                    } else if (message.type === 'output') {
                        terminal.current.write(message.data);
                    }
                } catch (e) {
                    console.error('Invalid message received:', event.data);
                }
            };

            socket.current.onclose = () => {
                console.log('WebSocket connection closed');
            };

            socket.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            terminal.current.onData((data) => {
                socket.current.send(JSON.stringify({ type: 'input', data }));
            });

            return () => {
                terminal.current.dispose();
                socket.current.close();
                document.removeEventListener('mousemove', handleResize);
            };
        });
    }, [API_URL]);

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let updatedFormDatas;

        if (name.startsWith("Port_Host_") || name.startsWith("Port_Container_")) {
            if (name.startsWith("Port_Host_")) {
                const index = parseInt(name.split("_")[2]);
                const newPortMappings = [...portMappings];
                newPortMappings[index].Port_Host = value;
                setPortMappings(newPortMappings);
            } else if (name.startsWith("Port_Container_")) {
                const index = parseInt(name.split("_")[2]);
                const newPortMappings = [...portMappings];
                newPortMappings[index].Port_Container = value;
                setPortMappings(newPortMappings);
            }
            updatedFormDatas = {
                ...formDatas,
                portMappings: portMappings,
            };
        } else if (name.startsWith("EnvKey_") || name.startsWith("EnvValue_")) {
            if (name.startsWith("EnvKey_")) {
                const index = parseInt(name.split("_")[1]);
                const newEnvVariables = [...envVariables];
                newEnvVariables[index].EnvKey = value;
                setEnvVariables(newEnvVariables);
            } else if (name.startsWith("EnvValue_")) {
                const index = parseInt(name.split("_")[1]);
                const newEnvVariables = [...envVariables];
                newEnvVariables[index].EnvValue = value;
                setEnvVariables(newEnvVariables);
            }
            updatedFormDatas = {
                ...formDatas,
                envVariables: envVariables,
            };
        } else if (name.startsWith("Volume_Host_") || name.startsWith("Volume_Container_")) {
            if (name.startsWith("Volume_Host_")) {
                const index = parseInt(name.split("_")[2]);
                const newVolumeMappings = [...volumeMappings];
                newVolumeMappings[index].Volume_Host = value;
                setVolumeMappings(newVolumeMappings);
            } else if (name.startsWith("Volume_Container_")) {
                const index = parseInt(name.split("_")[2]);
                const newVolumeMappings = [...volumeMappings];
                newVolumeMappings[index].Volume_Container = value;
                setVolumeMappings(newVolumeMappings);
            }
            updatedFormDatas = {
                ...formDatas,
                volumeMappings: volumeMappings
            };
        } else if (name.startsWith("reliancesFiles")) {
            const newReliancesFiles = Array.from(event.target.selectedOptions, option => option.value);
            setReliancesFiles(newReliancesFiles);
            updatedFormDatas = {
                ...formDatas,
                reliancesFiles: reliancesFiles
            };
        } else {
            updatedFormDatas = {
                ...formDatas,
                [name]: value,
            };
        }

        const commandParts = [
            "docker run",
            updatedFormDatas.Interactive ? "-it" : "",
            updatedFormDatas.Root ? "--user root" : "",
            updatedFormDatas.Remove ? "--rm" : "",
            updatedFormDatas.Background ? "-d" : "",
            updatedFormDatas.volumeMappings.map(volumeMapping => `-v ${volumeMapping.Volume_Host}:${volumeMapping.Volume_Container}`).join(' '),
            updatedFormDatas.envVariables.map(envVariable => `-e ${envVariable.EnvKey}=${envVariable.EnvValue}`).join(' '),
            updatedFormDatas.portMappings.map(portMapping => `-p ${portMapping.Port_Host}:${portMapping.Port_Container}`).join(' '),
            updatedFormDatas.WorkDir ? `-w ${updatedFormDatas.WorkDir}` : "",
            updatedFormDatas.DockerImages,
            updatedFormDatas.AdditionalParams,
            updatedFormDatas.Execute ? '\n' : ''
        ];

        const newDockerCommand = commandParts.filter(part => part).join(' ');

        setDockerCommand(newDockerCommand);
        setFormDatas(updatedFormDatas);
    }

    const addPortMapping = () => {
        setPortMappings([...portMappings, { Port_Host: null, Port_Container: null }]);
    }

    const removePortMapping = () => {
        if (portMappings.length > 1) {
            const newPortMappings = [...portMappings];
            newPortMappings.pop();
            setPortMappings(newPortMappings);
        }
    }

    const addEnvVariable = () => {
        setEnvVariables([...envVariables, { EnvKey: "", EnvValue: "" }]);
    }

    const removeEnvVariable = () => {
        if (envVariables.length > 1) {
            const newEnvVariables = [...envVariables];
            newEnvVariables.pop();
            setEnvVariables(newEnvVariables);
        }
    }

    const addVolumeMapping = () => {
        setVolumeMappings([...volumeMappings, { Volume_Host: null, Volume_Container: null }]);
    }

    const removeVolumeMapping = () => {
        if (volumeMappings.length > 1) {
            const newVolumeMappings = [...volumeMappings];
            newVolumeMappings.pop();
            setVolumeMappings(newVolumeMappings);
        }
    }

    const handleDockerRun = async (event) => {
        event.preventDefault();
        const dockerCommand = event.target.Docker_command.value;
        terminal.current.focus();
        socket.current.send(JSON.stringify({ type: 'input', data: dockerCommand }));
    }

    return (
        <div className="processing">
            <form className="processing-form" style={{ width: formWidth }} onSubmit={handleDockerRun} onChange={handleInputChange}>
                <label htmlFor="DockerImages" className="processing-info">Docker image:</label>
                <select className="processing-select" name="DockerImages" id="DockerImages" defaultValue={props.selectedImages} >
                    {props.images.map((image) => (
                        <option key={image} value={image} selected={image === props.selectedImages} >{image}</option>
                    ))
                    }
                </select>

                <label htmlFor="Interactive" className="processing-checkbox-label">
                    <input className="processing-checkbox" type="checkbox" name="Interactive" id="Interactive" />
                    Interactive (-it)
                </label>

                <label htmlFor="Root" className="processing-checkbox-label">
                    <input className="processing-checkbox" type="checkbox" name="Root" id="Root" />
                    root (--user root)
                </label>

                <label htmlFor="Remove" className="processing-checkbox-label">
                    <input className="processing-checkbox" type="checkbox" name="Remove" id="Remove" />
                    Remove after execution (--rm)
                </label>

                <label htmlFor="Background" className="processing-checkbox-label">
                    <input className="processing-checkbox" type="checkbox" name="Background" id="Background" />
                    Run on background (-d)
                </label>

                {/* <label htmlFor="Execute" className="processing-checkbox-label">
                    <input className="processing-checkbox" type="checkbox" name="Execute" id="Execute" />
                    Execute directly (Enter)
                </label> */}

                <label htmlFor="Language" className="processing-Language">Language:</label>
                <select className="processing-select" name="Language" id="Language" defaultValue="bash">
                    {Language.map((language) => (
                        <option key={language} value={language}>{language}</option>
                    ))
                    }
                </select>


                <label htmlFor="files" className="processing-info">Files:</label>
                <select className="processing-select" name="files" id="files" defaultValue={props.selectedFiles} multiple>
                    {props.files.map((file) => (
                        <option key={file} value={file} selected={props.selectedFiles.includes(file)} >{file}</option>
                    ))
                    }
                </select>

                <label htmlFor="reliancesFiles" className="processing-info">Reliances Files:</label>
                <select className="processing-select" name="reliancesFiles" id="reliancesFiles" multiple>
                    {props.files.map((file) => (
                        <option key={file} value={file}>{file}</option>
                    ))
                    }
                </select>


                {portMappings.map((portMapping, index) => (
                    <>
                        <label htmlFor="Port_Host" className="processing-port-label">Port Mapping {index + 1}:</label>
                        <input className="processing-port" type="number" name={`Port_Host_${index}`} id="Port_Host" placeholder="Host Port" />
                        <input className="processing-port" type="number" name={`Port_Container_${index}`} id="Port_Container" placeholder="Container Port" />
                        <div className="processing-add-and-remove">
                            <button className="processing-add" type="button" onClick={addPortMapping} >+</button>
                            <button className="processing-add" type="button" onClick={removePortMapping} >-</button>
                        </div>
                    </>
                ))}

                {envVariables.map((envVariable, index) => (
                    <>
                        <label htmlFor="EnvKey" className="processing-label">Environment Variables {index + 1}:</label>
                        <input className="processing-env" type="text" name={`EnvKey_${index}`} id="EnvKey" placeholder="env-key" />
                        <input className="processing-env" type="text" name={`EnvValue_${index}`} id="EnvValue" placeholder="env-value" />
                        <div className="processing-add-and-remove">
                            <button className="processing-add" type="button" onClick={addEnvVariable} >+</button>
                            <button className="processing-add" type="button" onClick={removeEnvVariable} >-</button>
                        </div>
                    </>
                ))}

                {volumeMappings.map((volumeMapping, index) => (
                    <>
                        <label htmlFor="Volume_Host" className="processing-label">Volume Mapping {index + 1}:</label>
                        <input className="processing-env" type="text" name={`Volume_Host_${index}`} id="Volume_Host" placeholder="Host Volume" />
                        <input className="processing-env" type="text" name={`Volume_Container_${index}`} id="Volume_Container" placeholder="Container Volume" />
                        <div className="processing-add-and-remove">
                            <button className="processing-add" type="button" onClick={addVolumeMapping} >+</button>
                            <button className="processing-add" type="button" onClick={removeVolumeMapping} >-</button>
                        </div>
                    </>
                ))}

                <label htmlFor="WorkDir" className="processing-label">WorkDir:</label>
                <input className="processing-input" type="text" name="WorkDir" id="WorkDir" placeholder="/path/to/directory (inside container)" />

                <label htmlFor="AdditionalParams" className="processing-label">Additional parameters:</label>
                <input className="processing-input" type="text" name="AdditionalParams" id="AdditionalParams" placeholder="Additional parameters (Commands)" />

                <label htmlFor="Docker_command" className="processing-label">Docker Command:</label>
                <textarea key={dockerCommand} className="processing-command" name="Docker_command" id="Docker_command" defaultValue={dockerCommand} />

                <div className="processing-buttons">
                    <button className="processing-button">Generate Image</button>
                    <button className="processing-button">Docker Run</button>
                </div>
            </form>

            <div className="resizer"></div>

            <div id='processing-terminal' ref={terminalRef} style={{ width: terminalWidth }} />
        </div>
    )
};

export default ProcessFormWS;
