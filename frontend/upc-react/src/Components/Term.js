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
    const atomOneLightTheme = {
        background: '#f9f9f9',
        foreground: '#383a42',
        cursor: '#d0d0d0',
        cursorAccent: '#000000', // The color of the cursor's accent. Allows for a contrasting cursor even in a block cursor.
        selection: 'rgba(80, 161, 79, 0.3)', // The color of the selection's background.
        black: '#000000',
        red: '#E45649',
        green: '#50A14F',
        yellow: '#986801',
        blue: '#4078F2',
        magenta: '#A626A4',
        cyan: '#0184BC',
        white: '#A0A1A7',
        brightBlack: '#5c6370',
        brightRed: '#e06c75',
        brightGreen: '#50A14F',
        brightYellow: '#986801',
        brightBlue: '#4078F2',
        brightMagenta: '#A626A4',
        brightCyan: '#0184BC',
        brightWhite: '#ffffff'
    };
    

    useEffect(() => {
        requestAnimationFrame(() => {
            console.log("Terminal is being rendered")
            socket.current = io(API_URL);
            terminal.current = new Terminal({
                FontWeight: '900', // font weight
                cursorBlink: true,     // cursor blinking
                cursorStyle: 'block',    // style（'block', 'underline', 'bar'）
                cursorInactiveStyle: 'block', // inactive cursor style
                fontSize: 15,          // font size
                fontFamily: 'monospace', // font family
                cols: 200,
                rows: 40,
                theme: atomOneLightTheme,
                });
            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            setTimeout(() => {fitAddon.current.fit()}, 100);

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
        });
    }, [API_URL]);

    return (
            <div id='terminal' ref={terminalRef}/>    
    );
};

export default Term;

