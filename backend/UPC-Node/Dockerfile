# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install docker and curl and python3 and make and g++
RUN apk update && apk add --no-cache docker-cli curl git zsh python3 make g++ zip

# Install oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install zsh-autosuggestions and add source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh to .zshrc
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions && echo "source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ~/.zshrc

# Install project dependencies
RUN npm install

# Install pack
RUN (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.32.1/pack-v0.32.1-linux.tgz" | tar -C /usr/local/bin/ --no-same-owner -xzv pack)

# Copy project files into the docker image
COPY . .

# start the frp client
RUN chmod +x /usr/src/app/frpc

# Expose port 4000
EXPOSE 4000

# Define the command to run when the container starts
# if want to use cloud server as a register server, change to the last step to : CMD sh -c "npm start && /usr/src/app/frpc -c /usr/src/app/frpc.ini"
CMD sh -c "npm start"

