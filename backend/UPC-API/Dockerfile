# Use an official Node runtime as a parent image
FROM node:20-alpine

#ENV HOST_URL=http://localhost:4000
#ENV CENTRAL_SERVER=http://localhost:8000

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Install docker and curl
RUN apk update && apk add docker-cli curl

# Install pack
RUN (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.32.1/pack-v0.32.1-linux.tgz" | tar -C /usr/local/bin/ --no-same-owner -xzv pack)

# Copy project files into the docker image
COPY . .

# Expose port 4000
EXPOSE 4000

# Define the command to run when the container starts
CMD ["npm", "start"]

