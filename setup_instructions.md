# Quick Setup Guide for Sales Promoter App

## Option 1: XAMPP (Recommended for Windows)

1. **Download XAMPP**
   - Go to: https://www.apachefriends.org/index.html
   - Download XAMPP for Windows
   - Run the installer (accept defaults)

2. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

3. **Setup Database**
   - Open http://localhost/phpmyadmin in browser
   - Create database: `sales_promoter_demo`
   - Import the demo data: use the `demo_setup.sql` file

4. **Deploy Application**
   - Copy all PHP files to: `C:\xampp\htdocs\sales-promoter\`
   - Open browser: http://localhost/sales-promoter/

## Option 2: Use Windows Subsystem for Linux (WSL)

1. **Install WSL**
   ```powershell
   wsl --install
   ```

2. **Install LAMP stack in WSL**
   ```bash
   sudo apt update
   sudo apt install apache2 php mysql-server php-mysql libapache2-mod-php
   ```

3. **Configure and run**

## Option 3: Docker (if available)

1. **Create docker-compose.yml**
2. **Run with: docker-compose up**

## Quick Test Commands

After setup, test with these demo users:
- Manager: manager@csss.com / demo123
- Promoter: john.smith@csss.com / demo123

## Troubleshooting

- Port 80 blocked? Use port 8080: http://localhost:8080/
- MySQL connection issues? Check config.php database settings
- Permissions issues? Ensure web server can read PHP files
