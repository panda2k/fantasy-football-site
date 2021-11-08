CREATE ROLE fantasyfootballadmin WITH LOGIN PASSWORD 'developmentpassword';
CREATE DATABASE fantasyfootballapi;
\c fantasyfootballapi;

CREATE TABLE users (
    email VARCHAR(255) NOT NULL PRIMARY KEY UNIQUE,
    display_name VARCHAR(32) NOT NULL,
    password VARCHAR(60) NOT NULL,
    verified_email BOOLEAN NOT NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    account_unlock_time BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE trusted_ips (
    ip_address VARCHAR(15) NOT NULL,
    account_email VARCHAR(255) NOT NULL,
    expiration_time BIGINT NOT NULL,
    FOREIGN KEY (account_email) REFERENCES users(email)
);

CREATE TABLE ip_address_verification_requests (
    ip_address VARCHAR(15) NOT NULL,
    account_email VARCHAR(255) NOT NULL,
    expiration_time BIGINT NOT NULL,
    verification_key VARCHAR(32) NOT NULL UNIQUE,
    FOREIGN KEY (account_email) REFERENCES users(email)
);

CREATE TABLE email_verification_requests (
    account_email VARCHAR(255) NOT NULL,
    expiration_time BIGINT NOT NULL,
    verification_key VARCHAR(32) NOT NULL UNIQUE PRIMARY KEY,
    FOREIGN KEY (account_email) REFERENCES users(email)
);

CREATE TABLE sessions (
    session_id VARCHAR(32) NOT NULL UNIQUE PRIMARY KEY,
    expiration_time BIGINT NOT NULL,
    account_email VARCHAR(255) NOT NULL,
    FOREIGN KEY (account_email) REFERENCES users(email)
);

GRANT ALL PRIVILEGES ON DATABASE fantasyfootballapi TO fantasyfootballadmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fantasyfootballadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fantasyfootballadmin;
