
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- create universities table

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email_domain VARCHAR UNIQUE NOT NULL
);


-- create users table

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,

    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,

    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    faculty VARCHAR(100) NULL,
    is_verified BOOLEAN DEFAULT FALSE,

    role VARCHAR(10) DEFAULT 'student'
        CHECK (role IN ('student','admin')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);


-- create otps (one time pins) table

CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL,
    code CHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- modules

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    faculty VARCHAR,
    semester SMALLINT,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE
);


-- books

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(13) UNIQUE,
    title VARCHAR NOT NULL,
    author VARCHAR,
    edition SMALLINT,
    publisher VARCHAR
);



-- listings

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200),

    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE SET NULL,

    condition VARCHAR(10)
        CHECK (condition IN ('new','good','fair','poor')),

    annotation_level VARCHAR(10)
        CHECK (annotation_level IN ('none','light','heavy')),

    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,

    reviewed_at TIMESTAMPTZ,

    photo_urls TEXT[] DEFAULT '{}', 

    status VARCHAR(15) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','APPROVED','REJECTED','SOFT_DELETED')),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ,

    -- Soft delete (IMPORTANT)
    deleted_at TIMESTAMPTZ
);


-- audit log

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entity_type VARCHAR NOT NULL,  
    entity_id UUID NOT NULL,

    action VARCHAR NOT NULL,       

    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW(),

    notes TEXT
);


-- indexes


-- listings indexes for filtering + sorting use-cases
CREATE INDEX idx_listings_module_price 
ON listings(module_id, price);

CREATE INDEX idx_listings_condition 
ON listings(condition);

CREATE INDEX idx_listings_annotation 
ON listings(annotation_level);

-- books indexes for search/filter use-cases
CREATE INDEX idx_books_isbn 
ON books(isbn);

CREATE INDEX idx_books_edition 
ON books(edition);

-- audit log lookup
CREATE INDEX idx_audit_entity 
ON audit_log(entity_type, entity_id);

CREATE INDEX idx_listing_status
ON listings(status);

CREATE INDEX idx_listing_seller
ON listings(seller_id);

CREATE INDEX idx_listing_reviewed_by
ON listings(reviewed_by);




