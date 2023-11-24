# UPC-node

![Logo](./UPC-logo-rm.png "UPC-LOGO")

This project is a full-stack application that provides a platform for generating and managing UPC codes. It consists of a Node.js backend and a React frontend.

## Features

- **File Upload**: Upload files to the server.
- **Image Generation**: Generate images for UPC codes.
- **Database Integration**: Store and manage UPC data using MongoDB. (in progress).
- **Server registration**: register backend API servers and frontend React servers at Register-Server.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisites

- Node.js: https://nodejs.org/en/download
- Docker: https://www.docker.com
- buildpack: https://buildpacks.io/docs/tools/pack
- MongoDB(optional): https://www.mongodb.com

---

## Run by Docker

### Script：

All Services at once:
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

API-service:
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-api-docker.sh -o start-api-docker.sh &&
chmod +x start-api-docker.sh &&
./start-api-docker.sh
```

Frontend-service:
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-react-docker.sh -o start-react-docker.sh &&
chmod +x start-react-docker.sh &&
./start-react-docker.sh
```

Register-service:
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-register-docker.sh -o start-register-docker.sh &&
chmod +x start-register-docker.sh &&
./start-register-docker.sh
```

### Docker command:

Run all services at once:
```bash
docker run -it --rm -e HOST_URL={http://your_API_host:4000} -e CENTRAL_SERVER={http://your_central_server:8000} -e INITIAL_API_URL={http://your_API_host:4000} -e INITIAL_CENTRAL_SERVER_URL={http://your_central_server:8000} -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000 -p 4000:4000 -p 8000:8000 afterlifexx/upc-system:1.0
```

for example(all services at once):
```bash
docker run -it --rm -e HOST_URL=http://192.168.0.103:4000 -e CENTRAL_SERVER=http://192.168.0.103:8000 -e INITIAL_API_URL=http://192.168.0.103:4000 -e INITIAL_CENTRAL_SERVER_URL=http://192.168.0.103:8000 -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000 -p 4000:4000 -p 8000:8000 afterlifexx/upc-system:1.0
```

```bash
docker run -it --rm -e HOST_URL=http://172.28.235.225:4000 -e CENTRAL_SERVER=http://172.28.235.225:8000 -e INITIAL_API_URL=http://172.28.235.225:4000 -e INITIAL_CENTRAL_SERVER_URL=http://172.28.235.225:8000 -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000 -p 4000:4000 -p 8000:8000 afterlifexx/upc-system:1.0
```

API-service:
```bash
docker run -it --rm -e HOST_URL={http://your_API_host:4000} -e CENTRAL_SERVER={http://your_central_server:8000} -v /var/run/docker.sock:/var/run/docker.sock -p 4000:4000 afterlifexx/upc-api:1.0
```
for example( API service ):
```bash
docker run -it --rm -e HOST_URL=http://172.28.235.64:4000 -e CENTRAL_SERVER=http://172.28.235.225:8000 -v /var/run/docker.sock:/var/run/docker.sock -p 4000:4000 afterlifexx/upc-api:1.0
```

Register-service:
```bash
docker run  -it --rm -p 8000:8000 afterlifexx/upc-register:1.0
```

Frontend-service:
```bash
docker run  -e INITIAL_API_URL={http://your_API_host:4000} -e INITIAL_CENTRAL_SERVER_URL={http://your_central_server:8000} -p 3000:3000 afterlifexx/upc-react:1.0
```

---

### Installing

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

## Usage

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

Register-Server:
```bash
cd register-server
npm start
```

Backend-Server:
```bash
cd backend/UPC-nodejs
npm start
```

Frontend-Server:
```bash
cd frontend/upc-react
npm start
```

## Workflow

1. Start the React(frontend) API(backend) servers and Register-Server.
2. Compress the directory of the task in to .zip file,
3. Upload the compressed file on React website,
4. Generate a image for this kind of task,
5. Upload files and process,
6. Download the results.

## Contributing

Xu Xiang

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
