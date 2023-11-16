# UPC-node

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
