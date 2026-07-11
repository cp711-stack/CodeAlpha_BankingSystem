-- ============================================================================
-- FinVerse — Demo Seed Data
-- Realistic test data for development and AI module training
-- ============================================================================

-- Passwords are all 'password123' hashed with bcrypt
-- $2b$12$LJ3m4ys3Lz0YLfDpB.Wz5OqF8Nv6fRqPkSx4kH1sXzMxYvHqJXGS

-- ============================================================================
-- CUSTOMERS (5 demo users)
-- ============================================================================

INSERT INTO customers (id, name, address, phone, email, password_hash, role, created_at) VALUES
('CUST00001', 'Aarav Sharma',    '42 MG Road, Bengaluru',    '9876543210', 'aarav@example.com',    '$2b$12$LJ3m4ys3Lz0YLfDpB.Wz5OqF8Nv6fRqPkSx4kH1sXzMxYvHqJXGS', 'customer', NOW() - INTERVAL '90 days'),
('CUST00002', 'Priya Patel',     '15 FC Road, Pune',         '9876543211', 'priya@example.com',    '$2b$12$LJ3m4ys3Lz0YLfDpB.Wz5OqF8Nv6fRqPkSx4kH1sXzMxYvHqJXGS', 'customer', NOW() - INTERVAL '75 days'),
('CUST00003', 'Rohan Gupta',     '88 Park Street, Kolkata',  '9876543212', 'rohan@example.com',    '$2b$12$LJ3m4ys3Lz0YLfDpB.Wz5OqF8Nv6fRqPkSx4kH1sXzMxYvHqJXGS', 'customer', NOW() - INTERVAL '60 days'),
('CUST00004', 'Sneha Reddy',     '7 Banjara Hills, Hyderabad','9876543213','sneha@example.com',    '$2b$12$LJ3m4ys3Lz0YLfDpB.Wz5OqF8Nv6fRqPkSx4kH1sXzMxYvHqJXGS', 'customer', NOW() - INTERVAL '45 days'),
('CUST00005', 'Vikram Singh',    '23 Civil Lines, Delhi',    '9876543214', 'vikram@example.com',   '$2b$12$LJ3m4ys3Lz0YLfDpB.Wz5OqF8Nv6fRqPkSx4kH1sXzMxYvHqJXGS', 'customer', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ACCOUNTS (8 accounts across 5 customers)
-- ============================================================================

INSERT INTO accounts (account_number, customer_id, type, balance, status, created_at) VALUES
('AC0000001', 'CUST00001', 'SAVINGS', 45750.00,  'ACTIVE', NOW() - INTERVAL '90 days'),
('AC0000002', 'CUST00001', 'CURRENT', 125000.00, 'ACTIVE', NOW() - INTERVAL '85 days'),
('AC0000003', 'CUST00002', 'SAVINGS', 32400.00,  'ACTIVE', NOW() - INTERVAL '75 days'),
('AC0000004', 'CUST00002', 'SAVINGS', 8500.00,   'FROZEN', NOW() - INTERVAL '70 days'),
('AC0000005', 'CUST00003', 'CURRENT', 67200.00,  'ACTIVE', NOW() - INTERVAL '60 days'),
('AC0000006', 'CUST00003', 'SAVINGS', 15000.00,  'ACTIVE', NOW() - INTERVAL '55 days'),
('AC0000007', 'CUST00004', 'SAVINGS', 91300.00,  'ACTIVE', NOW() - INTERVAL '45 days'),
('AC0000008', 'CUST00005', 'CURRENT', 210500.00, 'ACTIVE', NOW() - INTERVAL '30 days')
ON CONFLICT (account_number) DO NOTHING;

-- ============================================================================
-- TRANSACTIONS (50+ for analytics and AI training)
-- ============================================================================

INSERT INTO transactions (id, account_number, type, amount, balance_after, description, category, created_at) VALUES
-- Aarav Sharma - AC0000001 (Savings)
('TXN00000001', 'AC0000001', 'DEPOSIT',      50000.00, 50000.00, 'Initial deposit on account opening',    'Salary & Income',  NOW() - INTERVAL '90 days'),
('TXN00000002', 'AC0000001', 'WITHDRAWAL',    2500.00,  47500.00, 'ATM withdrawal',                        'Other',            NOW() - INTERVAL '85 days'),
('TXN00000003', 'AC0000001', 'WITHDRAWAL',    1200.00,  46300.00, 'Swiggy food order',                     'Food & Dining',    NOW() - INTERVAL '80 days'),
('TXN00000004', 'AC0000001', 'WITHDRAWAL',    3500.00,  42800.00, 'Electricity bill payment',              'Bills & Utilities',NOW() - INTERVAL '75 days'),
('TXN00000005', 'AC0000001', 'DEPOSIT',       25000.00, 67800.00, 'Salary credit July',                    'Salary & Income',  NOW() - INTERVAL '60 days'),
('TXN00000006', 'AC0000001', 'WITHDRAWAL',    8900.00,  58900.00, 'Amazon shopping',                       'Shopping',         NOW() - INTERVAL '55 days'),
('TXN00000007', 'AC0000001', 'WITHDRAWAL',    650.00,   58250.00, 'Netflix subscription',                  'Entertainment',    NOW() - INTERVAL '50 days'),
('TXN00000008', 'AC0000001', 'WITHDRAWAL',    2000.00,  56250.00, 'Uber rides',                            'Transport',        NOW() - INTERVAL '45 days'),
('TXN00000009', 'AC0000001', 'DEPOSIT',       25000.00, 81250.00, 'Salary credit August',                  'Salary & Income',  NOW() - INTERVAL '30 days'),
('TXN00000010', 'AC0000001', 'TRANSFER_OUT',  35000.00, 46250.00, 'Transfer to AC0000002',                 'Transfers',        NOW() - INTERVAL '25 days'),
('TXN00000011', 'AC0000001', 'WITHDRAWAL',    500.00,   45750.00, 'Medical consultation',                  'Healthcare',       NOW() - INTERVAL '20 days'),

-- Aarav Sharma - AC0000002 (Current)
('TXN00000012', 'AC0000002', 'DEPOSIT',      100000.00, 100000.00, 'Business income',                      'Salary & Income',  NOW() - INTERVAL '85 days'),
('TXN00000013', 'AC0000002', 'TRANSFER_IN',   35000.00, 135000.00, 'Transfer from AC0000001',              'Transfers',        NOW() - INTERVAL '25 days'),
('TXN00000014', 'AC0000002', 'WITHDRAWAL',    10000.00, 125000.00, 'Office supplies',                      'Shopping',         NOW() - INTERVAL '15 days'),

-- Priya Patel - AC0000003 (Savings)
('TXN00000015', 'AC0000003', 'DEPOSIT',       40000.00, 40000.00, 'Initial deposit on account opening',    'Salary & Income',  NOW() - INTERVAL '75 days'),
('TXN00000016', 'AC0000003', 'WITHDRAWAL',    1800.00,  38200.00, 'Grocery shopping',                      'Food & Dining',    NOW() - INTERVAL '70 days'),
('TXN00000017', 'AC0000003', 'WITHDRAWAL',    2200.00,  36000.00, 'Gas bill + Internet',                   'Bills & Utilities',NOW() - INTERVAL '65 days'),
('TXN00000018', 'AC0000003', 'WITHDRAWAL',    1500.00,  34500.00, 'Myntra order',                          'Shopping',         NOW() - INTERVAL '60 days'),
('TXN00000019', 'AC0000003', 'DEPOSIT',       20000.00, 54500.00, 'Freelance payment',                     'Salary & Income',  NOW() - INTERVAL '45 days'),
('TXN00000020', 'AC0000003', 'WITHDRAWAL',    3200.00,  51300.00, 'Restaurant dining',                     'Food & Dining',    NOW() - INTERVAL '40 days'),
('TXN00000021', 'AC0000003', 'WITHDRAWAL',    750.00,   50550.00, 'Movie tickets',                         'Entertainment',    NOW() - INTERVAL '35 days'),
('TXN00000022', 'AC0000003', 'DEPOSIT',       20000.00, 70550.00, 'Salary credit',                         'Salary & Income',  NOW() - INTERVAL '15 days'),
('TXN00000023', 'AC0000003', 'TRANSFER_OUT',  38000.00, 32550.00, 'Transfer to AC0000004',                 'Transfers',        NOW() - INTERVAL '10 days'),
('TXN00000024', 'AC0000003', 'WITHDRAWAL',    150.00,   32400.00, 'Pharmacy',                              'Healthcare',       NOW() - INTERVAL '5 days'),

-- Priya Patel - AC0000004 (Frozen Savings)
('TXN00000025', 'AC0000004', 'DEPOSIT',       5000.00,  5000.00,  'Initial deposit on account opening',    'Salary & Income',  NOW() - INTERVAL '70 days'),
('TXN00000026', 'AC0000004', 'TRANSFER_IN',   3500.00,  8500.00,  'Transfer from AC0000003',               'Transfers',        NOW() - INTERVAL '10 days'),

-- Rohan Gupta - AC0000005 (Current)
('TXN00000027', 'AC0000005', 'DEPOSIT',       80000.00, 80000.00, 'Business deposit',                      'Salary & Income',  NOW() - INTERVAL '60 days'),
('TXN00000028', 'AC0000005', 'WITHDRAWAL',    5500.00,  74500.00, 'Software subscription',                 'Bills & Utilities',NOW() - INTERVAL '55 days'),
('TXN00000029', 'AC0000005', 'WITHDRAWAL',    3200.00,  71300.00, 'Team lunch',                            'Food & Dining',    NOW() - INTERVAL '50 days'),
('TXN00000030', 'AC0000005', 'WITHDRAWAL',    12000.00, 59300.00, 'Flight tickets',                        'Transport',        NOW() - INTERVAL '40 days'),
('TXN00000031', 'AC0000005', 'DEPOSIT',       30000.00, 89300.00, 'Client payment',                        'Salary & Income',  NOW() - INTERVAL '25 days'),
('TXN00000032', 'AC0000005', 'WITHDRAWAL',    7500.00,  81800.00, 'Flipkart electronics',                  'Shopping',         NOW() - INTERVAL '20 days'),
('TXN00000033', 'AC0000005', 'TRANSFER_OUT',  15000.00, 66800.00, 'Transfer to AC0000006',                 'Transfers',        NOW() - INTERVAL '15 days'),
('TXN00000034', 'AC0000005', 'WITHDRAWAL',    600.00,   66200.00, 'Spotify + YouTube Premium',             'Entertainment',    NOW() - INTERVAL '10 days'),
('TXN00000035', 'AC0000005', 'DEPOSIT',       1000.00,  67200.00, 'Cashback reward',                       'Other',            NOW() - INTERVAL '3 days'),

-- Rohan Gupta - AC0000006 (Savings)
('TXN00000036', 'AC0000006', 'DEPOSIT',       5000.00,  5000.00,  'Initial deposit on account opening',    'Salary & Income',  NOW() - INTERVAL '55 days'),
('TXN00000037', 'AC0000006', 'TRANSFER_IN',   15000.00, 20000.00, 'Transfer from AC0000005',               'Transfers',        NOW() - INTERVAL '15 days'),
('TXN00000038', 'AC0000006', 'WITHDRAWAL',    5000.00,  15000.00, 'Emergency fund withdrawal',             'Other',            NOW() - INTERVAL '7 days'),

-- Sneha Reddy - AC0000007 (Savings)
('TXN00000039', 'AC0000007', 'DEPOSIT',      100000.00,100000.00, 'Initial deposit on account opening',    'Salary & Income',  NOW() - INTERVAL '45 days'),
('TXN00000040', 'AC0000007', 'WITHDRAWAL',    2500.00,  97500.00, 'Zomato orders',                         'Food & Dining',    NOW() - INTERVAL '40 days'),
('TXN00000041', 'AC0000007', 'WITHDRAWAL',    4200.00,  93300.00, 'Electricity + water bill',              'Bills & Utilities',NOW() - INTERVAL '35 days'),
('TXN00000042', 'AC0000007', 'DEPOSIT',       35000.00,128300.00, 'Salary credit',                         'Salary & Income',  NOW() - INTERVAL '15 days'),
('TXN00000043', 'AC0000007', 'WITHDRAWAL',    15000.00,113300.00, 'Udemy courses',                         'Education',        NOW() - INTERVAL '12 days'),
('TXN00000044', 'AC0000007', 'WITHDRAWAL',    2000.00, 111300.00, 'Ola cabs',                              'Transport',        NOW() - INTERVAL '8 days'),
('TXN00000045', 'AC0000007', 'WITHDRAWAL',    20000.00, 91300.00, 'Laptop repair',                         'Shopping',         NOW() - INTERVAL '3 days'),

-- Vikram Singh - AC0000008 (Current - high value)
('TXN00000046', 'AC0000008', 'DEPOSIT',      200000.00,200000.00, 'Initial deposit on account opening',    'Salary & Income',  NOW() - INTERVAL '30 days'),
('TXN00000047', 'AC0000008', 'WITHDRAWAL',    5000.00, 195000.00, 'Restaurant bill',                       'Food & Dining',    NOW() - INTERVAL '25 days'),
('TXN00000048', 'AC0000008', 'DEPOSIT',       50000.00,245000.00, 'Investment return',                     'Salary & Income',  NOW() - INTERVAL '20 days'),
('TXN00000049', 'AC0000008', 'WITHDRAWAL',    25000.00,220000.00, 'Insurance premium',                     'Bills & Utilities',NOW() - INTERVAL '15 days'),
('TXN00000050', 'AC0000008', 'WITHDRAWAL',    8000.00, 212000.00, 'Gym membership annual',                 'Healthcare',       NOW() - INTERVAL '10 days'),
('TXN00000051', 'AC0000008', 'WITHDRAWAL',    1500.00, 210500.00, 'BookMyShow',                            'Entertainment',    NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;
