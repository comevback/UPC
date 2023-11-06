# UPC-node

This project is a full-stack application that provides a platform for generating and managing UPC codes. It consists of a Node.js backend and a React frontend.

## Features

- **File Upload**: Upload files to the server.
- **Image Generation**: Generate images for UPC codes.
- **Database Integration**: Store and manage UPC data using MongoDB. (in progress).
- **Server registration**: register backend API servers and frontend React servers at Register-Server.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm
- Docker
- Buildpack

### Installing

Clone the repository:

```bash
git clone https://github.com/comevback/UPC-nodejs.git
```

Install the necessary tools for this system:

- Docker: https://www.docker.com/
- buildpack: https://buildpacks.io/docs/tools/pack/

Install dependencies for the backend:

```bash
cd backend/UPC-nodejs
npm install
```

Start the backend server:

```bash
node app.js
```

Install dependencies for the frontend:

```bash
cd frontend/upc-react
npm install
```

Start the React development server:

```bash
npm start
```

### Usage

- Start the React(frontend) API(backend) servers and Register-Server.
- Compress the directory of the task in to .zip file,
- Upload the compressed file on React website,
- Generate a image for this kind of task,
- Upload files and process,
- Download the results.

### Contributing

Xu Xiang

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
