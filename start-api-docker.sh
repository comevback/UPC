#!/bin/bash

# get host name
os_name=$(uname -s)
white="\033[0;37m"
green="\033[1;32m"
end_style="\033[0m"

# test if sudo command exists
if command -v sudo &> /dev/null
then
    SUDO="sudo"
else
    SUDO=""
fi

# 检查 Docker 是否正在运行
if ! docker info > /dev/null 2>&1; then
    echo -e "\033[1;31mDocker is not running. Please start Docker and try again.\033[0m"
    exit 1
fi

#  get local ip address according to the operating system
if [ "$os_name" = "Linux" ]; then
    ip_address=$(hostname -I | awk '{print $1}')
elif [ "$os_name" = "Darwin" ]; then
    ip_address=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n 1)
else
    echo "Unsupported OS"
    os_name=Windows
    ip_address=localhost
fi

# get public ip address
public_ip_address=$(curl -s https://api.ipify.org)

echo -e "\033[2J\033[0;0H"
echo -e "${white}---------------------------------------------------------------------------------------${end_style}"
echo -e "${white}|                               UPC System Start Script                               |${end_style}"
echo -e "${white}|-------------------------------------------------------------------------------------|${end_style}"

echo -e "${white}|                              ██╗   ██╗██████╗  ██████╗                              |${end_style}"
echo -e "${white}|                              ██║   ██║██╔══██╗██╔════╝                              |${end_style}"
echo -e "${white}|                              ██║   ██║██████╔╝██║                                   |${end_style}"
echo -e "${white}|                              ██║   ██║██╔═══╝ ██║                                   |${end_style}"
echo -e "${white}|                              ╚██████╔╝██║     ╚██████╗                              |${end_style}"
echo -e "${white}|                               ╚═════╝ ╚═╝      ╚═════╝                              |${end_style}"

echo -e "${white}|-------------------------------------------------------------------------------------|${end_style}"
echo -e "${white}|                                       Backend                                       |${end_style}"
echo -e "${white}---------------------------------------------------------------------------------------${end_style}"

echo ""
echo -e "\033[37mYour Host type: \033[1;33m$os_name${end_style}"
echo -e "\033[37mYour Local IP Address: \033[1;33m$ip_address${end_style}"
echo -e "\033[37mYour Public IP Address: \033[1;33m$public_ip_address${end_style}"
echo ""

default_api_url="http://$ip_address:4000"
default_central_server_url="http://$ip_address:8000"

# Ask user to input API host URL
echo -e "\033[1;37m1. Please enter your API host URL${end_style} ${white}(press Enter for default:${end_style} \033[32mhttp://$ip_address:4000${end_style}${white}):${end_style}"
if ! read -e -p '(default): ' -i "$default_api_url" URL 2>/dev/null; 
then
    # if failed, use 'read' command without '-i' option
    read -e -p "(default: $default_api_url): " URL
else
    # if succeed, use 'read' command with '-i' option
    read -e -p $'\033[0;33m(default)\033[0m: ' -i "$default_api_url" URL 
fi
API_URL=${URL:-http://$ip_address:4000}
API_PORT=$(echo $API_URL | cut -d':' -f3)
API_PORT=${API_PORT:-4000}
echo -e "\033[97mAPI Host URL: ${green}\033[4m$API_URL${end_style}"
echo ""


# Ask user to input central register server URL
echo -e "\033[1;37m2. Please enter your central register server URL${end_style} ${white}(press Enter for default:${end_style} \033[32mhttp://$ip_address:8000${end_style}${white}):${end_style} "
if ! read -e -p '(default): ' -i "$default_central_server_url" URL 2>/dev/null; 
then
    # if failed, use 'read' command without '-i' option
    read -e -p "(default: $default_central_server_url): " CENTRAL_SERVER
else
    # if succeed, use 'read' command with '-i' option
    read -e -p $'\033[0;33m(default)\033[0m: ' -i "$default_central_server_url" CENTRAL_SERVER 
fi
CENTRAL_SERVER=${CENTRAL_SERVER:-http://$ip_address:8000}
echo -e "\033[97mCentral Register Server URL: ${green}\033[4m$CENTRAL_SERVER${end_style}"
echo ""

sleep 1

echo -e "\033[2J\033[0;0H"
echo -e "${green}---------------------------------------------------------------------------------------${end_style}"
echo -e "${green}|                               UPC System Start Script                               |${end_style}"
echo -e "${green}|-------------------------------------------------------------------------------------|${end_style}"

echo -e "${green}|                              ██╗   ██╗██████╗  ██████╗                              |${end_style}"
echo -e "${green}|                              ██║   ██║██╔══██╗██╔════╝                              |${end_style}"
echo -e "${green}|                              ██║   ██║██████╔╝██║                                   |${end_style}"
echo -e "${green}|                              ██║   ██║██╔═══╝ ██║                                   |${end_style}"
echo -e "${green}|                              ╚██████╔╝██║     ╚██████╗                              |${end_style}"
echo -e "${green}|                               ╚═════╝ ╚═╝      ╚═════╝                              |${end_style}"

echo -e "${green}|-------------------------------------------------------------------------------------|${end_style}"
echo -e "${green}|                                       Backend                                       |${end_style}"
echo -e "${green}---------------------------------------------------------------------------------------${end_style}"


# check if there are dangling images
dangling_images=$($SUDO docker images -f "dangling=true" -q)
if [ -n "$dangling_images" ]; then
    # if there are dangling images, remove them
    $SUDO docker rmi $dangling_images
fi

# replace the ip address in files, and start the docker container
if [ "${os_name}" = "Windows" ]; then
    $SUDO docker pull afterlifexx/upc-api:latest && \
    $SUDO docker run -e API_URL=$API_URL \
           -e CENTRAL_SERVER=$CENTRAL_SERVER \
           -e API_PORT=$API_PORT \
           -v "//var/run/docker.sock:/var/run/docker.sock" \
           -p $API_PORT:$API_PORT -it --rm \
           afterlifexx/upc-api:latest
else
    $SUDO docker pull afterlifexx/upc-api:latest && \
    $SUDO docker run -e API_URL=$API_URL \
            -e CENTRAL_SERVER=$CENTRAL_SERVER \
            -e API_PORT=$API_PORT \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -p $API_PORT:$API_PORT -it --rm \
            afterlifexx/upc-api:latest
fi
