-- =========================================================================
-- MIGRATION SCRIPT: Split Caste into Caste, Category, and Special Reservation
-- Target Database: MS SQL Server (academy_web)
-- =========================================================================

-- 1. Create category_master table if not exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'category_master')
BEGIN
    CREATE TABLE category_master (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        category_code VARCHAR(20) NOT NULL UNIQUE,
        category_name VARCHAR(100) NOT NULL,
        category_name_marathi NVARCHAR(100) NULL,
        status VARCHAR(20) DEFAULT 'Active'
    );
    PRINT 'Created category_master table.';
END;

-- 2. Seed Official Maharashtra Reservation Categories (English names)
IF (SELECT COUNT(*) FROM category_master) = 0
BEGIN
    INSERT INTO category_master (category_code, category_name, category_name_marathi, status) VALUES
    ('OPEN', 'OPEN', N'खुला प्रवर्ग', 'Active'),
    ('SC', 'SC', N'अनुसूचित जाती', 'Active'),
    ('ST', 'ST', N'अनुसूचित जमाती', 'Active'),
    ('VJ-A', 'VJ-A', N'विमुक्त जाती (अ)', 'Active'),
    ('NT-B', 'NT-B', N'भटक्या जमाती (ब)', 'Active'),
    ('NT-C', 'NT-C', N'भटक्या जमाती (क)', 'Active'),
    ('NT-D', 'NT-D', N'भटक्या जमाती (ड)', 'Active'),
    ('SBC', 'SBC', N'विशेष मागास प्रवर्ग', 'Active'),
    ('OBC', 'OBC', N'इतर मागास वर्ग', 'Active'),
    ('SEBC', 'SEBC', N'सामाजिक व शैक्षणिक मागास प्रवर्ग', 'Active'),
    ('EWS', 'EWS', N'आर्थिकदृष्ट्या दुर्बल घटक', 'Active');
    PRINT 'Seeded category_master with 11 Maharashtra categories.';
END;

-- 3. Create or Update caste_master table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'caste_master')
BEGIN
    -- If old table was named 'castes', rename or recreate
    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'castes')
    BEGIN
        EXEC sp_rename 'castes', 'caste_master';
        PRINT 'Renamed castes table to caste_master.';
    END
    ELSE
    BEGIN
        CREATE TABLE caste_master (
            id BIGINT IDENTITY(1,1) PRIMARY KEY,
            caste_name VARCHAR(150) NOT NULL,
            caste_name_marathi NVARCHAR(150) NULL,
            category_id BIGINT NULL,
            category_code VARCHAR(50) NULL,
            status VARCHAR(20) DEFAULT 'Active'
        );
        PRINT 'Created caste_master table.';
    END;
END;

-- Ensure columns exist in caste_master
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('caste_master') AND name = 'caste_name')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('caste_master') AND name = 'name')
    BEGIN
        EXEC sp_rename 'caste_master.name', 'caste_name', 'COLUMN';
    END
    ELSE
    BEGIN
        ALTER TABLE caste_master ADD caste_name VARCHAR(150) NOT NULL DEFAULT '';
    END;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('caste_master') AND name = 'caste_name_marathi')
BEGIN
    ALTER TABLE caste_master ADD caste_name_marathi NVARCHAR(150) NULL;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('caste_master') AND name = 'category_id')
BEGIN
    ALTER TABLE caste_master ADD category_id BIGINT NULL;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('caste_master') AND name = 'category_code')
BEGIN
    ALTER TABLE caste_master ADD category_code VARCHAR(50) NULL;
END;

-- 4. Update students table with separate category, special_reservation, and review flag
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('students') AND name = 'category')
BEGIN
    ALTER TABLE students ADD category VARCHAR(50) NULL;
    PRINT 'Added category column to students table.';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('students') AND name = 'special_reservation')
BEGIN
    ALTER TABLE students ADD special_reservation VARCHAR(100) DEFAULT 'None';
    PRINT 'Added special_reservation column to students table.';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('students') AND name = 'needs_category_review')
BEGIN
    ALTER TABLE students ADD needs_category_review BIT DEFAULT 0;
    PRINT 'Added needs_category_review flag to students table.';
END;

-- 5. Backfill special_reservation to 'None' for existing records
UPDATE students
SET special_reservation = 'None'
WHERE special_reservation IS NULL OR special_reservation = '';

-- 6. Backward compatibility migration of existing student caste values into category:
-- A. Unambiguous mappings
UPDATE students
SET category = 'OPEN',
    needs_category_review = 0
WHERE UPPER(LTRIM(RTRIM(caste))) IN ('GENERAL', 'OPEN')
  AND (category IS NULL OR category = '');

UPDATE students
SET category = 'OBC',
    needs_category_review = 0
WHERE UPPER(LTRIM(RTRIM(caste))) = 'OBC'
  AND (category IS NULL OR category = '');

UPDATE students
SET category = 'SC',
    needs_category_review = 0
WHERE UPPER(LTRIM(RTRIM(caste))) = 'SC'
  AND (category IS NULL OR category = '');

UPDATE students
SET category = 'ST',
    needs_category_review = 0
WHERE UPPER(LTRIM(RTRIM(caste))) = 'ST'
  AND (category IS NULL OR category = '');

UPDATE students
SET category = 'SBC',
    needs_category_review = 0
WHERE UPPER(LTRIM(RTRIM(caste))) = 'SBC'
  AND (category IS NULL OR category = '');

UPDATE students
SET category = 'EWS',
    needs_category_review = 0
WHERE UPPER(LTRIM(RTRIM(caste))) = 'EWS'
  AND (category IS NULL OR category = '');

UPDATE students
SET category = 'SEBC',
    needs_category_review = 0
WHERE UPPER(LTRIM(RTRIM(caste))) = 'SEBC'
  AND (category IS NULL OR category = '');

-- B. Ambiguous mappings flagged for manual review:
-- Map NT -> best-fit 'NT-B' and flag for review
UPDATE students
SET category = 'NT-B',
    needs_category_review = 1
WHERE UPPER(LTRIM(RTRIM(caste))) = 'NT'
  AND (category IS NULL OR category = '');

-- Map VJNT -> 'VJ-A' and flag for review
UPDATE students
SET category = 'VJ-A',
    needs_category_review = 1
WHERE UPPER(LTRIM(RTRIM(caste))) IN ('VJNT', 'VJ/NT', 'VJ NT')
  AND (category IS NULL OR category = '');

PRINT 'Migration complete! Ambiguous NT and VJNT records are mapped to NT-B and VJ-A with needs_category_review = 1.';
