<?php
require_once 'config.php';

// Redirect to dashboard if already logged in
if (isLoggedIn()) {
    if (isManager()) {
        redirect('manager_dashboard.php');
    } else {
        redirect('promoter_dashboard.php');
    }
}

$error = '';

// Handle login submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Please enter both email and password.';
    } else {
        // Check against demo users
        $demoUsers = getDemoUsers();
        $userFound = false;
        
        foreach ($demoUsers as $user) {
            if ($user['email'] === $email && $user['password'] === $password) {
                $userFound = true;
                // Set session
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_role'] = $user['role'];
                $_SESSION['login_time'] = time();
                
                logInfo("Demo user logged in", ['email' => $email, 'role' => $user['role']]);
                
                // Redirect based on role
                if ($user['role'] === 'Manager') {
                    redirect('manager_dashboard.php');
                } else {
                    redirect('promoter_dashboard.php');
                }
                break;
            }
        }
        
        if (!$userFound) {
            $error = 'Invalid email or password.';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Promoter App Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 1200px;
            width: 95%;
            margin: 20px;
        }
        .login-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem;
            text-align: center;
        }
        .login-body {
            padding: 3rem;
        }
        .demo-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
        }
        .demo-users {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .demo-user-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .demo-user-card:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }
        .demo-user-card.manager {
            border-left: 4px solid #28a745;
        }
        .demo-user-card.promoter {
            border-left: 4px solid #007bff;
        }
        .role-badge {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
        }
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .btn-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 12px 30px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-login:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        .app-logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .demo-badge {
            background: #ffc107;
            color: #000;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: bold;
            margin-bottom: 1rem;
            display: inline-block;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .feature-item {
            text-align: center;
            padding: 1rem;
        }
        .feature-icon {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <div class="demo-badge">
                <i class="fas fa-flask me-2"></i>DEMO VERSION
            </div>
            <div class="app-logo">
                <i class="fas fa-chart-line"></i>
            </div>
            <h1 class="mb-3"><?php echo APP_NAME; ?></h1>
            <p class="lead mb-0">Sales Reporting & Management System</p>
            <p class="mt-2">GPS-enabled Check-in/out | Sales Tracking | Payroll Management</p>
        </div>
        
        <div class="row g-0">
            <div class="col-lg-6">
                <div class="login-body">
                    <h3 class="mb-4">
                        <i class="fas fa-sign-in-alt me-2"></i>Quick Login
                    </h3>
                    
                    <?php if ($error): ?>
                        <div class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <?php echo $error; ?>
                        </div>
                    <?php endif; ?>
                    
                    <form method="POST" id="loginForm">
                        <div class="mb-3">
                            <label for="email" class="form-label">
                                <i class="fas fa-envelope me-2"></i>Email Address
                            </label>
                            <input type="email" class="form-control" id="email" name="email" 
                                   placeholder="Enter your email" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">
                                <i class="fas fa-lock me-2"></i>Password
                            </label>
                            <input type="password" class="form-control" id="password" name="password" 
                                   placeholder="Enter your password" required>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-login">
                                <i class="fas fa-sign-in-alt me-2"></i>Sign In
                            </button>
                        </div>
                    </form>
                    
                    <div class="text-center mt-3">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Click on any demo user below for instant login
                        </small>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6">
                <div class="login-body">
                    <div class="demo-section">
                        <h4 class="mb-3">
                            <i class="fas fa-users me-2"></i>Demo Users
                        </h4>
                        <p class="text-muted mb-3">Click any user to login instantly (Password: demo123)</p>
                        
                        <div class="demo-users">
                            <?php foreach (getDemoUsers() as $user): ?>
                                <div class="demo-user-card <?php echo strtolower($user['role']); ?>" 
                                     onclick="quickLogin('<?php echo $user['email']; ?>', 'demo123')">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h6 class="mb-0"><?php echo htmlspecialchars($user['name']); ?></h6>
                                        <span class="badge role-badge <?php echo $user['role'] === 'Manager' ? 'bg-success' : 'bg-primary'; ?>">
                                            <?php echo $user['role']; ?>
                                        </span>
                                    </div>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-envelope me-1"></i>
                                        <?php echo htmlspecialchars($user['email']); ?>
                                    </small>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-key me-1"></i>
                                        demo123
                                    </small>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    
                    <div class="feature-grid">
                        <div class="feature-item">
                            <div class="feature-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <h6>GPS Check-in</h6>
                            <small class="text-muted">Location validation</small>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">
                                <i class="fas fa-rand-sign"></i>
                            </div>
                            <h6>Sales Tracking</h6>
                            <small class="text-muted">Real-time sales data</small>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">
                                <i class="fas fa-bullseye"></i>
                            </div>
                            <h6>Target Progress</h6>
                            <small class="text-muted">Performance metrics</small>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <h6>Reports</h6>
                            <small class="text-muted">Analytics & insights</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function quickLogin(email, password) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
            document.getElementById('loginForm').submit();
        }
        
        // Add some animation to the demo user cards
        document.querySelectorAll('.demo-user-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(-2px)';
            });
        });
    </script>
</body>
</html>
