#!/bin/bash

# get local ip address
os_name=$(uname -s)
white="\033[0;37m"
green="\033[1;32m"
end_style="\033[0m"

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

echo -e "\033[1;37mYour Local IP Address: \033[1;33m$ip_address${end_style}"
echo ""

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
echo -e "\033[37mYour Host's Local IP Address: \033[1;33m$ip_address${end_style}"
echo ""

# Ask user to input API host URL
echo -e "\033[1;37m1. Please enter your API host URL${end_style} ${white}(press Enter for default:${end_style} \033[32m$ip_address:4000${end_style}${white}):${end_style}"
read API_URL
API_URL=${API_URL:-http://$ip_address:4000}
echo -e "\033[97mAPI Host URL: ${green}\033[4m$API_URL${end_style}"
echo ""

# Ask user to input central register server URL
echo -e "\033[1;37m2. Please enter your central register server URL${end_style} ${white}(press Enter for default:${end_style} \033[32m$ip_address:8000${end_style}${white}):${end_style} "
read CENTRAL_SERVER
CENTRAL_SERVER=${CENTRAL_SERVER:-http://$ip_address:8000}
echo -e "\033[97mCentral Register Server URL: ${green}\033[4m$CENTRAL_SERVER${end_style}"
echo ""

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


# define the environment variables
HOST_URL=$API_URL
INITIAL_API_URL=$API_URL
INITIAL_CENTRAL_SERVER_URL=$CENTRAL_SERVER

# replace the ip address in files, and start the docker container
if [ "${os_name}" = "Windows" ]; then
    sudo docker run -e HOST_URL=$HOST_URL \
           -e CENTRAL_SERVER=$CENTRAL_SERVER \
           -v "//var/run/docker.sock:/var/run/docker.sock" \
           -p 4000:4000 -it --rm \
           afterlifexx/upc-api:1.0
else
    sudo docker run -e HOST_URL=$HOST_URL \
            -e CENTRAL_SERVER=$CENTRAL_SERVER \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -p 4000:4000 -it --rm \
            afterlifexx/upc-api:1.0
fi
