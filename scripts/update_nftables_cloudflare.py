#!/usr/bin/env python3

import requests
import ipaddress
import subprocess
import os
import socket

# Cloudflare IP list URLs
CLOUDFLARE_IPV4_URL = "https://www.cloudflare.com/ips-v4"
CLOUDFLARE_IPV6_URL = "https://www.cloudflare.com/ips-v6"

# Paths
NFTABLES_CONF = "/etc/nftables.conf"
TMP_NFTABLES_CONF = "/tmp/nftables_new.conf"

def fetch_ip_list(url):
    """Fetch IP list from Cloudflare and return validated IPs."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        ip_list = response.text.strip().split("\n")
        return [ip for ip in ip_list if is_valid_ip(ip)]
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return []

def is_valid_ip(ip):
    """Check if the input string is a valid IP or subnet."""
    try:
        ipaddress.ip_network(ip, strict=False)
        return True
    except ValueError:
        return False

def resolve_domain(domain):
    """Resolve a domain to its IPv4 and IPv6 addresses."""
    try:
        addrinfo = socket.getaddrinfo(domain, None)
        ips = []
        for info in addrinfo:
            ip = info[4][0]
            try:
                ip_addr = ipaddress.ip_address(ip)
                ips.append(str(ip_addr))
            except ValueError:
                continue
        unique_ips = list(set(ips))
        return unique_ips
    except socket.gaierror as e:
        print(f"Error resolving {domain}: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error resolving {domain}: {e}")
        return []

def generate_nftables_config(ipv4_list, ipv6_list, darkflow_ips_v4, darkflow_ips_v6):
    """Generate nftables rules to allow Cloudflare HTTPS, SSH (12222), DNS, Docker networking, and ai.darkflows.com."""
    nftables_rules = """#!/usr/sbin/nft -f

# Completely reset everything
flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        # Allow established and related connections
        ct state established,related accept

        # Allow loopback traffic
        iif lo accept

        # Block ICMP (ping)
        ip protocol icmp drop
        ip6 nexthdr icmpv6 drop

        # Allow all traffic from Tailscale
        iifname "tailscale0" accept

        # Allow all traffic on Docker interfaces (so containers can talk to each other)
        iifname "docker0" accept
        iifname "br-+" accept  # Match all Docker bridge networks
        iifname "veth+" accept # Allow traffic from veth interfaces

        # Allow forwarding between Docker containers
        iifname "docker0" oifname "docker0" accept
        iifname "br-+" oifname "br-+" accept
        iifname "veth+" oifname "veth+" accept

        # Allow DNS and Secure DNS for everyone
        udp dport { 53, 853 } accept
        tcp dport { 53, 853 } accept

        # Allow SSH on port 12222 for everyone
        tcp dport 12222 accept

        # Allow MongoDB connections on port 27017 for all containers
        # tcp dport 27017 accept

        # Allow HTTPS (443) only from Cloudflare
"""
    for ip in ipv4_list:
        nftables_rules += f"        ip saddr {ip} tcp dport 443 accept\n"

    for ip in ipv6_list:
        nftables_rules += f"        ip6 saddr {ip} tcp dport 443 accept\n"

    # Add ai.darkflows.com IPs
    if darkflow_ips_v4 or darkflow_ips_v6:
        nftables_rules += "        # Allow HTTPS from ai.darkflows.com\n"
        for ip in darkflow_ips_v4:
            nftables_rules += f"        ip saddr {ip} tcp dport 443 accept\n"
        for ip in darkflow_ips_v6:
            nftables_rules += f"        ip6 saddr {ip} tcp dport 443 accept\n"

    nftables_rules += """
        # Drop all other traffic
        drop
    }

    chain forward {
        type filter hook forward priority 0; policy accept;

        # Allow inter-container communication
        iifname "docker0" oifname "docker0" accept
        iifname "br-+" oifname "br-+" accept
        iifname "veth+" oifname "veth+" accept
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}
"""
    return nftables_rules

def apply_nftables_config():
    """Completely reset nftables and apply the new configuration."""
    try:
        subprocess.run(["nft", "flush", "ruleset"], check=True)  # Completely clear all firewall rules
        subprocess.run(["nft", "-f", TMP_NFTABLES_CONF], check=True)  # Apply new rules
        subprocess.run(["systemctl", "restart", "docker"], check=True)

        os.replace(TMP_NFTABLES_CONF, NFTABLES_CONF)  # Replace only if successful
        print("Successfully reset nftables and applied new firewall rules.")
    except subprocess.CalledProcessError as e:
        print(f"Error applying nftables rules: {e}")

def main():
    """Main function to update Cloudflare IPs in nftables."""
    print("Fetching Cloudflare IPs...")
    ipv4_list = fetch_ip_list(CLOUDFLARE_IPV4_URL)
    ipv6_list = fetch_ip_list(CLOUDFLARE_IPV6_URL)

    print("Resolving ai.darkflows.com...")
    darkflow_ips = resolve_domain("ai.darkflows.com")
    darkflow_ips = [ip for ip in darkflow_ips if is_valid_ip(ip)]
    darkflow_ips_v4 = []
    darkflow_ips_v6 = []
    for ip in darkflow_ips:
        try:
            ip_obj = ipaddress.ip_address(ip)
            if ip_obj.version == 4:
                darkflow_ips_v4.append(ip)
            else:
                darkflow_ips_v6.append(ip)
        except ValueError:
            pass

    print(f"Fetched {len(ipv4_list)} IPv4 and {len(ipv6_list)} IPv6 addresses from Cloudflare.")
    print(f"Resolved ai.darkflows.com: {len(darkflow_ips_v4)} IPv4 and {len(darkflow_ips_v6)} IPv6 addresses.")

    if not (ipv4_list or ipv6_list or darkflow_ips_v4 or darkflow_ips_v6):
        print("Error: No valid IPs found from Cloudflare or ai.darkflows.com. Exiting to avoid misconfigurations.")
        return

    print("Generating new nftables rules...")
    nftables_config = generate_nftables_config(ipv4_list, ipv6_list, darkflow_ips_v4, darkflow_ips_v6)

    # Write to temporary file
    with open(TMP_NFTABLES_CONF, "w") as f:
        f.write(nftables_config)

    print("Applying nftables rules...")
    apply_nftables_config()

if __name__ == "__main__":
    main()



