#!/bin/bash

# get local ip address
os_name=$(uname -s)

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

echo -e "\033[1;37mYour Local IP Address: \033[1;33m$ip_address\033[0m"
echo ""

echo -e "\033[2J\033[0;0H"
echo -e "\033[0;37m---------------------------------------------------------------------------------------\033[0m"
echo -e "\033[0;37m|                               UPC System Start Script                               |\033[0m"
echo -e "\033[0;37m|-------------------------------------------------------------------------------------|\033[0m"

echo -e "\033[0;37m|                              ██╗   ██╗██████╗  ██████╗                              |"
echo -e "\033[0;37m|                              ██║   ██║██╔══██╗██╔════╝                              |"
echo -e "\033[0;37m|                              ██║   ██║██████╔╝██║                                   |"
echo -e "\033[0;37m|                              ██║   ██║██╔═══╝ ██║                                   |"
echo -e "\033[0;37m|                              ╚██████╔╝██║     ╚██████╗                              |"
echo -e "\033[0;37m|                               ╚═════╝ ╚═╝      ╚═════╝                              |"

echo -e "\033[0;37m|-------------------------------------------------------------------------------------|\033[0m"
echo -e "\033[0;37m|                                       Backend                                       |\033[0m"
echo -e "\033[0;37m---------------------------------------------------------------------------------------\033[0m"

echo ""
echo -e "\033[37mYour Host's Local IP Address: \033[1;33m$ip_address\033[0m"
echo ""

# Ask user to input API host URL
echo -e "\033[1;37m1. Please enter your API host URL\033[0m \033[0;37m(press Enter for default:\033[0m \033[32m$ip_address:4000\033[0m\033[0;37m):\033[0m"
read API_URL
API_URL=${API_URL:-http://$ip_address:4000}
echo -e "\033[97mAPI Host URL: \033[1;32m\033[4m$API_URL\033[0m"
echo ""

# Ask user to input central register server URL
echo -e "\033[1;37m2. Please enter your central register server URL\033[0m \033[0;37m(press Enter for default:\033[0m \033[32m$ip_address:8000\033[0m\033[0;37m):\033[0m "
read CENTRAL_SERVER
CENTRAL_SERVER=${CENTRAL_SERVER:-http://$ip_address:8000}
echo -e "\033[97mCentral Register Server URL: \033[1;32m\033[4m$CENTRAL_SERVER\033[0m"
echo ""

echo -e "\033[2J\033[0;0H"
echo -e "\033[1;32m---------------------------------------------------------------------------------------\033[0m"
echo -e "\033[1;32m|                               UPC System Start Script                               |\033[0m"
echo -e "\033[1;32m|-------------------------------------------------------------------------------------|\033[0m"

echo -e "\033[1;32m|                              ██╗   ██╗██████╗  ██████╗                              |"
echo -e "\033[1;32m|                              ██║   ██║██╔══██╗██╔════╝                              |"
echo -e "\033[1;32m|                              ██║   ██║██████╔╝██║                                   |"
echo -e "\033[1;32m|                              ██║   ██║██╔═══╝ ██║                                   |"
echo -e "\033[1;32m|                              ╚██████╔╝██║     ╚██████╗                              |"
echo -e "\033[1;32m|                               ╚═════╝ ╚═╝      ╚═════╝                              |"

echo -e "\033[1;32m|-------------------------------------------------------------------------------------|\033[0m"
echo -e "\033[1;32m|                                       Backend                                       |\033[0m"
echo -e "\033[1;32m---------------------------------------------------------------------------------------\033[0m"


# define the environment variables
HOST_URL=$API_URL
INITIAL_API_URL=$API_URL
INITIAL_CENTRAL_SERVER_URL=$CENTRAL_SERVER

# replace the ip address in files, and start the docker container
if os_name=Windows; then
    docker run -e HOST_URL=$HOST_URL \
           -e CENTRAL_SERVER=$CENTRAL_SERVER \
           -v "//var/run/docker.sock:/var/run/docker.sock" \
           -p 4000:4000 -it --rm \
           afterlifexx/upc-api:1.0
else
    docker run -e HOST_URL=$HOST_URL \
            -e CENTRAL_SERVER=$CENTRAL_SERVER \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -p 4000:4000 -it --rm \
            afterlifexx/upc-api:1.0
fi
