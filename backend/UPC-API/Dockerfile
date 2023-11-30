# Use an official Node runtime as a parent image
FROM debian:stable-slim

#ENV HOST_URL=http://localhost:4000
#ENV CENTRAL_SERVER=http://localhost:8000

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install docker and curl and python3 and make and g++
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl gnupg2 software-properties-common && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# Install project dependencies
RUN npm install

# Install pack
RUN (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.32.1/pack-v0.32.1-linux.tgz" | tar -C /usr/local/bin/ --no-same-owner -xzv pack)

# Copy project files into the docker image
COPY . .

# Expose port 4000
EXPOSE 4000

# Define the command to run when the container starts
CMD ["npm", "start"]

