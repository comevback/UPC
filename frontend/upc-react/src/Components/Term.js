import React, { useEffect, useRef, useContext } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Term.css';
import io from 'socket.io-client';
import { ParaContext } from '../Global.js';

const Term = () => {
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const fitAddon = useRef(new FitAddon());
    const socket = useRef(null);
    const { API_URL } = useContext(ParaContext);
    

    useEffect(() => {
        console.log("Term is mounted");
            socket.current = io(API_URL);
            terminal.current = new Terminal({
                theme: {
                    background: '#1d1f21',
                    foreground: '#ffffff',
                    cursor: 'yellow',
                    // 其他您想要自定义的样式...
                }
            });
            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            fitAddon.current.fit()

            socket.current.on('output', (data) => {
                terminal.current.write(data);
            });

            terminal.current.onData((data) => {
                socket.current.emit('input', data);
            });

            return () => {
                terminal.current.dispose();
                socket.current.disconnect();
            };
    }, []);

    return (
            <div id='terminal' ref={terminalRef} />
    );
};

export default Term;

