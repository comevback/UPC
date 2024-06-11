<div align="center">
<img src='./UPC-logo-rm.png' alt='UPC logo' width='300px' height='300px'/>
</div>
<h1 align="center">UPC-node</h1>
<p align="center">(User-PC Computing System)</p>

[日本語版](./README_JP.md) | [中文版](./README_CN.md)

This system is designed to easily execute the same tasks on different hosts. By leveraging Docker's capabilities, it allows users with no Docker knowledge to use it effortlessly.

This system is divided into three parts:

```
UPC
├── backend
│   ├── UPC-Node
│   └── UPC-GO
├── frontend
│   └── upc-react
└── register-server
```

1. **React Frontend**: Provides a user interface that allows users to interact with the system intuitively.
2. **Go or Node Backend**: Connects to the host's Docker daemon, receives requests from the frontend, and handles operations on files and Docker.
3. **Register Server**: Functions as a central server, managing all frontends and backends, aggregating information, and enabling the frontend to switch between different backends easily.

---

### Quick Start by Docker

```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

<img src='./UPC-script-demo.gif' alt='UPC logo' width='600px'/>

---

## Demo

<img src='./docker-run-command.gif' alt='docker run command' width='1000px'/>

1. Start the React(frontend) API(backend) servers and Register-Server.
2. Compress the directory of the task in to .zip file,
3. Upload the compressed file on React website,
4. Generate a image for this kind of task,
5. Upload files and process,
6. Download the results.


---

## Features
This system allows users to easily operate Docker through a web browser. Here are its main features:

- **File Management**: Upload and delete files.
- **Docker Image Creation**: Create Docker images from uploaded files.
- **Task Processing**: Perform various tasks on the backend.
- **Terminal Access**: Execute commands directly from the web browser.
- **Server Management**: Register and manage local or cloud servers.
- **Docker Deployment**: Deploy the entire system with a single command.

In short, this system allows users to operate Docker from the web interface to create, pull, and delete Docker images. Additionally, through a panel, it helps users utilize Docker containers more quickly and easily.

---

# Concepts

---

## Architecture of the UPC system
![Architecture of the UPC system](./architecture.png)
The UPC system consisted three main components:
1. **UPC-Worker** (backend server)
2. **User Interface** (React frontend)
3. **Register Server** (A cloud or local central server to manage the system)

--- 

## Workflow of the UPC system
![Workflow of the UPC system](./workflow.png)

---

## Principle of accessing from outside by Frp
![Frp](./Frp_Prin.png)
Frp is a fast reverse proxy that allows you to expose a server(service) from a local network.

Frp forwards requests to internal services via a server with a Public IP.

![Frp](./Frp_Imp.png)

---

## Docker image auto generation Process
![Docker image auto generation Process](./Docker_gene_pro.png)

The order to generate a Docker image in UPC system:
![Docker image gene demo](./Docker_gene.png)

---

# Usage

---

## Deploy and run using Docker (recommended)

<img src='./UPC-script-demo.gif' alt='UPC logo' width='600px'/>

### Script (copy&paste to your terminal to run):


- Whole UPC system:
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

- Go-Server :
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-go-docker.sh -o start-go-docker.sh &&
chmod +x start-go-docker.sh &&
./start-go-docker.sh
```

- Node-Server (deprecated):
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-api-docker.sh -o start-api-docker.sh &&
chmod +x start-api-docker.sh &&
./start-api-docker.sh
```

- Frontend-service:
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-react-docker.sh -o start-react-docker.sh &&
chmod +x start-react-docker.sh &&
./start-react-docker.sh
```

- Register-service:
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-register-docker.sh -o start-register-docker.sh &&
chmod +x start-register-docker.sh &&
./start-register-docker.sh
```

---

## Deploy Project with Node.js

These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisites

- Node.js: https://nodejs.org/en/download
- Docker: https://www.docker.com
- buildpack: https://buildpacks.io/docs/tools/pack
- MongoDB(optional): https://www.mongodb.com

## Installing

1. **Clone the repository**:

```bash
git clone https://github.com/comevback/UPC-node.git
cd UPC-node
```

2. **Install dependencies for the all**:

- Linux/MacOS:
```bash
npm run install-all
```
or
```bash
chmod +x install.sh
./install.sh
```

- Windows:
(If you are using Windows, please use *git bash* or other kinds of bash)
```bash
chmod +x install.sh
./install.sh
```

3. **Run the setup scripts to change the ip address of backend server to your host ip address**
```bash
chmod +x setArgs.sh
./setArgs.sh
```

## Start by Node.js

*If you want to use Database to store the registered service, create a .env file on register-server folder, and add a line as:*
```.env
MongoURL={your-mongoDB-RUL}
```

*otherwise the data will be loacl.*

**Run Frontend-Server Backend-Server and Register-Server at the same time:**

```bash
npm start
```

**Or run individual part:**

- Register-Server:
```bash
cd register-server
npm start
```

- Backend-Server:
```bash
cd backend/UPC-nodejs
npm start
```

- Frontend-Server:
```bash
cd frontend/upc-react
npm start
```

## Contributing

Xu Xiang

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
