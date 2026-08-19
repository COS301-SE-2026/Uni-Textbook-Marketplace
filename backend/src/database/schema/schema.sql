
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
    faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
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
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- modules

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
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

--create faculties table 
CREATE TABLE faculties(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL , 
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--create saved_searches table 
CREATE TABLE saved_searches(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filter_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
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

    --these status are for admin use
    status VARCHAR(15) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','APPROVED','REJECTED','SOFT_DELETED')),

    --these are for the listing lifecycle
    listing_status VARCHAR(10) DEFAULT 'AVAILABLE'
        CHECK (listing_status IN ('AVAILABLE','RESERVED','SOLD','WITHDRAWN')),

    created_at TIMESTAMPTZ DEFAULT NOW(),


    has_notes BOOLEAN DEFAULT FALSE,

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
     CHECK (action IN (
            'CREATE',
            'UPDATE',
            'DELETE',
            'LOGIN',
            'LOGOUT',
            'SOLD',
            'WITHDRAWN'
        )),     

    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW(),

    notes TEXT
);

-- wishlist

CREATE TABLE wishlist (

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listings_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
   
    PRIMARY KEY (user_id, listings_id)
);


-- create cases table 
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ban_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, --same ref as user_id , will discuss with team for clarity
    appeal_message TEXT,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'upheld', 'reversed')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE INDEX idx_books_isbn 
ON books(isbn);

CREATE INDEX idx_saved_search_user 
ON saved_searches(user_id);


CREATE INDEX idx_saved_search_created_at
ON saved_searches(created_at);

CREATE INDEX idx_books_author_title ON books(author, title)

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

CREATE INDEX idx_books_title 
ON books(title);

-- filter by faculty and sort by price 
CREATE INDEX idx_listings_faculty_price ON listings(faculty_id, price);

-- index for recently created listings
CREATE INDEX idx_listings_performed_at ON listings(performed_at DESC);


-- index to query audit logs by date range
CREATE INDEX idx_audit_performed_at ON audit_log(performed_at DESC);

-- indexes for cases table 
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_ban_id ON cases(ban_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_user_status ON cases(user_id, status);
CREATE INDEX idx_cases_ban_status ON cases(ban_id, status);
CREATE INDEX idx_cases_reviewed_by ON cases(reviewed_by);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);