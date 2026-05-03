-- F1 Control — simplified relational model (MySQL 8+).
-- Run: mysql -u root -p < server/schema.sql   (adjust user / add -P port for Docker)
-- Drops and recreates tables; all application data lives here.

CREATE DATABASE IF NOT EXISTS f1_dashboard;
USE f1_dashboard;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS seasons;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS teams;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  color_hex VARCHAR(16) NOT NULL,
  founded_year SMALLINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  nationality VARCHAR(120) NOT NULL,
  f1_debut_year SMALLINT NOT NULL,
  performance_index TINYINT UNSIGNED NOT NULL,
  description TEXT NULL,
  total_wins INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_drivers_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE seasons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year SMALLINT NOT NULL,
  champion_driver_id INT NULL,
  champion_team_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_season_year (year),
  CONSTRAINT fk_season_champ_driver FOREIGN KEY (champion_driver_id) REFERENCES drivers (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_season_champ_team FOREIGN KEY (champion_team_id) REFERENCES teams (id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE races (
  id INT AUTO_INCREMENT PRIMARY KEY,
  season_id INT NOT NULL,
  race_name VARCHAR(200) NOT NULL,
  race_date DATE NOT NULL,
  winner_driver_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_races_season FOREIGN KEY (season_id) REFERENCES seasons (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_races_winner FOREIGN KEY (winner_driver_id) REFERENCES drivers (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ---------- Seed ----------

INSERT INTO teams (name, color_hex, founded_year) VALUES
('Oracle Red Bull Racing', '#1E41FF', 2005),
('Mercedes-AMG PETRONAS F1 Team', '#00D2BE', 2010),
('Scuderia Ferrari', '#E1062E', 1950);

INSERT INTO drivers (team_id, full_name, nationality, f1_debut_year, performance_index, description, total_wins) VALUES
(1, 'Max Verstappen', 'Dutch', 2015, 98,
 'Two-time world champion known for wet-weather mastery and relentless race pace. Leads Red Bull''s development direction on track.',
 63),
(1, 'Sergio Pérez', 'Mexican', 2011, 86,
 'Street-circuit specialist with deep tyre-management experience; key support role in constructors campaigns.',
 6),
(2, 'Lewis Hamilton', 'British', 2007, 96,
 'Seven-time champion with record race wins; combines qualifying excellence with long-run consistency.',
 103),
(2, 'George Russell', 'British', 2019, 90,
 'Meticulous preparer and strong qualifier; continues Mercedes'' front-running programme.',
 3),
(3, 'Charles Leclerc', 'Monegasque', 2018, 93,
 'Aggressive one-lap pace and emotional intelligence with the Tifosi; focal point for Ferrari qualifying.',
 6),
(3, 'Carlos Sainz Jr.', 'Spanish', 2015, 91,
 'Methodical race reader with strong feedback loop to engineers; multiple podium finisher.',
 4);

INSERT INTO seasons (year, champion_driver_id, champion_team_id) VALUES
(2024, 1, 1),
(2025, NULL, NULL);

INSERT INTO races (season_id, race_name, race_date, winner_driver_id) VALUES
(1, 'Bahrain Grand Prix', '2024-03-02', 1),
(1, 'Australian Grand Prix', '2024-03-24', 6),
(1, 'Japanese Grand Prix', '2024-04-07', 1),
(1, 'Monaco Grand Prix', '2024-05-26', 5),
(1, 'British Grand Prix', '2024-07-07', 3),
(2, 'Australian Grand Prix', '2025-03-16', 1),
(2, 'Chinese Grand Prix', '2025-03-23', 5);
