# get public ip address
public_ip_address=$(curl -s https://api.ipify.org)

# print public ip address
echo "Your Public IP Address: $public_ip_address"

