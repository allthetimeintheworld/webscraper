# Virtual Machine Setup Guide for Web Scraping Development

## Option 1: Local Virtual Machine Setup

### VirtualBox Setup (Recommended for Development)

#### 1. Download and Install VirtualBox
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install virtualbox virtualbox-ext-pack

# Or download from: https://www.virtualbox.org/wiki/Downloads
```

#### 2. Create Ubuntu 22.04 LTS VM
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 50GB minimum (100GB recommended for scraping data)
- **CPU**: 2-4 cores
- **Network**: NAT + Host-only adapter for SSH access

#### 3. Ubuntu VM Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential software-properties-common

# Install Python 3.9+
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Install Node.js 18+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply docker group changes
sudo reboot
```

#### 4. Clone and Setup Project
```bash
# Clone your project (if using git)
git clone <your-repo-url>
cd webscraper

# Or copy files from host
# You can use VirtualBox shared folders or scp

# Run setup
chmod +x scripts/*.sh
./scripts/setup_dev.sh
```

## Option 2: AWS EC2 Instance (Recommended for Production Testing)

### Launch EC2 Instance
```bash
# Use AWS CLI or Console to launch:
# - Instance Type: t3.medium or larger
# - OS: Ubuntu 22.04 LTS
# - Security Group: Allow SSH (22), HTTP (3000), API (8000)
# - Storage: 20GB+ EBS volume
```

### EC2 Setup Commands
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# Install Python 3.9+
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Option 3: Digital Ocean Droplet

### Create Droplet
- **Size**: 2GB RAM minimum
- **OS**: Ubuntu 22.04 LTS
- **Region**: Choose closest to your location

### Setup Commands (Same as EC2)
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Follow same installation steps as EC2
```

## Option 4: Docker Development Container

### Dockerfile for Complete Environment
```dockerfile
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install Docker CLI (for docker-in-docker if needed)
RUN curl -fsSL https://get.docker.com -o get-docker.sh \
    && sh get-docker.sh

# Create working directory
WORKDIR /app

# Copy project files
COPY . .

# Make scripts executable
RUN chmod +x scripts/*.sh

# Expose ports
EXPOSE 3000 8000

# Default command
CMD ["bash"]
```

## Testing VM Configuration

### 1. Verify Installation
```bash
# Check versions
python3 --version  # Should be 3.9+
node --version     # Should be 18+
npm --version      # Should be 9+
docker --version   # Should be 20+
docker-compose --version

# Check available resources
free -h           # Memory
df -h             # Disk space
nproc             # CPU cores
```

### 2. Test Project Setup
```bash
# Navigate to project
cd webscraper

# Copy environment file
cp .env.example .env

# Edit configuration
nano .env  # Add your AWS credentials if testing EC2 features

# Run setup
./scripts/setup_dev.sh

# Start services
./scripts/run_dev.sh
```

### 3. Port Forwarding (for VirtualBox)
```bash
# If using VirtualBox, forward ports:
# Host Port 3000 -> Guest Port 3000 (Frontend)
# Host Port 8000 -> Guest Port 8000 (Backend)
# Host Port 5432 -> Guest Port 5432 (PostgreSQL)
# Host Port 6379 -> Guest Port 6379 (Redis)
```

## Performance Recommendations

### Minimum VM Specifications
- **RAM**: 4GB (8GB recommended)
- **CPU**: 2 cores (4 cores recommended)
- **Storage**: 50GB SSD
- **Network**: Broadband internet for package downloads

### Optimal VM Specifications
- **RAM**: 8-16GB
- **CPU**: 4-8 cores
- **Storage**: 100GB+ SSD
- **Network**: High-speed internet for scraping

## Security Considerations

### Firewall Configuration
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow development ports
sudo ufw allow 3000
sudo ufw allow 8000

# Check status
sudo ufw status
```

### SSH Key Setup (for remote VMs)
```bash
# Generate SSH key on your local machine
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to VM
ssh-copy-id user@vm-ip-address
```

## Monitoring and Maintenance

### Resource Monitoring
```bash
# Install htop for better process monitoring
sudo apt install htop

# Monitor resources
htop           # Interactive process viewer
df -h          # Disk usage
free -h        # Memory usage
iostat         # I/O statistics
```

### Log Management
```bash
# Application logs location
tail -f backend/logs/app.log
tail -f /var/log/docker.log

# System logs
journalctl -f
```

Choose the option that best fits your needs:
- **VirtualBox**: Best for local development and testing
- **AWS EC2**: Best for production-like testing with real AWS services
- **Digital Ocean**: Cost-effective cloud alternative
- **Docker**: Lightweight, consistent environment

Would you like me to help you set up any specific option or provide more detailed instructions for your preferred approach?
