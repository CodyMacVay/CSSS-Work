-- Sales Promoter App Demo Database Setup
-- This creates a complete demo environment with sample data

-- Create database (if needed)
-- CREATE DATABASE sales_promoter_demo;
-- USE sales_promoter_demo;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    UserEmail VARCHAR(255) PRIMARY KEY,
    UserName VARCHAR(255) NOT NULL,
    Role ENUM('Promoter', 'Manager') NOT NULL,
    HomeStoreID VARCHAR(50),
    MonthlyTargetRand DECIMAL(10,2) DEFAULT 0.00,
    DailyBasePay DECIMAL(10,2) DEFAULT 0.00,
    IsActive BOOLEAN DEFAULT TRUE,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores Table
CREATE TABLE IF NOT EXISTS Stores (
    StoreID VARCHAR(50) PRIMARY KEY,
    StoreName VARCHAR(255) NOT NULL,
    Address TEXT NOT NULL,
    StoreLatLong VARCHAR(100) NOT NULL,
    AllowedRadiusMeters INT DEFAULT 100,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visits Table
CREATE TABLE IF NOT EXISTS Visits (
    VisitID VARCHAR(50) PRIMARY KEY,
    VisitDate DATE NOT NULL,
    PromoterEmail VARCHAR(255) NOT NULL,
    StoreID VARCHAR(50) NOT NULL,
    CheckInTime TIMESTAMP NULL,
    CheckInLocation VARCHAR(100) NULL,
    CheckOutTime TIMESTAMP NULL,
    CheckOutLocation VARCHAR(100) NULL,
    Sales_Nutriderma DECIMAL(10,2) DEFAULT 0.00,
    Sales_AcneSolutions DECIMAL(10,2) DEFAULT 0.00,
    Sales_NutridermaMen DECIMAL(10,2) DEFAULT 0.00,
    Sales_Dermacare DECIMAL(10,2) DEFAULT 0.00,
    TotalSales DECIMAL(10,2) GENERATED ALWAYS AS (
        Sales_Nutriderma + Sales_AcneSolutions + Sales_NutridermaMen + Sales_Dermacare
    ) STORED,
    PrintoutAvailable BOOLEAN DEFAULT TRUE,
    PrintoutPg1 VARCHAR(255) NULL,
    PrintoutPg2 VARCHAR(255) NULL,
    PrintoutPg3 VARCHAR(255) NULL,
    PrintoutPg4 VARCHAR(255) NULL,
    PrintoutPg5 VARCHAR(255) NULL,
    NoPrintReason TEXT NULL,
    SignerName VARCHAR(255) NULL,
    SignerRole VARCHAR(255) NULL,
    SignerSignature VARCHAR(255) NULL,
    IsPublicHoliday BOOLEAN DEFAULT FALSE,
    OvertimeApproved BOOLEAN DEFAULT FALSE,
    DailyPay DECIMAL(10,2) DEFAULT 0.00,
    Status ENUM('Open', 'Submitted', 'Locked') DEFAULT 'Open',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (PromoterEmail) REFERENCES Users(UserEmail),
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
);

-- Insert Sample Stores
INSERT INTO Stores (StoreID, StoreName, Address, StoreLatLong, AllowedRadiusMeters) VALUES
('STORE001', 'Sandton City Mall', 'Sandton City, 5th Street, Sandton, Johannesburg', '-26.1076,28.0573', 150),
('STORE002', 'Eastgate Shopping Centre', 'Corner Bradford and Van Riebeeck Roads, Bedfordview', '-26.1752,28.1425', 120),
('STORE003', 'Mall of Africa', 'Magalies Road, Midrand', '-25.9953,28.1268', 100),
('STORE004', 'Clearwater Mall', 'Corner Hendrik Potgieter & Christiaan De Wet Rd, Roodepoort', '-26.1454,27.8763', 130),
('STORE005', 'Fourways Mall', 'Corner William Nicol & Witkoppen Rd, Fourways', '-26.0408,28.0096', 110);

-- Insert Sample Users (Password: demo123)
INSERT INTO Users (UserEmail, UserName, Role, HomeStoreID, MonthlyTargetRand, DailyBasePay, PasswordHash) VALUES
('manager@csss.com', 'Sarah Johnson', 'Manager', NULL, 0.00, 0.00, '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('john.smith@csss.com', 'John Smith', 'Promoter', 'STORE001', 50000.00, 350.00, '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('mary.davis@csss.com', 'Mary Davis', 'Promoter', 'STORE002', 45000.00, 320.00, '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('peter.wilson@csss.com', 'Peter Wilson', 'Promoter', 'STORE003', 48000.00, 340.00, '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('lisa.brown@csss.com', 'Lisa Brown', 'Promoter', 'STORE004', 52000.00, 360.00, '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert Sample Visits for Demo
INSERT INTO Visits (VisitID, VisitDate, PromoterEmail, StoreID, CheckInTime, CheckInLocation, CheckOutTime, CheckOutLocation, 
                   Sales_Nutriderma, Sales_AcneSolutions, Sales_NutridermaMen, Sales_Dermacare, Status) VALUES

-- John Smith's recent visits
('VISIT_20240428_001', '2024-04-28', 'john.smith@csss.com', 'STORE001', '2024-04-28 08:30:00', '-26.1076,28.0573', '2024-04-28 17:15:00', '-26.1076,28.0573', 850.50, 420.00, 380.00, 290.00, 'Locked'),
('VISIT_20240427_001', '2024-04-27', 'john.smith@csss.com', 'STORE001', '2024-04-27 08:45:00', '-26.1076,28.0573', '2024-04-27 17:30:00', '-26.1076,28.0573', 920.00, 380.50, 410.00, 320.00, 'Locked'),
('VISIT_20240426_001', '2024-04-26', 'john.smith@csss.com', 'STORE001', '2024-04-26 08:15:00', '-26.1076,28.0573', '2024-04-26 17:00:00', '-26.1076,28.0573', 780.00, 450.00, 350.00, 280.00, 'Locked'),

-- Mary Davis's recent visits
('VISIT_20240428_002', '2024-04-28', 'mary.davis@csss.com', 'STORE002', '2024-04-28 09:00:00', '-26.1752,28.1425', '2024-04-28 17:45:00', '-26.1752,28.1425', 680.00, 390.00, 420.00, 310.00, 'Locked'),
('VISIT_20240427_002', '2024-04-27', 'mary.davis@csss.com', 'STORE002', '2024-04-27 08:30:00', '-26.1752,28.1425', '2024-04-27 17:20:00', '-26.1752,28.1425', 720.50, 410.00, 380.00, 290.00, 'Locked'),

-- Peter Wilson's recent visits
('VISIT_20240428_003', '2024-04-28', 'peter.wilson@csss.com', 'STORE003', '2024-04-28 08:20:00', '-25.9953,28.1268', NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'Open'),

-- Lisa Brown's recent visits
('VISIT_20240428_004', '2024-04-28', 'lisa.brown@csss.com', 'STORE004', '2024-04-28 08:45:00', '-26.1454,27.8763', '2024-04-28 16:30:00', '-26.1454,27.8763', 950.00, 480.00, 520.00, 380.00, 'Locked'),
('VISIT_20240427_004', '2024-04-27', 'lisa.brown@csss.com', 'STORE004', '2024-04-27 09:15:00', '-26.1454,27.8763', '2024-04-27 17:00:00', '-26.1454,27.8763', 880.00, 420.00, 460.00, 350.00, 'Locked');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visits_promoter_date ON Visits(PromoterEmail, VisitDate);
CREATE INDEX IF NOT EXISTS idx_visits_store_date ON Visits(StoreID, VisitDate);
CREATE INDEX IF NOT EXISTS idx_visits_status ON Visits(Status);
CREATE INDEX IF NOT EXISTS idx_users_role ON Users(Role);
CREATE INDEX IF NOT EXISTS idx_users_active ON Users(IsActive);

-- Demo Notes:
-- Manager login: manager@csss.com / demo123
-- Promoter logins: john.smith@csss.com, mary.davis@csss.com, peter.wilson@csss.com, lisa.brown@csss.com / demo123
-- Peter Wilson is currently checked in (open visit)
-- Others have completed visits for demonstration


-- Promoter will need to login via the demo login as no full login pages are up and running 