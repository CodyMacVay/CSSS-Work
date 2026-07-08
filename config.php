<?php
// Sales Promoter App Demo Configuration
define('APP_NAME', 'Sales Promoter App');
define('APP_VERSION', '1.0.0 Demo');
define('BASE_URL', 'http://localhost/sales-promoter-app');

// Demo Mode Configuration
define('DEMO_MODE', true);
define('AUTO_LOGIN', false); // Set to true for instant demo access

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'sales_promoter_demo');
define('DB_USER', 'root');
define('DB_PASS', '');

// Session Configuration
define('SESSION_LIFETIME', 86400); // 24 hours
define('SESSION_NAME', 'sales_promoter_demo');

// Security Configuration
define('HASH_COST', 12);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes

// File Upload Configuration
define('UPLOAD_DIR', 'uploads/');
define('MAX_PHOTO_SIZE', 5242880); // 5MB
define('ALLOWED_PHOTO_TYPES', ['jpg', 'jpeg', 'png']);

// GPS Configuration
define('EARTH_RADIUS', 6371000); // Earth's radius in meters
define('DEFAULT_GPS_RADIUS', 100); // Default radius in meters
define('GPS_SIMULATION', true); // Enable GPS simulation for demo

// Payroll Configuration
define('DEFAULT_PUBLIC_HOLIDAY_MULTIPLIER', 1.5);

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Africa/Johannesburg');

// Start session
session_name(SESSION_NAME);
session_start([
    'cookie_lifetime' => SESSION_LIFETIME,
    'cookie_httponly' => true,
    'cookie_secure' => false,
    'use_strict_mode' => true,
]);

// Database Connection
function getDB() {
    static $db = null;
    if ($db === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $db = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch(PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    return $db;
}

// Helper Functions
function isLoggedIn() {
    return isset($_SESSION['user_email']) && !empty($_SESSION['user_email']);
}

function getCurrentUser() {
    return isLoggedIn() ? $_SESSION['user_email'] : null;
}

function getCurrentUserRole() {
    return isLoggedIn() ? $_SESSION['user_role'] : null;
}

function isManager() {
    return getCurrentUserRole() === 'Manager';
}

function isPromoter() {
    return getCurrentUserRole() === 'Promoter';
}

function redirect($url) {
    header("Location: $url");
    exit;
}

function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function generateVisitId() {
    return 'VISIT_' . date('YmdHis') . '_' . uniqid();
}

function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $lat1Rad = deg2rad($lat1);
    $lon1Rad = deg2rad($lon1);
    $lat2Rad = deg2rad($lat2);
    $lon2Rad = deg2rad($lon2);
    
    $dLat = $lat2Rad - $lat1Rad;
    $dLon = $lon2Rad - $lon1Rad;
    
    $a = sin($dLat/2) * sin($dLat/2) + cos($lat1Rad) * cos($lat2Rad) * sin($dLon/2) * sin($dLon/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    
    return EARTH_RADIUS * $c; // Distance in meters
}

function formatCurrency($amount) {
    return 'R ' . number_format($amount, 2);
}

function formatDate($date, $format = 'Y-m-d') {
    return date($format, strtotime($date));
}

function logError($message, $data = []) {
    $logMessage = date('Y-m-d H:i:s') . " - ERROR: $message";
    if (!empty($data)) {
        $logMessage .= " | Data: " . json_encode($data);
    }
    error_log($logMessage);
}

function logInfo($message, $data = []) {
    $logMessage = date('Y-m-d H:i:s') . " - INFO: $message";
    if (!empty($data)) {
        $logMessage .= " | Data: " . json_encode($data);
    }
    error_log($logMessage);
}

// Demo Functions
function getDemoUsers() {
    return [
        ['email' => 'manager@csss.com', 'name' => 'Sarah Johnson', 'role' => 'Manager', 'password' => 'demo123'],
        ['email' => 'john.smith@csss.com', 'name' => 'John Smith', 'role' => 'Promoter', 'password' => 'demo123'],
        ['email' => 'mary.davis@csss.com', 'name' => 'Mary Davis', 'role' => 'Promoter', 'password' => 'demo123'],
        ['email' => 'peter.wilson@csss.com', 'name' => 'Peter Wilson', 'role' => 'Promoter', 'password' => 'demo123'],
        ['email' => 'lisa.brown@csss.com', 'name' => 'Lisa Brown', 'role' => 'Promoter', 'password' => 'demo123'],
    ];
}

function simulateGPSLocation($storeId) {
    // Simulate GPS coordinates near the store for demo purposes
    $locations = [
        'STORE001' => ['-26.1076', '28.0573'],
        'STORE002' => ['-26.1752', '28.1425'],
        'STORE003' => ['-25.9953', '28.1268'],
        'STORE004' => ['-26.1454', '27.8763'],
        'STORE005' => ['-26.0408', '28.0096'],
    ];
    
    return $locations[$storeId] ?? ['-26.1076', '28.0573'];
}

// Auto-login for demo (if enabled)
if (AUTO_LOGIN && !isLoggedIn()) {
    $_SESSION['user_email'] = 'manager@csss.com';
    $_SESSION['user_name'] = 'Sarah Johnson';
    $_SESSION['user_role'] = 'Manager';
    $_SESSION['login_time'] = time();
}
?>
