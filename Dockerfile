# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install docker and curl
RUN apk update && apk add --no-cache docker-cli curl git zsh python3 make g++ zip

# Install oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install zsh-autosuggestions
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# Append zsh-autosuggestions to the list of plugins in .zshrc
RUN sed -i 's/plugins=(/plugins=(zsh-autosuggestions /' ~/.zshrc

# Install project dependencies
RUN npm install

# Install pack
RUN (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.32.1/pack-v0.32.1-linux.tgz" | tar -C /usr/local/bin/ --no-same-owner -xzv pack)

# Copy project files into the docker image
COPY . .

RUN npm run install-all

# Expose port 3000 4000 8000
EXPOSE 3000 4000 8000

# Define the command to run when the container starts
CMD ["npm", "start"]

