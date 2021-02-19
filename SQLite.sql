
-- SQLite

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(32) UNIQUE NOT NULL,
    firstname VARCHAR(32) NOT NULL,
    lastname VARCHAR(32) NOT NULL,
    password VARCHAR(128) NOT NULL,
    accounttype INTEGER(3) NOT NULL,
    block INTEGER(2),
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL);
   

DROP TABLE IF EXISTS questions;
CREATE TABLE IF NOT EXISTS questions (
    category VARCHAR(128) NOT NULL,
    title VARCHAR(128) NOT NULL,
    question VARCHAR(512) NOT NULL,
    timeofquestion DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duplicate INTEGER(28),
    userQuestion INTEGER(12)REFERENCES users(id),
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL);

DROP TABLE IF EXISTS answers;
CREATE TABLE IF NOT EXISTS answers (
    response VARCHAR(512) NOT NULL,
    vote INTEGER(12),
    userAnswer INTEGER(12)REFERENCES users(id),
    questionId INTEGER(12)REFERENCES questions(id),
    timeofanswer DATETIME DEFAULT CURRENT_TIMESTAMP,
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL);