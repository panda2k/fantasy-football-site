CREATE ROLE fantasyfootballadmin WITH LOGIN PASSWORD 'password here';
CREATE DATABASE fantasyfootballapi;
\c fantasyfootballapi;
GRANT ALL PRIVILEGES ON DATABASE fantasyfootballapi TO fantasyfootballadmin;

CREATE TABLE users (
    email VARCHAR(255) NOT NULL PRIMARY KEY UNIQUE,
    display_name VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(53) NOT NULL
);

