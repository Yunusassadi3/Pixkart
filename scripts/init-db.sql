-- ==============================================================================
-- PixKart E-Commerce Database Schema (MySQL 8.0 CE & 24/7 Cloud Architecture)
-- 100% Free of Cost (₹0 Cost Forever)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS pixkart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pixkart_db;

-- 1. Users Table (Google OAuth & Email Verified Customers and Admins)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  phone VARCHAR(32) NULL,
  avatar TEXT NULL,
  provider ENUM('google', 'email', 'admin') DEFAULT 'google',
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Saved Delivery Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  type ENUM('Home', 'Work', 'Other') DEFAULT 'Home',
  name VARCHAR(128) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(64) NOT NULL,
  state VARCHAR(64) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_address_pincode (pincode),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Phone Brands
CREATE TABLE IF NOT EXISTS brands (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  logo TEXT NULL,
  series_list JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  icon VARCHAR(64) NULL,
  image TEXT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Phone Models
CREATE TABLE IF NOT EXISTS phone_models (
  id VARCHAR(64) PRIMARY KEY,
  brand_id VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  series VARCHAR(64) NULL,
  screen_size VARCHAR(32) NULL,
  image TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_model_brand (brand_id),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Products Master Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  discount_percent INT DEFAULT 0,
  brand_id VARCHAR(64) NULL,
  category_id VARCHAR(64) NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 4.50,
  rating_count INT DEFAULT 0,
  stock_status VARCHAR(32) DEFAULT 'in_stock',
  images JSON NULL,
  specs JSON NULL,
  compatible_models JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_category (category_id),
  INDEX idx_product_brand (brand_id),
  INDEX idx_product_price (base_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Product Variants (Color, Model, Storage specific)
CREATE TABLE IF NOT EXISTS product_variants (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  model_id VARCHAR(64) NULL,
  color VARCHAR(64) NULL,
  storage VARCHAR(64) NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 100,
  sku VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Orders Table (Master Orders with Delivery Pincode Tracking)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) UNIQUE NOT NULL,
  user_id VARCHAR(64) NULL,
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  shipping_address JSON NOT NULL,
  items JSON NULL,
  pincode VARCHAR(10) NOT NULL,
  payment_method VARCHAR(32) DEFAULT 'cod',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  order_status VARCHAR(64) NOT NULL DEFAULT 'Ordered',
  tracking_number VARCHAR(64) NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_number (order_number),
  INDEX idx_order_pincode (pincode),
  INDEX idx_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  model_name VARCHAR(128) NULL,
  color VARCHAR(64) NULL,
  storage VARCHAR(64) NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  image TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Serviceable Pincodes (Udupi & Manipal Delivery Coverage)
CREATE TABLE IF NOT EXISTS serviceable_pincodes (
  pincode VARCHAR(10) PRIMARY KEY,
  locality VARCHAR(128) NOT NULL,
  city VARCHAR(64) NOT NULL,
  state VARCHAR(64) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  delivery_hours INT DEFAULT 48,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Admin & Store Settings
CREATE TABLE IF NOT EXISTS admin_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Temporary Cloud Order Queue (Zero-Bloat Buffer used while PC is OFF)
CREATE TABLE IF NOT EXISTS cloud_order_queue (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL,
  order_payload JSON NOT NULL,
  sync_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_queue_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Temporary Cloud User Queue (Zero-Bloat Buffer for User Logins & Signups while PC is OFF)
CREATE TABLE IF NOT EXISTS cloud_user_queue (
  id VARCHAR(64) PRIMARY KEY,
  user_email VARCHAR(191) NOT NULL,
  user_payload JSON NOT NULL,
  sync_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_queue_created (created_at),
  INDEX idx_user_queue_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Temporary Cloud Catalog Queue (Buffer for Products, Brands, Categories while PC is OFF)
CREATE TABLE IF NOT EXISTS cloud_catalog_queue (
  id VARCHAR(64) PRIMARY KEY,
  entity_type ENUM('product', 'brand', 'category', 'model', 'spotlight', 'hero_slide', 'promo_ad') NOT NULL,
  action ENUM('upsert', 'delete') NOT NULL DEFAULT 'upsert',
  entity_id VARCHAR(64) NOT NULL,
  payload JSON NOT NULL,
  sync_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_catalog_entity (entity_type, entity_id),
  INDEX idx_catalog_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


