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
    ip_address=localhost
fi

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
echo -e "\033[0;37m|                                   Register Server                                   |\033[0m"
echo -e "\033[0;37m---------------------------------------------------------------------------------------\033[0m"

echo ""
echo -e "\033[37mYour Host's Local IP Address: \033[1;33m$ip_address\033[0m"
echo ""

# Run the docker container
docker run -it --rm -p 8000:8000 afterlifexx/upc-register:1.0