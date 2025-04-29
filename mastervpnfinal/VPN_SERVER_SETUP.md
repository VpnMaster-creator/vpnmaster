# VPN Server Setup Guide

This guide explains how to set up your own VPN servers to work with MasterVPN application. MasterVPN can connect to standard OpenVPN or WireGuard servers, allowing you to create a private, secure network.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up a Server on a Cloud Provider](#setting-up-a-server-on-a-cloud-provider)
3. [Installing OpenVPN](#installing-openvpn)
4. [Installing WireGuard](#installing-wireguard)
5. [Registering Your Server with MasterVPN](#registering-your-server-with-mastervpn)
6. [Testing Your VPN Connection](#testing-your-vpn-connection)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- A cloud server (e.g., AWS EC2, DigitalOcean, Linode, etc.) with Ubuntu 20.04 or later
- Root access to the server
- Basic familiarity with Linux command line
- Domain name (optional but recommended)

## Setting Up a Server on a Cloud Provider

### DigitalOcean Example

1. Create an account on [DigitalOcean](https://www.digitalocean.com/)
2. Create a new Droplet:
   - Choose Ubuntu 22.04 LTS
   - Select a plan (minimum 1GB RAM)
   - Choose a data center region where you want your VPN server to be located
   - Add your SSH key or create a password
   - Click "Create Droplet"

3. Note your server's IP address

### AWS Example

1. Create an account on [AWS](https://aws.amazon.com/)
2. Launch a new EC2 instance:
   - Choose Ubuntu Server 22.04 LTS
   - Select t2.micro or larger
   - Configure security groups to allow:
     - SSH (port 22)
     - OpenVPN (port 1194 UDP)
     - WireGuard (port 51820 UDP)
   - Launch the instance and download the key pair
   - Connect to your instance using SSH

## Installing OpenVPN

For easy setup, we'll use a script that automates the installation process:

1. SSH into your server:
   ```
   ssh root@your_server_ip
   ```

2. Download and run the OpenVPN installation script:
   ```
   curl -O https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh
   chmod +x openvpn-install.sh
   ./openvpn-install.sh
   ```

3. Follow the prompts:
   - Confirm your server's IP address
   - Choose UDP as the protocol
   - Use the default port (1194)
   - Select a DNS resolver (CloudFlare is a good option)
   - Enter a client name (e.g., "client1")

4. Once completed, you'll have a .ovpn file in your home directory. You need to copy this file to your local machine:
   ```
   # On your local machine, not the server
   scp root@your_server_ip:~/client1.ovpn ./
   ```

5. This .ovpn file contains all the configuration needed for MasterVPN to connect to your server.

## Installing WireGuard

WireGuard is a more modern VPN protocol that's faster and simpler:

1. SSH into your server:
   ```
   ssh root@your_server_ip
   ```

2. Download and run the WireGuard installation script:
   ```
   curl -O https://raw.githubusercontent.com/angristan/wireguard-install/master/wireguard-install.sh
   chmod +x wireguard-install.sh
   ./wireguard-install.sh
   ```

3. Follow the prompts:
   - Confirm your server's IP address
   - Choose the default port (51820)
   - Enter a client name (e.g., "client1")

4. Once completed, you'll have a .conf file in your home directory. You need to copy this file to your local machine:
   ```
   # On your local machine, not the server
   scp root@your_server_ip:~/client1.conf ./
   ```

5. This .conf file contains all the configuration needed for MasterVPN to connect to your server.

## Registering Your Server with MasterVPN

You can register your VPN server with the MasterVPN application:

1. Log in to MasterVPN as an administrator
2. Go to "Admin Panel" → "Manage Servers"
3. Click "Add New Server"
4. Fill in the server details:
   - Server Name: Choose a descriptive name
   - Country: Select the country where your server is located
   - IP Address: Enter your server's public IP address
   - Protocol: Select OpenVPN or WireGuard
   - Port: Enter the port you selected during installation
   - Configuration: Paste the contents of your .ovpn or .conf file

5. Click "Save" to add your server to the list of available servers

## Testing Your VPN Connection

After adding your server:

1. In the MasterVPN dashboard, select your newly added server
2. Click "Connect" to establish a VPN connection
3. Once connected, use the "VPN Test" panel to verify:
   - Your new IP address matches your VPN server's IP
   - Your location has changed to match the server location
   - No data leaks are detected

## Troubleshooting

### Connection Issues

1. **Cannot connect to VPN server:**
   - Check if the server is running: `systemctl status openvpn` or `systemctl status wg-quick@wg0`
   - Verify firewall settings: `ufw status`
   - Ensure ports are open: `sudo netstat -tulpn | grep 1194` (for OpenVPN) or `sudo netstat -tulpn | grep 51820` (for WireGuard)

2. **Slow connection speeds:**
   - Test server bandwidth: `speedtest-cli`
   - Adjust MTU settings in the configuration file
   - Try a different server location that's closer to your physical location

3. **DNS leaks:**
   - Install DNSCrypt: `apt install dnscrypt-proxy`
   - Configure DNSCrypt to use secure DNS servers
   - Update your VPN configuration to use the local DNSCrypt proxy

### Security Hardening

For production VPN servers, consider these additional security measures:

1. **Disable root login:**
   ```
   sudo nano /etc/ssh/sshd_config
   # Find PermitRootLogin and change to:
   PermitRootLogin no
   sudo systemctl restart sshd
   ```

2. **Set up automated security updates:**
   ```
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure unattended-upgrades
   ```

3. **Configure a firewall:**
   ```
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 1194/udp  # For OpenVPN
   sudo ufw allow 51820/udp  # For WireGuard
   sudo ufw enable
   ```

## Further Reading

- [OpenVPN Documentation](https://openvpn.net/community-resources/)
- [WireGuard Documentation](https://www.wireguard.com/)
- [DigitalOcean VPN Guides](https://www.digitalocean.com/community/tutorials/openvpn-setup-ubuntu)
- [AWS VPN Solutions](https://aws.amazon.com/vpn/)

---

Remember that running a VPN server involves responsibilities regarding the users' privacy and security. Always keep your server updated and properly secured.