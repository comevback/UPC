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
        selectionBackground: '#E4EFE7', // The color of the selection's background.
        selectionForeground: '#000000', // The color of the selection's text.
    };
    
    useEffect(() => {
        requestAnimationFrame(() => {
            console.log(`Terminal is being rendered`)
            socket.current = io(API_URL, {
                path: '/app', // The path to the WebSocket endpoint on the server
            });
            terminal.current = new Terminal({
                cursorBlink: true,     // cursor blinking
                cursorStyle: 'block',    // style（'block', 'underline', 'bar'）
                cursorInactiveStyle: 'block', // inactive cursor style
                fontSize: 15,          // font size
                fontFamily: 'monospace', // font family
                cols: 200,
                rows: 40,
                // theme: atomOneLightTheme,
                });
            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            setTimeout(() => {fitAddon.current.fit()}, 100);

            const end_style = '\x1b[0m';
            const demoColor = '\x1b[1;37m';
            //const lightblue_style = '\x1b[0;34m';
            const darkgreen_style = '\x1b[0;32m';

            terminal.current.writeln('\x1b[2J\x1b[0;0H');
            terminal.current.writeln(`${demoColor}---------------------------------------------------------------------------------------${end_style}`)
            terminal.current.writeln(`${demoColor}|                                      Terminal                                       |${end_style}`)
            terminal.current.writeln(`${demoColor}|-------------------------------------------------------------------------------------|${end_style}`)

            terminal.current.writeln(`${demoColor}|                              ██╗   ██╗██████╗  ██████╗                              |${end_style}`)
            terminal.current.writeln(`${demoColor}|                              ██║   ██║██╔══██╗██╔════╝                              |${end_style}`)
            terminal.current.writeln(`${demoColor}|                              ██║   ██║██████╔╝██║                                   |${end_style}`)
            terminal.current.writeln(`${demoColor}|                              ██║   ██║██╔═══╝ ██║                                   |${end_style}`)
            terminal.current.writeln(`${demoColor}|                              ╚██████╔╝██║     ╚██████╗                              |${end_style}`)
            terminal.current.writeln(`${demoColor}|                               ╚═════╝ ╚═╝      ╚═════╝                              |${end_style}`)

            terminal.current.writeln(`${demoColor}|-------------------------------------------------------------------------------------|${end_style}`)
            terminal.current.writeln(`${darkgreen_style}                                 ${API_URL}                                            ${end_style}`)
            terminal.current.writeln(`${demoColor}---------------------------------------------------------------------------------------${end_style}`)

            socket.current.on('output', (data) => {
                terminal.current.write(data); // 从服务器接收到的数据
            });

            terminal.current.onData((data) => {
                socket.current.emit('input', data); // 发送数据到服务器
            });

            return () => {
                terminal.current.dispose();
                socket.current.disconnect();
            };
        });
    }, [API_URL]);

    return (
        <>
            <div id='terminal' ref={terminalRef}/> 
        </>        
    );
};

export default Term;

