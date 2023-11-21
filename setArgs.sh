# get local ip address
os_name=$(uname -s)

#  get local ip address according to the operating system
if [ "$os_name" = "Linux" ]; then
    ip_address=$(hostname -I | awk '{print $1}')
elif [ "$os_name" = "Darwin" ]; then
    ip_address=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n 1)
else
    echo "Unsupported OS"
    exit 1
fi

echo "Local IP Address: $ip_address"

backend_method="./backend/UPC-API/Components/methods.js"

# replace the ip address in the methods.js file
if [ "$os_name" = "Linux" ]; then
    sed -i "s/const CENTRAL_SERVER = '.*';/const CENTRAL_SERVER = 'http:\/\/${ip_address}:8000';/" $backend_method
    sed -i "s/const hostURL = '.*';/const hostURL: 'http:\/\/${ip_address}:4000',/" $backend_method
elif [ "$os_name" = "Darwin" ]; then
    sed -i '' "s/const CENTRAL_SERVER = '.*';/const CENTRAL_SERVER = 'http:\/\/${ip_address}:8000';/" $backend_method
    sed -i '' "s/const hostURL: '.*';/const hostURL: 'http:\/\/${ip_address}:4000',/" $backend_method
fi