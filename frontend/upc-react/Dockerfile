# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy project files into the docker image
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with serve
FROM node:20-alpine

# Install serve globally
RUN npm install -g serve

# Copy the build output to the final image
COPY --from=build /usr/src/app/build /usr/src/app/build

# Expose port 3000
EXPOSE 3000

# Define the command to run serve
CMD ["serve", "-s", "/usr/src/app/build", "-l", "3000"]
