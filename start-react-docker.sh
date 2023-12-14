#!/bin/bash

# get local ip address
os_name=$(uname -s)
white="\033[0;37m"
green="\033[1;32m"
end_style="\033[0m"

if command -v sudo &> /dev/null
then
    SUDO="sudo"
else
    SUDO=""
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
echo -e "${white}|                                      Frontend                                       |${end_style}"
echo -e "${white}---------------------------------------------------------------------------------------${end_style}"

echo ""
echo -e "\033[37mYour Host's Local IP Address: \033[1;33m$ip_address${end_style}"
echo ""

default_api_url="http://$ip_address:4000"
default_central_server_url="http://$ip_address:8000"
default_port=3000

echo -e "\033[1;37m1. Please enter your React \033[1;31mPORT${end_style} ${white}(press Enter for default:${end_style} \033[32m3000${end_style}${white}):${end_style}"
if ! read -e -p '(default): ' -i "$default_port" PORT 2>/dev/null; 
then
    # if failed, use 'read' command without '-i' option
    read -e -p "(default: $default_port): " PORT
else
    # if succeed, use 'read' command with '-i' option
    read -e -p $'\033[0;33m(default)\033[0m: ' -i "$default_port" PORT
fi
PORT=${PORT:-3000}
echo -e "\033[97mReact URL: ${green}\033[4mhttp://$ip_address:$PORT${end_style}"


# Ask user to input API host URL
echo -e "\033[1;37m2. Please enter your API host URL${end_style} ${white}(press Enter for default:${end_style} \033[32mhttp://$ip_address:4000${end_style}${white}):${end_style}"
if ! read -e -p '(default): ' -i "$default_api_url" URL 2>/dev/null; 
then
    # if failed, use 'read' command without '-i' option
    read -e -p "(default: $default_api_url): " URL
else
    # if succeed, use 'read' command with '-i' option
    read -e -p $'\033[0;33m(default)\033[0m: ' -i "$default_api_url" URL
fi
API_URL=${API_URL:-http://$ip_address:4000}
echo -e "\033[97mAPI Host URL: ${green}\033[4m$API_URL${end_style}"
echo ""


# Ask user to input central register server URL
echo -e "\033[1;37m3. Please enter your central register server URL${end_style} ${white}(press Enter for default:${end_style} \033[32mhttp://$ip_address:8000${end_style}${white}):${end_style} "
if ! read -e -p '(default): ' -i "$default_central_server_url" CENTRAL_SERVER 2>/dev/null; 
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
echo -e "${green}|                                      Frontend                                       |${end_style}"
echo -e "${green}---------------------------------------------------------------------------------------${end_style}"



# define the environment variables
HOST_URL=$API_URL
INITIAL_API_URL=$API_URL
INITIAL_CENTRAL_SERVER_URL=$CENTRAL_SERVER

# check if there are dangling images
dangling_images=$($SUDO docker images -f "dangling=true" -q)
if [ -n "$dangling_images" ]; then
    # if there are dangling images, remove them
    $SUDO docker rmi $dangling_images
fi

# replace the ip address in files, and start the docker container
$SUDO docker pull afterlifexx/upc-react:latest && \
$SUDO docker run -e INITIAL_API_URL=$INITIAL_API_URL \
           -e INITIAL_CENTRAL_SERVER_URL=$INITIAL_CENTRAL_SERVER_URL \
           -e PORT=$PORT \
           -p $PORT:$PORT -it --rm \
           afterlifexx/upc-react:latest
