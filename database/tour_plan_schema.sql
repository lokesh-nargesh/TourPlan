-- ==========================================
-- TOUR PLAN APPLICATION DATABASE SETUP SCRIPT
-- ==========================================

-- 1. Create Databases
CREATE DATABASE IF NOT EXISTS tour_auth_db;
CREATE DATABASE IF NOT EXISTS tour_user_db;
CREATE DATABASE IF NOT EXISTS tour_plan_db;
CREATE DATABASE IF NOT EXISTS tour_booking_db;
CREATE DATABASE IF NOT EXISTS tour_payment_db;
CREATE DATABASE IF NOT EXISTS tour_notification_db;

-- ==========================================
-- DATABASE: tour_auth_db
-- ==========================================
USE tour_auth_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL
) ENGINE=InnoDB;

-- Seed Data (Password is BCrypt hash of 'password123')
INSERT INTO users (id, username, password, email, role, created_at)
VALUES (1, 'john_doe', '$2a$10$UoWbXl.Z8g3x8n4l6.Z17.o2u2lFms3.2dD.x0iZ25Nl9m2PZtHnS', 'john.doe@example.com', 'USER', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- ==========================================
-- DATABASE: tour_user_db
-- ==========================================
USE tour_user_db;

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id BIGINT PRIMARY KEY,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    preferences TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS passengers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(10),
    passport_number VARCHAR(50),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- Seed Data
INSERT INTO user_profiles (user_id, full_name, phone, avatar_url, preferences)
VALUES (1, 'John Doe', '+1-555-0100', 'https://api.dicebear.com/7.x/adventurer/svg?seed=John', '{"dietary":"Veg","budget":"Mid-Range","transport":"Flight"}')
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO passengers (id, user_id, full_name, age, gender, passport_number)
VALUES (1, 1, 'Jane Doe', 28, 'Female', 'A12345678')
ON DUPLICATE KEY UPDATE id=id;

-- ==========================================
-- DATABASE: tour_plan_db
-- ==========================================
USE tour_plan_db;

CREATE TABLE IF NOT EXISTS tour_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    destination VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget DOUBLE NOT NULL,
    estimated_cost DOUBLE,
    status VARCHAR(20) NOT NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS itineraries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_plan_id BIGINT NOT NULL,
    day_number INT NOT NULL,
    activity_title VARCHAR(150) NOT NULL,
    description TEXT,
    estimated_cost DOUBLE,
    INDEX idx_tour_plan_id (tour_plan_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS budget_breakdowns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_plan_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    allocated_amount DOUBLE NOT NULL,
    spent_amount DOUBLE NOT NULL,
    INDEX idx_tour_plan_id (tour_plan_id)
) ENGINE=InnoDB;

-- ==========================================
-- DATABASE: tour_booking_db
-- ==========================================
USE tour_booking_db;

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_plan_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    reference_number VARCHAR(50) NOT NULL UNIQUE,
    price DOUBLE NOT NULL,
    status VARCHAR(20) NOT NULL,
    booking_date DATETIME NOT NULL,
    INDEX idx_tour_plan_id (tour_plan_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flight_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    flight_number VARCHAR(20) NOT NULL,
    departure_airport VARCHAR(10) NOT NULL,
    arrival_airport VARCHAR(10) NOT NULL,
    departure_time VARCHAR(20),
    arrival_time VARCHAR(20),
    seat_number VARCHAR(10),
    CONSTRAINT fk_flight_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hotel_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    hotel_name VARCHAR(150) NOT NULL,
    room_type VARCHAR(50),
    check_in_date VARCHAR(20),
    check_out_date VARCHAR(20),
    guests_count INT,
    CONSTRAINT fk_hotel_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS train_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    train_number VARCHAR(20) NOT NULL,
    source_station VARCHAR(50) NOT NULL,
    destination_station VARCHAR(50) NOT NULL,
    coach_class VARCHAR(20),
    pnr VARCHAR(20),
    CONSTRAINT fk_train_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS taxi_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    taxi_type VARCHAR(50) NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    drop_location VARCHAR(255) NOT NULL,
    pickup_time VARCHAR(20),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    CONSTRAINT fk_taxi_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- DATABASE: tour_payment_db
-- ==========================================
USE tour_payment_db;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_booking_id (booking_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    tax_amount DOUBLE NOT NULL,
    total_amount DOUBLE NOT NULL,
    issued_at DATETIME NOT NULL,
    INDEX idx_payment_id (payment_id)
) ENGINE=InnoDB;

-- ==========================================
-- DATABASE: tour_notification_db
-- ==========================================
USE tour_notification_db;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;
