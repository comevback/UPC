import React, { useEffect, useRef, useContext } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Term.css';
import { ParaContext } from '../Global.js';

const TermWS = () => {
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const fitAddon = useRef(new FitAddon());
    const socket = useRef(null);
    const { API_URL } = useContext(ParaContext);

    const atomOneLightTheme = {
        background: '#f9f9f9',
        foreground: '#383a42',
        cursor: '#d0d0d0',
        cursorAccent: '#000000',
        selectionBackground: '#E4EFE7',
        selectionForeground: '#000000',
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            console.log(`Terminal is being rendered`);
            // Create a new WebSocket connection
            socket.current = new WebSocket(`ws://localhost:4000/ws`);

            terminal.current = new Terminal({
                cursorBlink: true,
                cursorStyle: 'block',
                cursorInactiveStyle: 'block',
                fontSize: 15,
                fontFamily: 'monospace',
                cols: 200,
                rows: 40,
                // theme: atomOneLightTheme,
                scrollback: 10000, // 增加滚动缓冲区大小
            });

            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            setTimeout(() => { fitAddon.current.fit() }, 100);

            const end_style = '\x1b[0m';
            const demoColor = '\x1b[1;37m';
            const darkgreen_style = '\x1b[0;32m';

            terminal.current.writeln('\x1b[2J\x1b[0;0H');
            terminal.current.writeln(`${demoColor}---------------------------------------------------------------------------------------${end_style}`);
            terminal.current.writeln(`${demoColor}|                                      Terminal                                       |${end_style}`);
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

            // Handle WebSocket events
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
                socket.current.send(JSON.stringify({ type: 'input', data })); // 发送数据到服务器
            });

            return () => {
                terminal.current.dispose();
                if (socket.current) {
                    socket.current.close();
                }
            };
        });
    }, [API_URL]);

    return (
        <>
            <div id='terminal' ref={terminalRef} />
        </>
    );
};

export default TermWS;
