# Use the official Golang image as the base image
FROM golang:1.22-alpine as builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go app
RUN go build -o main .

# Use a minimal base image
FROM alpine:latest

# Set the working directory
WORKDIR /usr/src/app

# Install docker, curl, git, zsh, python3, make, g++ and zip
RUN apk update && apk add --no-cache docker-cli curl git zsh python3 make g++ zip

# Install oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# # Install zsh-autosuggestions and add source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh to .zshrc
# RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions && echo "source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ~/.zshrc

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main .
COPY --from=builder /app/views ./views
COPY --from=builder /app/public ./public

# Expose port 4000 to the outside world
EXPOSE 4000

# Set Zsh as the default shell
SHELL ["/bin/zsh", "-c"]

# Command to run the executable
CMD ["./main"]
