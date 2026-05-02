

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





