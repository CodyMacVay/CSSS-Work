<?php
require_once 'config.php';

// Check if user is logged in and is a promoter
if (!isLoggedIn() || !isPromoter()) {
    redirect('index.php');
}

// Get current user data
$currentUser = getCurrentUser();
$userName = $_SESSION['user_name'];

// Get demo data for the current user
$db = getDB();

// Get user's home store
$userStore = $db->fetch("SELECT HomeStoreID, MonthlyTargetRand, DailyBasePay FROM Users WHERE UserEmail = ?", [$currentUser]);

// Get today's visit
$todayVisit = $db->fetch(
    "SELECT * FROM Visits WHERE PromoterEmail = ? AND VisitDate = CURDATE() ORDER BY CreatedAt DESC LIMIT 1",
    [$currentUser]
);

// Get recent visits
$recentVisits = $db->fetchAll(
    "SELECT v.*, s.StoreName FROM Visits v 
     JOIN Stores s ON v.StoreID = s.StoreID 
     WHERE v.PromoterEmail = ? AND v.VisitDate <= CURDATE() 
     ORDER BY v.VisitDate DESC, v.CheckInTime DESC 
     LIMIT 10",
    [$currentUser]
);

// Calculate month-to-date sales
$mtmSales = $db->fetch(
    "SELECT SUM(TotalSales) as total_sales, COUNT(*) as visit_count 
     FROM Visits 
     WHERE PromoterEmail = ? AND YEAR(VisitDate) = YEAR(CURDATE()) AND MONTH(VisitDate) = MONTH(CURDATE()) AND Status = 'Locked'",
    [$currentUser]
);

// Calculate target progress
$monthlyTarget = $userStore['MonthlyTargetRand'] ?? 0;
$mtmSalesAmount = $mtmSales['total_sales'] ?? 0;
$targetProgress = $monthlyTarget > 0 ? ($mtmSalesAmount / $monthlyTarget) * 100 : 0;

// Determine check-in/check-out status
$canCheckIn = !$todayVisit || ($todayVisit['CheckInTime'] === null);
$canCheckOut = $todayVisit && $todayVisit['CheckInTime'] !== null && $todayVisit['CheckOutTime'] === null;
$hasActiveVisit = $todayVisit && $todayVisit['CheckInTime'] !== null && $todayVisit['CheckOutTime'] === null;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promoter Dashboard - <?php echo APP_NAME; ?></title>
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
        }
        .progress-ring {
            width: 120px;
            height: 120px;
        }
        .progress-ring-circle {
            transition: stroke-dashoffset 0.35s;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
        }
        .action-button {
            padding: 1rem 2rem;
            font-weight: 600;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
        .status-badge {
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 600;
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
                    <p class="mb-0">Welcome back, <?php echo htmlspecialchars($userName); ?>!</p>
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
                    <a href="promoter_dashboard.php" class="nav-link active">
                        <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                    </a>
                    <a href="#" class="nav-link" onclick="showCheckInModal()">
                        <i class="fas fa-sign-in-alt me-2"></i>Check In
                    </a>
                    <a href="#" class="nav-link" onclick="showCheckOutModal()">
                        <i class="fas fa-sign-out-alt me-2"></i>Check Out
                    </a>
                    <a href="#" class="nav-link" onclick="showSalesModal()">
                        <i class="fas fa-rand-sign me-2"></i>Enter Sales
                    </a>
                    <a href="#" class="nav-link" onclick="showTargetsModal()">
                        <i class="fas fa-bullseye me-2"></i>My Targets
                    </a>
                </nav>
            </div>

            <!-- Main Content -->
            <div class="col-md-10 main-content">
                <!-- Today's Status & Actions -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-calendar-day me-2"></i>Today's Status
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <span>Check-in Status</span>
                                            <span class="status-badge <?php echo $todayVisit && $todayVisit['CheckInTime'] ? 'bg-success' : 'bg-warning'; ?>">
                                                <?php echo $todayVisit && $todayVisit['CheckInTime'] ? 'Completed' : 'Pending'; ?>
                                            </span>
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <span>Check-out Status</span>
                                            <span class="status-badge <?php echo $todayVisit && $todayVisit['CheckOutTime'] ? 'bg-success' : 'bg-warning'; ?>">
                                                <?php echo $todayVisit && $todayVisit['CheckOutTime'] ? 'Completed' : 'Pending'; ?>
                                            </span>
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <span>Sales Entered</span>
                                            <span class="status-badge <?php echo $todayVisit && $todayVisit['TotalSales'] > 0 ? 'bg-success' : 'bg-warning'; ?>">
                                                <?php echo $todayVisit && $todayVisit['TotalSales'] > 0 ? 'Yes' : 'No'; ?>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <?php if ($canCheckIn): ?>
                                            <button class="btn btn-success action-button w-100 mb-2" onclick="showCheckInModal()">
                                                <i class="fas fa-sign-in-alt me-2"></i>Check In Now
                                            </button>
                                        <?php endif; ?>
                                        
                                        <?php if ($canCheckOut): ?>
                                            <button class="btn btn-warning action-button w-100 mb-2" onclick="showCheckOutModal()">
                                                <i class="fas fa-sign-out-alt me-2"></i>Check Out Now
                                            </button>
                                        <?php endif; ?>
                                        
                                        <?php if ($hasActiveVisit): ?>
                                            <button class="btn btn-primary action-button w-100 mb-2" onclick="showSalesModal()">
                                                <i class="fas fa-rand-sign me-2"></i>Enter Sales
                                            </button>
                                        <?php endif; ?>
                                        
                                        <button class="btn btn-info action-button w-100" onclick="showTargetsModal()">
                                            <i class="fas fa-bullseye me-2"></i>View Targets
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-info-circle me-2"></i>Quick Info
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <small class="text-muted">Home Store</small>
                                    <h6><?php echo htmlspecialchars($userStore['HomeStoreID'] ?? 'Not assigned'); ?></h6>
                                </div>
                                <div class="mb-3">
                                    <small class="text-muted">Daily Base Pay</small>
                                    <h6><?php echo formatCurrency($userStore['DailyBasePay'] ?? 0); ?></h6>
                                </div>
                                <div>
                                    <small class="text-muted">Monthly Target</small>
                                    <h6><?php echo formatCurrency($userStore['MonthlyTargetRand'] ?? 0); ?></h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-primary text-white mx-auto">
                                    <i class="fas fa-calendar-check"></i>
                                </div>
                                <h3 class="card-title mb-0"><?php echo $mtmSales['visit_count'] ?? 0; ?></h3>
                                <p class="card-text text-muted">Visits This Month</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-success text-white mx-auto">
                                    <i class="fas fa-rand-sign"></i>
                                </div>
                                <h3 class="card-title mb-0"><?php echo formatCurrency($mtmSalesAmount); ?></h3>
                                <p class="card-text text-muted">Month-to-Date Sales</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-warning text-white mx-auto">
                                    <i class="fas fa-bullseye"></i>
                                </div>
                                <h3 class="card-title mb-0"><?php echo number_format($targetProgress, 1); ?>%</h3>
                                <p class="card-text text-muted">Target Progress</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-info text-white mx-auto">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <h3 class="card-title mb-0"><?php echo $mtmSales['visit_count'] > 0 ? formatCurrency($mtmSalesAmount / $mtmSales['visit_count']) : formatCurrency(0); ?></h3>
                                <p class="card-text text-muted">Avg Sales/Visit</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Visits -->
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-history me-2"></i>Recent Visits
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Store</th>
                                        <th>Check-in</th>
                                        <th>Check-out</th>
                                        <th>Sales</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentVisits as $visit): ?>
                                        <tr>
                                            <td><?php echo formatDate($visit['VisitDate']); ?></td>
                                            <td><?php echo htmlspecialchars($visit['StoreName']); ?></td>
                                            <td><?php echo $visit['CheckInTime'] ? date('H:i', strtotime($visit['CheckInTime'])) : '-'; ?></td>
                                            <td><?php echo $visit['CheckOutTime'] ? date('H:i', strtotime($visit['CheckOutTime'])) : '-'; ?></td>
                                            <td><?php echo formatCurrency($visit['TotalSales']); ?></td>
                                            <td>
                                                <span class="badge <?php 
                                                    echo $visit['Status'] === 'Locked' ? 'bg-success' : 
                                                         ($visit['Status'] === 'Submitted' ? 'bg-warning' : 'bg-secondary'); 
                                                ?>">
                                                    <?php echo $visit['Status']; ?>
                                                </span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Check-in Modal -->
    <div class="modal fade" id="checkInModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-sign-in-alt me-2"></i>Check In
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Click below to simulate GPS-based check-in at your store location.</p>
                    <div class="alert alert-info">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        <strong>Store:</strong> <?php echo htmlspecialchars($userStore['HomeStoreID'] ?? 'Not assigned'); ?><br>
                        <strong>GPS Location:</strong> Simulated for demo
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" onclick="performCheckIn()">
                        <i class="fas fa-sign-in-alt me-2"></i>Check In Now
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Check-out Modal -->
    <div class="modal fade" id="checkOutModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-sign-out-alt me-2"></i>Check Out
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Click below to check out from your current location.</p>
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Make sure you have entered all sales data before checking out.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-warning" onclick="performCheckOut()">
                        <i class="fas fa-sign-out-alt me-2"></i>Check Out Now
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Sales Entry Modal -->
    <div class="modal fade" id="salesModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-rand-sign me-2"></i>Enter Sales
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="salesForm">
                        <div class="mb-3">
                            <label class="form-label">Nutriderma Sales (R)</label>
                            <input type="number" class="form-control" name="Sales_Nutriderma" step="0.01" min="0" value="0">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Acne Solutions Sales (R)</label>
                            <input type="number" class="form-control" name="Sales_AcneSolutions" step="0.01" min="0" value="0">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nutriderma Men Sales (R)</label>
                            <input type="number" class="form-control" name="Sales_NutridermaMen" step="0.01" min="0" value="0">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Dermacare Sales (R)</label>
                            <input type="number" class="form-control" name="Sales_Dermacare" step="0.01" min="0" value="0">
                        </div>
                        <div class="alert alert-info">
                            <strong>Total Sales:</strong> R <span id="totalSales">0.00</span>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveSales()">
                        <i class="fas fa-save me-2"></i>Save Sales
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Targets Modal -->
    <div class="modal fade" id="targetsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-bullseye me-2"></i>My Targets & Progress
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 text-center">
                            <h6>Monthly Target Progress</h6>
                            <div class="progress" style="height: 30px;">
                                <div class="progress-bar" role="progressbar" style="width: <?php echo min($targetProgress, 100); ?>%">
                                    <?php echo number_format($targetProgress, 1); ?>%
                                </div>
                            </div>
                            <div class="mt-3">
                                <small class="text-muted">Current: <?php echo formatCurrency($mtmSalesAmount); ?></small><br>
                                <small class="text-muted">Target: <?php echo formatCurrency($monthlyTarget); ?></small><br>
                                <small class="text-muted">Remaining: <?php echo formatCurrency(max(0, $monthlyTarget - $mtmSalesAmount)); ?></small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6>Performance Metrics</h6>
                            <div class="mb-2">
                                <small class="text-muted">Visits This Month:</small>
                                <strong><?php echo $mtmSales['visit_count'] ?? 0; ?></strong>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">Average Sales per Visit:</small>
                                <strong><?php echo $mtmSales['visit_count'] > 0 ? formatCurrency($mtmSalesAmount / $mtmSales['visit_count']) : formatCurrency(0); ?></strong>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">Daily Average Needed:</small>
                                <strong><?php 
                                    $daysRemaining = max(1, date('t') - date('d'));
                                    echo formatCurrency(($monthlyTarget - $mtmSalesAmount) / $daysRemaining); 
                                ?></strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.5.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function showCheckInModal() {
            new bootstrap.Modal(document.getElementById('checkInModal')).show();
        }

        function showCheckOutModal() {
            new bootstrap.Modal(document.getElementById('checkOutModal')).show();
        }

        function showSalesModal() {
            new bootstrap.Modal(document.getElementById('salesModal')).show();
        }

        function showTargetsModal() {
            new bootstrap.Modal(document.getElementById('targetsModal')).show();
        }

        function performCheckIn() {
            // Simulate check-in
            alert('Check-in successful! GPS location validated.');
            location.reload();
        }

        function performCheckOut() {
            // Simulate check-out
            alert('Check-out successful! Have a great day!');
            location.reload();
        }

        function saveSales() {
            // Calculate total
            const form = document.getElementById('salesForm');
            const inputs = form.querySelectorAll('input[type="number"]');
            let total = 0;
            inputs.forEach(input => {
                total += parseFloat(input.value) || 0;
            });
            
            alert(`Sales saved successfully! Total: R ${total.toFixed(2)}`);
            bootstrap.Modal.getInstance(document.getElementById('salesModal')).hide();
            location.reload();
        }

        // Update total sales in real-time
        document.querySelectorAll('#salesForm input[type="number"]').forEach(input => {
            input.addEventListener('input', function() {
                const inputs = document.querySelectorAll('#salesForm input[type="number"]');
                let total = 0;
                inputs.forEach(inp => {
                    total += parseFloat(inp.value) || 0;
                });
                document.getElementById('totalSales').textContent = total.toFixed(2);
            });
        });
    </script>
</body>
</html>
