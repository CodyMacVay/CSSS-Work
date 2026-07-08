<?php
require_once 'config.php';

// Check if user is logged in and is a manager
if (!isLoggedIn() || !isManager()) {
    redirect('index.php');
}

// Get current user data
$currentUser = getCurrentUser();
$userName = $_SESSION['user_name'];

// Get demo data
$db = getDB();

// Get overall statistics
$totalPromoters = $db->fetch("SELECT COUNT(*) as count FROM Users WHERE Role = 'Promoter' AND IsActive = TRUE");
$totalStores = $db->fetch("SELECT COUNT(*) as count FROM Stores WHERE IsActive = TRUE");
$todayVisits = $db->fetch("SELECT COUNT(*) as count FROM Visits WHERE VisitDate = CURDATE()");
$todaySales = $db->fetch("SELECT SUM(TotalSales) as total FROM Visits WHERE VisitDate = CURDATE() AND Status = 'Locked'");

// Get monthly statistics
$monthlyVisits = $db->fetch("SELECT COUNT(*) as count FROM Visits WHERE YEAR(VisitDate) = YEAR(CURDATE()) AND MONTH(VisitDate) = MONTH(CURDATE()) AND Status = 'Locked'");
$monthlySales = $db->fetch("SELECT SUM(TotalSales) as total FROM Visits WHERE YEAR(VisitDate) = YEAR(CURDATE()) AND MONTH(VisitDate) = MONTH(CURDATE()) AND Status = 'Locked'");

// Get top performers
$topPerformers = $db->fetchAll(
    "SELECT u.UserName, u.UserEmail, SUM(v.TotalSales) as total_sales, COUNT(v.VisitID) as visit_count
     FROM Users u 
     LEFT JOIN Visits v ON u.UserEmail = v.PromoterEmail AND v.Status = 'Locked' 
     WHERE u.Role = 'Promoter' AND u.IsActive = TRUE 
     GROUP BY u.UserEmail, u.UserName 
     ORDER BY total_sales DESC 
     LIMIT 5"
);

// Get store performance
$storePerformance = $db->fetchAll(
    "SELECT s.StoreName, s.StoreID, COUNT(v.VisitID) as visit_count, SUM(v.TotalSales) as total_sales
     FROM Stores s 
     LEFT JOIN Visits v ON s.StoreID = v.StoreID AND v.Status = 'Locked' 
     WHERE s.IsActive = TRUE 
     GROUP BY s.StoreID, s.StoreName 
     ORDER BY total_sales DESC"
);

// Get recent activity
$recentActivity = $db->fetchAll(
    "SELECT v.*, u.UserName, s.StoreName 
     FROM Visits v 
     JOIN Users u ON v.PromoterEmail = u.UserEmail 
     JOIN Stores s ON v.StoreID = s.StoreID 
     ORDER BY v.CreatedAt DESC 
     LIMIT 10"
);

// Get alerts
$pendingReports = $db->fetch("SELECT COUNT(*) as count FROM Visits WHERE Status = 'Submitted'");
$gpsIssues = $db->fetch("SELECT COUNT(*) as count FROM Visits WHERE CheckInLocation IS NULL AND CheckInTime IS NOT NULL");
$inactiveToday = $db->fetch("SELECT COUNT(*) as count FROM Users WHERE Role = 'Promoter' AND IsActive = TRUE AND UserEmail NOT IN (SELECT DISTINCT PromoterEmail FROM Visits WHERE VisitDate = CURDATE())");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard - <?php echo APP_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .dashboard-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
        }
        .stat-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
            height: 100%;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        .sidebar {
            background: #f8f9fa;
            min-height: calc(100vh - 80px);
            border-right: 1px solid #dee2e6;
        }
        .nav-link {
            color: #495057;
            border-radius: 10px;
            margin: 5px 10px;
            transition: all 0.3s ease;
        }
        .nav-link:hover, .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .main-content {
            padding: 2rem;
        }
        .quick-action {
            text-decoration: none;
            color: inherit;
        }
        .quick-action:hover {
            text-decoration: none;
            color: inherit;
            transform: translateY(-2px);
        }
        .demo-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ffc107;
            color: #000;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .activity-item {
            border-left: 3px solid #667eea;
            padding-left: 1rem;
            margin-bottom: 1rem;
        }
        .alert-item {
            border-left: 3px solid #dc3545;
            padding-left: 1rem;
            margin-bottom: 0.5rem;
        }
        .performance-bar {
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        .performance-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s ease;
        }
        .chart-container {
            position: relative;
            height: 300px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="dashboard-header">
        <div class="demo-badge">
            <i class="fas fa-flask me-1"></i>DEMO
        </div>
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1 class="mb-0">
                        <i class="fas fa-chart-line me-3"></i>
                        <?php echo APP_NAME; ?>
                    </h1>
                    <p class="mb-0">Manager Dashboard - Welcome, <?php echo htmlspecialchars($userName); ?>!</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <div class="dropdown">
                        <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user me-2"></i>
                            <?php echo htmlspecialchars($userName); ?>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="index.php">
                                <i class="fas fa-sign-out-alt me-2"></i>Logout
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-2 sidebar">
                <nav class="nav flex-column mt-3">
                    <a href="manager_dashboard.php" class="nav-link active">
                        <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                    </a>
                    <a href="#" class="nav-link" onclick="showUsersModal()">
                        <i class="fas fa-users me-2"></i>Manage Users
                    </a>
                    <a href="#" class="nav-link" onclick="showStoresModal()">
                        <i class="fas fa-store me-2"></i>Manage Stores
                    </a>
                    <a href="#" class="nav-link" onclick="showVisitsModal()">
                        <i class="fas fa-calendar-check me-2"></i>View Visits
                    </a>
                    <a href="#" class="nav-link" onclick="showReportsModal()">
                        <i class="fas fa-chart-bar me-2"></i>Reports
                    </a>
                    <a href="#" class="nav-link" onclick="showExportModal()">
                        <i class="fas fa-download me-2"></i>Export Data
                    </a>
                </nav>
            </div>

            <!-- Main Content -->
            <div class="col-md-10 main-content">
                <!-- Key Metrics -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <a href="#" class="quick-action" onclick="showUsersModal()">
                            <div class="card stat-card">
                                <div class="card-body text-center">
                                    <div class="stat-icon bg-primary text-white mx-auto">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <h3 class="card-title mb-0"><?php echo $totalPromoters['count']; ?></h3>
                                    <p class="card-text text-muted">Active Promoters</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-3 mb-3">
                        <a href="#" class="quick-action" onclick="showStoresModal()">
                            <div class="card stat-card">
                                <div class="card-body text-center">
                                    <div class="stat-icon bg-success text-white mx-auto">
                                        <i class="fas fa-store"></i>
                                    </div>
                                    <h3 class="card-title mb-0"><?php echo $totalStores['count']; ?></h3>
                                    <p class="card-text text-muted">Active Stores</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-3 mb-3">
                        <a href="#" class="quick-action" onclick="showVisitsModal()">
                            <div class="card stat-card">
                                <div class="card-body text-center">
                                    <div class="stat-icon bg-warning text-white mx-auto">
                                        <i class="fas fa-calendar-check"></i>
                                    </div>
                                    <h3 class="card-title mb-0"><?php echo $todayVisits['count']; ?></h3>
                                    <p class="card-text text-muted">Today's Visits</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-3 mb-3">
                        <a href="#" class="quick-action" onclick="showReportsModal()">
                            <div class="card stat-card">
                                <div class="card-body text-center">
                                    <div class="stat-icon bg-info text-white mx-auto">
                                        <i class="fas fa-rand-sign"></i>
                                    </div>
                                    <h3 class="card-title mb-0"><?php echo formatCurrency($todaySales['total'] ?? 0); ?></h3>
                                    <p class="card-text text-muted">Today's Sales</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Performance Overview -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-trophy me-2"></i>Top Performers This Month
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <?php foreach ($topPerformers as $index => $performer): ?>
                                        <div class="col-md-6 mb-3">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 class="mb-1"><?php echo htmlspecialchars($performer['UserName']); ?></h6>
                                                    <small class="text-muted">
                                                        <?php echo $performer['visit_count']; ?> visits
                                                    </small>
                                                </div>
                                                <div class="text-end">
                                                    <h6 class="mb-0"><?php echo formatCurrency($performer['total_sales']); ?></h6>
                                                    <small class="text-muted">Total sales</small>
                                                </div>
                                            </div>
                                            <div class="performance-bar mt-2">
                                                <div class="performance-fill" style="width: <?php 
                                                    echo $performer['total_sales'] > 0 ? 
                                                        min(100, ($performer['total_sales'] / ($topPerformers[0]['total_sales'] + 0.01)) * 100) : 0; 
                                                    ?>%"></div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-exclamation-triangle me-2"></i>Alerts
                                </h5>
                            </div>
                            <div class="card-body">
                                <?php if ($pendingReports['count'] > 0): ?>
                                    <div class="alert-item">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span>Pending Reports</span>
                                            <span class="badge bg-warning"><?php echo $pendingReports['count']; ?></span>
                                        </div>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($gpsIssues['count'] > 0): ?>
                                    <div class="alert-item">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span>GPS Issues</span>
                                            <span class="badge bg-danger"><?php echo $gpsIssues['count']; ?></span>
                                        </div>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($inactiveToday['count'] > 0): ?>
                                    <div class="alert-item">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span>Inactive Today</span>
                                            <span class="badge bg-info"><?php echo $inactiveToday['count']; ?></span>
                                        </div>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($pendingReports['count'] == 0 && $gpsIssues['count'] == 0 && $inactiveToday['count'] == 0): ?>
                                    <div class="text-center text-muted">
                                        <i class="fas fa-check-circle fa-3x mb-2"></i>
                                        <p>All systems operational!</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Store Performance & Recent Activity -->
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-store me-2"></i>Store Performance
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Store</th>
                                                <th>Visits</th>
                                                <th>Sales</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($storePerformance as $store): ?>
                                                <tr>
                                                    <td><?php echo htmlspecialchars($store['StoreName']); ?></td>
                                                    <td><?php echo $store['visit_count']; ?></td>
                                                    <td><?php echo formatCurrency($store['total_sales']); ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-history me-2"></i>Recent Activity
                                </h5>
                            </div>
                            <div class="card-body">
                                <div style="max-height: 300px; overflow-y: auto;">
                                    <?php foreach ($recentActivity as $activity): ?>
                                        <div class="activity-item">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 class="mb-1"><?php echo htmlspecialchars($activity['UserName']); ?></h6>
                                                    <small class="text-muted">
                                                        <?php 
                                                        if ($activity['CheckInTime'] && !$activity['CheckOutTime']) {
                                                            echo 'Checked in at ' . htmlspecialchars($activity['StoreName']);
                                                        } elseif ($activity['CheckOutTime']) {
                                                            echo 'Checked out from ' . htmlspecialchars($activity['StoreName']);
                                                        } else {
                                                            echo 'Visit created for ' . htmlspecialchars($activity['StoreName']);
                                                        }
                                                        ?>
                                                    </small>
                                                </div>
                                                <small class="text-muted">
                                                    <?php echo date('H:i', strtotime($activity['CreatedAt'])); ?>
                                                </small>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monthly Summary -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-chart-bar me-2"></i>Monthly Summary
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row text-center">
                                    <div class="col-md-3">
                                        <h4 class="text-primary"><?php echo $monthlyVisits['count']; ?></h4>
                                        <p class="text-muted">Total Visits</p>
                                    </div>
                                    <div class="col-md-3">
                                        <h4 class="text-success"><?php echo formatCurrency($monthlySales['total'] ?? 0); ?></h4>
                                        <p class="text-muted">Total Sales</p>
                                    </div>
                                    <div class="col-md-3">
                                        <h4 class="text-info"><?php echo $monthlyVisits['count'] > 0 ? formatCurrency(($monthlySales['total'] ?? 0) / $monthlyVisits['count']) : formatCurrency(0); ?></h4>
                                        <p class="text-muted">Avg Sales/Visit</p>
                                    </div>
                                    <div class="col-md-3">
                                        <h4 class="text-warning"><?php echo $totalPromoters['count'] > 0 ? number_format(($monthlyVisits['count'] ?? 0) / $totalPromoters['count'], 1) : 0; ?></h4>
                                        <p class="text-muted">Avg Visits/Promoter</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals for Demo Actions -->
    <div class="modal fade" id="usersModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-users me-2"></i>User Management
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>User management interface would allow you to:</p>
                    <ul>
                        <li>Add new promoters and managers</li>
                        <li>Assign home stores to promoters</li>
                        <li>Set monthly targets and daily pay rates</li>
                        <li>Activate/deactivate user accounts</li>
                        <li>View user performance metrics</li>
                    </ul>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        This is a demo. In the full version, you would have complete CRUD operations for user management.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="storesModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-store me-2"></i>Store Management
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Store management interface would allow you to:</p>
                    <ul>
                        <li>Add new store locations</li>
                        <li>Set GPS coordinates and allowed radius</li>
                        <li>Update store information and addresses</li>
                        <li>View store performance analytics</li>
                        <li>Manage store assignments</li>
                    </ul>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        GPS coordinates ensure promoters check in from the correct location.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="visitsModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-calendar-check me-2"></i>Visit Management
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Visit management interface would allow you to:</p>
                    <ul>
                        <li>View all promoter visits with filtering options</li>
                        <li>Validate GPS locations for check-ins</li>
                        <li>Approve or reject visit submissions</li>
                        <li>View detailed visit reports and sales data</li>
                        <li>Export visit data for payroll processing</li>
                    </ul>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        All visits are tracked with timestamps and GPS validation.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="reportsModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-chart-bar me-2"></i>Reports & Analytics
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Reports and analytics would include:</p>
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Sales Reports</h6>
                            <ul>
                                <li>Daily/Weekly/Monthly sales summaries</li>
                                <li>Product-wise sales analysis</li>
                                <li>Store performance comparison</li>
                                <li>Sales trend analysis</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6>Performance Reports</h6>
                            <ul>
                                <li>Promoter performance metrics</li>
                                <li>Target achievement reports</li>
                                <li>Attendance and punctuality</li>
                                <li>GPS compliance reports</li>
                            </ul>
                        </div>
                    </div>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Interactive charts and graphs for data visualization.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="exportModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-download me-2"></i>Export Data
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Export options would include:</p>
                    <ul>
                        <li>Excel format for payroll processing</li>
                        <li>CSV format for data analysis</li>
                        <li>PDF reports for management</li>
                        <li>Custom date range exports</li>
                        <li>Automated scheduled reports</li>
                    </ul>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        All exports include comprehensive data for business analysis.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function showUsersModal() {
            new bootstrap.Modal(document.getElementById('usersModal')).show();
        }

        function showStoresModal() {
            new bootstrap.Modal(document.getElementById('storesModal')).show();
        }

        function showVisitsModal() {
            new bootstrap.Modal(document.getElementById('visitsModal')).show();
        }

        function showReportsModal() {
            new bootstrap.Modal(document.getElementById('reportsModal')).show();
        }

        function showExportModal() {
            new bootstrap.Modal(document.getElementById('exportModal')).show();
        }

        // Auto-refresh dashboard every 30 seconds
        setInterval(function() {
            // In production, this would fetch fresh data via AJAX
            console.log('Dashboard data refreshed');
        }, 30000);
    </script>
</body>
</html>
