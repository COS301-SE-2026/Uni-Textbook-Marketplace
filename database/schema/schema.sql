

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
    isbn VARCHAR(13),
    title VARCHAR NOT NULL,
    author VARCHAR,
    edition SMALLINT,
    publisher VARCHAR
);




