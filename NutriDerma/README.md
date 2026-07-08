# Sales Promoter App - Demo Version

A comprehensive sales reporting and management system with GPS-enabled check-in/out, sales tracking, and payroll management.

## Features Demonstrated

### Core Functionality
- **GPS-based Check-in/Check-out**: Location validation with configurable radius
- **Sales Tracking**: Multi-brand sales entry with automatic total calculation
- **Target Management**: Monthly targets with real-time progress tracking
- **Role-based Access**: Separate interfaces for Promoters and Managers
- **Real-time Dashboard**: Live statistics and performance metrics

### Promoter Features
- Daily check-in/out with GPS validation
- Sales entry for multiple product brands
- Personal target tracking and progress visualization
- Visit history and attendance records
- Mobile-responsive interface

### Manager Features
- Overview of all promoter activities
- Performance analytics and reporting
- User and store management
- Real-time alerts and notifications
- Export capabilities for payroll processing

## Demo Setup

### Database Setup
1. Create a MySQL database named `sales_promoter_demo`
2. Import the demo data:
   ```sql
   mysql -u root -p sales_promoter_demo < demo_setup.sql
   ```

### Configuration
1. Update database credentials in `config.php` if needed:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'sales_promoter_demo');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   ```

### Web Server Setup
1. Place all files in your web server's document root
2. Ensure PHP 8.0+ and MySQL 5.7+ are installed
3. Enable the following PHP extensions:
   - PDO
   - PDO_MySQL
   - JSON
   - Session

## Demo Users

### Manager Access
- **Email**: manager@csss.com
- **Password**: demo123
- **Role**: Manager

### Promoter Access
- **John Smith**: john.smith@csss.com / demo123
- **Mary Davis**: mary.davis@csss.com / demo123
- **Peter Wilson**: peter.wilson@csss.com / demo123 *(Currently checked in)*
- **Lisa Brown**: lisa.brown@csss.com / demo123

## Demo Scenarios

### 1. Manager Dashboard
- View overall system statistics
- Monitor top performers
- Check alerts and system status
- Review store performance metrics

### 2. Promoter Experience
- **Peter Wilson**: Currently checked in (active visit)
  - Can enter sales data
  - Can check out
  - View daily progress

- **Other Promoters**: Have completed visits
  - Can view historical data
  - Check monthly target progress
  - Review past performance

### 3. GPS Simulation
- All GPS coordinates are simulated for demo purposes
- Check-in/out validates against store locations
- Distance calculations use real-world formulas

## File Structure

```
sales-promoter-app/
|-- index.php                 # Main login page
|-- promoter_dashboard.php    # Promoter interface
|-- manager_dashboard.php     # Manager interface
|-- config.php               # Application configuration
|-- demo_setup.sql           # Database schema and sample data
|-- README.md                # This file
```

## Key Features Demonstrated

### 1. Authentication System
- Secure login with role-based access control
- Session management
- Password hashing (demo uses simple passwords)

### 2. GPS Location Services
- Coordinate validation
- Distance calculations
- Store radius enforcement

### 3. Sales Management
- Multi-brand sales entry
- Real-time total calculation
- Historical sales tracking

### 4. Performance Analytics
- Target progress tracking
- Performance comparisons
- Statistical summaries

### 5. Responsive Design
- Mobile-friendly interface
- Bootstrap 5 framework
- Modern UI/UX patterns

## Technical Specifications

### Backend
- **Language**: PHP 8.0+
- **Database**: MySQL 5.7+
- **Architecture**: MVC pattern (simplified for demo)

### Frontend
- **Framework**: Bootstrap 5
- **Icons**: Font Awesome 6
- **JavaScript**: Vanilla JS with Bootstrap components

### Security Features
- Input sanitization
- SQL injection prevention (prepared statements)
- Session security
- Role-based access control

## Production Considerations

This demo showcases the core functionality. For production deployment, consider:

1. **Enhanced Security**
   - Proper password hashing
   - CSRF protection
   - Rate limiting
   - HTTPS enforcement

2. **Scalability**
   - Database optimization
   - Caching strategies
   - Load balancing

3. **Additional Features**
   - Email notifications
   - Advanced reporting
   - API integrations
   - Mobile app development

4. **Compliance**
   - Data privacy regulations
   - Audit logging
   - Backup strategies

## Support and Contact

For questions about this demo or to discuss full implementation:

- Review the code comments for detailed explanations
- Check the database schema for data relationships
- Test all user roles for complete functionality

---

**Note**: This is a demonstration version. All data is simulated and passwords are simple for demo purposes. In production, implement proper security measures.
