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
  headquarters_city VARCHAR(120) NULL,
  headquarters_country VARCHAR(120) NULL,
  team_principal VARCHAR(160) NULL,
  technical_director VARCHAR(160) NULL,
  chassis_code VARCHAR(64) NULL,
  engine_supplier VARCHAR(120) NULL,
  constructors_titles SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  official_website VARCHAR(255) NULL,
  active_status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
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
  date_of_birth DATE NULL,
  race_number TINYINT UNSIGNED NULL,
  three_letter_code CHAR(3) NULL,
  podium_finishes SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  pole_positions SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  current_contract_end_year SMALLINT NULL,
  helmet_color_hex VARCHAR(16) NULL,
  instagram_handle VARCHAR(120) NULL,
  driver_status ENUM('Active', 'Reserve', 'Retired') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_drivers_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE seasons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year SMALLINT NOT NULL,
  champion_driver_id INT NULL,
  champion_team_id INT NULL,
  regulation_name VARCHAR(180) NULL,
  planned_rounds TINYINT UNSIGNED NOT NULL DEFAULT 0,
  completed_rounds TINYINT UNSIGNED NOT NULL DEFAULT 0,
  sprint_weekends TINYINT UNSIGNED NOT NULL DEFAULT 0,
  season_start_date DATE NULL,
  season_end_date DATE NULL,
  budget_cap_musd DECIMAL(8,2) NULL,
  points_system_version VARCHAR(60) NULL,
  weather_overview VARCHAR(120) NULL,
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
  fastest_lap_seconds DECIMAL(8,3) NULL,
  fastest_lap_driver_id INT NULL,
  winner_points SMALLINT NULL,
  circuit_name VARCHAR(160) NULL,
  host_city VARCHAR(120) NULL,
  host_country VARCHAR(120) NULL,
  lap_count SMALLINT UNSIGNED NULL,
  track_length_km DECIMAL(6,3) NULL,
  weather_condition VARCHAR(60) NULL,
  safety_car_laps TINYINT UNSIGNED NOT NULL DEFAULT 0,
  attendance INT NULL,
  race_status ENUM('Completed', 'Scheduled', 'Cancelled') NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_races_season FOREIGN KEY (season_id) REFERENCES seasons (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_races_winner FOREIGN KEY (winner_driver_id) REFERENCES drivers (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_races_fastest_lap_driver FOREIGN KEY (fastest_lap_driver_id) REFERENCES drivers (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ---------- Seed ----------

INSERT INTO teams (
  name, color_hex, founded_year, headquarters_city, headquarters_country,
  team_principal, technical_director, chassis_code, engine_supplier,
  constructors_titles, official_website, active_status
) VALUES
('Oracle Red Bull Racing', '#1E41FF', 2005, 'Milton Keynes', 'United Kingdom', 'Christian Horner', 'Pierre Wache', 'RB20', 'Honda RBPT', 6, 'https://www.redbullracing.com', 'Active'),
('Mercedes-AMG PETRONAS F1 Team', '#00D2BE', 2010, 'Brackley', 'United Kingdom', 'Toto Wolff', 'James Allison', 'W15', 'Mercedes', 8, 'https://www.mercedesamgf1.com', 'Active'),
('Scuderia Ferrari', '#E1062E', 1950, 'Maranello', 'Italy', 'Frederic Vasseur', 'Enrico Cardile', 'SF-24', 'Ferrari', 16, 'https://www.ferrari.com/formula1', 'Active'),
('McLaren F1 Team', '#FF8700', 1963, 'Woking', 'United Kingdom', 'Andrea Stella', 'Peter Prodromou', 'MCL38', 'Mercedes', 8, 'https://www.mclaren.com/racing', 'Active'),
('Aston Martin Aramco F1 Team', '#006F62', 2021, 'Silverstone', 'United Kingdom', 'Mike Krack', 'Dan Fallows', 'AMR24', 'Mercedes', 0, 'https://www.astonmartinf1.com', 'Active'),
('BWT Alpine F1 Team', '#0090FF', 2021, 'Enstone', 'United Kingdom', 'Bruno Famin', 'Matt Harman', 'A524', 'Renault', 2, 'https://www.alpinecars.com/en/formula-1', 'Active'),
('Williams Racing', '#005AFF', 1977, 'Grove', 'United Kingdom', 'James Vowles', 'Pat Fry', 'FW46', 'Mercedes', 9, 'https://www.williamsf1.com', 'Active');

INSERT INTO drivers (
  team_id, full_name, nationality, f1_debut_year, performance_index, description, total_wins,
  date_of_birth, race_number, three_letter_code, podium_finishes, pole_positions, current_contract_end_year, helmet_color_hex, driver_status
) VALUES
(1, 'Max Verstappen', 'Dutch', 2015, 98,
 'Two-time world champion known for wet-weather mastery and relentless race pace.',
 63, '1997-09-30', 1, 'VER', 111, 40, 2028, '#1E41FF', 'Active'),
(1, 'Sergio Pérez', 'Mexican', 2011, 86,
 'Street-circuit specialist with deep tyre-management experience.',
 6, '1990-01-26', 11, 'PER', 39, 3, 2026, '#0F172A', 'Active'),
(2, 'Lewis Hamilton', 'British', 2007, 96,
 'Seven-time champion with record race wins; qualifying excellence.',
 103, '1985-01-07', 44, 'HAM', 202, 104, 2026, '#6B21A8', 'Active'),
(2, 'George Russell', 'British', 2019, 90,
 'Meticulous preparer and strong qualifier.',
 3, '1998-02-15', 63, 'RUS', 16, 5, 2026, '#1F2937', 'Active'),
(3, 'Charles Leclerc', 'Monegasque', 2018, 93,
 'Aggressive one-lap pace; focal point for Ferrari qualifying.',
 6, '1997-10-16', 16, 'LEC', 35, 26, 2029, '#B91C1C', 'Active'),
(3, 'Carlos Sainz Jr.', 'Spanish', 2015, 91,
 'Methodical race reader with strong feedback loop to engineers.',
 4, '1994-09-01', 55, 'SAI', 21, 5, 2026, '#DC2626', 'Active'),
(4, 'Lando Norris', 'British', 2019, 89,
 'Sharp racecraft and consistent points finishes for McLaren.',
 0, '1999-11-13', 4, 'NOR', 14, 1, 2027, '#FF8700', 'Active'),
(4, 'Oscar Piastri', 'Australian', 2023, 87,
 'Rookie standout with calm wheel-to-wheel judgement.',
 0, '2001-04-06', 81, 'PIA', 4, 0, 2028, '#FF8700', 'Active'),
(5, 'Fernando Alonso', 'Spanish', 2001, 92,
 'Double world champion; relentless development feedback.',
 32, '1981-07-29', 14, 'ALO', 106, 22, 2026, '#006F62', 'Active'),
(5, 'Lance Stroll', 'Canadian', 2017, 78,
 'Wet-weather highlights and strong starts.',
 0, '1998-10-29', 18, 'STR', 3, 1, 2026, '#006F62', 'Active'),
(6, 'Esteban Ocon', 'French', 2016, 84,
 'Hungarian GP winner; technical and precise.',
 1, '1996-09-17', 31, 'OCO', 3, 0, 2026, '#0090FF', 'Active'),
(6, 'Pierre Gasly', 'French', 2017, 85,
 'Monza winner; aggressive overtakes on Sundays.',
 1, '1996-02-07', 10, 'GAS', 4, 0, 2026, '#0090FF', 'Active'),
(7, 'Alexander Albon', 'Thai', 2019, 83,
 'Tyre whisperer with strong defensive driving.',
 0, '1996-03-23', 23, 'ALB', 2, 0, 2026, '#005AFF', 'Active'),
(7, 'Logan Sargeant', 'American', 2023, 76,
 'Williams development focus and feedback.',
 0, '2000-12-31', 2, 'SAR', 0, 0, 2025, '#005AFF', 'Reserve');

INSERT INTO seasons (
  year, champion_driver_id, champion_team_id, regulation_name, planned_rounds, completed_rounds,
  sprint_weekends, season_start_date, season_end_date, budget_cap_musd, points_system_version, weather_overview
) VALUES
(2018, 3, 2, 'FIA Formula One Sporting & Technical Regulations 2018', 21, 21, 0, '2018-03-25', '2018-11-25', 0.00, '25-18-15-12-10-8-6-4-2-1', 'Mixed'),
(2019, 3, 2, 'FIA Formula One Sporting & Technical Regulations 2019', 21, 21, 0, '2019-03-17', '2019-12-01', 0.00, '25-18-15-12-10-8-6-4-2-1', 'Dry'),
(2020, 1, 1, 'FIA Formula One Sporting & Technical Regulations 2020', 17, 17, 0, '2020-07-05', '2020-12-13', 145.00, '25-18-15-12-10-8-6-4-2-1', 'Mixed'),
(2021, 1, 1, 'FIA Formula One Sporting & Technical Regulations 2021', 22, 22, 3, '2021-03-28', '2021-12-12', 145.00, '25-18-15-12-10-8-6-4-2-1', 'Mixed'),
(2022, 1, 1, 'FIA Formula One Sporting & Technical Regulations 2022', 22, 22, 3, '2022-03-20', '2022-11-20', 140.00, '25-18-15-12-10-8-6-4-2-1', 'Mixed'),
(2023, 1, 1, 'FIA Formula One Sporting & Technical Regulations 2023', 22, 22, 6, '2023-03-05', '2023-11-26', 135.00, '25-18-15-12-10-8-6-4-2-1', 'Mixed'),
(2024, 1, 1, 'FIA Formula One Sporting & Technical Regulations 2024', 24, 24, 6, '2024-03-02', '2024-12-08', 135.00, '25-18-15-12-10-8-6-4-2-1', 'Mixed'),
(2025, NULL, NULL, 'FIA Formula One Sporting & Technical Regulations 2025', 24, 6, 6, '2025-03-16', '2025-12-07', 135.00, '25-18-15-12-10-8-6-4-2-1', 'TBD');

-- season_id: 6 = 2023, 7 = 2024, 8 = 2025 (after 8 season inserts)
INSERT INTO races (
  season_id, race_name, race_date, winner_driver_id, fastest_lap_seconds, fastest_lap_driver_id, winner_points,
  circuit_name, host_city, host_country, lap_count, track_length_km, weather_condition, safety_car_laps, attendance, race_status
) VALUES
(6, 'Bahrain Grand Prix', '2023-03-05', 1, 92.486, 5, 25, 'Bahrain International Circuit', 'Sakhir', 'Bahrain', 57, 5.412, 'Dry', 0, 95000, 'Completed'),
(6, 'Saudi Arabian Grand Prix', '2023-03-19', 1, 89.104, 1, 25, 'Jeddah Corniche Circuit', 'Jeddah', 'Saudi Arabia', 50, 6.174, 'Dry', 2, 142000, 'Completed'),
(6, 'Australian Grand Prix', '2023-04-02', 3, 81.332, 3, 25, 'Albert Park Circuit', 'Melbourne', 'Australia', 58, 5.278, 'Dry', 1, 118000, 'Completed'),
(6, 'Monaco Grand Prix', '2023-05-28', 5, 74.201, 5, 25, 'Circuit de Monaco', 'Monte Carlo', 'Monaco', 78, 3.337, 'Dry', 0, 37000, 'Completed'),
(6, 'British Grand Prix', '2023-07-09', 1, 88.234, 7, 25, 'Silverstone Circuit', 'Silverstone', 'United Kingdom', 52, 5.891, 'Mixed', 3, 160000, 'Completed'),
(7, 'Bahrain Grand Prix', '2024-03-02', 1, 91.447, 1, 25, 'Bahrain International Circuit', 'Sakhir', 'Bahrain', 57, 5.412, 'Dry', 0, 96000, 'Completed'),
(7, 'Saudi Arabian Grand Prix', '2024-03-09', 1, 88.901, 5, 25, 'Jeddah Corniche Circuit', 'Jeddah', 'Saudi Arabia', 50, 6.174, 'Dry', 0, 140000, 'Completed'),
(7, 'Australian Grand Prix', '2024-03-24', 5, 79.915, 5, 25, 'Albert Park Circuit', 'Melbourne', 'Australia', 58, 5.278, 'Dry', 3, 125000, 'Completed'),
(7, 'Japanese Grand Prix', '2024-04-07', 1, 84.223, 1, 25, 'Suzuka Circuit', 'Suzuka', 'Japan', 53, 5.807, 'Dry', 0, 155000, 'Completed'),
(7, 'Chinese Grand Prix', '2024-04-21', 1, 95.171, 3, 25, 'Shanghai International Circuit', 'Shanghai', 'China', 56, 5.451, 'Dry', 1, 200000, 'Completed'),
(7, 'Miami Grand Prix', '2024-05-05', 1, 90.556, 7, 25, 'Miami International Autodrome', 'Miami', 'United States', 57, 5.412, 'Dry', 0, 108000, 'Completed'),
(7, 'Monaco Grand Prix', '2024-05-26', 5, 73.892, 5, 25, 'Circuit de Monaco', 'Monte Carlo', 'Monaco', 78, 3.337, 'Dry', 0, 37000, 'Completed'),
(7, 'Canadian Grand Prix', '2024-06-09', 3, 74.856, 3, 25, 'Circuit Gilles Villeneuve', 'Montreal', 'Canada', 70, 4.361, 'Dry', 0, 95000, 'Completed'),
(7, 'British Grand Prix', '2024-07-07', 3, 87.234, 1, 25, 'Silverstone Circuit', 'Silverstone', 'United Kingdom', 52, 5.891, 'Mixed', 4, 164000, 'Completed'),
(7, 'Hungarian Grand Prix', '2024-07-21', 1, 79.104, 5, 25, 'Hungaroring', 'Budapest', 'Hungary', 70, 4.381, 'Dry', 0, 92000, 'Completed'),
(7, 'Belgian Grand Prix', '2024-07-28', 1, 108.234, 1, 25, 'Circuit de Spa-Francorchamps', 'Spa', 'Belgium', 44, 7.004, 'Mixed', 2, 88000, 'Completed'),
(7, 'Dutch Grand Prix', '2024-08-25', 1, 72.445, 1, 25, 'Circuit Zandvoort', 'Zandvoort', 'Netherlands', 72, 4.259, 'Dry', 0, 105000, 'Completed'),
(7, 'Italian Grand Prix', '2024-09-01', 1, 83.221, 5, 25, 'Autodromo Nazionale Monza', 'Monza', 'Italy', 53, 5.793, 'Dry', 0, 98000, 'Completed'),
(7, 'Azerbaijan Grand Prix', '2024-09-15', 1, 104.123, 3, 25, 'Baku City Circuit', 'Baku', 'Azerbaijan', 51, 6.003, 'Dry', 1, 72000, 'Completed'),
(7, 'Singapore Grand Prix', '2024-09-22', 3, 104.556, 5, 25, 'Marina Bay Street Circuit', 'Singapore', 'Singapore', 62, 5.065, 'Dry', 0, 83000, 'Completed'),
(7, 'United States Grand Prix', '2024-10-20', 1, 99.887, 1, 25, 'Circuit of the Americas', 'Austin', 'United States', 56, 5.513, 'Dry', 0, 140000, 'Completed'),
(7, 'Mexico City Grand Prix', '2024-10-27', 1, 81.445, 1, 25, 'Autódromo Hermanos Rodríguez', 'Mexico City', 'Mexico', 71, 4.304, 'Dry', 0, 110000, 'Completed'),
(7, 'São Paulo Grand Prix', '2024-11-03', 1, 76.234, 7, 25, 'Autódromo José Carlos Pace', 'São Paulo', 'Brazil', 71, 4.309, 'Mixed', 5, 95000, 'Completed'),
(7, 'Las Vegas Grand Prix', '2024-11-23', 1, 93.112, 1, 25, 'Las Vegas Strip Circuit', 'Las Vegas', 'United States', 50, 6.120, 'Dry', 0, 105000, 'Completed'),
(7, 'Qatar Grand Prix', '2024-12-01', 1, 85.667, 1, 25, 'Lusail International Circuit', 'Lusail', 'Qatar', 57, 5.380, 'Dry', 0, 78000, 'Completed'),
(7, 'Abu Dhabi Grand Prix', '2024-12-08', 1, 87.901, 5, 25, 'Yas Marina Circuit', 'Abu Dhabi', 'United Arab Emirates', 58, 5.281, 'Dry', 0, 92000, 'Completed'),
(8, 'Australian Grand Prix', '2025-03-16', 1, 80.112, 5, 25, 'Albert Park Circuit', 'Melbourne', 'Australia', 58, 5.278, 'Dry', 1, 130000, 'Completed'),
(8, 'Chinese Grand Prix', '2025-03-23', 5, 94.556, 5, 25, 'Shanghai International Circuit', 'Shanghai', 'China', 56, 5.451, 'Dry', 0, 200000, 'Completed'),
(8, 'Japanese Grand Prix', '2025-04-06', 1, 83.901, 1, 25, 'Suzuka Circuit', 'Suzuka', 'Japan', 53, 5.807, 'Dry', 0, 158000, 'Completed'),
(8, 'Bahrain Grand Prix', '2025-04-13', 1, 91.001, 3, 25, 'Bahrain International Circuit', 'Sakhir', 'Bahrain', 57, 5.412, 'Dry', 0, 97000, 'Completed'),
(8, 'Saudi Arabian Grand Prix', '2025-04-20', 1, 88.334, 1, 25, 'Jeddah Corniche Circuit', 'Jeddah', 'Saudi Arabia', 50, 6.174, 'Dry', 0, 141000, 'Completed'),
(8, 'Miami Grand Prix', '2025-05-04', NULL, NULL, NULL, NULL, 'Miami International Autodrome', 'Miami', 'United States', 57, 5.412, 'Scheduled', 0, NULL, 'Scheduled');
