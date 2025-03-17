#!/usr/bin/env python3

import requests
import ipaddress
import subprocess
import os
import socket
import json
import sys
import argparse
from datetime import datetime

# Configuration
CONFIG_DIR = "/etc/darkflows"
IP_CACHE_FILE = f"{CONFIG_DIR}/ip_cache.json"
CONFIG_FILE = f"{CONFIG_DIR}/config.json"
NFTABLES_CONF = "/etc/nftables.conf"
TMP_NFTABLES_CONF = "/tmp/nftables_new.conf"

# Global config variable (will be initialized in main)
config = None

# Default configuration
DEFAULT_CONFIG = {
    "cloudflare_ipv4_url": "https://www.cloudflare.com/ips-v4",
    "cloudflare_ipv6_url": "https://www.cloudflare.com/ips-v6",
    "custom_domains": ["ai.darkflows.com"],
    "allow_ssh_port": 12222,
    "log_file": "/var/log/darkflows_nftables_update.log"
}

def log(message):
    """Log message to both stdout and log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)
    
    try:
        # Use global config if available, otherwise use DEFAULT_CONFIG
        log_file = DEFAULT_CONFIG["log_file"]
        if config is not None:
            log_file = config.get("log_file", DEFAULT_CONFIG["log_file"])
            
        with open(log_file, "a") as f:
            f.write(log_entry + "\n")
    except Exception as e:
        print(f"Warning: Could not write to log file: {e}")

def ensure_config_dir():
    """Ensure the darkflows configuration directory exists."""
    if not os.path.exists(CONFIG_DIR):
        try:
            os.makedirs(CONFIG_DIR, exist_ok=True)
            log(f"Created darkflows configuration directory: {CONFIG_DIR}")
        except Exception as e:
            log(f"Error creating darkflows config directory: {e}")
            sys.exit(1)

def load_config():
    """Load configuration or create default if it doesn't exist."""
    ensure_config_dir()
    
    if not os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "w") as f:
                json.dump(DEFAULT_CONFIG, f, indent=4)
            log(f"Created default configuration file: {CONFIG_FILE}")
        except Exception as e:
            log(f"Error creating default config file: {e}")
            sys.exit(1)
    
    try:
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
        return config
    except Exception as e:
        log(f"Error loading config file: {e}, using defaults")
        return DEFAULT_CONFIG

def load_ip_cache():
    """Load previously cached IPs."""
    if os.path.exists(IP_CACHE_FILE):
        try:
            with open(IP_CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            log(f"Error loading IP cache: {e}, will create new cache")
    return {"cloudflare_ipv4": [], "cloudflare_ipv6": [], "custom_domains": {}}

def save_ip_cache(ip_cache):
    """Save IP cache to file."""
    try:
        with open(IP_CACHE_FILE, "w") as f:
            json.dump(ip_cache, f, indent=4)
    except Exception as e:
        log(f"Error saving IP cache: {e}")

def fetch_ip_list(url):
    """Fetch IP list from Cloudflare and return validated IPs."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        ip_list = response.text.strip().split("\n")
        return [ip for ip in ip_list if is_valid_ip(ip)]
    except requests.RequestException as e:
        log(f"Error fetching {url}: {e}")
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
        log(f"Error resolving {domain}: {e}")
        return []
    except Exception as e:
        log(f"Unexpected error resolving {domain}: {e}")
        return []

def generate_nftables_config(ipv4_list, ipv6_list, custom_domains_ips):
    """Generate nftables rules based on the current configuration."""
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

        # Allow SSH on custom port
"""
    # Add SSH rule
    ssh_port = config.get("allow_ssh_port", DEFAULT_CONFIG["allow_ssh_port"])
    nftables_rules += f"        tcp dport {ssh_port} accept\n\n"

    # Add Cloudflare HTTPS rules
    nftables_rules += "        # Allow HTTPS (443) only from Cloudflare\n"
    for ip in ipv4_list:
        nftables_rules += f"        ip saddr {ip} tcp dport 443 accept\n"

    for ip in ipv6_list:
        nftables_rules += f"        ip6 saddr {ip} tcp dport 443 accept\n"

    # Add custom domain IPs
    for domain, ips in custom_domains_ips.items():
        ipv4_list = []
        ipv6_list = []
        
        for ip in ips:
            try:
                ip_obj = ipaddress.ip_address(ip)
                if ip_obj.version == 4:
                    ipv4_list.append(ip)
                else:
                    ipv6_list.append(ip)
            except ValueError:
                continue
                
        if ipv4_list or ipv6_list:
            nftables_rules += f"\n        # Allow HTTPS from {domain}\n"
            for ip in ipv4_list:
                nftables_rules += f"        ip saddr {ip} tcp dport 443 accept\n"
            for ip in ipv6_list:
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
    """Apply the new configuration."""
    try:
        subprocess.run(["nft", "flush", "ruleset"], check=True)  # Completely clear all firewall rules
        subprocess.run(["nft", "-f", TMP_NFTABLES_CONF], check=True)  # Apply new rules
        
        # Only restart Docker if it's running
        docker_status = subprocess.run(["systemctl", "is-active", "docker"], 
                                       capture_output=True, text=True)
        if docker_status.stdout.strip() == "active":
            subprocess.run(["systemctl", "restart", "docker"], check=True)

        os.replace(TMP_NFTABLES_CONF, NFTABLES_CONF)  # Replace only if successful
        log("Successfully reset nftables and applied new firewall rules.")
        return True
    except subprocess.CalledProcessError as e:
        log(f"Error applying nftables rules: {e}")
        return False

def ips_have_changed(old_ips, new_ips):
    """Check if IPs have changed by comparing the old and new sets."""
    if set(old_ips.get("cloudflare_ipv4", [])) != set(new_ips["cloudflare_ipv4"]):
        return True
    if set(old_ips.get("cloudflare_ipv6", [])) != set(new_ips["cloudflare_ipv6"]):
        return True
    
    # Check custom domains
    old_domains = old_ips.get("custom_domains", {})
    for domain, ips in new_ips["custom_domains"].items():
        if set(old_domains.get(domain, [])) != set(ips):
            return True
    
    return False

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Update nftables firewall rules for Cloudflare and custom domains')
    parser.add_argument('--force', action='store_true', help='Force update even if IPs have not changed')
    parser.add_argument('--check', action='store_true', help='Check if IPs have changed without updating')
    return parser.parse_args()

def main():
    """Main function to update firewall rules only when IPs have changed."""
    global config
    args = parse_arguments()
    
    # Load configuration
    config = load_config()
    
    # Load previous IP cache
    old_ip_cache = load_ip_cache()
    
    # Fetch Cloudflare IPs
    log("Fetching Cloudflare IPs...")
    ipv4_list = fetch_ip_list(config.get("cloudflare_ipv4_url", DEFAULT_CONFIG["cloudflare_ipv4_url"]))
    ipv6_list = fetch_ip_list(config.get("cloudflare_ipv6_url", DEFAULT_CONFIG["cloudflare_ipv6_url"]))
    
    # Resolve custom domains
    custom_domains = config.get("custom_domains", DEFAULT_CONFIG["custom_domains"])
    custom_domains_ips = {}
    
    log(f"Resolving {len(custom_domains)} custom domains...")
    for domain in custom_domains:
        log(f"Resolving {domain}...")
        ips = resolve_domain(domain)
        valid_ips = [ip for ip in ips if is_valid_ip(ip)]
        custom_domains_ips[domain] = valid_ips
        log(f"Resolved {domain}: {len(valid_ips)} valid IPs")
    
    # Create new IP cache
    new_ip_cache = {
        "cloudflare_ipv4": ipv4_list,
        "cloudflare_ipv6": ipv6_list,
        "custom_domains": custom_domains_ips
    }
    
    # Check if IPs have changed
    ip_changed = ips_have_changed(old_ip_cache, new_ip_cache)
    
    if args.check:
        if ip_changed:
            log("IP addresses have changed since last update.")
            return 0
        else:
            log("No changes to IP addresses detected.")
            return 0
    
    # If no changes and not forcing update, exit
    if not ip_changed and not args.force:
        log("No changes to IP addresses detected. Exiting without updating firewall.")
        return 0
    
    # Ensure we have at least some valid IPs to avoid locking out
    if not (ipv4_list or ipv6_list or any(ips for ips in custom_domains_ips.values())):
        log("Error: No valid IPs found. Exiting to avoid misconfigurations.")
        return 1
    
    # Generate nftables configuration
    log("Generating new nftables rules...")
    nftables_config = generate_nftables_config(ipv4_list, ipv6_list, custom_domains_ips)
    
    # Write to temporary file
    with open(TMP_NFTABLES_CONF, "w") as f:
        f.write(nftables_config)
    
    # Apply the configuration
    log("Applying nftables rules...")
    if apply_nftables_config():
        # Save new IP cache
        save_ip_cache(new_ip_cache)
        log("Updated IP cache saved.")
        return 0
    else:
        log("Failed to apply firewall rules. IP cache not updated.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

